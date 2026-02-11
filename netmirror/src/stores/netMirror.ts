import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface IPRecord {
  registry: string;
  type: 'ipv4' | 'ipv6';
  cidr: string;
  cc: string;
}

interface ASNResult {
  asn: string;
  data: IPRecord[];
  error?: boolean;
}

export const useNetMirrorStore = defineStore('netMirror', () => {
  // State
  const inputAsns = ref('');
  const results = ref<ASNResult[]>([]);
  const loading = ref(false);
  const mergeResults = ref(true);
  const selectedVendor = ref('cisco');
  const showIPv4 = ref(true);
  const showIPv6 = ref(true);

  // Actions
  const fetchASNs = async () => {
    if (!inputAsns.value.trim()) return;
    
    loading.value = true;
    results.value = [];
    
    // Normalização da entrada
    const uniqueAsns = [...new Set(
      inputAsns.value
        .split(/[\s,]+/) // Divide por espaço, vírgula ou quebra de linha
        .map(s => s.trim())
        .filter(s => /^\d+$/.test(s)) // Mantém apenas números
    )];

    const promises = uniqueAsns.map(async (asn) => {
      try {
        const res = await fetch(`./api/asn/${asn}.json`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        return { asn, data, error: false };
      } catch {
        return { asn, data: [], error: true };
      }
    });

    results.value = await Promise.all(promises);
    loading.value = false;
  };

  // Getters (Computed)
  const stats = computed(() => {
    const all = results.value.flatMap(r => r.data);
    return {
      totalASNs: results.value.filter(r => !r.error).length,
      ipv4: all.filter(ip => ip.type === 'ipv4').length,
      ipv6: all.filter(ip => ip.type === 'ipv6').length,
      errors: results.value.filter(r => r.error).length
    };
  });

  const formattedOutput = computed(() => {
    if (results.value.length === 0) return '';
    let output = '';
    const vendor = selectedVendor.value;

    const filterIPs = (records: IPRecord[]) => {
      return records.filter(ip => {
        if (!showIPv4.value && ip.type === 'ipv4') return false;
        if (!showIPv6.value && ip.type === 'ipv6') return false;
        return true;
      });
    };

    const generateLine = (cidr: string, index: number, listName: string) => {
      switch (vendor) {
        case 'cisco': return `ip prefix-list ${listName} seq ${index + 5} permit ${cidr}`;
        case 'huawei': return `ip ip-prefix ${listName} index ${index + 10} permit ${cidr}`;
        case 'juniper': return `set policy-options prefix-list ${listName} ${cidr}`;
        case 'mikrotik': return `/ip firewall address-list add list=${listName} address=${cidr}`;
        case 'mikrotik_route': return `/routing filter rule add chain=${listName} rule="if (dst in ${cidr}) { accept }"`;
        case 'bird': return `route ${cidr} via "bgp_uplink";`;
        default: return cidr;
      }
    };

    if (mergeResults.value) {
      const allRecords = results.value.flatMap(r => filterIPs(r.data));
      output += `! --- NETMIRROR: ${stats.value.totalASNs} ASNs MERGED ---\n`;
      allRecords.forEach((ip, idx) => output += generateLine(ip.cidr, idx * 5, 'NETMIRROR_LIST') + '\n');
    } else {
      results.value.forEach(res => {
        if (res.error) { output += `! ERRO: ASN ${res.asn} não encontrado\n`; return; }
        const validIPs = filterIPs(res.data);
        if (validIPs.length === 0) return;
        output += `! --- ASN ${res.asn} (${validIPs.length} prefixos) ---\n`;
        validIPs.forEach((ip, idx) => output += generateLine(ip.cidr, idx * 5, `AS${res.asn}`) + '\n');
        output += '\n';
      });
    }
    return output;
  });

  return { inputAsns, results, loading, mergeResults, selectedVendor, showIPv4, showIPv6, fetchASNs, stats, formattedOutput };
});