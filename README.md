# CargaCerta ⚡🚗

> 🌐 **Language / Idioma:** [English](#english) | [Português](#português)

---

<a id="english"></a>
## 🇬🇧 English

**CargaCerta** is a complete web application for electric vehicle (EV) drivers in Portugal. It allows you to compare and simulate the **real charging cost** across the national network (Mobi.E and Tesla Superchargers), integrating station tariffs (**OPC**) with the user's electric mobility cards and plans (**CEMEs**) (BMW Charging, MINI Charging, Mercedes me, Tesla App, Continente Plug&Charge, Atlante, Galp, EDP, Via Verde, Goldenergy, Repsol, Miio, etc.).

---

### 🚀 Key Features

#### 1. 💳 CEME Cards & Plans Manager
- **Personalized wallet:** Add, edit, activate, or deactivate your cards and plans.
- **Ready-to-use presets based on the market and ERSE simulators:**
  - **BMW Charging Active** and **BMW + IONITY Plus** (fixed per-minute rates / IONITY discounts).
  - **MINI Charging Active** and **MINI + IONITY Plus**.
  - **Mercedes me Charge M and L**.
  - **Tesla App** (No subscription or with *Membership* for member rates on open Superchargers).
  - **Continente Plug&Charge** (direct rate of 0.34 €/kWh and 10% card cashback).
  - **Atlante** (direct rate on own network and Mobi.E conditions).
  - **Galp Electric** (with Continente Card discount).
  - **EDP Mobilidade**, **Via Verde Electric**, **Goldenergy**, **Repsol Move/Waylet**, **Miio / EVIO**.
- **Custom card creation:** Set kWh price, activation fee, per-minute rate, and discount percentage.
- **"Best Card Auto" mode:** The app automatically calculates and selects the most economical card for each specific station.

#### 2. 🔍 Comparator & Detailed Bill Breakdown
- **Energy requirement calculation:** Search for your EV model (or enter battery capacity) and set the current charge percentage and target charge.
- **Transparent cost formula (Mobi.E + CEMEs):**
  - $\text{⚡ CEME Energy (kWh)}$
  - $\text{⏳ OPC Station Time / Occupancy (€/min)}$
  - $\text{🔌 Activation / Session Fee}$
  - $\text{🎁 Card Discounts / Cashback}$
  - $\text{💰 Forecast Total with 23\% VAT included}$
- **Tesla Supercharger support:** Clear identification of stations open to all brands and proprietary network warning (no Mobi.E intermediation).

#### 3. 🗺️ Interactive Map View & GPS Geolocation
- **Integrated Leaflet map:** Quick toggle between List view and Map view.
- **Device geolocation:** Discover stations within a configurable radius (5 km, 10 km, 20 km, 50 km).
- **Unified interactive popup:** Check power, connectors, operator, OPC time rates, price/duration estimate, and send the station directly to the monthly simulator.

#### 4. 📊 Monthly Bill Simulator & Home/Combustion Comparison
- **Monthly spending estimate:** Adjust weekly mileage, average consumption (kWh/100 km), and extra station dwell time.
- **🏠 Home Charging Comparison (Domestic Tariff):**
  - Integration of real supplier tariffs in Portugal: **Galp Casa** (5.75 kVA, 0.1467 €/kWh, 0.4274 €/day, -4.17 € discount), **EDP Comercial** (5.75 kVA, 0.1340 €/kWh, 0.4160 €/day), **Goldenergy**, and **Custom** mode.
  - Support for **Simple** and **Bi-hourly (Off-peak)** cycles.
  - Tax calculation with Portuguese taxes (23% VAT + IEC fee 0.001 €/kWh).
  - Cost per 100 km at home (~2.50 € / 100 km) and monthly savings compared to public charging.
- **⛽ Combustion Comparison (DGEG):** Direct comparison of the EV monthly bill against **Gasoline 95** and **Diesel** vehicles, with official daily averages in Portugal and a fuel price adjustment panel.

#### 5. 🌐 Bilingual Support (PT / EN)
- Fully translated interface in **Portuguese** and **English** (including CEME vs OPC guide and informational notes).

---

### 🛠️ Technologies

- **Frontend:** React 19, Vite, native modular CSS with dark/green sustainable theme.
- **Maps:** Leaflet.
- **Internationalization:** Context API with PT/EN dictionaries.
- **Quality & Linting:** Oxlint.

---

### 💻 Installation and Development

Prerequisites: **Node.js 18+** and **npm**.

```bash
# 1. Install dependencies
npm install

# 2. Start development server (http://localhost:5173)
npm run dev

# 3. Run linter
npm run lint

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

---

### 📡 Data Source and Updates

Base station and tariff data comes from the national public catalog provided by **Mobi.E** ("Download Tariffs") and the **Tesla Superchargers** mapping in Portugal.

- **Real-time in-browser update:** *"Update tariffs"* button in the app's top bar (downloads the latest Mobi.E CSV via the browser).
- **Repository/build update:**
  ```bash
  npm run sync:tarifas
  ```
  The `scripts/sync-tarifas.mjs` script downloads the official CSV, processes municipalities, districts, outlets, and tariffs, updating the `public/data/postos.json` file.

---

### 📁 Project Structure

```
ceme_veichle/
├── public/
│   └── data/
│       └── postos.json              # Generated national dataset (Mobi.E + coordinates)
├── scripts/
│   └── sync-tarifas.mjs             # Mobi.E data sync script
├── src/
│   ├── components/
│   │   ├── CardsManager.jsx         # CEME card management and creation modal
│   │   ├── CemeExplainer.jsx        # Explanatory guide for CEME vs OPC ecosystem
│   │   ├── MonthlyCostSimulator.jsx # Monthly simulator and DGEG comparison
│   │   └── StationsMap.jsx          # Interactive Leaflet map and station popups
│   ├── data/
│   │   ├── municipio-coords.json    # Geographic coordinates of municipalities
│   │   ├── municipio-distrito.json  # Municipality → district mapping
│   │   ├── teslaStations.js         # Tesla Supercharger network in Portugal
│   │   ├── useTarifas.js            # Tariff loading and state hook
│   │   └── vehicles.js              # EV models and battery database
│   ├── lib/
│   │   ├── cards.js                 # Rules engine, CEME cards, and presets
│   │   ├── fuel.js                  # DGEG daily average prices and consumption
│   │   ├── geo.js                   # Distance calculation and GPS functions
│   │   ├── i18n.jsx                 # Translation system and dictionaries (PT/EN)
│   │   ├── operators.js             # CEME/OPC operator code mapping
│   │   ├── pricing.js               # Cost calculation, OPC tariffs, and ad-hoc
│   │   ├── refreshTarifas.js        # In-browser CSV download utility
│   │   └── tarifasParser.js         # Mobi.E tariff parser
│   ├── App.jsx                      # Main application component
│   ├── App.css                      # Global styles and app component styles
│   └── main.jsx                     # React entry point
└── package.json
```

---

### ⚖️ Legal Notice and Disclaimer

The costs presented are estimates calculated based on Mobi.E public tariffs, CEME commercial offers, and DGEG average prices. Always confirm the final amount in your electric mobility operator's app before starting a charging session.

---
---

<a id="português"></a>
## 🇵🇹 Português

**CargaCerta** é uma aplicação web completa para condutores de veículos elétricos (VE) em Portugal. Permite comparar e simular o **custo real de carregamento** em toda a rede nacional (Mobi.E e Superchargers Tesla), integrando as tarifas do posto (**OPC**) com os cartões e planos de mobilidade elétrica (**CEMEs**) do utilizador (BMW Charging, MINI Charging, Mercedes me, Tesla App, Continente Plug&Charge, Atlante, Galp, EDP, Via Verde, Goldenergy, Repsol, Miio, etc.).

---

### 🚀 Principais Funcionalidades

#### 1. 💳 Gestor de Cartões & Planos CEME
- **Carteira personalizada:** Adicione, edite, ative ou desative os seus cartões e planos.
- **Predefinições prontas com base no mercado e simuladores ERSE:**
  - **BMW Charging Active** e **BMW + IONITY Plus** (tarifas fixas por minuto / descontos IONITY).
  - **MINI Charging Active** e **MINI + IONITY Plus**.
  - **Mercedes me Charge M e L**.
  - **Tesla App** (Sem mensalidade ou com *Membership* para tarifas de membro em Superchargers abertos).
  - **Continente Plug&Charge** (tarifa direta de 0,34 €/kWh e 10% de cashback em cartão).
  - **Atlante** (tarifa direta na rede própria e condições Mobi.E).
  - **Galp Electric** (com desconto em Cartão Continente).
  - **EDP Mobilidade**, **Via Verde Electric**, **Goldenergy**, **Repsol Move/Waylet**, **Miio / EVIO**.
- **Criação de cartões personalizados:** Defina preço de kWh, taxa de ativação, tarifa por minuto e percentagem de desconto.
- **Modo "Melhor Cartão Automático":** A aplicação calcula e seleciona automaticamente o cartão mais económico para cada posto específico.

#### 2. 🔍 Comparador & Discriminação Detalhada de Fatura
- **Cálculo da energia necessária:** Pesquise o modelo do seu VE (ou insira a capacidade da bateria) e defina a percentagem atual e o objetivo de carga.
- **Fórmula de custo transparente (Mobi.E + CEMEs):**
  - $\text{⚡ Energia CEME (kWh)}$
  - $\text{⏳ Tempo / Ocupação do Posto OPC (€/min)}$
  - $\text{🔌 Taxa de Ativação / Sessão}$
  - $\text{🎁 Descontos de Cartão / Cashback}$
  - $\text{💰 Total Previsto com IVA 23\% incluído}$
- **Suporte a Superchargers Tesla:** Identificação clara de postos abertos a todas as marcas e aviso de rede proprietária (sem intermediação Mobi.E).

#### 3. 🗺️ Visão Mapa Interativo & Geolocalização GPS
- **Mapa Leaflet integrado:** Alternância rápida entre visão em Lista e visão em Mapa.
- **Geolocalização do dispositivo:** Descubra postos num raio configurável (5 km, 10 km, 20 km, 50 km).
- **Popup unificado e interativo:** Consulte potência, conectores, operador, taxas de tempo OPC, estimativa de preço/duração e envie o posto diretamente para a simulação mensal.

#### 4. 📊 Simulador de Fatura Mensal & Comparativo com Casa e Combustão
- **Estimativa de gastos mensais:** Ajuste os quilómetros semanais, consumo médio (kWh/100 km) e tempo extra de permanência no posto.
- **🏠 Comparativo de Carregamento em Casa (Tarifa Doméstica):**
  - Integração de tarifários reais de fornecedores em Portugal: **Galp Casa** (5.75 kVA, 0,1467 €/kWh, 0,4274 €/dia, desconto de -4,17 €), **EDP Comercial** (5.75 kVA, 0,1340 €/kWh, 0,4160 €/dia), **Goldenergy** e modo **Personalizado**.
  - Suporte a ciclos **Simples** e **Bi-horário (Vazio)**.
  - Cálculo fiscal com impostos portugueses (IVA 23% + taxa IEC 0,001 €/kWh).
  - Cálculo de custo por 100 km em casa (~2,50 € / 100 km) e poupança mensal face ao carregamento na rua.
- **⛽ Comparativo com Combustão (DGEG):** Comparação direta da fatura mensal do VE face a veículos a **Gasolina 95** e **Gasóleo Simples**, com médias diárias oficiais em Portugal e painel de ajuste de preços de combustível.

#### 5. 🌐 Suporte Bilingue (PT / EN)
- Interface integralmente traduzida em **Português** e **Inglês** (incluindo guia de funcionamento CEME vs OPC e notas informativas).

---

### 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, Vite, CSS modular nativo com tema escuro/verde sustentável.
- **Mapas:** Leaflet.
- **Internacionalização:** Context API com dicionários PT/EN.
- **Qualidade & Linting:** Oxlint.

---

### 💻 Instalação e Desenvolvimento

Pré-requisitos: **Node.js 18+** e **npm**.

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento (http://localhost:5173)
npm run dev

# 3. Executar o linter
npm run lint

# 4. Gerar build de produção
npm run build

# 5. Pré-visualizar o build de produção
npm run preview
```

---

### 📡 Fonte e Atualização dos Dados

Os dados base de postos e tarifas provêm do catálogo público nacional disponibilizado pela **Mobi.E** ("Descarregar Tarifas") e do mapeamento de **Superchargers Tesla** em Portugal.

- **Atualização em tempo real no browser:** Botão *"Atualizar tarifas"* na barra superior da aplicação (faz o download do CSV mais recente da Mobi.E via browser).
- **Atualização do repositório/build:**
  ```bash
  npm run sync:tarifas
  ```
  O script `scripts/sync-tarifas.mjs` descarrega o CSV oficial, processa os concelhos, distritos, tomadas e tarifas, atualizando o ficheiro `public/data/postos.json`.

---

### 📁 Estrutura do Projeto

```
ceme_veichle/
├── public/
│   └── data/
│       └── postos.json              # Dataset nacional gerado (Mobi.E + coordenadas)
├── scripts/
│   └── sync-tarifas.mjs             # Script de sincronização de dados Mobi.E
├── src/
│   ├── components/
│   │   ├── CardsManager.jsx         # Modal de gestão e criação de cartões CEME
│   │   ├── CemeExplainer.jsx        # Guia explicativo do ecossistema CEME vs OPC
│   │   ├── MonthlyCostSimulator.jsx # Simulador mensal e comparativo DGEG
│   │   └── StationsMap.jsx          # Mapa interativo Leaflet e popups de postos
│   ├── data/
│   │   ├── municipio-coords.json    # Coordenadas geográficas dos municípios
│   │   ├── municipio-distrito.json  # Mapeamento concelho → distrito
│   │   ├── teslaStations.js         # Rede de Superchargers Tesla em Portugal
│   │   ├── useTarifas.js            # Hook de carregamento e estado das tarifas
│   │   └── vehicles.js              # Base de dados de modelos VE e baterias
│   ├── lib/
│   │   ├── cards.js                 # Motor de regras, cartões CEME e presets
│   │   ├── fuel.js                  # Preços médios diários DGEG e consumos
│   │   ├── geo.js                   # Funções de cálculo de distância e GPS
│   │   ├── i18n.jsx                 # Sistema e dicionários de tradução (PT/EN)
│   │   ├── operators.js             # Mapeamento de códigos de operadores CEME/OPC
│   │   ├── pricing.js               # Cálculo de custos, tarifas OPC e ad-hoc
│   │   ├── refreshTarifas.js        # Utilitário de download do CSV no browser
│   │   └── tarifasParser.js         # Parser de tarifas Mobi.E
│   ├── App.jsx                      # Componente principal da aplicação
│   ├── App.css                      # Estilos globais e componentes da app
│   └── main.jsx                     # Ponto de entrada React
└── package.json
```

---

### ⚖️ Nota Legal e Isenção de Responsabilidade

Os custos apresentados são estimativas calculadas com base nas tarifas públicas da Mobi.E, nas ofertas comerciais dos CEMEs e nos preços médios da DGEG. Confirme sempre o valor final na aplicação do seu operador de mobilidade elétrica antes de iniciar a sessão de carregamento.
