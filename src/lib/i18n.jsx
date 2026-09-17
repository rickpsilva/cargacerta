import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export const LANG_STORAGE_KEY = 'cargacerta_user_lang'

export const DICTIONARY = {
  pt: {
    // Header & Nav
    brandName: 'CargaCerta',
    headerExplainerBtn: '💡 Como funciona CEME?',
    headerCardsBtn: '💳 Os Meus Cartões',
    headerOfficialLink: 'Mobi.E',

    // Hero
    heroEyebrow: 'Carregamento elétrico em Portugal · Rede MOBI.E & CEMEs',
    heroTitle: 'Encontre o carregamento mais barato com os seus cartões.',
    heroCopy:
      'Compare postos e simule o preço real usando os seus cartões CEME (BMW Charging, MINI Charging, Mercedes me, Tesla App, Atlante, Galp, EDP e mais). Descubra quanto poupa face ao preço avulso do posto.',
    heroActiveCardsBadge: 'cartão(ões) CEME ativo(s)',
    heroManageBadge: 'Gerir',
    heroGuideBadgeTitle: 'Tarifas CEME vs OPC: Como poupar',
    heroGuideBadgeAction: 'Ver Guia',

    // Planner
    plannerTitle: 'O seu veículo & cartão',
    plannerSubtitle: 'Indique a bateria, carga pretendida e o cartão CEME que quer utilizar.',
    vehicleFieldLabel: 'Veículo (opcional)',
    vehicleFieldPlaceholder: 'Pesquisar por marca/modelo, ex. BMW iX3, MINI Countryman, Tesla…',
    cardSelectLabel: 'Cartão CEME para cálculo',
    cardSelectAuto: '✨ Melhor Cartão Automático (Compara {count} ativos)',
    cardSelectNone: '❌ Sem cartão (Preço Avulso de Balcão)',
    cardSelectManageBtn: '⚙️ Gerir',
    batteryCapacityLabel: 'Capacidade da bateria',
    currentChargeLabel: 'Carga atual',
    targetChargeLabel: 'Carregar até',
    energyNeededLabel: 'Energia a carregar',
    energyCapacityOf: 'de {cap} kWh de capacidade',
    selectedCardPillLabel: 'Cartão selecionado:',
    autoCardPillLabel: 'Modo comparador:',
    autoCardPillValue: 'Melhor cartão por posto',

    // Stations
    stationsStep: 'Explorar rede',
    stationsTitle: 'Postos disponíveis',
    stationsFoundSummary: '{count} postos encontrados · ordenados por {sort}',
    sortPriceAsc: 'preço mais baixo',
    sortSavingsDesc: 'maior poupança',
    sortPowerDesc: 'maior potência',
    sortDurationAsc: 'menor tempo',
    sortDistanceAsc: 'mais próximo',

    // View Mode & Geolocation
    viewModeList: '📋 Lista',
    viewModeMap: '🗺️ Mapa',
    geoLocateBtn: '📍 Minha Localização',
    geoLocatingBtn: '📍 A detetar...',
    geoLocateSuccess: 'Localização detetada ({locality})',
    geoLocateError: 'Não foi possível obter a sua localização GPS.',
    geoClearBtn: 'Limpar GPS ✕',
    geoRadiusLabel: 'Raio de proximidade:',
    geoRadiusOptionAll: 'Sem limite de raio',
    geoRadiusOption10: 'Até 10 km',
    geoRadiusOption20: 'Até 20 km',
    geoRadiusOption50: 'Até 50 km',
    geoRadiusOption100: 'Até 100 km',
    yourLocationTitle: 'A sua localização',
    distanceKmLabel: 'a {dist} km',

    // Data Refresh
    tariffDateLabel: 'Tarifário de {date}',
    tariffDateUnknown: 'Data do tarifário desconhecida',
    refreshFailed: 'Falha ao atualizar ({error}).',
    dismissBtn: 'Fechar',
    refreshBtn: 'Atualizar tarifas',
    refreshingBtn: 'A atualizar…',
    progressDownload: 'A descarregar o CSV nacional de tarifas…',
    progressDownloadPercent: 'A descarregar o CSV nacional de tarifas… {percent}%',
    progressParsing: 'A processar os preços dos postos de carregamento…',
    progressDone: 'Concluído.',

    // Filters
    searchPlaceholder: 'Pesquisar concelho, morada ou operador (CEME)',
    allDistricts: 'Todos os distritos',
    anySpeed: 'Qualquer velocidade',
    allOperators: 'Todos os operadores',
    sortOptionPrice: 'Ordenar: Preço mais baixo',
    sortOptionSavings: 'Ordenar: Maior poupança CEME',
    sortOptionPower: 'Ordenar: Maior potência (kW)',
    sortOptionDuration: 'Ordenar: Menor tempo',

    // Speed labels
    speedNormal: 'Normal (lento)',
    speedSemiRapid: 'Semirrápido',
    speedRapid: 'Rápido',
    speedUltraRapid: 'Ultrarrápido',

    // Pricing category labels
    pricingAdHoc: 'Preço avulso (sem contrato)',
    pricingBlank: 'Preço publicado',
    pricingRegular: 'Requer contrato com um CEME',

    // States
    loadingCatalog: 'A carregar o catálogo nacional de postos de carregamento…',
    errorCatalog: 'Não foi possível carregar os dados dos postos ({error}). Consulte diretamente a ',
    noStationsFound: 'Não foram encontrados postos para esta pesquisa. Experimente outro distrito, tipo de carregamento ou termo de pesquisa.',
    showMoreStations: 'Mostrar mais postos ({count} restantes)',

    // Station Card
    powerNotAvailable: 'Potência n/d',
    operatorLabelPrefix: 'Operador (OPC):',
    addressNotAvailable: 'Morada não disponível',
    moreSockets: '+{count} tomada(s)',
    requiresTeslaApp: '📲 Requer App Tesla',
    bestCardTag: 'Melhor: {name}',
    teslaDirectTag: 'App Tesla (Sem Cartão CEME)',
    adhocTag: 'Preço Normal CEME / Balcão',
    saveBadge: '🎉 Poupa {val}',
    stdRefCost: 'Ref. Normal: {val}',
    costEstimateLabel: 'Estimativa de Custo',
    noTariff: 'Sem tarifa',
    timeEstimateLabel: 'Tempo Estimado',
    opcTimeRateBadge: '⏳ Tempo OPC: {rate} €/min',
    opcNoTimeFeeBadge: '⏳ Sem taxa por minuto',
    opcTimeCostDetail: 'Parcela Tempo/Ocupação ({time} min × {rate}€):',
    opcActivationDetail: 'Taxa de Ativação/Sessão (OPC):',
    opcEnergyDetail: 'Parcela Energia Posto (OPC):',
    showDetailsBtn: '▼ Ver discriminação da fatura',
    hideDetailsBtn: '▲ Ocultar detalhes',
    useInSimBtn: '📊 Usar na Simulação Mensal',
    selectedInSimBtn: '✓ Posto Selecionado no Simulador',

    // Station Breakdown Drawer
    breakdownTitle: 'Discriminação do Custo:',
    breakdownEnergyCeme: '⚡ Energia CEME ({name}): {kwh} kWh × {rate} €/kWh',
    breakdownEnergyStation: '⚡ Energia do Posto (OPC): {kwh} kWh × {rate} €/kWh',
    breakdownEnergyStationExtra: '⚡ Parcela Energia Posto OPC: {kwh} kWh × {rate} €/kWh',
    breakdownEnergyTesla: '⚡ Energia App Tesla: {kwh} kWh × {rate} €/kWh',
    breakdownTimeOpc: '⏳ Tempo / Ocupação Posto (OPC): ~{time} min × {rate} €/min',
    breakdownTimeOpcFree: '⏳ Tempo / Ocupação Posto (OPC): Isento (sem taxa por minuto)',
    breakdownActivationFee: '🔌 Taxa de Ativação / Sessão (OPC + CEME):',
    breakdownCardDiscount: '🎁 Desconto do Cartão ({name}):',
    breakdownBmwTimeModel: '⏱️ Tarifa por Minuto ({name}): ~{time} min × {rate} €/min',
    breakdownBmwTimeModelNote: 'ℹ️ No plano BMW/MINI Active paga uma tarifa fixa por minuto que já inclui a energia e a ocupação do posto.',
    breakdownDirectNetwork: '🏷️ Tarifa Direta na Rede ({name}): {kwh} kWh × {rate} €/kWh',
    breakdownDirectNetworkNote: 'ℹ️ Tarifa plana tudo incluído da rede (sem cobrança adicional de CEME ou taxas Mobi.E).',
    includedInMinuteRate: 'Incluída no tempo',
    teslaNoSubBreakdown: 'Tarifa App Tesla (Sem Subscrição):',
    teslaNoSubBreakdownValue: '~0,39 €/kWh (0,23€ fora pico / 0,41€ pico)',
    specialCardRateLabel: 'Tarifa Especial Cartão:',
    opcPortionLabel: 'Parcela Posto (OPC):',
    cemePortionLabel: 'Parcela Cartão ({name}):',
    cardDiscountLabel: 'Desconto Cartão:',
    totalExpectedLabel: 'Total Previsto:',
    vatIncludedNotice: 'IVA 23% incluído',
    alternativeCardTip: '💡 Sugestão: Com o plano {name} pagaria apenas {cost} neste posto.',
    teslaNetworkNotice: 'ℹ️ Rede proprietária Tesla: Cartões CEME (BMW, Galp, EDP, etc.) não são aceites. Inicie a sessão na App Tesla.',
    publishedTariffLabel: 'Tarifário publicado:',

    // Map Selected Station Card
    mapSelectedStationTitle: 'Posto Selecionado no Mapa',
    mapSelectedViewDetails: '📋 Ver Ficha Completa',
    mapSelectedUsedInSim: '✓ Selecionado no Simulador',
    mapClosePreview: 'Fechar',
    mapPopupClose: 'Fechar ✕',

    // Monthly Simulator
    simHeading: 'Simulador de Fatura Mensal',
    simSubtitle: 'Estimativa de custos ao final do mês a carregar na rua.',
    simKmPerWeek: 'Quilómetros por semana',
    simKmPerMonth: '~{km} km/mês',
    simAvgConsumption: 'Consumo médio',
    simExtraTimeOpc: 'Tempo extra no posto (OPC)',
    simRefStationLabel: 'Posto de Referência:',
    simRefStationAuto: 'Posto mais barato da lista (Auto)',
    simMethodLabel: 'Método de Carregamento:',
    simCardLabel: 'Cartão CEME:',
    simEstimatedTotal: 'Fatura Total Estimada',
    simTotalSubtext: 'Carregamentos + Mensalidade',
    simEnergyConsumed: '⚡ Energia consumida (~{kwh} kWh):',
    simCardSubscription: '💳 Mensalidade cartão ({name}):',
    simIdlePenalty: '⏳ Tarifa de tempo/ocupação OPC:',
    simCostPer100Km: '🚗 Custo por 100 km:',
    simCombustionCompTitle: 'Comparativo com Combustão (DGEG)',
    simAdjustPricesBtn: '⚙️ Ajustar Preços',
    simCloseConfigBtn: 'Fechar ✕',
    simFuelConfigHelp: 'Valores de referência diários médios em Portugal (DGEG). Pode ajustar consoante o preço no seu posto habitual.',
    simGasoline95Field: 'Gasolina 95 (€/L)',
    simGasolineConsumptionField: 'Consumo Gasolina (L/100km)',
    simDieselField: 'Gasóleo Simples (€/L)',
    simDieselConsumptionField: 'Consumo Gasóleo (L/100km)',
    simResetFuelBtn: 'Restaurar preços diários médios DGEG (Portugal)',
    simVsGasoline: 'Vs. Gasolina 95 ({price}€/L · {cons}L)',
    simVsDiesel: 'Vs. Gasóleo ({price}€/L · {cons}L)',
    simSavesMonthly: '🎉 Poupa {val}/mês',
    simCostsMoreMonthly: '{val}/mês a mais',
    simManageCardsBtn: '💳 Gerir Mensalidades & Cartões',
    simUnderstandOpcBtn: '💡 Entender Taxas de Tempo OPC',

    // Home Charging Simulation
    simHomeCompTitle: 'Carregamento em Casa (Tarifa Doméstica)',
    simHomeSubtitle: 'Compare o custo na rua com o que pagaria a carregar na sua tomada/wallbox.',
    simHomeConfigBtn: '⚙️ Configurar Casa',
    simHomePresetLabel: 'Tarifa Predefinida:',
    simHomePresetGalp: 'Galp Casa (5.75 kVA)',
    simHomePresetEdp: 'EDP Comercial (5.75 kVA)',
    simHomePresetGold: 'Goldenergy / Outra',
    simHomePresetCustom: 'Personalizado',
    simHomeCycleLabel: 'Ciclo Horário:',
    simHomeCycleSimple: 'Simples',
    simHomeCycleBiHourly: 'Bi-horário (Vazio / Fora de Vazio)',
    simHomeCycleTriHourly: 'Tri-horário (Ponta / Cheias / Vazio)',
    simHomeTriHourlySlotLabel: 'Horário de Carga:',
    simHomeSlotVazio: '🌙 Vazio (Noite)',
    simHomeSlotCheias: '☀️ Cheias (Dia)',
    simHomeSlotPonta: '⚡ Ponta (Pico)',
    simHomeRatesTriSection: 'Preços por Período (€/kWh base):',
    simHomeRateVazioShort: 'Vazio',
    simHomeRateCheiasShort: 'Cheias',
    simHomeRatePontaShort: 'Ponta',
    simHomeEnergyRateLabel: 'Preço Energia (€/kWh base):',
    simHomeEnergyRateVazioLabel: 'Preço Vazio (€/kWh base):',
    simHomeFixedDailyLabel: 'Termo Fixo Potência (€/dia base):',
    simHomeDiscountLabel: 'Desconto Fatura (€/mês):',
    simHomeApplyFixedTermLabel: 'Aplicar termo fixo de potência (€/dia)',
    simHomeApplyDiscountLabel: 'Aplicar desconto mensal da fatura (€/mês)',
    simHomeApplyTaxesLabel: 'Aplicar impostos (IVA 23% + IEC 0,001€)',
    simHomeVsStreet: '🏠 Em Casa ({name}):',
    simHomeCostDetail: '~{rate} €/kWh · {cost100} €/100km',
    simHomeSavesVsStreet: '🎉 Poupa {val}/mês vs. rua',
    simHomeCardTip: '💡 Dica: Em casa pagaria apenas {val} por esta mesma carga ({rate} €/kWh).',
    simResetHomeBtn: 'Restaurar valores Galp Casa (0,1467€/kWh + 0,4274€/dia)',

    // Cards Manager Modal
    cardsModalEyebrow: 'Carteira de Mobilidade Elétrica',
    cardsModalTitle: 'Os Meus Cartões CEME',
    cardsModalSubtitle: 'Configure os seus cartões (BMW, Tesla, Atlante, Galp, EDP, etc.) para calcular o valor real que paga em cada posto.',
    cardsActiveCountStat: 'Cartões Ativos',
    cardsTotalFeesStat: 'Total em Mensalidades',
    cardsHowItWorksBtn: '💡 Como funciona a faturação CEME/OPC?',
    cardsSavedTitle: 'Cartões Guardados ({count})',
    cardsNewCustomBtn: '+ Novo Cartão Personalizado',
    cardsCancelBtn: 'Cancelar',
    cardsAddCustomHeading: 'Adicionar Cartão Personalizado',
    cardsFieldProvider: 'Fornecedor / CEME',
    cardsFieldName: 'Nome do Cartão',
    cardsFieldKwhPrice: 'Preço Energia (€/kWh)',
    cardsFieldActivationFee: 'Taxa de Ativação (€/sessão)',
    cardsFieldMinuteFee: 'Taxa por Minuto (€/min)',
    cardsFieldMonthlyFee: 'Mensalidade (€/mês)',
    cardsFieldDiscount: 'Desconto (%)',
    cardsFieldNotes: 'Observações / Notas',
    cardsSaveCardBtn: 'Guardar Cartão',
    cardsEmptyNotice: 'Ainda não tem cartões adicionados. Escolha um dos modelos abaixo ou crie um cartão personalizado.',
    cardsRateEnergy: 'Energia',
    cardsRateIonity: 'IONITY',
    cardsRateActivation: 'Ativação',
    cardsRateMonthly: 'Mensalidade',
    cardsRateDiscount: 'Desconto',
    cardsSetActiveBtn: 'Usar como Ativo',
    cardsIsActiveBadge: '✓ Cartão Selecionado',
    cardsEditBtnTitle: 'Editar valores do cartão',
    cardsDeleteBtnTitle: 'Remover cartão',
    cardsSaveInlineBtn: 'Guardar',
    cardsCatalogTitle: 'Catálogo de Cartões CEME (ERSE & Marcas Oficiais)',
    cardsCatalogSub: 'Adicione com 1 clique planos de referência (Mercedes, BMW, Tesla, Via Verde, Continente, Goldenergy, Galp, Repsol, etc.) baseados nos dados públicos e ofertas ERSE. Pode editar qualquer valor.',
    cardsCatAll: 'Todos ({count})',
    cardsCatAuto: '🚗 Marcas Auto',
    cardsCatRetail: '🛒 Retalho / Descontos',
    cardsCatEnergy: '⚡ Energia / Combustíveis',
    cardsCatApps: '📱 Apps & Mobilidade',
    cardsAddPresetBtn: '+ Adicionar à Minha Carteira',
    cardsAddedPresetBtn: '✓ Adicionado à Carteira',
    cardsFreeMonthlyTag: 'Sem Mensalidade',
    cardsModalDoneBtn: 'Concluir & Voltar aos Postos',

    // CEME Explainer Modal
    explainerEyebrow: 'Guia de Carregamento em Portugal',
    explainerTitle: 'Como funciona a faturação MOBI.E & CEME?',
    explainerSubtitle: 'Entenda como a combinação entre cartões CEME e operadores de postos (OPC) permite poupar centenas de euros por ano.',
    explainerSec1Title: '1. O Modelo Português (MOBI.E)',
    explainerSec1Body: 'Em Portugal, a rede pública de mobilidade elétrica é totalmente interoperável. Qualquer utilizador com um cartão CEME pode carregar em qualquer posto de qualquer operador (OPC) no país.',
    explainerSec2Title: '2. OPC vs CEME',
    explainerSec2Body: '• OPC (Operador do Posto): É quem instala e gere o carregador (ex: Atlante, Galp, EDP, Ionity). Cobra pelo tempo de ocupação do posto e taxa de ativação da tomada.\n• CEME (Comercializador): É a entidade onde tem o contrato/cartão (ex: BMW Charging, Atlante, Galp, EDP). Cobra a eletricidade consumida (€/kWh).',
    explainerSec3Title: '3. Como é calculado o valor final?',
    explainerSec3Body: 'Ao carregar com um cartão CEME, a fatura única é a soma de:\n• Parcela OPC: Taxa de utilização do posto (tempo/ativação).\n• Parcela CEME: Energia consumida (kWh × preço do seu cartão) + TAR.\n• Impostos: IEC + IVA (23%).',
    explainerSec4Title: '4. Por que usar um cartão CEME em vez de pagamento avulso?',
    explainerSec4Body: 'O pagamento direto com cartão bancário no posto (Preço Avulso / Ad-Hoc) tem muitas vezes uma margem muito superior (ex: 0,60€ a 0,79€/kWh). Ao associar os seus cartões CEME na CargaCerta, pode ver imediatamente a poupança real (frequentemente 30% a 50% mais barato!).',
    explainerSec5Title: '5. Marcas Auto (BMW, MINI, Mercedes) & Mensalidades',
    explainerSec5Body: 'Programas de fabricantes como o BMW Charging, MINI Charging (Active / IONITY Plus) ou Mercedes me Charge (M/L) cobram uma mensalidade que desbloqueia tarifas com desconto substancial na rede IONITY (ex: 0,30€ a 0,52€/kWh em vez de 0,79€/kWh) e taxas vantajosas por minuto.',
    explainerSec6Title: '6. Superchargers Tesla em Portugal (Abertos a Todas as Marcas)',
    explainerSec6Body: 'A Tesla abriu postos Supercharger V3 e V4 a qualquer veículo elétrico em Portugal. Atenção: Esta rede é fechada e NÃO aceita cartões CEME da Mobi.E. O carregamento é ativado diretamente na App Tesla (~0,23€ a 0,41€/kWh avulso ou com subscrição Membership de 12,99€/mês).',
    explainerProTip: '💡 Dica Pro CargaCerta: Em postos com taxa de tempo elevada (ex: 0,05€ a 0,15€/minuto), evite ultrapassar os 80% de bateria onde a curva de potência desce consideravelmente, para não pagar taxas de ocupação desnecessárias.',
    explainerActionBtn: 'Configurar a Minha Carteira de Cartões',

    // Footer
    footerTitle: 'Nota sobre preços & CEMEs',
    footerBody:
      'Dados agregados a partir do catálogo nacional de tarifas publicado pela Mobi.E ("Descarregar Tarifas" em mobie.pt). Os custos apresentados calculam a combinação entre a taxa de posto (OPC) e a tarifa do seu cartão CEME selecionado (BMW Charging, MINI Charging, Mercedes me, Tesla App, Atlante, Galp, EDP, etc.) ou tarifas planas específicas. Pode gerir os seus cartões e valores a qualquer momento no botão "Os Meus Cartões". Confirme sempre o valor final na aplicação do seu operador antes de iniciar o carregamento.',
  },

  en: {
    // Header & Nav
    brandName: 'CargaCerta',
    headerExplainerBtn: '💡 How does CEME work?',
    headerCardsBtn: '💳 My Cards',
    headerOfficialLink: 'Mobi.E',

    // Hero
    heroEyebrow: 'EV Charging in Portugal · MOBI.E Network & CEMEs',
    heroTitle: 'Find the cheapest EV charging with your cards.',
    heroCopy:
      'Compare stations and simulate real costs using your CEME cards (BMW Charging, MINI Charging, Mercedes me, Tesla App, Atlante, Galp, EDP and more). Discover how much you save vs. standard walk-up station rates.',
    heroActiveCardsBadge: 'active CEME card(s)',
    heroManageBadge: 'Manage',
    heroGuideBadgeTitle: 'CEME vs CPO rates: How to save',
    heroGuideBadgeAction: 'View Guide',

    // Planner
    plannerTitle: 'Your vehicle & card',
    plannerSubtitle: 'Select battery capacity, target charge and the CEME card to use.',
    vehicleFieldLabel: 'Vehicle (optional)',
    vehicleFieldPlaceholder: 'Search by make/model, e.g. BMW iX3, MINI Countryman, Tesla…',
    cardSelectLabel: 'CEME Card for calculation',
    cardSelectAuto: '✨ Best Automatic Card (Compares {count} active)',
    cardSelectNone: '❌ No card (Direct Ad-Hoc / Walk-up price)',
    cardSelectManageBtn: '⚙️ Manage',
    batteryCapacityLabel: 'Battery capacity',
    currentChargeLabel: 'Current charge',
    targetChargeLabel: 'Charge up to',
    energyNeededLabel: 'Energy needed',
    energyCapacityOf: 'of {cap} kWh capacity',
    selectedCardPillLabel: 'Selected card:',
    autoCardPillLabel: 'Comparison mode:',
    autoCardPillValue: 'Best card per station',

    // Stations
    stationsStep: 'Explore network',
    stationsTitle: 'Available stations',
    stationsFoundSummary: '{count} stations found · sorted by {sort}',
    sortPriceAsc: 'lowest price',
    sortSavingsDesc: 'highest savings',
    sortPowerDesc: 'highest power',
    sortDurationAsc: 'shortest time',
    sortDistanceAsc: 'nearest first',

    // View Mode & Geolocation
    viewModeList: '📋 List',
    viewModeMap: '🗺️ Map',
    geoLocateBtn: '📍 My Location',
    geoLocatingBtn: '📍 Detecting...',
    geoLocateSuccess: 'Location detected ({locality})',
    geoLocateError: 'Could not retrieve your GPS location.',
    geoClearBtn: 'Clear GPS ✕',
    geoRadiusLabel: 'Radius filter:',
    geoRadiusOptionAll: 'No radius limit',
    geoRadiusOption10: 'Within 10 km',
    geoRadiusOption20: 'Within 20 km',
    geoRadiusOption50: 'Within 50 km',
    geoRadiusOption100: 'Within 100 km',
    yourLocationTitle: 'Your location',
    distanceKmLabel: '{dist} km away',

    // Data Refresh
    tariffDateLabel: 'Tariff data from {date}',
    tariffDateUnknown: 'Tariff date unknown',
    refreshFailed: 'Failed to refresh ({error}).',
    dismissBtn: 'Dismiss',
    refreshBtn: 'Refresh tariffs',
    refreshingBtn: 'Updating…',
    progressDownload: 'Downloading national tariff CSV…',
    progressDownloadPercent: 'Downloading national tariff CSV… {percent}%',
    progressParsing: 'Processing charging station prices…',
    progressDone: 'Completed.',

    // Filters
    searchPlaceholder: 'Search municipality, address or operator (CPO)',
    allDistricts: 'All districts',
    anySpeed: 'Any charging speed',
    allOperators: 'All operators',
    sortOptionPrice: 'Sort: Lowest price',
    sortOptionSavings: 'Sort: Highest CEME savings',
    sortOptionPower: 'Sort: Highest power (kW)',
    sortOptionDuration: 'Sort: Shortest time',

    // Speed labels
    speedNormal: 'Normal (slow)',
    speedSemiRapid: 'Semi-rapid (AC)',
    speedRapid: 'Rapid (DC)',
    speedUltraRapid: 'Ultra-rapid (HPC)',

    // Pricing category labels
    pricingAdHoc: 'Direct walk-up price (no contract)',
    pricingBlank: 'Published price',
    pricingRegular: 'Requires contract with a CEME',

    // States
    loadingCatalog: 'Loading national charging stations catalog…',
    errorCatalog: 'Could not load charging station data ({error}). Check directly on ',
    noStationsFound: 'No charging stations found for this search. Try another district, charging speed or search term.',
    showMoreStations: 'Show more stations ({count} remaining)',

    // Station Card
    powerNotAvailable: 'Power n/a',
    operatorLabelPrefix: 'Operator (CPO):',
    addressNotAvailable: 'Address not available',
    moreSockets: '+{count} socket(s)',
    requiresTeslaApp: '📲 Requires Tesla App',
    bestCardTag: 'Best: {name}',
    teslaDirectTag: 'Tesla App (No CEME Card)',
    adhocTag: 'Standard CEME / Walk-up Price',
    saveBadge: '🎉 Save {val}',
    stdRefCost: 'Std Ref: {val}',
    costEstimateLabel: 'Estimated Cost',
    noTariff: 'No tariff',
    timeEstimateLabel: 'Estimated Time',
    opcTimeRateBadge: '⏳ CPO Time: {rate} €/min',
    opcNoTimeFeeBadge: '⏳ No minute fee',
    opcTimeCostDetail: 'Time/Occupancy Fee ({time} min × {rate}€):',
    opcActivationDetail: 'Session/Activation Fee (CPO):',
    opcEnergyDetail: 'Station Energy (CPO):',
    showDetailsBtn: '▼ View invoice breakdown',
    hideDetailsBtn: '▲ Hide details',
    useInSimBtn: '📊 Use in Monthly Simulation',
    selectedInSimBtn: '✓ Selected in Simulator',

    // Station Breakdown Drawer
    breakdownTitle: 'Cost Breakdown:',
    breakdownEnergyCeme: '⚡ CEME Energy ({name}): {kwh} kWh × {rate} €/kWh',
    breakdownEnergyStation: '⚡ Station Energy (CPO): {kwh} kWh × {rate} €/kWh',
    breakdownEnergyStationExtra: '⚡ Extra Station Energy (CPO): {kwh} kWh × {rate} €/kWh',
    breakdownEnergyTesla: '⚡ Tesla App Energy: {kwh} kWh × {rate} €/kWh',
    breakdownTimeOpc: '⏳ Station Time / Occupancy (CPO): ~{time} min × {rate} €/min',
    breakdownTimeOpcFree: '⏳ Station Time / Occupancy (CPO): Free (no minute fee)',
    breakdownActivationFee: '🔌 Session / Activation Fee (CPO + CEME):',
    breakdownCardDiscount: '🎁 Card Discount ({name}):',
    breakdownBmwTimeModel: '⏱️ Per-Minute Plan ({name}): ~{time} min × {rate} €/min',
    breakdownBmwTimeModelNote: 'ℹ️ Under the BMW/MINI Active plan, you pay a flat per-minute rate that already covers both energy and station occupancy.',
    breakdownDirectNetwork: '🏷️ Direct Network Rate ({name}): {kwh} kWh × {rate} €/kWh',
    breakdownDirectNetworkNote: 'ℹ️ Direct flat rate from operator (no extra CEME or Mobi.E fees).',
    includedInMinuteRate: 'Included in time rate',
    teslaNoSubBreakdown: 'Tesla App Tariff (No Subscription):',
    teslaNoSubBreakdownValue: '~0.39 €/kWh (€0.23 off-peak / €0.41 peak)',
    specialCardRateLabel: 'Special Card Tariff:',
    opcPortionLabel: 'Station Fee (CPO):',
    cemePortionLabel: 'Card Portion ({name}):',
    cardDiscountLabel: 'Card Discount:',
    totalExpectedLabel: 'Estimated Total:',
    vatIncludedNotice: '23% VAT included',
    alternativeCardTip: '💡 Suggestion: With the {name} plan you would only pay {cost} at this station.',
    teslaNetworkNotice: 'ℹ️ Proprietary Tesla Network: CEME cards (BMW, Galp, EDP, etc.) are not accepted. Start the session in the Tesla App.',
    publishedTariffLabel: 'Published tariff:',

    // Map Selected Station Card
    mapSelectedStationTitle: 'Selected Station on Map',
    mapSelectedViewDetails: '📋 View Full Details',
    mapSelectedUsedInSim: '✓ Active in Simulator',
    mapClosePreview: 'Close',
    mapPopupClose: 'Close ✕',

    // Monthly Simulator
    simHeading: 'Monthly Bill Simulator',
    simSubtitle: 'End-of-month cost estimate for public street charging.',
    simKmPerWeek: 'Kilometres per week',
    simKmPerMonth: '~{km} km/month',
    simAvgConsumption: 'Average consumption',
    simExtraTimeOpc: 'Extra idle time at station (CPO)',
    simRefStationLabel: 'Reference Station:',
    simRefStationAuto: 'Cheapest station from list (Auto)',
    simMethodLabel: 'Charging Method:',
    simCardLabel: 'CEME Card:',
    simEstimatedTotal: 'Estimated Total Bill',
    simTotalSubtext: 'Charging + Subscription',
    simEnergyConsumed: '⚡ Energy consumed (~{kwh} kWh):',
    simCardSubscription: '💳 Card subscription ({name}):',
    simIdlePenalty: '⏳ CPO time/occupancy fee:',
    simCostPer100Km: '🚗 Cost per 100 km:',
    simCombustionCompTitle: 'Combustion Comparison (DGEG)',
    simAdjustPricesBtn: '⚙️ Adjust Prices',
    simCloseConfigBtn: 'Close ✕',
    simFuelConfigHelp: 'Official daily average benchmark prices in Portugal (DGEG). You can adjust according to your local fuel station.',
    simGasoline95Field: 'Gasoline 95 (€/L)',
    simGasolineConsumptionField: 'Gasoline Consumption (L/100km)',
    simDieselField: 'Diesel (€/L)',
    simDieselConsumptionField: 'Diesel Consumption (L/100km)',
    simResetFuelBtn: 'Reset to official DGEG daily averages (Portugal)',
    simVsGasoline: 'Vs. Gasoline 95 ({price}€/L · {cons}L)',
    simVsDiesel: 'Vs. Diesel ({price}€/L · {cons}L)',
    simSavesMonthly: '🎉 Save {val}/mo',
    simCostsMoreMonthly: '{val}/mo more',
    simManageCardsBtn: '💳 Manage Subscriptions & Cards',
    simUnderstandOpcBtn: '💡 Understand CPO Time Fees',

    // Home Charging Simulation
    simHomeCompTitle: 'Home Charging (Domestic Tariff)',
    simHomeSubtitle: 'Compare public street charging with charging at home (wallbox/outlet).',
    simHomeConfigBtn: '⚙️ Configure Home',
    simHomePresetLabel: 'Tariff Preset:',
    simHomePresetGalp: 'Galp Home (5.75 kVA)',
    simHomePresetEdp: 'EDP Comercial (5.75 kVA)',
    simHomePresetGold: 'Goldenergy / Other',
    simHomePresetCustom: 'Custom',
    simHomeCycleLabel: 'Time Cycle:',
    simHomeCycleSimple: 'Simple (Flat)',
    simHomeCycleBiHourly: 'Bi-hourly (Off-peak / Normal)',
    simHomeCycleTriHourly: 'Tri-hourly (Peak / Shoulder / Off-peak)',
    simHomeTriHourlySlotLabel: 'Charging Period:',
    simHomeSlotVazio: '🌙 Off-peak (Night)',
    simHomeSlotCheias: '☀️ Shoulder (Day)',
    simHomeSlotPonta: '⚡ Peak (High)',
    simHomeRatesTriSection: 'Rates by Period (€/kWh base):',
    simHomeRateVazioShort: 'Off-peak',
    simHomeRateCheiasShort: 'Shoulder',
    simHomeRatePontaShort: 'Peak',
    simHomeEnergyRateLabel: 'Base Energy Price (€/kWh):',
    simHomeEnergyRateVazioLabel: 'Off-peak / Vazio Price (€/kWh):',
    simHomeFixedDailyLabel: 'Fixed Power Term (€/day):',
    simHomeDiscountLabel: 'Bill Discount (€/month):',
    simHomeApplyFixedTermLabel: 'Apply fixed power term (€/day)',
    simHomeApplyDiscountLabel: 'Apply monthly bill discount (€/month)',
    simHomeApplyTaxesLabel: 'Apply taxes (23% VAT + 0.001€ IEC)',
    simHomeVsStreet: '🏠 At Home ({name}):',
    simHomeCostDetail: '~{rate} €/kWh · {cost100} €/100km',
    simHomeSavesVsStreet: '🎉 Save {val}/mo vs. street',
    simHomeCardTip: '💡 Tip: At home you would pay only {val} for this charge ({rate} €/kWh).',
    simResetHomeBtn: 'Reset to Galp Home defaults (0.1467€/kWh + 0.4274€/day)',

    // Cards Manager Modal
    cardsModalEyebrow: 'EV Mobility Wallet',
    cardsModalTitle: 'My CEME Cards',
    cardsModalSubtitle: 'Configure your cards (BMW, Tesla, Atlante, Galp, EDP, etc.) to calculate the real price at every charging point.',
    cardsActiveCountStat: 'Active Cards',
    cardsTotalFeesStat: 'Total Subscriptions',
    cardsHowItWorksBtn: '💡 How does CEME/CPO billing work?',
    cardsSavedTitle: 'Saved Cards ({count})',
    cardsNewCustomBtn: '+ New Custom Card',
    cardsCancelBtn: 'Cancel',
    cardsAddCustomHeading: 'Add Custom Card',
    cardsFieldProvider: 'Provider / CEME',
    cardsFieldName: 'Card Name',
    cardsFieldKwhPrice: 'Energy Price (€/kWh)',
    cardsFieldActivationFee: 'Activation Fee (€/session)',
    cardsFieldMinuteFee: 'Minute Fee (€/min)',
    cardsFieldMonthlyFee: 'Monthly Fee (€/mo)',
    cardsFieldDiscount: 'Discount (%)',
    cardsFieldNotes: 'Notes / Remarks',
    cardsSaveCardBtn: 'Save Card',
    cardsEmptyNotice: 'No cards added yet. Choose one of the templates below or create a custom card.',
    cardsRateEnergy: 'Energy',
    cardsRateIonity: 'IONITY',
    cardsRateActivation: 'Activation',
    cardsRateMonthly: 'Monthly Fee',
    cardsRateDiscount: 'Discount',
    cardsSetActiveBtn: 'Set as Active',
    cardsIsActiveBadge: '✓ Active Card',
    cardsEditBtnTitle: 'Edit card values',
    cardsDeleteBtnTitle: 'Remove card',
    cardsSaveInlineBtn: 'Save',
    cardsCatalogTitle: 'CEME Cards Catalog (ERSE & Official Brands)',
    cardsCatalogSub: 'Add benchmark plans with 1 click (Mercedes, BMW, Tesla, Via Verde, Continente, Goldenergy, Galp, Repsol, etc.) based on public ERSE data. All values can be edited.',
    cardsCatAll: 'All ({count})',
    cardsCatAuto: '🚗 Car Brands',
    cardsCatRetail: '🛒 Retail / Discounts',
    cardsCatEnergy: '⚡ Energy / Fuel',
    cardsCatApps: '📱 Apps & Mobility',
    cardsAddPresetBtn: '+ Add to My Wallet',
    cardsAddedPresetBtn: '✓ Added to Wallet',
    cardsFreeMonthlyTag: 'No Monthly Fee',
    cardsModalDoneBtn: 'Done & Back to Stations',

    // CEME Explainer Modal
    explainerEyebrow: 'EV Charging Guide in Portugal',
    explainerTitle: 'How does MOBI.E & CEME billing work?',
    explainerSubtitle: 'Learn how combining CEME cards and charging point operators (CPO/OPC) saves hundreds of euros per year.',
    explainerSec1Title: '1. The Portuguese Model (MOBI.E)',
    explainerSec1Body: 'In Portugal, the public EV charging network is fully interoperable. Any EV driver with any CEME card can charge at any charging station operated by any CPO across the country.',
    explainerSec2Title: '2. CPO (OPC) vs CEME',
    explainerSec2Body: '• CPO / OPC (Station Operator): Installs and maintains the physical charger (e.g. Atlante, Galp, EDP, Ionity). Charges for charger occupancy time and socket activation fees.\n• CEME (Electricity Retailer): Entity with which you have a contract/card (e.g. BMW Charging, Atlante, Galp, EDP). Charges for actual electricity consumed (€/kWh).',
    explainerSec3Title: '3. How is the final bill calculated?',
    explainerSec3Body: 'When charging with a CEME card, your single consolidated invoice consists of:\n• CPO portion: Station usage fee (time/session activation).\n• CEME portion: Energy consumed (kWh × your card price) + TAR.\n• Taxes: IEC + VAT (23%).',
    explainerSec4Title: '4. Why use a CEME card instead of direct bank card payment?',
    explainerSec4Body: 'Direct walk-up payment with a debit/credit card at the charger (Ad-Hoc price) often carries a hefty markup (e.g. 0.60€ to 0.79€/kWh). By connecting your CEME cards on CargaCerta, you immediately see your real savings (frequently 30% to 50% cheaper!).',
    explainerSec5Title: '5. Auto Brands (BMW, MINI, Mercedes) & Monthly Subscriptions',
    explainerSec5Body: 'Automaker programs like BMW Charging, MINI Charging (Active / IONITY Plus) or Mercedes me Charge (M/L) charge a monthly fee unlocking substantially discounted rates on the IONITY network (e.g. 0.30€ to 0.52€/kWh instead of 0.79€/kWh) and attractive per-minute rates.',
    explainerSec6Title: '6. Tesla Superchargers in Portugal (Open to All EV Brands)',
    explainerSec6Body: 'Tesla has opened V3 and V4 Supercharger stations to all EV brands in Portugal. Note: This is a closed proprietary network and does NOT accept Mobi.E CEME cards. Charging is initiated directly via the Tesla App (~0.23€ to 0.41€/kWh walk-up or with a 12.99€/month Membership subscription).',
    explainerProTip: '💡 CargaCerta Pro Tip: On charging stations with high time-based fees (e.g. €0.05 to €0.15/minute), avoid charging above 80% SoC where charging power tapers significantly, avoiding unnecessary occupancy charges.',
    explainerActionBtn: 'Configure My Cards Wallet',

    // Footer
    footerTitle: 'Note on pricing & CEMEs',
    footerBody:
      'Data aggregated from the Portuguese national tariff catalog published by Mobi.E ("Download Tariffs" on mobie.pt). Displayed costs calculate the combination between charging point operator (CPO/OPC) fees and the rate of your selected CEME card (BMW Charging, MINI Charging, Mercedes me, Tesla App, Atlante, Galp, EDP, etc.) or specific flat rates. You can manage your cards and rates at any time via "My Cards". Always check the final rate in your operator app before plugging in.',
  },
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'pt'
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    if (saved === 'pt' || saved === 'en') return saved
    const browserLang = navigator.language?.toLowerCase() || ''
    return browserLang.startsWith('pt') ? 'pt' : 'en'
  })

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang)
      document.documentElement.lang = lang
    } catch {
      // Ignore storage errors
    }
  }, [lang])

  const t = useMemo(() => {
    const dict = DICTIONARY[lang] || DICTIONARY.pt
    return (key, params = {}) => {
      let str = dict[key] ?? DICTIONARY.pt[key] ?? key
      for (const [pKey, pVal] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal))
      }
      return str
    }
  }, [lang])

  const formatEuro = useMemo(() => {
    const locale = lang === 'pt' ? 'pt-PT' : 'en-IE'
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
    })
    return (val) => (val == null || Number.isNaN(val) ? '—' : formatter.format(val))
  }, [lang])

  const formatNumber = useMemo(() => {
    const locale = lang === 'pt' ? 'pt-PT' : 'en-US'
    return (val, options = {}) => {
      if (val == null || Number.isNaN(val)) return '—'
      return new Intl.NumberFormat(locale, options).format(val)
    }
  }, [lang])

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
      formatEuro,
      formatNumber,
    }),
    [lang, t, formatEuro, formatNumber],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}
