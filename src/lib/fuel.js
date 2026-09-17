/**
 * Fuel prices service (DGEG reference averages for Portugal).
 * Provides daily reference prices for Gasoline 95 and Diesel (Gasóleo simples).
 */

const FUEL_STORAGE_KEY = 'cargacerta_fuel_prices'

// Default fallback prices based on DGEG national averages (Portugal)
export const DEFAULT_FUEL_PRICES = {
  gasoline95: 2.069, // €/liter (Gasolina 95 Simples em Portugal - DGEG)
  diesel: 2.157,     // €/liter (Gasóleo Simples em Portugal - DGEG)
  consumptionGasolineL100: 6.5, // L / 100km standard benchmark
  consumptionDieselL100: 5.5,   // L / 100km standard benchmark
  lastUpdated: new Date().toISOString(),
  source: 'DGEG (Preço Médio Diário Portugal)',
}

/**
 * Loads fuel prices from localStorage or fallback defaults.
 */
export function loadFuelPrices() {
  try {
    const raw = localStorage.getItem(FUEL_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_FUEL_PRICES, ...parsed }
    }
  } catch (err) {
    console.warn('Failed to load saved fuel prices:', err)
  }
  return { ...DEFAULT_FUEL_PRICES }
}

/**
 * Saves customized fuel prices to localStorage.
 */
export function saveFuelPrices(prices) {
  try {
    localStorage.setItem(FUEL_STORAGE_KEY, JSON.stringify(prices))
  } catch (err) {
    console.warn('Failed to save fuel prices:', err)
  }
}
