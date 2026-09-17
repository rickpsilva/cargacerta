/**
 * CEME Cards & Tariffs for EV Charging in Portugal (Mobi.E Network).
 *
 * In Portugal:
 *  - OPC (Operador do Posto): Owns/operates the charging station. Charges for infrastructure use (time, flat, or kWh).
 *  - CEME (Comercializador de Eletricidade para a Mobilidade Elétrica): Card/app provider (e.g. BMW Charging, Atlante, Galp, EDP).
 *    Charges for energy consumed (kWh), session fee, or offers flat rates/discounts.
 *
 * Total Cost = OPC Tariff (station) + CEME Tariff (card) [or special direct flat-rate when applicable].
 */

export const STORAGE_KEY = 'cargacerta_user_cards_v2'

export const CARD_PROVIDERS = {
  BMW: {
    id: 'BMW',
    name: 'BMW Charging',
    shortCode: 'BMW',
    color: '#1c69d4',
    bg: '#eaf2fd',
    textColor: '#0c3d82',
    icon: '🚙',
    category: 'auto',
  },
  MINI: {
    id: 'MINI',
    name: 'MINI Charging',
    shortCode: 'MINI',
    color: '#1b8b00',
    bg: '#eaf7ea',
    textColor: '#105600',
    icon: '🚗',
    category: 'auto',
  },
  MB: {
    id: 'MB',
    name: 'Mercedes me Charge',
    shortCode: 'MB',
    color: '#00adef',
    bg: '#e6f7fc',
    textColor: '#00587a',
    icon: '⭐',
    category: 'auto',
  },
  VV: {
    id: 'VV',
    name: 'Via Verde Electric',
    shortCode: 'VV',
    color: '#009a44',
    bg: '#e6f6ee',
    textColor: '#005c28',
    icon: '🟢',
    category: 'apps',
  },
  CNT: {
    id: 'CNT',
    name: 'Continente Plug&Charge',
    shortCode: 'CNT',
    color: '#e31b23',
    bg: '#fde8e9',
    textColor: '#8a0d12',
    icon: '🛒',
    category: 'retail',
  },
  GLD: {
    id: 'GLD',
    name: 'Goldenergy',
    shortCode: 'GLD',
    color: '#f5a623',
    bg: '#fef6e9',
    textColor: '#8a5908',
    icon: '⚡',
    category: 'energy',
  },
  PRIO: {
    id: 'PRIO',
    name: 'PRIO Electric',
    shortCode: 'PRIO',
    color: '#0072ce',
    bg: '#e6f1fa',
    textColor: '#004278',
    icon: '⛽',
    category: 'energy',
  },
  ATL: {
    id: 'ATL',
    name: 'Atlante',
    shortCode: 'ATL',
    color: '#00a86b',
    bg: '#e6f7f0',
    textColor: '#005a39',
    icon: '⚡',
    category: 'energy',
  },
  GLP: {
    id: 'GLP',
    name: 'Galp Electric',
    shortCode: 'GLP',
    color: '#ff5c00',
    bg: '#fff0e6',
    textColor: '#993700',
    icon: '⛽',
    category: 'energy',
  },
  EDP: {
    id: 'EDP',
    name: 'EDP Mobilidade Elétrica',
    shortCode: 'EDP',
    color: '#e60000',
    bg: '#fde8e8',
    textColor: '#8a0000',
    icon: '🔴',
    category: 'energy',
  },
  REP: {
    id: 'REP',
    name: 'Repsol / Waylet',
    shortCode: 'REP',
    color: '#e03a14',
    bg: '#fcece8',
    textColor: '#801e07',
    icon: '🚗',
    category: 'energy',
  },
  MIIO: {
    id: 'MIIO',
    name: 'Miio / EVIO',
    shortCode: 'MIIO',
    color: '#0284c7',
    bg: '#e0f2fe',
    textColor: '#0369a1',
    icon: '📱',
    category: 'apps',
  },
  TSLA: {
    id: 'TSLA',
    name: 'Tesla App / Supercharger',
    shortCode: 'TSLA',
    color: '#e82127',
    bg: '#fdebec',
    textColor: '#a31115',
    icon: '⚡',
    category: 'auto',
  },
  CUSTOM: {
    id: 'CUSTOM',
    name: 'Personalizado',
    shortCode: 'CUSTOM',
    color: '#164b42',
    bg: '#eef5f2',
    textColor: '#164b42',
    icon: '💳',
    category: 'custom',
  },
}

/**
 * Well-researched CEME card presets available in Portugal (ERSE benchmarks & official plans).
 */
export const CARD_PRESETS = [
  // 1. BMW Charging
  {
    id: 'preset-bmw-active',
    presetId: 'bmw-active',
    provider: 'BMW',
    name: 'BMW Charging Active',
    name_en: 'BMW Charging Active',
    monthlyFee: 3.99,
    kwhPrice: 0.18,
    activationFee: 0.0,
    minuteFee: 0.0,
    discountPercent: 0,
    pricingMode: 'time_or_kwh', // BMW Active applies time tariffs on AC/DC in PT network
    specialRates: {
      acMinuteRate: 0.05, // 0.05 €/min on AC stations
      dcMinuteRate: 0.31, // 0.31 €/min on DC stations
      ionityKwhRate: 0.79, // 0.79 €/kWh without Ionity Plus
    },
    notes: 'Tarifa BMW Active (3,99€/mês, 1º ano grátis para novos BMW i). AC a 0,05€/min e DC a 0,31€/min.',
    notes_en: 'BMW Active rate (€3.99/mo, 1st year free for new BMW i models). AC at €0.05/min and DC at €0.31/min.',
    enabled: true,
  },
  {
    id: 'preset-bmw-ionity-plus',
    presetId: 'bmw-ionity-plus',
    provider: 'BMW',
    name: 'BMW Charging + IONITY Plus',
    name_en: 'BMW Charging + IONITY Plus',
    monthlyFee: 13.0,
    kwhPrice: 0.18,
    activationFee: 0.0,
    minuteFee: 0.0,
    discountPercent: 0,
    pricingMode: 'time_or_kwh',
    specialRates: {
      acMinuteRate: 0.05,
      dcMinuteRate: 0.31,
      ionityKwhRate: 0.3, // 0.30 €/kWh on Ionity (IOY)
    },
    notes: 'Pacote IONITY Plus (13€/mês). Carregamento ultra-rápido na rede IONITY por apenas 0,30€/kWh.',
    notes_en: 'IONITY Plus package (€13/mo). Ultra-fast charging on IONITY network for just €0.30/kWh.',
    enabled: false,
  },

  // 2. MINI Charging
  {
    id: 'preset-mini-active',
    presetId: 'mini-active',
    provider: 'MINI',
    name: 'MINI Charging Active',
    name_en: 'MINI Charging Active',
    monthlyFee: 4.99,
    kwhPrice: 0.18,
    activationFee: 0.0,
    minuteFee: 0.0,
    discountPercent: 0,
    pricingMode: 'time_or_kwh',
    specialRates: {
      acMinuteRate: 0.05, // 0.05 €/min on AC stations
      dcMinuteRate: 0.31, // 0.31 €/min on DC stations
      ionityKwhRate: 0.79, // 0.79 €/kWh without Ionity Plus
    },
    notes: 'Tarifa MINI Active (4,99€/mês, 6 meses grátis para novo MINI elétrico). AC a 0,05€/min e DC a 0,31€/min.',
    notes_en: 'MINI Active plan (€4.99/mo, 6 months free for new electric MINI). AC at €0.05/min and DC at €0.31/min.',
    enabled: false,
  },
  {
    id: 'preset-mini-ionity-plus',
    presetId: 'mini-ionity-plus',
    provider: 'MINI',
    name: 'MINI Charging + IONITY Plus',
    name_en: 'MINI Charging + IONITY Plus',
    monthlyFee: 5.99,
    kwhPrice: 0.18,
    activationFee: 0.0,
    minuteFee: 0.0,
    discountPercent: 0,
    pricingMode: 'time_or_kwh',
    specialRates: {
      acMinuteRate: 0.05,
      dcMinuteRate: 0.31,
      ionityKwhRate: 0.52, // 0.52 €/kWh on Ionity with MINI IONITY Plus
    },
    notes: 'Pacote IONITY Plus MINI (5,99€/mês). Carregamento IONITY a 0,52€/kWh sem taxas por minuto.',
    notes_en: 'MINI IONITY Plus package (€5.99/mo). IONITY charging at €0.52/kWh with no minute fees.',
    enabled: false,
  },
  {
    id: 'preset-mini-flex',
    presetId: 'mini-flex',
    provider: 'MINI',
    name: 'MINI Charging Flex',
    name_en: 'MINI Charging Flex',
    monthlyFee: 0.0,
    kwhPrice: 0.19,
    activationFee: 0.0,
    minuteFee: 0.0,
    discountPercent: 0,
    pricingMode: 'standard',
    specialRates: {
      ionityKwhRate: 0.79,
    },
    notes: 'Tarifa Flex sem mensalidade para utilização ocasional. Preço por kWh variável e IONITY a 0,79€/kWh.',
    notes_en: 'Flex plan without monthly fee for occasional use. Standard kWh rates and IONITY at €0.79/kWh.',
    enabled: false,
  },

  // 3. Tesla App (Superchargers & MultiPass para todas as marcas)
  {
    id: 'preset-tesla-app-payg',
    presetId: 'tesla-app-payg',
    provider: 'TSLA',
    name: 'Tesla App (Sem Mensalidade)',
    name_en: 'Tesla App (Pay As You Go)',
    monthlyFee: 0.0,
    kwhPrice: 0.39, // Average rate for non-Tesla users in Superchargers (0.23€ fora pico a 0.41€ pico)
    activationFee: 0.0,
    minuteFee: 0.0,
    discountPercent: 0,
    pricingMode: 'standard',
    specialRates: {
      operatorFlatRate: {
        TSLA: 0.39, // 0.39 €/kWh flat on Tesla Superchargers for non-Tesla
      },
    },
    notes: 'Acesso via App Tesla para qualquer marca de EV. ~0,23€ a 0,41€/kWh (média ~0,39€/kWh) sem custos de ativação.',
    notes_en: 'Access via Tesla App for any EV make. ~€0.23 to €0.41/kWh (avg ~€0.39/kWh) with zero session activation fees.',
    enabled: true,
  },
  {
    id: 'preset-tesla-membership',
    presetId: 'tesla-membership',
    provider: 'TSLA',
    name: 'Tesla Supercharging Membership',
    name_en: 'Tesla Supercharging Membership',
    monthlyFee: 12.99,
    kwhPrice: 0.27, // Reduced rate with Tesla Membership (~0.27€/kWh average)
    activationFee: 0.0,
    minuteFee: 0.0,
    discountPercent: 0,
    pricingMode: 'standard',
    specialRates: {
      operatorFlatRate: {
        TSLA: 0.27, // 0.27 €/kWh flat on Superchargers with active membership
      },
    },
    notes: 'Subscrição Mensal na App Tesla (12,99€/mês). Garante as mesmas tarifas com desconto que os condutores de Tesla (~0,27€/kWh).',
    notes_en: 'Monthly Subscription on Tesla App (€12.99/mo). Unlocks same discounted member rates as Tesla drivers (~€0.27/kWh).',
    enabled: false,
  },

  // 4. Mercedes me Charge
  {
    id: 'preset-mb-charge-m',
    presetId: 'mb-charge-m',
    provider: 'MB',
    name: 'Mercedes me Charge M',
    name_en: 'Mercedes me Charge M',
    monthlyFee: 4.9,
    kwhPrice: 0.17,
    activationFee: 0.0,
    minuteFee: 0.0,
    discountPercent: 0,
    pricingMode: 'standard',
    specialRates: {
      ionityKwhRate: 0.55,
    },
    notes: 'Plano M (4,90€/mês, 1º ano grátis novos Mercedes-Benz). Tarifas reduzidas AC/DC e IONITY a 0,55€/kWh.',
    notes_en: 'Plan M (€4.90/mo, 1st year free for new Mercedes-Benz). Discounted AC/DC rates and IONITY at €0.55/kWh.',
    enabled: false,
  },
  {
    id: 'preset-mb-charge-l',
    presetId: 'mb-charge-l',
    provider: 'MB',
    name: 'Mercedes me Charge L',
    name_en: 'Mercedes me Charge L',
    monthlyFee: 12.9,
    kwhPrice: 0.155,
    activationFee: 0.0,
    minuteFee: 0.0,
    discountPercent: 0,
    pricingMode: 'standard',
    specialRates: {
      ionityKwhRate: 0.39,
    },
    notes: 'Plano L (12,90€/mês) para quem viaja frequentemente. IONITY por 0,39€/kWh e energia a 0,155€/kWh.',
    notes_en: 'Plan L (€12.90/mo) for frequent road-trippers. IONITY at €0.39/kWh and energy at €0.155/kWh.',
    enabled: false,
  },

  // 5. Via Verde Electric
  {
    id: 'preset-via-verde-electric',
    presetId: 'via-verde-electric',
    provider: 'VV',
    name: 'Via Verde Electric (App)',
    name_en: 'Via Verde Electric (App)',
    monthlyFee: 0.0,
    kwhPrice: 0.185,
    activationFee: 0.15,
    minuteFee: 0.0,
    discountPercent: 0,
    pricingMode: 'standard',
    specialRates: {},
    notes: 'Carregamento direto via App Via Verde (CEME Ecochoice/Mobi.E). Faturação integrada no extrato Via Verde.',
    notes_en: 'Direct charging via Via Verde App (CEME Ecochoice/Mobi.E). Integrated billing in your Via Verde statement.',
    enabled: false,
  },

  // 6. Continente Plug&Charge
  {
    id: 'preset-continente-plug-charge',
    presetId: 'continente-plug-charge',
    provider: 'CNT',
    name: 'Continente Plug&Charge',
    name_en: 'Continente Plug&Charge',
    monthlyFee: 0.0,
    kwhPrice: 0.175,
    activationFee: 0.0,
    minuteFee: 0.0,
    discountPercent: 10,
    pricingMode: 'standard',
    specialRates: {
      operatorFlatRate: {
        CNT: 0.34, // Tarifa direta nas lojas Continente
      },
    },
    notes: '0,34€/kWh direto nos postos das lojas Continente. 10% acumulável em Cartão Continente na rede Mobi.E.',
    notes_en: '€0.34/kWh flat at Continente store chargers. 10% cashback into Continente Loyalty Card across Mobi.E network.',
    enabled: true,
  },

  // 7. Goldenergy
  {
    id: 'preset-goldenergy-mobilidade',
    presetId: 'goldenergy-mobilidade',
    provider: 'GLD',
    name: 'Goldenergy Mobilidade (Cliente Casa)',
    name_en: 'Goldenergy Mobility (Home Client)',
    monthlyFee: 0.0,
    kwhPrice: 0.149, // Valor ERSE benchmark cliente casa
    activationFee: 0.0,
    minuteFee: 0.0,
    discountPercent: 0,
    pricingMode: 'standard',
    specialRates: {},
    notes: 'Tarifa muito competitiva da Goldenergy para clientes domésticos de eletricidade (~0,149€/kWh energia).',
    notes_en: 'Competitive Goldenergy tariff for residential electricity clients (~€0.149/kWh energy).',
    enabled: false,
  },

  // 8. PRIO Electric
  {
    id: 'preset-prio-electric',
    presetId: 'prio-electric',
    provider: 'PRIO',
    name: 'PRIO Electric (Cartão / App)',
    name_en: 'PRIO Electric (Card / App)',
    monthlyFee: 0.0,
    kwhPrice: 0.168,
    activationFee: 0.18,
    minuteFee: 0.0,
    discountPercent: 0,
    pricingMode: 'standard',
    specialRates: {},
    notes: 'Tarifário ERSE PRIO Electric sem mensalidade (~0,168€/kWh + 0,18€ ativação).',
    notes_en: 'Standard PRIO Electric rate without monthly subscription (~€0.168/kWh + €0.18 activation).',
    enabled: false,
  },

  // 9. Atlante
  {
    id: 'preset-atlante-direct',
    presetId: 'atlante-direct',
    provider: 'ATL',
    name: 'Atlante (myAtlante / Direct)',
    name_en: 'Atlante (myAtlante / Direct)',
    monthlyFee: 0.0,
    kwhPrice: 0.1, // 0.10 €/kWh energy on Mobi.E network
    activationFee: 0.3, // 0.30 € session fee on Mobi.E
    minuteFee: 0.0,
    discountPercent: 0,
    pricingMode: 'standard',
    specialRates: {
      operatorFlatRate: {
        ATL: 0.49, // 0.49 €/kWh flat all-inclusive on Atlante stations
      },
    },
    notes: '0,49€/kWh preço final direto em postos Atlante (ATL). Nos restantes Mobi.E: 0,10€/kWh energia + taxa do posto.',
    notes_en: '€0.49/kWh all-inclusive flat rate at Atlante stations (ATL). On other Mobi.E chargers: €0.10/kWh + station fee.',
    enabled: true,
  },

  // 10. Galp Electric
  {
    id: 'preset-galp-electric',
    presetId: 'galp-electric',
    provider: 'GLP',
    name: 'Galp Electric (Plano Continente)',
    name_en: 'Galp Electric (Continente Plan)',
    monthlyFee: 0.0,
    kwhPrice: 0.175,
    activationFee: 0.0,
    minuteFee: 0.0,
    discountPercent: 16, // 16% cashback on Continente card
    pricingMode: 'standard',
    specialRates: {},
    notes: 'Energia a 0,175€/kWh + 16% de desconto em Cartão Continente.',
    notes_en: 'Energy at €0.175/kWh + 16% cashback into Continente Loyalty Card.',
    enabled: true,
  },

  // 11. EDP Mobilidade
  {
    id: 'preset-edp-mobilidade',
    presetId: 'edp-mobilidade',
    provider: 'EDP',
    name: 'EDP Mobilidade (Cliente Casa)',
    name_en: 'EDP Mobility (Home Client)',
    monthlyFee: 0.0,
    kwhPrice: 0.165,
    activationFee: 0.2,
    minuteFee: 0.0,
    discountPercent: 0,
    pricingMode: 'standard',
    specialRates: {},
    notes: 'Tarifa para clientes de eletricidade EDP Comercial em casa (~0,165€/kWh energia + 0,20€ ativação).',
    notes_en: 'Discounted tariff for EDP Comercial home electricity customers (~€0.165/kWh energy + €0.20 activation).',
    enabled: false,
  },

  // 12. Repsol Waylet
  {
    id: 'preset-repsol-waylet',
    presetId: 'repsol-waylet',
    provider: 'REP',
    name: 'Repsol Move / Waylet',
    name_en: 'Repsol Move / Waylet',
    monthlyFee: 0.0,
    kwhPrice: 0.18,
    activationFee: 0.15,
    minuteFee: 0.0,
    discountPercent: 10,
    pricingMode: 'standard',
    specialRates: {},
    notes: 'Desconto de 10% acumulável na app Waylet para clientes Repsol.',
    notes_en: '10% cashback discount into Waylet wallet for Repsol customers.',
    enabled: false,
  },

  // 13. Miio / EVIO
  {
    id: 'preset-miio-evio',
    presetId: 'miio-evio',
    provider: 'MIIO',
    name: 'EVIO / Miio (Pay as you go)',
    name_en: 'EVIO / Miio (Pay as you go)',
    monthlyFee: 0.0,
    kwhPrice: 0.195,
    activationFee: 0.0,
    minuteFee: 0.0,
    discountPercent: 0,
    pricingMode: 'standard',
    specialRates: {},
    notes: 'Tarifário flexível sem mensalidade. Energia média a 0,195€/kWh.',
    notes_en: 'Flexible plan with no monthly subscription. Average energy ~€0.195/kWh.',
    enabled: false,
  },
]

export function getCardDisplayName(card, lang = 'pt') {
  if (!card) return ''
  if (lang === 'en' && card.name_en) return card.name_en
  return card.name || ''
}

export function getCardDisplayNotes(card, lang = 'pt') {
  if (!card) return ''
  if (lang === 'en' && card.notes_en) return card.notes_en
  return card.notes || ''
}

export const DEFAULT_USER_CARDS = [
  CARD_PRESETS[0], // BMW Charging Active
  CARD_PRESETS[5], // Tesla App (Sem Mensalidade)
  CARD_PRESETS[9], // Continente Plug&Charge
  CARD_PRESETS[12], // Atlante
  CARD_PRESETS[13], // Galp Electric
]

/**
 * Reads saved user cards from localStorage. If none found, returns defaults.
 */
export function loadUserCards() {
  if (typeof window === 'undefined') return DEFAULT_USER_CARDS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_USER_CARDS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_USER_CARDS
  } catch (err) {
    console.warn('Failed to parse user cards from localStorage:', err)
    return DEFAULT_USER_CARDS
  }
}

/**
 * Saves user cards to localStorage.
 */
export function saveUserCards(cards) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
  } catch (err) {
    console.warn('Failed to save user cards to localStorage:', err)
  }
}

/**
 * Calculates the charging cost using a specific CEME card at a given station socket.
 *
 * @param {Object} card - The CEME card configuration
 * @param {Object} socket - The selected socket with its tariffs
 * @param {number} energyKwh - Required energy in kWh
 * @param {number} durationMinutes - Estimated charging duration in minutes
 * @param {Object} station - Station metadata (operador, tipoPosto, etc.)
 * @returns {Object} Cost breakdown and total
 */
export function calculateCardCost(card, socket, energyKwh, durationMinutes, station) {
  if (!card || !socket || energyKwh <= 0) {
    return null
  }

  const operatorCode = station?.operador || ''
  const stationSpeed = station?.tipoPosto || 'Normal'
  const isDC = stationSpeed === 'Rápido' || stationSpeed === 'Ultrarrápido' || (socket?.potencia && socket.potencia > 22)

  // 0. Tesla Superchargers (TSLA) are a closed proprietary network (non-Mobi.E).
  // Only Tesla App presets (TSLA provider or cards explicitly with TSLA operatorFlatRate) can be used.
  if (operatorCode === 'TSLA' || station?.isTeslaSupercharger) {
    if (card.provider === 'TSLA' || card.specialRates?.operatorFlatRate?.TSLA != null) {
      const flatPerKwh = card.specialRates?.operatorFlatRate?.TSLA ?? card.kwhPrice ?? 0.39
      const totalCost = flatPerKwh * energyKwh
      return {
        totalCost,
        opcCost: 0,
        cemeCost: totalCost,
        discountAmount: 0,
        isFlatOverride: true,
        flatPerKwh,
        breakdownText: `Tarifa App Tesla: ${flatPerKwh.toFixed(2)} €/kWh tudo incluído`,
      }
    }
    // Any generic Mobi.E CEME card (BMW, EDP, Galp, Continente, etc.) cannot be used at Tesla Superchargers
    return null
  }

  // 1. Check for special operator direct flat rate (e.g. Atlante card on Atlante station, or Continente on Continente)
  if (card.specialRates?.operatorFlatRate && card.specialRates.operatorFlatRate[operatorCode] != null) {
    const flatPerKwh = card.specialRates.operatorFlatRate[operatorCode]
    const totalCost = flatPerKwh * energyKwh
    return {
      totalCost,
      opcCost: 0,
      cemeCost: totalCost,
      discountAmount: 0,
      isFlatOverride: true,
      flatPerKwh,
      breakdownText: `Tarifa direta na rede ${operatorCode}: ${flatPerKwh.toFixed(2)} €/kWh tudo incluído`,
    }
  }

  // 2. Check for Ionity special rate with BMW Charging / Mercedes me Charge
  if (operatorCode === 'IOY' && card.specialRates?.ionityKwhRate != null) {
    const ionityRate = card.specialRates.ionityKwhRate
    const totalCost = ionityRate * energyKwh
    return {
      totalCost,
      opcCost: 0,
      cemeCost: totalCost,
      discountAmount: 0,
      isFlatOverride: true,
      flatPerKwh: ionityRate,
      breakdownText: `Tarifa especial IONITY: ${ionityRate.toFixed(2)} €/kWh`,
    }
  }

  // 3. Check for BMW Charging Active time-based model (AC vs DC per minute)
  if (card.pricingMode === 'time_or_kwh' && card.specialRates?.acMinuteRate != null && card.specialRates?.dcMinuteRate != null) {
    if (durationMinutes == null || durationMinutes <= 0) {
      return null
    }
    const minuteRate = isDC ? card.specialRates.dcMinuteRate : card.specialRates.acMinuteRate
    const cemeCost = minuteRate * Math.max(0, durationMinutes)
    return {
      totalCost: cemeCost,
      opcCost: 0,
      cemeCost,
      discountAmount: 0,
      isFlatOverride: true,
      minuteRate,
      breakdownText: `${isDC ? 'DC' : 'AC'}: ${minuteRate.toFixed(2)} €/min (~${Math.ceil(durationMinutes)} min)`,
    }
  }

  // 4. Standard Mobi.E calculation: OPC (Station) + CEME (Card)
  // Extract OPC regular tariffs from socket
  const opcTarifas = socket.tarifas || []
  if (opcTarifas.length === 0) {
    return null
  }

  const regularTarifas = opcTarifas.filter((t) => t.tarifario === 'REGULAR' || !t.tarifario)
  const listToUse = regularTarifas.length > 0 ? regularTarifas : opcTarifas

  const opcFlat = listToUse.find((t) => t.tipo === 'FLAT' && t.valor != null)?.valor ?? 0
  const opcEnergyRate = listToUse.find((t) => t.tipo === 'ENERGY' && t.valor != null)?.valor ?? 0
  const opcTimeRate = listToUse.find((t) => t.tipo === 'TIME' && t.valor != null)?.valor ?? 0

  if (opcTimeRate > 0 && (durationMinutes == null || durationMinutes <= 0)) {
    return null
  }

  const opcCost = opcFlat + opcEnergyRate * energyKwh + opcTimeRate * Math.max(0, durationMinutes ?? 0)

  // Calculate CEME portion
  const cemeEnergy = (card.kwhPrice ?? 0.18) * energyKwh
  const cemeActivation = card.activationFee ?? 0
  const cemeTime = (card.minuteFee ?? 0) * Math.max(0, durationMinutes ?? 0)
  let rawCemeCost = cemeEnergy + cemeActivation + cemeTime

  let discountAmount = 0
  if (card.discountPercent && card.discountPercent > 0) {
    discountAmount = rawCemeCost * (card.discountPercent / 100)
    rawCemeCost = Math.max(0, rawCemeCost - discountAmount)
  }

  const totalCost = opcCost + rawCemeCost

  return {
    totalCost,
    opcCost,
    cemeCost: rawCemeCost,
    discountAmount,
    isFlatOverride: false,
    opcBreakdown: { opcFlat, opcEnergyRate, opcTimeRate },
    cemeBreakdown: { cemeEnergy, cemeActivation, cemeTime },
    breakdownText: `OPC: ${opcCost.toFixed(2)} € + CEME: ${rawCemeCost.toFixed(2)} €`,
  }
}

/**
 * Finds the best (lowest total cost) card among enabled user cards for a given station socket.
 */
export function findBestCardForStation(cards, socket, energyKwh, durationMinutes, station) {
  const enabledCards = (cards || []).filter((c) => c.enabled !== false)
  if (!enabledCards.length) return null

  let best = null

  for (const card of enabledCards) {
    const result = calculateCardCost(card, socket, energyKwh, durationMinutes, station)
    if (!result || result.totalCost == null || result.totalCost <= 0) continue

    if (best == null || result.totalCost < best.cost.totalCost) {
      best = {
        card,
        cost: result,
      }
    }
  }

  return best
}
