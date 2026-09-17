#!/usr/bin/env node
/**
 * Downloads the public national tariffs CSV published by Mobi.E
 * ("Descarregar Tarifas" button on https://mobie.pt/pt/carregarveiculo/encontrar-posto)
 * and converts it into a compact JSON dataset consumed by the webapp.
 *
 * The CSV has one row per (socket, tariff line) combination. This script
 * aggregates rows into stations -> sockets -> tariffs, resolves each
 * station's distrito from its município, and writes the result to
 * public/data/postos.json.
 *
 * Run with: npm run sync:tarifas
 */
import { writeFile, mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { parseTarifasCsv } from '../src/lib/tarifasParser.js'

const TARIFAS_URL = 'https://www.mobie.pt/documents/42032/106470/Tarifas'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUTPUT_PATH = path.join(ROOT, 'public', 'data', 'postos.json')
const MUNICIPIO_DISTRITO_PATH = path.join(ROOT, 'src', 'data', 'municipio-distrito.json')

async function main() {
  console.log(`A descarregar ${TARIFAS_URL} ...`)
  const response = await fetch(TARIFAS_URL)
  if (!response.ok) {
    throw new Error(`Falha ao descarregar o CSV: HTTP ${response.status}`)
  }
  const sourceLastModified = response.headers.get('last-modified') ?? null
  const csvText = await response.text()
  console.log(`CSV descarregado (${(csvText.length / 1024 / 1024).toFixed(1)} MB).`)
  console.log(`Data do CSV (Last-Modified): ${sourceLastModified ?? 'desconhecida'}`)

  const municipioDistrito = JSON.parse(await readFile(MUNICIPIO_DISTRITO_PATH, 'utf8'))

  const { stations, unmappedMunicipios, recordCount } = parseTarifasCsv(csvText, municipioDistrito)
  console.log(`Linhas processadas: ${recordCount}`)
  console.log(`Postos agregados: ${stations.length}`)
  console.log(`Tomadas agregadas: ${stations.reduce((sum, s) => sum + s.sockets.length, 0)}`)

  if (unmappedMunicipios.length > 0) {
    console.warn(
      `Aviso: ${unmappedMunicipios.length} município(s) sem distrito mapeado:`,
      unmappedMunicipios,
    )
  }

  const dataset = {
    generatedAt: new Date().toISOString(),
    sourceUrl: TARIFAS_URL,
    sourceLastModified,
    stationCount: stations.length,
    stations,
  }

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, JSON.stringify(dataset), 'utf8')
  console.log(`Dataset escrito em ${path.relative(ROOT, OUTPUT_PATH)}`)
}

main().catch((error) => {
  console.error('Falha ao sincronizar as tarifas da Mobi.E:', error)
  process.exitCode = 1
})
