/**
 * Client-side refresh of the Mobi.E tariffs dataset. Downloads the same
 * public CSV used by scripts/sync-tarifas.mjs directly from the browser
 * (the endpoint reflects the request Origin in its CORS headers, so this
 * works without a backend), reports download progress, then parses it
 * with the shared parser used at build time.
 */
import { parseTarifasCsv } from './tarifasParser.js'
import municipioDistrito from '../data/municipio-distrito.json'

export const TARIFAS_URL = 'https://www.mobie.pt/documents/42032/106470/Tarifas'

/**
 * @param {(progress: { phase: 'download' | 'parsing', loaded?: number, total?: number }) => void} onProgress
 */
export async function refreshTarifasDataset(onProgress = () => {}) {
  onProgress({ phase: 'download', loaded: 0, total: 0 })

  const response = await fetch(TARIFAS_URL, { mode: 'cors', cache: 'no-store' })
  if (!response.ok || !response.body) {
    throw new Error(`Falha ao descarregar o CSV: HTTP ${response.status}`)
  }

  const sourceLastModified = response.headers.get('last-modified') ?? null
  const totalHeader = response.headers.get('content-length')
  const total = totalHeader ? Number.parseInt(totalHeader, 10) : 0

  const reader = response.body.getReader()
  const chunks = []
  let loaded = 0

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    loaded += value.length
    onProgress({ phase: 'download', loaded, total })
  }

  onProgress({ phase: 'parsing', loaded, total })
  const csvText = new TextDecoder('utf-8').decode(concatChunks(chunks, loaded))

  const { stations, unmappedMunicipios } = parseTarifasCsv(csvText, municipioDistrito)
  if (unmappedMunicipios.length > 0) {
    console.warn('Município(s) sem distrito mapeado:', unmappedMunicipios)
  }

  onProgress({ phase: 'done', loaded, total })

  return {
    generatedAt: new Date().toISOString(),
    sourceUrl: TARIFAS_URL,
    sourceLastModified,
    stationCount: stations.length,
    stations,
  }
}

function concatChunks(chunks, totalLength) {
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}
