import { useCallback, useEffect, useState } from 'react'
import { refreshTarifasDataset } from '../lib/refreshTarifas.js'
import { resolveStationCoordinates } from '../lib/geo.js'
import { TESLA_SUPERCHARGERS } from './teslaStations.js'
import municipioCoords from './municipio-coords.json'

const DATASET_URL = `${import.meta.env.BASE_URL}data/postos.json`

function enrichStationCoordinates(stations) {
  return stations.map((s) => {
    const { lat, lng } = resolveStationCoordinates(s, municipioCoords)
    return {
      ...s,
      lat,
      lng,
    }
  })
}

function mergeWithTeslaStations(rawDataset) {
  if (!rawDataset || !Array.isArray(rawDataset.stations)) return rawDataset
  const existingIds = new Set(rawDataset.stations.map((p) => p.id))
  const missingTesla = TESLA_SUPERCHARGERS.filter((s) => !existingIds.has(s.id))
  const combined = [...missingTesla, ...rawDataset.stations]
  const stationsWithCoords = enrichStationCoordinates(combined)

  return {
    ...rawDataset,
    stations: stationsWithCoords,
    stationCount: stationsWithCoords.length,
  }
}

/**
 * Loads the locally generated Mobi.E tariffs dataset (see scripts/sync-tarifas.mjs)
 * on first render, and exposes a refresh() function that re-downloads the
 * source CSV directly from the browser and rebuilds the dataset in place.
 */
export function useTarifas() {
  const [state, setState] = useState({ status: 'loading', dataset: null, error: null })
  const [refreshProgress, setRefreshProgress] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetch(DATASET_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((dataset) => {
        if (!cancelled) {
          const merged = mergeWithTeslaStations(dataset)
          setState({ status: 'ready', dataset: merged, error: null })
        }
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', dataset: null, error })
      })

    return () => {
      cancelled = true
    }
  }, [])

  const refresh = useCallback(async () => {
    setRefreshProgress({ phase: 'download', loaded: 0, total: 0 })
    try {
      const rawDataset = await refreshTarifasDataset(setRefreshProgress)
      const dataset = mergeWithTeslaStations(rawDataset)
      setState({ status: 'ready', dataset, error: null })
      setRefreshProgress(null)
      return dataset
    } catch (error) {
      setRefreshProgress({ phase: 'error', error })
      throw error
    }
  }, [])

  const dismissRefreshError = useCallback(() => setRefreshProgress(null), [])

  return { ...state, refresh, refreshProgress, dismissRefreshError }
}

