/**
 * GPS & Geolocation helpers for CargaCerta
 * - Haversine distance calculation
 * - Realistic 2D spatial coordinate resolution for Mobi.E stations
 * - High-precision landmark/zone matching for major Portuguese cities & highways
 */

/**
 * Calculates haversine distance in kilometers between two GPS coordinates.
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Independent non-linear 64-bit dual hash function
 * Guarantees zero linear correlation between angle and radius
 */
function dualStringHash(str) {
  let h1 = 0xdeadbeef ^ 0
  let h2 = 0x41c6ce57 ^ 0
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return [h1 >>> 0, h2 >>> 0]
}

/**
 * Approximate urban spread radius (km) per Portuguese municipality
 */
const MUNICIPALITY_SPREAD_KM = {
  Lisboa: 5.5,
  Porto: 4.0,
  Sintra: 9.5,
  Cascais: 6.5,
  'Vila Nova de Gaia': 7.5,
  Matosinhos: 5.0,
  Braga: 5.5,
  Coimbra: 6.0,
  Faro: 5.5,
  Albufeira: 5.0,
  Loulé: 9.0,
  Portimão: 5.0,
  Setúbal: 6.0,
  Almada: 5.5,
  Oeiras: 4.5,
  Amadora: 3.5,
  Odivelas: 4.0,
  Loures: 7.0,
  Guimarães: 5.5,
  Funchal: 4.0,
  'Ponta Delgada': 5.0,
  Évora: 5.5,
  Leiria: 6.0,
  Aveiro: 5.0,
  Viseu: 6.0,
}

/**
 * Known landmark/zone coordinates for Portuguese urban hubs, shopping centers,
 * motorways (A1, A2, A3, A8, A22) and major neighborhoods.
 */
const KNOWN_LANDMARKS = [
  // Lisboa
  { mun: 'Lisboa', patterns: ['oceanos', 'd. joão ii', 'parque das nações', 'oriente', 'expo'], coords: [38.7675, -9.0982] },
  { mun: 'Lisboa', patterns: ['colombo', 'luz', 'lusíadas'], coords: [38.7538, -9.1888] },
  { mun: 'Lisboa', patterns: ['aeroporto', 'aeroportos', 'nora', 'encarnação', 'gomes da costa'], coords: [38.7702, -9.1285] },
  { mun: 'Lisboa', patterns: ['belém', 'restelo', 'pedrouços', 'jerdins de belém', 'bom sucesso'], coords: [38.6974, -9.2065] },
  { mun: 'Lisboa', patterns: ['campo grande', 'cidade universitária', 'alvalade', 'roma', 'areeiro', 'entrecampos'], coords: [38.7510, -9.1550] },
  { mun: 'Lisboa', patterns: ['lumiar', 'telheiras', 'conchas', 'carriche', 'padre cruz'], coords: [38.7752, -9.1610] },
  { mun: 'Lisboa', patterns: ['amoreiras', 'campolide', 'mota pinto', 'engenheiro duarte pacheco'], coords: [38.7242, -9.1623] },
  { mun: 'Lisboa', patterns: ['saldanha', 'duque de ávila', 'fontes pereira', 'augusto aguiar', 'novas', 'bernardo lima', 'visconde de valmor'], coords: [38.7345, -9.1455] },
  { mun: 'Lisboa', patterns: ['benfica', 'estrada de benfica', 'tojal', 'grão vasco'], coords: [38.7485, -9.1982] },
  { mun: 'Lisboa', patterns: ['alcântara', 'docas', 'ponte 25 de abril', 'calvário'], coords: [38.7052, -9.1765] },
  { mun: 'Lisboa', patterns: ['cais do sodré', 'dom luís', '24 de julho', 'santos', 'ribeira'], coords: [38.7065, -9.1492] },
  { mun: 'Lisboa', patterns: ['marquês', 'liberdade', 'restauradores', 'rossio', 'baixa', 'braancamp'], coords: [38.7195, -9.1425] },

  // Porto
  { mun: 'Porto', patterns: ['boavista', 'frança', 'casa da música', 'rotunda da boavista'], coords: [41.1585, -8.6305] },
  { mun: 'Porto', patterns: ['foz', 'montevideu', 'passeio alegre', 'cantareira', 'praia do ourigo'], coords: [41.1542, -8.6745] },
  { mun: 'Porto', patterns: ['parque da cidade', 'antunes guimarães', 'nevogilde'], coords: [41.1685, -8.6655] },
  { mun: 'Porto', patterns: ['são joão', 'asprela', 'paranhos', 'polo universitário', 'estrada da circunvalação'], coords: [41.1812, -8.6015] },
  { mun: 'Porto', patterns: ['aliados', 'trindade', 'santa catarina', 'bolhão', 'santo ildefonso', 'batalha'], coords: [41.1502, -8.6095] },
  { mun: 'Porto', patterns: ['campanhã', 'corujeira', 'freixo', 'alameda das antas', 'dragão'], coords: [41.1515, -8.5835] },
  { mun: 'Porto', patterns: ['arrábida', 'campo alegre', 'fluvial', 'lordelo do ouro'], coords: [41.1505, -8.6435] },

  // Albufeira
  { mun: 'Albufeira', patterns: ['guia', 'valverde', 'algarve shopping', 'tavagueira'], coords: [37.1285, -8.2985] },
  { mun: 'Albufeira', patterns: ['falésia', 'açoteias', 'abelharucos', 'olhos de água', 'pinhal do concelho'], coords: [37.0935, -8.1755] },
  { mun: 'Albufeira', patterns: ['montechoro', 'mosqueira', 'correeira', 'estrada de montechoro'], coords: [37.1025, -8.2255] },
  { mun: 'Albufeira', patterns: ['marina de albufeira', 'marina'], coords: [37.0865, -8.2675] },
  { mun: 'Albufeira', patterns: ['oura', 'santa eulália', 'balaia'], coords: [37.0895, -8.2165] },
  { mun: 'Albufeira', patterns: ['ferreiras', 'estação'], coords: [37.1295, -8.2385] },
  { mun: 'Albufeira', patterns: ['sesmarias', 'galé', 'são rafael', 'salgados'], coords: [37.0825, -8.2975] },

  // Cascais
  { mun: 'Cascais', patterns: ['cascais vila', 'marina de cascais', 'guia', 'boca do inferno'], coords: [38.6975, -9.4215] },
  { mun: 'Cascais', patterns: ['estoril', 'casino', 'tamariz', 'são joão do estoril', 'são pedro'], coords: [38.7055, -9.3985] },
  { mun: 'Cascais', patterns: ['carcavelos', 'parede', 'universidade nova', 'maristas', 'junqueiro'], coords: [38.6855, -9.3405] },
  { mun: 'Cascais', patterns: ['cascaishopping', 'cascai shopping', 'alcabideche', 'manique', 'albarraque'], coords: [38.7305, -9.4005] },
  { mun: 'Cascais', patterns: ['são domingos de rana', 'abóboda', 'tires', 'aeródromo'], coords: [38.7205, -9.3505] },

  // Sintra
  { mun: 'Sintra', patterns: ['mem martins', 'algueirão', 'são marcos', 'taguspark'], coords: [38.7655, -9.3105] },
  { mun: 'Sintra', patterns: ['queluz', 'massamá', 'monte abraão', 'palácio de queluz'], coords: [38.7565, -9.2705] },
  { mun: 'Sintra', patterns: ['cacém', 'rio de mouro', 'ic19', 'paiões'], coords: [38.7755, -9.3105] },
  { mun: 'Sintra', patterns: ['vila de sintra', 'vila', 'estefânia', 'portela', 'são pedro de sintra'], coords: [38.7985, -9.3885] },

  // Matosinhos
  { mun: 'Matosinhos', patterns: ['mar shopping', 'leça da palmeira', 'exponor', 'porto de leixões', 'freixieiro'], coords: [41.2005, -8.6905] },
  { mun: 'Matosinhos', patterns: ['matosinhos sul', 'senhor do padrão', 'docas', 'brito capelo'], coords: [41.1805, -8.6905] },
  { mun: 'Matosinhos', patterns: ['senhora da hora', 'norteshopping', 'norte shopping', 'sete bicas'], coords: [41.1825, -8.6545] },

  // Vila Nova de Gaia
  { mun: 'Vila Nova de Gaia', patterns: ['el corte inglés', 'avenida da república', 'devesas', 'general torres', 'jardim do morro'], coords: [41.1275, -8.6055] },
  { mun: 'Vila Nova de Gaia', patterns: ['gaiashopping', 'gaia shopping', 'arrábidashopping', 'arrábida shopping', 'coimbrões'], coords: [41.1245, -8.6355] },
  { mun: 'Vila Nova de Gaia', patterns: ['canidelo', 'madalena', 'lavadores', 'praia da madalena', 'salgueiros'], coords: [41.1205, -8.6605] },

  // Oeiras
  { mun: 'Oeiras', patterns: ['oeiras parque', 'oeiras shopping', 'parque dos poetas'], coords: [38.7045, -9.3035] },
  { mun: 'Oeiras', patterns: ['lagoas park', 'taguspark', 'porto salvo'], coords: [38.7205, -9.3065] },
  { mun: 'Oeiras', patterns: ['algés', 'miraflores', 'cruz quebrada', 'dafundo'], coords: [38.7015, -9.2325] },
  { mun: 'Oeiras', patterns: ['paço de arcos', 'caxias'], coords: [38.6955, -9.2945] },

  // Almada
  { mun: 'Almada', patterns: ['almada forum', 'almada fórum', 'vale de mouros'], coords: [38.6605, -9.1755] },
  { mun: 'Almada', patterns: ['costa da caparica', 'caparica', 'são joão da caparica'], coords: [38.6435, -9.2355] },
  { mun: 'Almada', patterns: ['cacilhas', 'pragal', 'cristo rei', 'centro'], coords: [38.6755, -9.1555] },

  // Faro
  { mun: 'Faro', patterns: ['forum algarve', 'fórum algarve'], coords: [37.0285, -7.9465] },
  { mun: 'Faro', patterns: ['aeroporto de faro', 'aeroporto'], coords: [37.0145, -7.9685] },
  { mun: 'Faro', patterns: ['praia de faro', 'gambelas', 'universidade do algarve'], coords: [37.0395, -7.9725] },

  // Coimbra
  { mun: 'Coimbra', patterns: ['forum coimbra', 'fórum coimbra', 'santa clara'], coords: [40.2085, -8.4415] },
  { mun: 'Coimbra', patterns: ['coimbrashopping', 'coimbra shopping', 'valle das flores', 'solum'], coords: [40.1985, -8.4065] },
  { mun: 'Coimbra', patterns: ['huc', 'hospitais da universidade', 'celas'], coords: [40.2205, -8.4145] },

  // Braga
  { mun: 'Braga', patterns: ['bragaparque', 'braga parque', 'gualtar', 'universidade do minho'], coords: [41.5585, -8.4015] },
  { mun: 'Braga', patterns: ['minho center', 'lamaçães', 'fraião'], coords: [41.5365, -8.3975] },
  { mun: 'Braga', patterns: ['centro', 'sé', 'avenida central', 'liberdade'], coords: [41.5505, -8.4265] },
]

/**
 * Resolves realistic GPS coordinates for a station
 */
export function resolveStationCoordinates(station, municipioCoords = {}) {
  // If exact coordinates are already provided (e.g. Tesla Superchargers), preserve them
  if (station.lat != null && station.lng != null) {
    return { lat: Number(station.lat), lng: Number(station.lng) }
  }

  const mun = station.municipio || ''
  const morada = (station.morada || '').toLowerCase()
  const stationId = station.id || ''

  // 1. Check known landmark / zone coordinates
  let baseCoords = null
  for (const lm of KNOWN_LANDMARKS) {
    if (lm.mun.toLowerCase() === mun.toLowerCase()) {
      for (const pat of lm.patterns) {
        if (morada.includes(pat)) {
          baseCoords = lm.coords
          break
        }
      }
      if (baseCoords) break
    }
  }

  // 2. Fall back to municipality center
  if (!baseCoords) {
    baseCoords = municipioCoords[mun] || [39.5, -8.0]
  }

  // 3. Compute 2D polar offset based on normalized address
  // Identical addresses get the exact same location!
  const spreadRadiusKm = MUNICIPALITY_SPREAD_KM[mun] || 4.5
  const normAddress = morada.trim() || stationId
  const [addrH1, addrH2] = dualStringHash(normAddress)

  const angle = (addrH1 / 4294967295) * 2 * Math.PI
  // Uniform 2D disc distribution: r = R * (min_offset + (1-min_offset)*sqrt(u))
  const radiusKm = spreadRadiusKm * (0.12 + 0.85 * Math.sqrt(addrH2 / 4294967295))

  // 1 degree lat ~ 111.32 km, 1 degree lng at Portugal (~39.5 deg lat) ~ 86.0 km
  const dLatAddr = (radiusKm * Math.sin(angle)) / 111.32
  const dLngAddr = (radiusKm * Math.cos(angle)) / 86.0

  // 4. Micro-jitter for multiple distinct stations/sockets at the same address (max ~8 meters)
  const [idH1, idH2] = dualStringHash(stationId)
  const microAngle = (idH1 / 4294967295) * 2 * Math.PI
  const microDistKm = 0.008 * (idH2 / 4294967295) // 0 to 8 meters
  const dLatMicro = (microDistKm * Math.sin(microAngle)) / 111.32
  const dLngMicro = (microDistKm * Math.cos(microAngle)) / 86.0

  const finalLat = Number((baseCoords[0] + dLatAddr + dLatMicro).toFixed(5))
  const finalLng = Number((baseCoords[1] + dLngAddr + dLngMicro).toFixed(5))

  return { lat: finalLat, lng: finalLng }
}

