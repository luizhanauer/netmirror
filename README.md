# 🌐 NetMirror Global

O **NetMirror Global** é uma ferramenta de código aberto projetada para simplificar a vida de administradores de redes e engenheiros de tráfego BGP. Ele espelha diariamente os dados globais do **NRO (Number Resource Organization)**, processando milhões de registros para oferecer uma API estática de prefixos IP (IPv4 e IPv6) organizada por ASN.

O objetivo é fornecer dados "mastigados" para automação de filtros, firewalls e objetos de rede sem a necessidade de processar manualmente arquivos de estatísticas massivos de centenas de megabytes.

---

## 🚀 Como usar a API (Dados Estáticos)

O projeto disponibiliza endpoints diretos que podem ser consumidos por scripts, automações ou roteadores.

### 📄 Lista de Prefixos (TXT)

Ideal para automação via CLI, scripts de shell ou importação direta em objetos de rede. Retorna apenas os prefixos em formato CIDR, um por linha.

**Exemplo com `curl`:**

```bash
curl https://luizhanauer.github.io/netmirror/api/asn/28145.txt

```

### 📦 Dados Completos (JSON)

Ideal para desenvolvedores que desejam integrar informações de ASN em seus próprios dashboards ou sistemas.

**Exemplo de integração:**

```bash
# Requisição via terminal
curl https://luizhanauer.github.io/netmirror/api/asn/28145.json

```

---

## 💻 Interface Web

Você pode utilizar a interface amigável e minimalista para realizar consultas múltiplas e gerar formatadores de configuração para diversos fabricantes (Cisco, Huawei, Mikrotik, Juniper, BIRD).

🔗 **Acesse aqui:** [https://luizhanauer.github.io/netmirror/](https://luizhanauer.github.io/netmirror/)

### Funcionalidades do Site:

* **Busca Bulk:** Consulte vários ASNs simultaneamente.
* **Formatadores de CLI:** Gere listas de prefixos prontas para copiar e colar no seu roteador.
* **Filtros Inteligentes:** Alterne entre visualizações de IPv4 e IPv6.
* **PWA:** Instale o NetMirror como um aplicativo no seu desktop ou celular para acesso rápido.

---

## 🛠️ Tecnologias Utilizadas

Este projeto utiliza uma arquitetura **Serverless** moderna para garantir alta disponibilidade e custo zero:

* **Go (Golang):** O motor de processamento. Um binário de alta performance que faz o parsing diário de dados do NRO (RIPE, LACNIC, ARIN, APNIC, AFRINIC) em segundos.
* **Vue 3 + TypeScript:** Interface reativa, rápida e tipada.
* **Vite + Tailwind CSS v4:** Build ultra-rápido e estilização moderna baseada em utilitários.
* **GitHub Actions:** Automação total (CI/CD). O backend roda diariamente via cron e o frontend é publicado automaticamente.
* **Pinia:** Gerenciamento de estado global para buscas múltiplas e preferências do usuário.

---

## ☕ Apoie o Projeto

Se o NetMirror Global ajudou você a automatizar sua rede ou facilitou seu trabalho diário, considere apoiar a manutenção do projeto:

Se você gostou do meu trabalho e quer me agradecer, você pode me pagar um café :)

<a href="https://www.paypal.com/donate/?hosted_button_id=SFR785YEYHC4E" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 150px !important;" ></a>


---

## 📄 Licença

Este projeto está sob a licença [MIT]. Os dados de recursos de numeração de internet são providos pelo NRO e seguem suas respectivas políticas de uso.
