import { calculateCardCost, findBestCardForStation } from './cards.js'

/**
 * Resolves the tariff a walk-up (non-contracted) driver would typically pay for a socket.
 *
 * Each socket in the Mobi.E dataset carries up to three tariff "buckets":
 *  - AD_HOC_PAYMENT: pay-per-use price, no subscription/contract required.
 *  - '' (blank tarifário): a single, unconditional price published by the CPO.
 *  - REGULAR: price for drivers with a contract/subscription with a CEME.
 *
 * We prefer AD_HOC_PAYMENT (most relevant for an occasional/any driver), then the
 * blank bucket. When neither is available, REGULAR is the best published CEME
 * estimate for a driver without an active card.
 */
export function resolveSocketPricing(tarifas) {
  const buckets = { AD_HOC_PAYMENT: [], BLANK: [], REGULAR: [] }

  for (const tarifa of tarifas) {
    const key = tarifa.tarifario === 'AD_HOC_PAYMENT' || tarifa.tarifario === 'REGULAR'
      ? tarifa.tarifario
      : 'BLANK'
    buckets[key].push(tarifa)
  }

  const category = buckets.AD_HOC_PAYMENT.length
    ? 'AD_HOC_PAYMENT'
    : buckets.BLANK.length
      ? 'BLANK'
      : buckets.REGULAR.length
        ? 'REGULAR'
        : null

  if (!category) return null

  const list = buckets[category]
  const flat = list.find((tarifa) => tarifa.tipo === 'FLAT' && tarifa.valor != null) ?? null
  const energy = list.find((tarifa) => tarifa.tipo === 'ENERGY' && tarifa.valor != null) ?? null
  const time = list.find((tarifa) => tarifa.tipo === 'TIME' && tarifa.valor != null) ?? null
  const hasTieredConditions = list.some((tarifa) => tarifa.condicao)

  return { category, flat, energy, time, hasTieredConditions }
}

/**
 * Estimates the total cost of charging `energyKWh` over `durationMinutes`,
 * combining the flat session fee, energy rate and time rate when present.
 * Returns null when the socket has no usable numeric tariff.
 */
export function estimateCost(pricing, energyKWh, durationMinutes) {
  if (!pricing) return null
  const { flat, energy, time } = pricing
  if (!flat && !energy && !time) return null

  const flatCost = flat?.valor ?? 0
  const energyCost = (energy?.valor ?? 0) * Math.max(0, energyKWh)
  const timeCost = (time?.valor ?? 0) * Math.max(0, durationMinutes)

  return flatCost + energyCost + timeCost
}

/**
 * Calculates the comprehensive cost for a station taking into account the user's
 * CEME cards, active selection and ad-hoc baseline.
 */
export function calculateStationPricing({
  station,
  headlineSocket,
  energyNeeded,
  durationMinutes,
  cards = [],
  activeCardId = 'auto',
}) {
  const rawPricing = headlineSocket ? resolveSocketPricing(headlineSocket.tarifas) : null
  const adHocEstimatedCost = rawPricing ? estimateCost(rawPricing, energyNeeded, durationMinutes ?? 0) : null

  // Reference Standard CEME market cost (~0.185 €/kWh energy + 0.15 € session + OPC station tariff)
  const STD_CEME_ENERGY_RATE = 0.185
  const STD_CEME_ACTIVATION_FEE = 0.15
  let standardCemeCost = null
  let standardCemeEnergyCost = 0
  if (headlineSocket && headlineSocket.tarifas && headlineSocket.tarifas.length > 0) {
    const stdRefCard = {
      kwhPrice: STD_CEME_ENERGY_RATE,
      activationFee: STD_CEME_ACTIVATION_FEE,
      minuteFee: 0.0,
      discountPercent: 0,
      pricingMode: 'standard',
    }
    const stdRes = calculateCardCost(stdRefCard, headlineSocket, energyNeeded, durationMinutes ?? 0, station)
    if (stdRes && stdRes.totalCost != null) {
      standardCemeCost = stdRes.totalCost
      standardCemeEnergyCost = stdRes.cemeBreakdown?.cemeEnergy ?? STD_CEME_ENERGY_RATE * energyNeeded
    }
  }

  const enabledCards = (cards || []).filter((c) => c.enabled !== false)
  const bestCardResult = headlineSocket
    ? findBestCardForStation(enabledCards, headlineSocket, energyNeeded, durationMinutes ?? 0, station)
    : null

  let activeCardResult = null

  if (activeCardId === 'none' || !enabledCards.length) {
    activeCardResult = null
  } else if (activeCardId === 'auto') {
    activeCardResult = bestCardResult
  } else {
    const selectedCard = enabledCards.find((c) => c.id === activeCardId)
    if (selectedCard && headlineSocket) {
      const cardCost = calculateCardCost(selectedCard, headlineSocket, energyNeeded, durationMinutes ?? 0, station)
      if (cardCost && cardCost.totalCost != null) {
        activeCardResult = {
          card: selectedCard,
          cost: cardCost,
        }
      } else {
        activeCardResult = null
      }
    } else {
      activeCardResult = bestCardResult
    }
  }

  // Determine final effective cost for sorting and display.
  // When no card is active, use the published walk-up price only if it includes an energy rate.
  // Otherwise (e.g. REGULAR tariff with 0 €/kWh energy) fall back to a standard CEME market
  // reference so the energy portion is never shown as 0 €/kWh.
  const hasWalkUpEnergyRate = rawPricing?.energy?.valor > 0
  const noCardEstimatedCost =
    activeCardId === 'none' || !enabledCards.length
      ? (hasWalkUpEnergyRate ? adHocEstimatedCost : standardCemeCost)
      : null

  const effectiveCost =
    activeCardResult?.cost?.totalCost ??
    noCardEstimatedCost ??
    adHocEstimatedCost ??
    standardCemeCost

  // Benchmark reference: use Ad-Hoc walk-up price if available, otherwise Standard CEME market reference
  const benchmarkCost = adHocEstimatedCost ?? standardCemeCost
  const savings =
    benchmarkCost != null && activeCardResult?.cost?.totalCost != null
      ? Math.max(0, benchmarkCost - activeCardResult.cost.totalCost)
      : 0

  // Extract OPC rate details from headline socket for UI badges & breakdowns
  const opcTarifas = headlineSocket?.tarifas || []
  const regularTarifas = opcTarifas.filter((t) => t.tarifario === 'REGULAR' || !t.tarifario)
  const listToInspect = regularTarifas.length > 0 ? regularTarifas : opcTarifas

  const opcTimeRate = listToInspect.find((t) => t.tipo === 'TIME' && t.valor != null)?.valor ?? 0
  const opcFlatFee = listToInspect.find((t) => t.tipo === 'FLAT' && t.valor != null)?.valor ?? 0
  const opcEnergyRate = listToInspect.find((t) => t.tipo === 'ENERGY' && t.valor != null)?.valor ?? 0
  const opcTimeCost = durationMinutes ? opcTimeRate * durationMinutes : 0

  return {
    rawPricing,
    adHocEstimatedCost,
    standardCemeCost,
    benchmarkCost,
    activeCardResult,
    bestCardResult,
    effectiveCost,
    savings,
    opcTimeRate,
    opcFlatFee,
    opcEnergyRate,
    opcTimeCost,
    estimatedCemeEnergyRate: STD_CEME_ENERGY_RATE,
    estimatedCemeActivationFee: STD_CEME_ACTIVATION_FEE,
    estimatedCemeEnergyCost: standardCemeEnergyCost,
  }
}

export const PRICING_CATEGORY_LABELS = {
  pt: {
    AD_HOC_PAYMENT: 'Preço avulso (sem contrato)',
    BLANK: 'Preço publicado',
    REGULAR: 'Requer contrato com um CEME',
  },
  en: {
    AD_HOC_PAYMENT: 'Direct walk-up price (no contract)',
    BLANK: 'Published price',
    REGULAR: 'Requires contract with a CEME',
  },
}

export function getPricingCategoryLabel(category, lang = 'pt') {
  const dict = PRICING_CATEGORY_LABELS[lang] || PRICING_CATEGORY_LABELS.pt
  return dict[category] || category || '—'
}

/** Human labels for Mobi.E's official charging speed classification. */
export const CHARGING_SPEED_LABELS = {
  pt: {
    Normal: 'Normal (lento)',
    Semirrápido: 'Semirrápido',
    Rápido: 'Rápido',
    Ultrarrápido: 'Ultrarrápido',
  },
  en: {
    Normal: 'Normal (slow)',
    Semirrápido: 'Semi-rapid (AC)',
    Rápido: 'Rapid (DC)',
    Ultrarrápido: 'Ultra-rapid (HPC)',
  },
}

export function getChargingSpeedLabel(speed, lang = 'pt') {
  const dict = CHARGING_SPEED_LABELS[lang] || CHARGING_SPEED_LABELS.pt
  return dict[speed] || speed || '—'
}

export const CHARGING_SPEED_ORDER = ['Normal', 'Semirrápido', 'Rápido', 'Ultrarrápido']

/** Picks the fastest (highest power) socket in a station to headline the card. */
export function pickFastestSocket(sockets) {
  if (!sockets || !sockets.length) return null
  return sockets.reduce((fastest, socket) => {
    if (!fastest) return socket
    const currentPower = socket.potencia ?? 0
    const fastestPower = fastest.potencia ?? 0

    const currentHasTariffs = socket.tarifas && socket.tarifas.length > 0
    const fastestHasTariffs = fastest.tarifas && fastest.tarifas.length > 0

    if (currentHasTariffs && !fastestHasTariffs) return socket
    if (!currentHasTariffs && fastestHasTariffs) return fastest

    return currentPower > fastestPower ? socket : fastest
  }, null)
}
