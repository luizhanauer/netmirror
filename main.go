package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

type IPRecord struct {
	Registry string `json:"registry"`
	Type     string `json:"type"`
	Start    string `json:"start"`
	Prefix   int    `json:"prefix"`
	CIDR     string `json:"cidr"`
	CC       string `json:"cc"`
	Date     string `json:"date"`
}

func calculatePrefix(ipType string, valueStr string) int {
	val, _ := strconv.Atoi(valueStr)
	if ipType == "ipv4" {
		// NRO mantém o padrão: 32 - log2(quantidade)
		return 32 - int(math.Log2(float64(val)))
	}
	// No IPv6 do NRO, o valor já é o tamanho do prefixo (ex: 32)
	return val
}

func main() {
	// URL Unificada do NRO (RIPE NCC Mirror)
	const url = "https://ftp.ripe.net/pub/stats/ripencc/nro-stats/latest/combined-stat"
	const outputDir = "public/api/asn"

	os.RemoveAll("public")
	os.MkdirAll(outputDir, 0755)

	fmt.Println("🌐 Baixando base global do NRO...")
	resp, err := http.Get(url)
	if err != nil {
		fmt.Printf("Erro: %v\n", err)
		return
	}
	defer resp.Body.Close()

	opaqueToASN := make(map[string]string)
	opaqueToIPs := make(map[string][]IPRecord)

	scanner := bufio.NewScanner(resp.Body)
	// Buffer aumentado para linhas longas, comum em arquivos grandes de rede
	buf := make([]byte, 0, 64*1024)
	scanner.Buffer(buf, 1024*1024)

	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "#") || line == "" {
			continue
		}

		parts := strings.Split(line, "|")
		if len(parts) < 7 {
			continue
		}

		registry := parts[0]
		cc := parts[1]
		resourceType := parts[2]

		// O NRO segue: registry|cc|type|start|value|date|status|opaque_id
		// Em alguns casos o opaque_id pode estar na posição 7 (index 6 ou 7)
		// Vamos garantir a captura do OpaqueID se disponível
		var opaqueID string
		if len(parts) >= 8 {
			opaqueID = parts[7]
		}

		if resourceType == "asn" {
			asn := parts[3]
			if opaqueID != "" {
				opaqueToASN[opaqueID] = asn
			}
		} else if (resourceType == "ipv4" || resourceType == "ipv6") && opaqueID != "" {
			prefixLen := calculatePrefix(resourceType, parts[4])
			record := IPRecord{
				Registry: registry,
				Type:     resourceType,
				Start:    parts[3],
				Prefix:   prefixLen,
				CIDR:     fmt.Sprintf("%s/%d", parts[3], prefixLen),
				CC:       cc,
				Date:     parts[5],
			}
			opaqueToIPs[opaqueID] = append(opaqueToIPs[opaqueID], record)
		}
	}

	fmt.Println("🛠️ Mapeando e gravando arquivos globais...")
	count := 0
	for opaqueID, asn := range opaqueToASN {
		ips := opaqueToIPs[opaqueID]
		if len(ips) == 0 {
			continue
		}

		// Grava JSON
		jsonPath := filepath.Join(outputDir, fmt.Sprintf("%s.json", asn))
		jsonFile, _ := os.Create(jsonPath)
		json.NewEncoder(jsonFile).Encode(ips)
		jsonFile.Close()

		// Grava TXT
		txtPath := filepath.Join(outputDir, fmt.Sprintf("%s.txt", asn))
		txtFile, _ := os.Create(txtPath)
		for _, ip := range ips {
			txtFile.WriteString(ip.CIDR + "\n")
		}
		txtFile.Close()
		count++
	}

	fmt.Printf("✅ Sucesso! %d ASNs processados com dados globais.\n", count)
}
