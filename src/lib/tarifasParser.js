/**
 * Shared, environment-agnostic (Node + browser) parsing/aggregation logic for
 * the public national tariffs CSV published by Mobi.E. Used both by the
 * build-time sync script (scripts/sync-tarifas.mjs) and by the in-app
 * "Atualizar tarifas" refresh feature (src/lib/refreshTarifas.js).
 */

/** Minimal RFC4180-ish CSV parser supporting ';' delimiter and quoted fields. */
export function parseCsv(text, delimiter = ';') {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === delimiter) {
      row.push(field)
      field = ''
    } else if (char === '\r') {
      // ignore, \n handles the line break
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

export function toRecords(rows) {
  const [header, ...body] = rows
  return body
    .filter((cols) => cols.length === header.length && cols.some((value) => value !== ''))
    .map((cols) => Object.fromEntries(header.map((key, index) => [key, cols[index]])))
}

export function parseNumber(value) {
  if (!value) return null
  const normalized = value.replace(/\s/g, '').replace(',', '.')
  const number = Number.parseFloat(normalized)
  return Number.isNaN(number) ? null : number
}

/** Parses strings like "€ 0.261 /charge" or "€ 0.09 /min até 45 min" or "€ 0.27 /min após 30 min". */
export function parseTarifaValor(raw) {
  if (!raw) return { valor: null, unidade: null, condicao: null }

  const match = raw.match(/€\s*([\d.,]+)\s*\/\s*(charge|kwh|min)/i)
  const valor = match ? parseNumber(match[1]) : null
  const unidade = match ? match[2].toLowerCase() : null

  let condicao = null
  const ateMatch = raw.match(/até\s+(\d+)\s*min/i)
  const aposMatch = raw.match(/após\s+(\d+)\s*min/i)
  if (ateMatch) condicao = { tipo: 'ate', minutos: Number.parseInt(ateMatch[1], 10) }
  else if (aposMatch) condicao = { tipo: 'apos', minutos: Number.parseInt(aposMatch[1], 10) }

  return { valor, unidade: unidade === 'kwh' ? 'kWh' : unidade, condicao }
}

export function buildDataset(records, municipioDistrito) {
  const stationsById = new Map()
  const socketsByUid = new Map()
  const unmappedMunicipios = new Set()

  for (const record of records) {
    const stationId = record.ID?.trim()
    const socketUid = record.UID_TOMADA?.trim()
    if (!stationId || !socketUid) continue

    if (!stationsById.has(stationId)) {
      const municipio = record.MUNICIPIO?.trim() ?? ''
      const distrito = municipioDistrito[municipio] ?? null
      if (!distrito) unmappedMunicipios.add(municipio)

      stationsById.set(stationId, {
        id: stationId,
        municipio,
        distrito,
        morada: record.MORADA?.trim() ?? '',
        tipoPosto: record.TIPO_POSTO?.trim() ?? '',
        operador: record.OPERADOR?.trim() ?? '',
        sockets: [],
      })
    }

    if (!socketsByUid.has(socketUid)) {
      const socket = {
        uid: socketUid,
        nivelTensao: record.NIVELTENSAO?.trim() || null,
        tipoTomada: record.TIPO_TOMADA?.trim() || null,
        formatoTomada: record.FORMATO_TOMADA?.trim() || null,
        potencia: parseNumber(record.POTENCIA_TOMADA),
        tarifas: [],
      }
      socketsByUid.set(socketUid, socket)
      stationsById.get(stationId).sockets.push(socket)
    }

    const tipoTarifa = record.TIPO_TARIFA?.trim()
    const rawTarifa = record.TARIFA?.trim()
    if (tipoTarifa && rawTarifa) {
      const { valor, unidade, condicao } = parseTarifaValor(rawTarifa)
      socketsByUid.get(socketUid).tarifas.push({
        tarifario: record.TIPO_TARIFARIO?.trim() || null,
        tipo: tipoTarifa,
        valor,
        unidade,
        condicao,
        raw: rawTarifa,
      })
    }
  }

  return {
    stations: Array.from(stationsById.values()),
    unmappedMunicipios: Array.from(unmappedMunicipios).sort(),
  }
}

/** Parses raw CSV text end-to-end into the aggregated dataset shape used by the app. */
export function parseTarifasCsv(csvText, municipioDistrito) {
  const rows = parseCsv(csvText)
  const records = toRecords(rows)
  const { stations, unmappedMunicipios } = buildDataset(records, municipioDistrito)
  return { stations, unmappedMunicipios, recordCount: records.length }
}
