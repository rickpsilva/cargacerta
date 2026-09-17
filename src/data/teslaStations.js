/**
 * Known Tesla Superchargers in Portugal (open to non-Tesla vehicles via Tesla App).
 * Coordinates and locations compiled from Tesla official network & UVE / Mobi.E.
 */

export const TESLA_SUPERCHARGERS = [
  {
    id: 'TSLA-FATIMA',
    municipio: 'Fátima',
    distrito: 'Santarém',
    morada: 'Restaurante Floresta, Estrada da Batalha (V4 Supercharger)',
    operador: 'TSLA',
    tipoPosto: 'Ultrarrápido',
    isTeslaSupercharger: true,
    requiresTeslaApp: true,
    lat: 39.6338,
    lng: -8.6723,
    sockets: [
      {
        id: 'TSLA-FATIMA-CCS',
        tipoTomada: 'CCS (Type 2 Combo)',
        potencia: 250,
        tarifas: [
          {
            tipo: 'ENERGY',
            valor: 0.39, // Average peak/off-peak rate for non-Tesla without subscription
            tarifario: 'REGULAR',
          },
          {
            tipo: 'TIME',
            valor: 0.0,
            tarifario: 'REGULAR',
          },
        ],
      },
    ],
  },
  {
    id: 'TSLA-ALCACER',
    municipio: 'Alcácer do Sal',
    distrito: 'Setúbal',
    morada: 'Restaurante Boa Viagem, EN5, 7580-000 Alcácer do Sal',
    operador: 'TSLA',
    tipoPosto: 'Ultrarrápido',
    isTeslaSupercharger: true,
    requiresTeslaApp: true,
    lat: 38.3752,
    lng: -8.5132,
    sockets: [
      {
        id: 'TSLA-ALCACER-CCS',
        tipoTomada: 'CCS (Type 2 Combo)',
        potencia: 250,
        tarifas: [
          {
            tipo: 'ENERGY',
            valor: 0.39,
            tarifario: 'REGULAR',
          },
        ],
      },
    ],
  },
  {
    id: 'TSLA-MATOSINHOS',
    municipio: 'Matosinhos',
    distrito: 'Porto',
    morada: 'MAR Shopping Matosinhos, Av. Dr. Óscar Lopes',
    operador: 'TSLA',
    tipoPosto: 'Ultrarrápido',
    isTeslaSupercharger: true,
    requiresTeslaApp: true,
    lat: 41.2008,
    lng: -8.6903,
    sockets: [
      {
        id: 'TSLA-MATOSINHOS-CCS',
        tipoTomada: 'CCS (Type 2 Combo)',
        potencia: 250,
        tarifas: [
          {
            tipo: 'ENERGY',
            valor: 0.39,
            tarifario: 'REGULAR',
          },
        ],
      },
    ],
  },
  {
    id: 'TSLA-MEALHADA',
    municipio: 'Mealhada',
    distrito: 'Aveiro',
    morada: 'Hotel Portagem Bairrada, R. São Domingos 20 (Coimbra Norte)',
    operador: 'TSLA',
    tipoPosto: 'Ultrarrápido',
    isTeslaSupercharger: true,
    requiresTeslaApp: true,
    lat: 40.3783,
    lng: -8.4522,
    sockets: [
      {
        id: 'TSLA-MEALHADA-CCS',
        tipoTomada: 'CCS (Type 2 Combo)',
        potencia: 250,
        tarifas: [
          {
            tipo: 'ENERGY',
            valor: 0.39,
            tarifario: 'REGULAR',
          },
        ],
      },
    ],
  },
  {
    id: 'TSLA-LOULE',
    municipio: 'Loulé',
    distrito: 'Faro',
    morada: 'MAR Shopping Algarve, Av. Algarve 3, Almancil (Faro)',
    operador: 'TSLA',
    tipoPosto: 'Ultrarrápido',
    isTeslaSupercharger: true,
    requiresTeslaApp: true,
    lat: 37.0989,
    lng: -7.9961,
    sockets: [
      {
        id: 'TSLA-LOULE-CCS',
        tipoTomada: 'CCS (Type 2 Combo)',
        potencia: 250,
        tarifas: [
          {
            tipo: 'ENERGY',
            valor: 0.39,
            tarifario: 'REGULAR',
          },
        ],
      },
    ],
  },
  {
    id: 'TSLA-ALCANTARILHA',
    municipio: 'Silves (Alcantarilha)',
    distrito: 'Faro',
    morada: 'Amendoeira Golf Resort, Morgado da Lameira, Alcantarilha',
    operador: 'TSLA',
    tipoPosto: 'Ultrarrápido',
    isTeslaSupercharger: true,
    requiresTeslaApp: true,
    lat: 37.1352,
    lng: -8.3582,
    sockets: [
      {
        id: 'TSLA-ALCANTARILHA-CCS',
        tipoTomada: 'CCS (Type 2 Combo)',
        potencia: 250,
        tarifas: [
          {
            tipo: 'ENERGY',
            valor: 0.39,
            tarifario: 'REGULAR',
          },
        ],
      },
    ],
  },
  {
    id: 'TSLA-GUARDA',
    municipio: 'Guarda',
    distrito: 'Guarda',
    morada: 'Hotel Lusitânia, Rua das Covas Lote 34',
    operador: 'TSLA',
    tipoPosto: 'Ultrarrápido',
    isTeslaSupercharger: true,
    requiresTeslaApp: true,
    lat: 40.5489,
    lng: -7.2412,
    sockets: [
      {
        id: 'TSLA-GUARDA-CCS',
        tipoTomada: 'CCS (Type 2 Combo)',
        potencia: 250,
        tarifas: [
          {
            tipo: 'ENERGY',
            valor: 0.39,
            tarifario: 'REGULAR',
          },
        ],
      },
    ],
  },
  {
    id: 'TSLA-CASTELO-BRANCO',
    municipio: 'Castelo Branco',
    distrito: 'Castelo Branco',
    morada: 'Av. Prof. Dr. Egas Moniz (A23)',
    operador: 'TSLA',
    tipoPosto: 'Ultrarrápido',
    isTeslaSupercharger: true,
    requiresTeslaApp: true,
    lat: 39.8222,
    lng: -7.4931,
    sockets: [
      {
        id: 'TSLA-CASTELO-BRANCO-CCS',
        tipoTomada: 'CCS (Type 2 Combo)',
        potencia: 250,
        tarifas: [
          {
            tipo: 'ENERGY',
            valor: 0.39,
            tarifario: 'REGULAR',
          },
        ],
      },
    ],
  },
  {
    id: 'TSLA-MONTEMOR',
    municipio: 'Montemor-o-Novo',
    distrito: 'Évora',
    morada: 'Herdade das Valadas, EN (A6)',
    operador: 'TSLA',
    tipoPosto: 'Ultrarrápido',
    isTeslaSupercharger: true,
    requiresTeslaApp: true,
    lat: 38.6481,
    lng: -8.2195,
    sockets: [
      {
        id: 'TSLA-MONTEMOR-CCS',
        tipoTomada: 'CCS (Type 2 Combo)',
        potencia: 250,
        tarifas: [
          {
            tipo: 'ENERGY',
            valor: 0.39,
            tarifario: 'REGULAR',
          },
        ],
      },
    ],
  },
  {
    id: 'TSLA-RIBEIRA-PENA',
    municipio: 'Ribeira de Pena',
    distrito: 'Vila Real',
    morada: 'Pena Park Hotel, Rua do Complexo Turístico de Lamelas',
    operador: 'TSLA',
    tipoPosto: 'Ultrarrápido',
    isTeslaSupercharger: true,
    requiresTeslaApp: true,
    lat: 41.5213,
    lng: -7.7942,
    sockets: [
      {
        id: 'TSLA-RIBEIRA-PENA-CCS',
        tipoTomada: 'CCS (Type 2 Combo)',
        potencia: 250,
        tarifas: [
          {
            tipo: 'ENERGY',
            valor: 0.39,
            tarifario: 'REGULAR',
          },
        ],
      },
    ],
  },
]
