/**
 * Best-effort mapping of Mobi.E operator (CEME) short codes to their public
 * brand names. Not an official/exhaustive list — Mobi.E does not publish a
 * public code→name table, so this was compiled from public sources (brand
 * websites, DGEG's registered-CEME list, news coverage). Codes not present
 * here simply display as-is in the app. Extend freely as more codes are
 * identified.
 */
export const OPERATOR_NAMES = {
  EDP: 'EDP',
  GLP: 'Galp',
  HLX: 'Helexia',
  REP: 'Repsol',
  IBD: 'Iberdrola',
  PRI: 'Prio',
  IOY: 'Ionity',
  ATL: 'Atlante',
  ZUN: 'Zunder',
  CIR: 'Circle K',
  VIA: 'Via Verde',
  EVI: 'EVIO',
  ACC: 'Acciona',
  GEN: 'Generg',
  CAP: 'Capwatt',
  MOO: 'Moove',
  BLU: 'Blue Charge',
  FCT: 'Factorenergia',
  TSLA: 'Tesla Supercharger',
}

/** Returns "Nome (CÓDIGO)" when a friendly name is known, otherwise just the raw code. */
export function operatorLabel(code) {
  if (!code) return 'n/d'
  const name = OPERATOR_NAMES[code]
  return name ? `${name} (${code})` : code
}
