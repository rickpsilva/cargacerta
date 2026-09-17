/**
 * Home electricity tariffs (Portugal domestic tariffs & benchmarks).
 * Handles simple and bi-hourly tariffs, fixed power terms (€/day or kVA), discounts, and tax calculation (IVA 23% + IEC).
 */

const HOME_TARIFF_STORAGE_KEY = 'cargacerta_home_tariff_v1'

export const HOME_TARIFF_PRESETS = [
  {
    id: 'galp-casa',
    name: 'Galp Casa (Potência 5.75 kVA)',
    name_en: 'Galp Home (5.75 kVA)',
    provider: 'Galp',
    cycle: 'simple', // 'simple' | 'bi-hourly' | 'tri-hourly'
    potenciaKva: 5.75,
    applyFixedTerm: false, // Apply daily fixed power term
    applyDiscount: false, // Apply monthly discount
    fixedTermDaily: 0.4274, // €/day (without taxes)
    energyRateSimple: 0.1467, // €/kWh (without taxes)
    energyRateVazio: 0.1020,
    energyRateForaVazio: 0.1780,
    energyRatePonta: 0.2250,
    energyRateCheias: 0.1580,
    monthlyDiscount: 4.17, // €/month discount
    applyTaxes: true, // Apply 23% VAT + 0.001€ IEC
    vatRate: 23, // %
    iecRate: 0.001, // €/kWh
    notes: 'Tarifário Galp 5.75 kVA simples (0,4274€/dia + 0,1467€/kWh + 4,17€ desconto).',
    notes_en: 'Galp 5.75 kVA simple tariff (€0.4274/day + €0.1467/kWh + €4.17 discount).',
  },
  {
    id: 'edp-comercial',
    name: 'EDP Comercial (Potência 5.75 kVA)',
    name_en: 'EDP Comercial (5.75 kVA)',
    provider: 'EDP',
    cycle: 'simple',
    potenciaKva: 5.75,
    applyFixedTerm: false,
    applyDiscount: false,
    fixedTermDaily: 0.4160,
    energyRateSimple: 0.1340,
    energyRateVazio: 0.0980,
    energyRateForaVazio: 0.1690,
    energyRatePonta: 0.2180,
    energyRateCheias: 0.1490,
    monthlyDiscount: 0.0,
    applyTaxes: true,
    vatRate: 23,
    iecRate: 0.001,
    notes: 'EDP Comercial 5.75 kVA simples (0,4160€/dia + 0,1340€/kWh).',
    notes_en: 'EDP Comercial 5.75 kVA simple tariff (€0.4160/day + €0.1340/kWh).',
  },
  {
    id: 'goldenergy-casa',
    name: 'Goldenergy + ACP / Casa',
    name_en: 'Goldenergy Home',
    provider: 'Goldenergy',
    cycle: 'simple',
    potenciaKva: 5.75,
    applyFixedTerm: false,
    applyDiscount: false,
    fixedTermDaily: 0.3850,
    energyRateSimple: 0.1290,
    energyRateVazio: 0.0890,
    energyRateForaVazio: 0.1580,
    energyRatePonta: 0.2050,
    energyRateCheias: 0.1420,
    monthlyDiscount: 0.0,
    applyTaxes: true,
    vatRate: 23,
    iecRate: 0.001,
    notes: 'Tarifa competitiva Goldenergy (~0,129€/kWh base).',
    notes_en: 'Competitive Goldenergy tariff (~€0.129/kWh base).',
  },
  {
    id: 'custom-home',
    name: 'Personalizado (Configurar)',
    name_en: 'Custom Tariff',
    provider: 'Outro',
    cycle: 'simple',
    potenciaKva: 5.75,
    applyFixedTerm: false,
    applyDiscount: false,
    fixedTermDaily: 0.4000,
    energyRateSimple: 0.1400,
    energyRateVazio: 0.0950,
    energyRateForaVazio: 0.1700,
    energyRatePonta: 0.2200,
    energyRateCheias: 0.1500,
    monthlyDiscount: 0.0,
    applyTaxes: true,
    vatRate: 23,
    iecRate: 0.001,
    notes: 'Configure os termos da sua própria fatura.',
    notes_en: 'Configure your own home bill rates.',
  },
]

export const DEFAULT_HOME_TARIFF = { ...HOME_TARIFF_PRESETS[0] }

/**
 * Loads home tariff from localStorage or default Galp preset.
 */
export function loadHomeTariff() {
  if (typeof window === 'undefined') return DEFAULT_HOME_TARIFF
  try {
    const raw = localStorage.getItem(HOME_TARIFF_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_HOME_TARIFF, ...parsed }
    }
  } catch (err) {
    console.warn('Failed to load saved home tariff:', err)
  }
  return { ...DEFAULT_HOME_TARIFF }
}

/**
 * Saves home tariff to localStorage.
 */
export function saveHomeTariff(tariff) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(HOME_TARIFF_STORAGE_KEY, JSON.stringify(tariff))
  } catch (err) {
    console.warn('Failed to save home tariff:', err)
  }
}

/**
 * Calculates the home charging cost for a given energy amount (kWh).
 * 
 * @param {Object} tariff - The home tariff config
 * @param {number} energyKwh - Energy in kWh (session or monthly)
 * @param {number} days - Number of days for fixed term allocation (0 if only incremental EV charging)
 * @param {Object} [overrides] - Optional overrides { applyFixedTerm, applyDiscount, applyTaxes }
 * @returns {Object} Total cost and details
 */
export function calculateHomeChargingCost(tariff, energyKwh, days = 0, overrides = {}) {
  if (!tariff || energyKwh == null || energyKwh <= 0) {
    return {
      energyCost: 0,
      fixedCost: 0,
      discount: 0,
      taxes: 0,
      totalCost: 0,
      effectiveRatePerKwh: 0,
    }
  }

  let rate = tariff.energyRateSimple ?? 0.1467

  if (tariff.cycle === 'bi-hourly') {
    // EV charging is typically scheduled in Vazio (off-peak overnight)
    rate = tariff.energyRateVazio ?? 0.1020
  } else if (tariff.cycle === 'tri-hourly') {
    // In Tri-horário, user can select the target slot or defaults to Vazio (Super-vazio/Vazio)
    const slot = tariff.triHourlySlot || 'vazio'
    if (slot === 'ponta') {
      rate = tariff.energyRatePonta ?? 0.2250
    } else if (slot === 'cheias') {
      rate = tariff.energyRateCheias ?? 0.1580
    } else {
      rate = tariff.energyRateVazio ?? 0.1020
    }
  }

  const shouldApplyFixed = overrides.applyFixedTerm != null ? overrides.applyFixedTerm : !!tariff.applyFixedTerm
  const shouldApplyDiscount = overrides.applyDiscount != null ? overrides.applyDiscount : !!tariff.applyDiscount
  const shouldApplyTaxes = overrides.applyTaxes != null ? overrides.applyTaxes : tariff.applyTaxes !== false

  const rawEnergyCost = rate * energyKwh
  const rawFixedCost = shouldApplyFixed ? (tariff.fixedTermDaily ?? 0) * (days || 30.4) : 0
  const rawDiscount = shouldApplyDiscount ? (tariff.monthlyDiscount ?? 0) : 0

  const subtotalBeforeTax = Math.max(0, rawEnergyCost + rawFixedCost - rawDiscount)

  let taxes = 0
  let totalCost = subtotalBeforeTax

  if (shouldApplyTaxes) {
    const vatMultiplier = 1 + (tariff.vatRate ?? 23) / 100
    const iecTotal = (tariff.iecRate ?? 0.001) * energyKwh
    totalCost = (subtotalBeforeTax + iecTotal) * vatMultiplier
    taxes = totalCost - subtotalBeforeTax
  }

  const effectiveRatePerKwh = energyKwh > 0 ? totalCost / energyKwh : 0

  return {
    rawEnergyCost,
    rawFixedCost,
    rawDiscount,
    subtotalBeforeTax,
    taxes,
    totalCost,
    effectiveRatePerKwh,
    appliedRatePerKwh: shouldApplyTaxes ? (rate + (tariff.iecRate ?? 0.001)) * (1 + (tariff.vatRate ?? 23) / 100) : rate,
  }
}
