<script setup lang="ts">
import { useNetMirrorStore } from './stores/netMirror';

const store = useNetMirrorStore();

const copyToClipboard = async () => {
  if(!store.formattedOutput) return;
  try {
    await navigator.clipboard.writeText(store.formattedOutput);
    alert('Copiado!');
  } catch (err) {
    console.error('Erro ao copiar', err);
  }
};
</script>

<template>
  <div class="min-h-screen bg-dark p-4 flex flex-col items-center">
    
    <header class="w-full max-w-5xl mb-8 mt-4 text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
        NetMirror <span class="text-primary">Global</span>
      </h1>
      <p class="text-gray-400 text-lg">NRO Statistics Explorer & BGP Filter Generator</p>
    </header>

    <main class="w-full max-w-5xl bg-surface rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
      
      <div class="p-6 border-b border-gray-700 bg-surface">
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Insira os ASNs para consulta
        </label>
        
        <textarea 
          v-model="store.inputAsns"
          class="w-full h-32 bg-dark text-white p-4 rounded-lg border border-gray-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition font-mono text-sm resize-none"
          placeholder="Ex: 28573, 26599"
          @keydown.ctrl.enter="store.fetchASNs"
        ></textarea>
        
        <div class="mt-4 flex flex-col sm:flex-row justify-end items-center gap-4">
          <span class="text-xs text-gray-500 hidden sm:block">Dica: Ctrl + Enter envia rápido</span>
          
          <button 
            @click="store.fetchASNs" 
            :disabled="store.loading"
            class="w-full sm:w-auto bg-primary hover:bg-emerald-400 text-dark font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            <span v-if="store.loading" class="animate-spin">⟳</span>
            {{ store.loading ? 'Buscando...' : 'Pesquisar ASNs' }}
          </button>
        </div>
      </div>

      <div v-if="store.results.length > 0" class="p-6 bg-[#0b1221]">
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="stat-box">
            <span class="stat-label">ASNs</span>
            <span class="stat-value text-white">{{ store.stats.totalASNs }}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">IPv4</span>
            <span class="stat-value text-blue-400">{{ store.stats.ipv4 }}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">IPv6</span>
            <span class="stat-value text-purple-400">{{ store.stats.ipv6 }}</span>
          </div>
          <div v-if="store.stats.errors" class="stat-box border-red-900/40 bg-red-900/10">
            <span class="stat-label text-red-400">Erros</span>
            <span class="stat-value text-red-500">{{ store.stats.errors }}</span>
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-4 justify-between items-center mb-4 bg-surface p-3 rounded-lg border border-gray-700">
          
          <div class="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
            <button 
              v-for="v in ['cisco', 'huawei', 'mikrotik', 'mikrotik_route', 'juniper', 'bird']" 
              :key="v"
              @click="store.selectedVendor = v"
              :class="store.selectedVendor === v ? 'bg-primary text-dark font-bold' : 'bg-dark text-gray-400 hover:text-white'"
              class="px-4 py-2 rounded text-sm transition whitespace-nowrap"
            >
              {{ v.replace('_', ' ') }}
            </button>
          </div>

          <div class="flex items-center gap-4 text-sm font-bold shrink-0">
            <label class="toggle-item">
              <input type="checkbox" v-model="store.mergeResults" class="accent-primary w-4 h-4">
              <span :class="store.mergeResults ? 'text-white' : 'text-gray-500'">Unificar Lista</span>
            </label>
            
            <div class="h-6 w-px bg-gray-600 mx-2"></div>
            
            <label class="toggle-item">
              <input type="checkbox" v-model="store.showIPv4" class="accent-blue-500 w-4 h-4">
              <span :class="store.showIPv4 ? 'text-blue-400' : 'text-gray-600'">v4</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="store.showIPv6" class="accent-purple-500 w-4 h-4">
              <span :class="store.showIPv6 ? 'text-purple-400' : 'text-gray-600'">v6</span>
            </label>
          </div>
        </div>

        <div class="relative group mt-2">
          <div class="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button 
              @click="copyToClipboard" 
              class="bg-primary hover:bg-white text-dark text-xs font-bold px-4 py-2 rounded shadow-lg transition-colors"
            >
              COPIAR CÓDIGO
            </button>
          </div>
          <pre class="bg-dark p-6 rounded-lg border border-gray-700 text-gray-300 font-mono text-xs md:text-sm h-96 overflow-y-auto custom-scrollbar leading-relaxed">{{ store.formattedOutput }}</pre>
        </div>

      </div>
    </main>
    
    <footer class="mt-12 text-gray-600 text-sm">
      <p>Dados via NRO Combined Stats</p>
    </footer>
  </div>
</template>