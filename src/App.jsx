import { useMemo, useState } from 'react'
import './App.css'
import { useTarifas } from './data/useTarifas'
import {
  CHARGING_SPEED_ORDER,
  calculateStationPricing,
  getChargingSpeedLabel,
  getPricingCategoryLabel,
  pickFastestSocket,
} from './lib/pricing'
import { OPERATOR_NAMES, operatorLabel } from './lib/operators'
import { VEHICLES } from './data/vehicles'
import { CARD_PROVIDERS, getCardDisplayName, loadUserCards, saveUserCards } from './lib/cards'
import { calculateDistanceKm } from './lib/geo'
import { CardsManager } from './components/CardsManager'
import { CemeExplainer } from './components/CemeExplainer'
import { MonthlyCostSimulator } from './components/MonthlyCostSimulator'
import { StationsMap } from './components/StationsMap'
import { loadHomeTariff, calculateHomeChargingCost } from './lib/homeTariff'
import { useI18n } from './lib/i18n'

const PAGE_SIZE = 24

function formatDatasetDate(dataset, lang) {
  const iso = dataset?.sourceLastModified ?? dataset?.generatedAt
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const locale = lang === 'en' ? 'en-GB' : 'pt-PT'
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-PT')
}

function App() {
  const { t, lang, setLang, formatEuro } = useI18n()
  const { status, dataset, error, refresh, refreshProgress, dismissRefreshError } = useTarifas()
  const [vehicleQuery, setVehicleQuery] = useState('')
  const [capacity, setCapacity] = useState(64)
  const [charge, setCharge] = useState(20)
  const [targetCharge, setTargetCharge] = useState(80)
  const [district, setDistrict] = useState('')
  const [chargingSpeed, setChargingSpeed] = useState('')
  const [operator, setOperator] = useState('')
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [appliedFilters, setAppliedFilters] = useState({ district, chargingSpeed, operator, query })

  // CEME Cards State
  const [cards, setCards] = useState(() => loadUserCards())
  const [activeCardId, setActiveCardId] = useState('auto') // 'auto' | 'none' | card.id
  const [sortBy, setSortBy] = useState('price') // 'price' | 'savings' | 'power' | 'duration' | 'distance'
  const [isCardsModalOpen, setIsCardsModalOpen] = useState(false)
  const [isExplainerOpen, setIsExplainerOpen] = useState(false)
  const [expandedStationId, setExpandedStationId] = useState(null)
  const [selectedSimStationId, setSelectedSimStationId] = useState(null)

  // Map & Geolocation State
  const [viewMode, setViewMode] = useState('list') // 'list' | 'map'
  const [userLocation, setUserLocation] = useState(null) // { lat, lng, locality? }
  const [isLocating, setIsLocating] = useState(false)
  const [geoError, setGeoError] = useState(null)
  const [radiusKm, setRadiusKm] = useState(20) // 10 | 20 | 50 | 100 | null

  const energyNeeded = Math.max(0, capacity * ((targetCharge - charge) / 100))
  const isRefreshing = refreshProgress != null && refreshProgress.phase !== 'error'
  const refreshErrorMessage = refreshProgress?.phase === 'error' ? refreshProgress.error?.message : null

  const handleCardsChange = (newCards) => {
    setCards(newCards)
    saveUserCards(newCards)
  }

  const enabledCards = useMemo(() => cards.filter((c) => c.enabled !== false), [cards])

  const handleRefresh = () => {
    refresh().catch(() => {
      // error is already surfaced via refreshProgress; nothing else to do here
    })
  }

  const handleVehicleInput = (event) => {
    const value = event.target.value
    setVehicleQuery(value)
    const match = VEHICLES.find((vehicle) => vehicle.label === value)
    if (match) setCapacity(match.batteryKwh)
  }

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoError(t('geoLocateError'))
      return
    }
    setIsLocating(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setIsLocating(false)
        if (sortBy === 'price') {
          // If user searches GPS, default sorting by distance or keep price
          setSortBy('distance')
        }
      },
      (err) => {
        console.warn('Geolocation error:', err)
        setIsLocating(false)
        setGeoError(t('geoLocateError'))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  const handleClearGeolocation = () => {
    setUserLocation(null)
    setGeoError(null)
    if (sortBy === 'distance') setSortBy('price')
  }

  const districts = useMemo(() => {
    if (!dataset) return []
    const counts = new Map()
    for (const station of dataset.stations) {
      if (!station.distrito) continue
      counts.set(station.distrito, (counts.get(station.distrito) ?? 0) + 1)
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b, 'pt-PT'))
  }, [dataset])

  const operators = useMemo(() => {
    if (!dataset) return []
    const counts = new Map()
    for (const station of dataset.stations) {
      if (!station.operador) continue
      counts.set(station.operador, (counts.get(station.operador) ?? 0) + 1)
    }
    return [...counts.entries()].sort(([codeA, countA], [codeB, countB]) => {
      const nameA = OPERATOR_NAMES[codeA] ?? codeA
      const nameB = OPERATOR_NAMES[codeB] ?? codeB
      if (Boolean(OPERATOR_NAMES[codeA]) !== Boolean(OPERATOR_NAMES[codeB])) {
        return OPERATOR_NAMES[codeA] ? -1 : 1
      }
      return nameA.localeCompare(nameB, 'pt-PT') || countB - countA
    })
  }, [dataset])

  const rankedStations = useMemo(() => {
    if (!dataset) return []
    const normalizedQuery = query.trim() ? normalize(query.trim()) : ''

    const matches = dataset.stations.filter((station) => {
      if (district && station.distrito !== district) return false
      if (chargingSpeed && station.tipoPosto !== chargingSpeed) return false
      if (operator && station.operador !== operator) return false

      if (normalizedQuery) {
        const searchable = normalize(
          `${station.municipio} ${station.morada} ${station.operador} ${OPERATOR_NAMES[station.operador] ?? ''} ${station.id}`,
        )
        if (!searchable.includes(normalizedQuery)) return false
      }

      // Radius filter with User Location
      if (userLocation && radiusKm != null) {
        if (station.lat != null && station.lng != null) {
          const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, station.lat, station.lng)
          if (dist != null && dist > radiusKm) return false
        }
      }

      return true
    })

    return matches
      .map((station) => {
        const headlineSocket = pickFastestSocket(station.sockets)
        const power = headlineSocket?.potencia ?? null
        const durationMinutes = power ? (energyNeeded / power) * 60 : null

        const distanceKm =
          userLocation && station.lat != null && station.lng != null
            ? calculateDistanceKm(userLocation.lat, userLocation.lng, station.lat, station.lng)
            : null

        const pricingData = calculateStationPricing({
          station,
          headlineSocket,
          energyNeeded,
          durationMinutes,
          cards,
          activeCardId,
        })

        const connectors = [...new Set(station.sockets.map((socket) => socket.tipoTomada).filter(Boolean))]

        return {
          station,
          headlineSocket,
          power,
          durationMinutes,
          connectors,
          distanceKm,
          ...pricingData,
        }
      })
      .sort((a, b) => {
        if (sortBy === 'distance') {
          if (a.distanceKm == null && b.distanceKm == null) return 0
          if (a.distanceKm == null) return 1
          if (b.distanceKm == null) return -1
          return a.distanceKm - b.distanceKm
        }
        if (sortBy === 'savings') {
          return (b.savings || 0) - (a.savings || 0)
        }
        if (sortBy === 'power') {
          return (b.power || 0) - (a.power || 0)
        }
        if (sortBy === 'duration') {
          if (a.durationMinutes == null && b.durationMinutes == null) return 0
          if (a.durationMinutes == null) return 1
          if (b.durationMinutes == null) return -1
          return a.durationMinutes - b.durationMinutes
        }
        // Default: sort by effective price ascending
        if (a.effectiveCost == null && b.effectiveCost == null) return 0
        if (a.effectiveCost == null) return 1
        if (b.effectiveCost == null) return -1
        return a.effectiveCost - b.effectiveCost
      })
  }, [
    dataset,
    district,
    chargingSpeed,
    operator,
    query,
    energyNeeded,
    cards,
    activeCardId,
    sortBy,
    userLocation,
    radiusKm,
  ])

  // Reset pagination synchronously during render when filters change
  if (
    appliedFilters.district !== district ||
    appliedFilters.chargingSpeed !== chargingSpeed ||
    appliedFilters.operator !== operator ||
    appliedFilters.query !== query
  ) {
    setAppliedFilters({ district, chargingSpeed, operator, query })
    setVisibleCount(PAGE_SIZE)
  }

  const visibleStations = rankedStations.slice(0, visibleCount)

  const selectedSimStation = useMemo(() => {
    if (selectedSimStationId) {
      const found = rankedStations.find((s) => s.station.id === selectedSimStationId)
      if (found) return found
    }
    return rankedStations[0] || null
  }, [rankedStations, selectedSimStationId])

  const activeCardObj = useMemo(() => {
    if (activeCardId === 'auto' || activeCardId === 'none') return null
    return cards.find((c) => c.id === activeCardId) || null
  }, [cards, activeCardId])

  const formattedTariffDate = formatDatasetDate(dataset, lang)

  const sortLabelForSummary =
    sortBy === 'distance'
      ? t('sortDistanceAsc')
      : sortBy === 'savings'
        ? t('sortSavingsDesc')
        : sortBy === 'power'
          ? t('sortPowerDesc')
          : sortBy === 'duration'
            ? t('sortDurationAsc')
            : t('sortPriceAsc')

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="/" aria-label={`${t('brandName')}, home`}>
          <span className="brand-mark">C</span>
          {t('brandName')}
        </a>
        <div className="header-nav-actions">
          <button
            type="button"
            className="btn-header-lang"
            onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
            title={lang === 'pt' ? 'Switch interface to English' : 'Mudar interface para Português'}
          >
            <span>{lang === 'pt' ? '🇬🇧 English' : '🇵🇹 Português'}</span>
          </button>
          <button
            type="button"
            className="btn-header-secondary"
            onClick={() => setIsExplainerOpen(true)}
          >
            {t('headerExplainerBtn')}
          </button>
          <button
            type="button"
            className="btn-header-cards"
            onClick={() => setIsCardsModalOpen(true)}
          >
            {t('headerCardsBtn')} <span className="badge-count">{enabledCards.length}</span>
          </button>
          <a
            className="official-link"
            href="https://mobie.pt/pt/carregarveiculo/encontrar-posto"
            target="_blank"
            rel="noreferrer"
          >
            {t('headerOfficialLink')} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <section className="hero-section">
        <p className="eyebrow">{t('heroEyebrow')}</p>
        <h1>{t('heroTitle')}</h1>
        <p className="hero-copy">{t('heroCopy')}</p>
        <div className="hero-quick-badges">
          <button type="button" className="hero-pill" onClick={() => setIsCardsModalOpen(true)}>
            <span>💳</span>
            <span>{enabledCards.length} {t('heroActiveCardsBadge')}</span>
            <strong>{t('heroManageBadge')}</strong>
          </button>
          <button type="button" className="hero-pill info-pill" onClick={() => setIsExplainerOpen(true)}>
            <span>💡</span>
            <span>{t('heroGuideBadgeTitle')}</span>
            <strong>{t('heroGuideBadgeAction')}</strong>
          </button>
        </div>
      </section>

      <section className="planner" aria-labelledby="planner-title">
        <div className="planner-heading">
          <h2 id="planner-title">{t('plannerTitle')}</h2>
          <p>{t('plannerSubtitle')}</p>
        </div>
        <div className="planner-fields">
          <label className="vehicle-field">
            {t('vehicleFieldLabel')}
            <input
              type="text"
              list="vehicle-options"
              placeholder={t('vehicleFieldPlaceholder')}
              value={vehicleQuery}
              onChange={handleVehicleInput}
              autoComplete="off"
            />
            <datalist id="vehicle-options">
              {VEHICLES.map((vehicle) => (
                <option key={vehicle.label} value={vehicle.label} />
              ))}
            </datalist>
          </label>

          <label className="card-selector-field">
            {t('cardSelectLabel')}
            <div className="card-select-wrapper">
              <select
                value={activeCardId}
                onChange={(e) => setActiveCardId(e.target.value)}
                className="planner-card-select"
              >
                <option value="auto">
                  {t('cardSelectAuto', { count: enabledCards.length })}
                </option>
                {enabledCards.map((card) => {
                  const provider = CARD_PROVIDERS[card.provider] || CARD_PROVIDERS.CUSTOM
                  const displayName = getCardDisplayName(card, lang)
                  return (
                    <option key={card.id} value={card.id}>
                      {provider.icon} {displayName}
                      {card.monthlyFee > 0 ? ` (${formatEuro(card.monthlyFee)}/mês)` : ''}
                    </option>
                  )
                })}
                <option value="none">{t('cardSelectNone')}</option>
              </select>
              <button
                type="button"
                className="btn-manage-cards-inline"
                onClick={() => setIsCardsModalOpen(true)}
                title={t('cardsModalTitle')}
              >
                {t('cardSelectManageBtn')}
              </button>
            </div>
          </label>

          <label>
            {t('batteryCapacityLabel')}
            <span className="input-with-unit">
              <input
                type="number"
                min="1"
                max="200"
                value={capacity}
                onChange={(event) => setCapacity(Number(event.target.value))}
              />
              <span>kWh</span>
            </span>
          </label>
          <label>
            {t('currentChargeLabel')} <output>{charge}%</output>
            <input
              className="range"
              type="range"
              min="0"
              max="100"
              value={charge}
              onChange={(event) => setCharge(Number(event.target.value))}
            />
          </label>
          <label>
            {t('targetChargeLabel')} <output>{targetCharge}%</output>
            <input
              className="range"
              type="range"
              min={charge}
              max="100"
              value={targetCharge}
              onChange={(event) => setTargetCharge(Number(event.target.value))}
            />
          </label>
        </div>
        <aside className="energy-summary">
          <span>{t('energyNeededLabel')}</span>
          <strong>{energyNeeded.toFixed(1)} <small>kWh</small></strong>
          <span>{t('energyCapacityOf', { cap: capacity || 0 })}</span>
          {activeCardObj && (
            <div className="active-card-pill">
              <span>{t('selectedCardPillLabel')}</span>
              <strong>{getCardDisplayName(activeCardObj, lang)}</strong>
            </div>
          )}
          {activeCardId === 'auto' && (
            <div className="active-card-pill auto-pill">
              <span>{t('autoCardPillLabel')}</span>
              <strong>{t('autoCardPillValue')}</strong>
            </div>
          )}
        </aside>
      </section>

      <section className="station-section" aria-labelledby="stations-title">
        <div className="section-intro">
          <div>
            <p className="eyebrow">{t('stationsStep')}</p>
            <h2 id="stations-title">{t('stationsTitle')}</h2>
          </div>
          {status === 'ready' && (
            <p>
              {t('stationsFoundSummary', {
                count: rankedStations.length,
                sort: sortLabelForSummary,
              })}
            </p>
          )}
        </div>

        <div className="data-refresh">
          <div className="data-refresh-info">
            <span>
              {formattedTariffDate
                ? t('tariffDateLabel', { date: formattedTariffDate })
                : t('tariffDateUnknown')}
            </span>
            {refreshErrorMessage && (
              <span className="data-refresh-error">
                {t('refreshFailed', { error: refreshErrorMessage })}{' '}
                <button type="button" className="link-button" onClick={dismissRefreshError}>
                  {t('dismissBtn')}
                </button>
              </span>
            )}
          </div>
          <button
            type="button"
            className="location-button"
            onClick={handleRefresh}
            disabled={isRefreshing || status === 'loading'}
          >
            {isRefreshing ? t('refreshingBtn') : t('refreshBtn')}
          </button>
        </div>

        {isRefreshing && (
          <div className="refresh-progress" role="status" aria-live="polite">
            <p>
              {refreshProgress.phase === 'download' &&
                (refreshProgress.total
                  ? t('progressDownloadPercent', {
                      percent: Math.min(
                        100,
                        Math.round((refreshProgress.loaded / refreshProgress.total) * 100),
                      ),
                    })
                  : t('progressDownload'))}
              {refreshProgress.phase === 'parsing' && t('progressParsing')}
              {refreshProgress.phase === 'done' && t('progressDone')}
            </p>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width:
                    refreshProgress.phase === 'download' && refreshProgress.total
                      ? `${Math.min(100, (refreshProgress.loaded / refreshProgress.total) * 100)}%`
                      : refreshProgress.phase === 'parsing' || refreshProgress.phase === 'done'
                        ? '100%'
                        : '5%',
                }}
              />
            </div>
          </div>
        )}

        <div className="filters">
          <label className="search-field">
            <span className="sr-only">{t('searchPlaceholder')}</span>
            <input
              type="search"
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="select-field">
            <span className="sr-only">{t('allDistricts')}</span>
            <select value={district} onChange={(event) => setDistrict(event.target.value)}>
              <option value="">{t('allDistricts')}</option>
              {districts.map(([name, count]) => (
                <option key={name} value={name}>{name} ({count})</option>
              ))}
            </select>
          </label>
          <label className="select-field">
            <span className="sr-only">{t('anySpeed')}</span>
            <select value={chargingSpeed} onChange={(event) => setChargingSpeed(event.target.value)}>
              <option value="">{t('anySpeed')}</option>
              {CHARGING_SPEED_ORDER.map((speed) => (
                <option key={speed} value={speed}>{getChargingSpeedLabel(speed, lang)}</option>
              ))}
            </select>
          </label>
          <label className="select-field">
            <span className="sr-only">{t('allOperators')}</span>
            <select value={operator} onChange={(event) => setOperator(event.target.value)}>
              <option value="">{t('allOperators')}</option>
              {operators.map(([code, count]) => (
                <option key={code} value={code}>{operatorLabel(code)} · {count}</option>
              ))}
            </select>
          </label>
          <label className="select-field sort-field">
            <span className="sr-only">{t('sortOptionPrice')}</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {userLocation && <option value="distance">📍 {t('sortDistanceAsc')}</option>}
              <option value="price">{t('sortOptionPrice')}</option>
              <option value="savings">{t('sortOptionSavings')}</option>
              <option value="power">{t('sortOptionPower')}</option>
              <option value="duration">{t('sortOptionDuration')}</option>
            </select>
          </label>
        </div>

        {/* View Controls & Geolocation Proximity Bar */}
        <div className="view-controls-bar">
          <div className="view-mode-switch">
            <button
              type="button"
              className={`btn-view-mode ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              {t('viewModeList')}
            </button>
            <button
              type="button"
              className={`btn-view-mode ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
            >
              {t('viewModeMap')}
            </button>
          </div>

          <div className="geo-controls">
            <button
              type="button"
              className={`btn-geolocate ${userLocation ? 'active' : ''}`}
              onClick={handleGeolocate}
              disabled={isLocating}
              title="Obter coordenadas do GPS"
            >
              {isLocating ? t('geoLocatingBtn') : t('geoLocateBtn')}
            </button>

            {userLocation && (
              <>
                <select
                  className="geo-radius-select"
                  value={radiusKm == null ? '' : String(radiusKm)}
                  onChange={(e) => setRadiusKm(e.target.value === '' ? null : Number(e.target.value))}
                  title={t('geoRadiusLabel')}
                >
                  <option value="10">{t('geoRadiusOption10')}</option>
                  <option value="20">{t('geoRadiusOption20')}</option>
                  <option value="50">{t('geoRadiusOption50')}</option>
                  <option value="100">{t('geoRadiusOption100')}</option>
                  <option value="">{t('geoRadiusOptionAll')}</option>
                </select>

                <button
                  type="button"
                  className="btn-clear-geo"
                  onClick={handleClearGeolocation}
                  title="Desativar filtro de GPS"
                >
                  {t('geoClearBtn')}
                </button>
              </>
            )}

            {geoError && <span className="data-refresh-error">{geoError}</span>}
          </div>
        </div>

        {status === 'loading' && (
          <div className="empty-state">{t('loadingCatalog')}</div>
        )}

        {status === 'error' && (
          <div className="empty-state">
            {t('errorCatalog', { error: error?.message })}
            <a href="https://mobie.pt/pt/carregarveiculo/encontrar-posto" target="_blank" rel="noreferrer">
              {t('headerOfficialLink')}
            </a>.
          </div>
        )}

        {status === 'ready' && (
          <div className="stations-layout-wrapper">
            <div className="stations-main-column">
              {viewMode === 'map' ? (
                <StationsMap
                  stations={rankedStations}
                  userLocation={userLocation}
                  radiusKm={radiusKm}
                  selectedStationId={selectedSimStation?.station.id}
                  onSelectStation={(id) => {
                    setSelectedSimStationId(id)
                    if (id) {
                      setExpandedStationId(id)
                    }
                  }}
                  onViewDetails={(id) => {
                    setSelectedSimStationId(id)
                    setExpandedStationId(id)
                    const idx = rankedStations.findIndex((s) => s.station.id === id)
                    if (idx >= visibleCount) {
                      setVisibleCount(Math.max(visibleCount, idx + 10))
                    }
                    setTimeout(() => {
                      const el = document.getElementById(`station-card-${id}`)
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                    }, 50)
                  }}
                />
              ) : null}

              {/* Station Grid (shown in list mode or under map) */}
              <div className="station-grid">
                {visibleStations.map(
                  ({
                    station,
                    rawPricing,
                    power,
                    durationMinutes,
                    connectors,
                    distanceKm,
                    activeCardResult,
                    bestCardResult,
                    adHocEstimatedCost,
                    benchmarkCost,
                    effectiveCost,
                    savings,
                    opcTimeRate,
                    opcFlatFee,
                    opcEnergyRate,
                    opcTimeCost,
                  }) => {
                    const isExpanded = expandedStationId === station.id
                    const isSelectedForSim = selectedSimStation?.station.id === station.id
                    const usedCard = activeCardResult?.card || null
                    const provider = usedCard ? CARD_PROVIDERS[usedCard.provider] || CARD_PROVIDERS.CUSTOM : null
                    const cardDisplayName = usedCard ? getCardDisplayName(usedCard, lang) : ''
                    const walkUpEnergyRate = rawPricing?.energy?.valor ?? 0
                    const walkUpTimeRate = rawPricing?.time?.valor ?? 0
                    const walkUpFlatFee = rawPricing?.flat?.valor ?? 0
                    const walkUpHasCharge = walkUpEnergyRate > 0 || walkUpTimeRate > 0 || walkUpFlatFee > 0

                    const speedIcon =
                      station.tipoPosto === 'Ultrarrápido'
                        ? '⚡⚡'
                        : station.tipoPosto === 'Rápido'
                          ? '⚡'
                          : '🔌'

                    return (
                      <article
                        id={`station-card-${station.id}`}
                        className={`station-card ${isSelectedForSim ? 'is-selected-for-sim' : ''}`}
                        key={station.id}
                      >
                        <div className="station-topline">
                          <span>
                            {speedIcon} {getChargingSpeedLabel(station.tipoPosto, lang)}
                          </span>
                          <span>
                            {distanceKm != null ? `📍 ${distanceKm.toFixed(1)} km · ` : ''}
                            {power ? `${power} kW` : t('powerNotAvailable')}
                          </span>
                        </div>

                        <h3>{station.municipio}, {station.distrito ?? 'Distrito n/d'}</h3>
                        <p className="operator">{t('operatorLabelPrefix')} {operatorLabel(station.operador)}</p>
                        <p className="address">{station.morada || t('addressNotAvailable')}</p>

                        <div className="tags">
                          {connectors.map((connector) => <span key={connector}>{connector}</span>)}
                          {station.sockets.length > 1 && (
                            <span>{t('moreSockets', { count: station.sockets.length - 1 })}</span>
                          )}
                          {station.isTeslaSupercharger && (
                            <span className="tesla-tag">{t('requiresTeslaApp')}</span>
                          )}
                        </div>

                        <div className="card-applied-badge-row">
                          {usedCard ? (
                            <div
                              className="card-applied-tag"
                              style={{ background: provider?.bg, color: provider?.textColor }}
                            >
                              <span>{provider?.icon}</span>
                              <span>
                                {activeCardId === 'auto'
                                  ? t('bestCardTag', { name: cardDisplayName })
                                  : cardDisplayName}
                              </span>
                            </div>
                          ) : station.isTeslaSupercharger ? (
                            <div className="card-applied-tag tesla-direct-tag">
                              <span>⚡</span>
                              <span>{t('teslaDirectTag')}</span>
                            </div>
                          ) : (
                            <div className="card-applied-tag adhoc-tag">
                              <span>🏷️</span>
                              <span>{t('adhocTag')}</span>
                            </div>
                          )}
                          {savings > 0.05 && (
                            <div
                              className="savings-badge"
                              title={`Poupança em relação ao preço de referência (${formatEuro(benchmarkCost)})`}
                            >
                              {t('saveBadge', { val: formatEuro(savings) })}
                            </div>
                          )}
                        </div>

                        <div className="opc-rate-summary-row">
                          {station.isTeslaSupercharger ? (
                            <span className="opc-rate-pill tesla-fee" title="Rede Tesla Supercharger (sem taxa de tempo Mobi.E)">
                              {t('opcNoTimeFeeBadge')}
                            </span>
                          ) : opcTimeRate > 0 ? (
                            <span className="opc-rate-pill with-fee" title={`Cobrança por tempo do operador do posto: ${opcTimeRate.toFixed(3)} €/min`}>
                              {t('opcTimeRateBadge', { rate: opcTimeRate.toFixed(3) })}
                            </span>
                          ) : (
                            <span className="opc-rate-pill free" title="Este posto não cobra taxa por minuto de permanência">
                              {t('opcNoTimeFeeBadge')}
                            </span>
                          )}
                        </div>

                        <div className="estimate">
                          <div>
                            <span>{t('costEstimateLabel')}</span>
                            <strong className="cost-highlight">
                              {effectiveCost != null ? formatEuro(effectiveCost) : t('noTariff')}
                            </strong>
                            {benchmarkCost != null && usedCard && Math.abs(benchmarkCost - effectiveCost) > 0.05 && (
                              <small className="adhoc-strikethrough">
                                {t('stdRefCost', { val: formatEuro(benchmarkCost) })}
                              </small>
                            )}
                          </div>
                          <div>
                            <span>{t('timeEstimateLabel')}</span>
                            <strong>{durationMinutes != null ? `~${Math.ceil(durationMinutes)} min` : '—'}</strong>
                            {effectiveCost != null && energyNeeded > 0 && (
                              <small className="real-kwh-rate">
                                ~{(effectiveCost / energyNeeded).toFixed(3)} €/kWh
                              </small>
                            )}
                          </div>
                        </div>

                        <div className="station-card-actions">
                          <button
                            type="button"
                            className="btn-toggle-breakdown"
                            onClick={() => setExpandedStationId(isExpanded ? null : station.id)}
                          >
                            {isExpanded ? t('hideDetailsBtn') : t('showDetailsBtn')}
                          </button>
                        </div>

                        <div className="station-sim-action">
                          <button
                            type="button"
                            className={`btn-select-station-sim ${isSelectedForSim ? 'active' : ''}`}
                            onClick={() => setSelectedSimStationId(station.id)}
                          >
                            {isSelectedForSim ? t('selectedInSimBtn') : t('useInSimBtn')}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="breakdown-drawer">
                            <h5>{t('breakdownTitle')}</h5>

                            {/* 1. Tesla Superchargers */}
                            {station.isTeslaSupercharger ? (
                              <>
                                <div className="breakdown-item">
                                  <span>
                                    {t('breakdownEnergyTesla', {
                                      kwh: energyNeeded.toFixed(1),
                                      rate: (activeCardResult?.cost?.flatPerKwh ?? 0.39).toFixed(2),
                                    })}
                                  </span>
                                  <strong>{effectiveCost != null ? formatEuro(effectiveCost) : '—'}</strong>
                                </div>
                                <div className="breakdown-subitem">
                                  <span>{t('breakdownTimeOpcFree')}</span>
                                  <strong>0,00 €</strong>
                                </div>
                                <p className="mobi-note" style={{ color: '#a31115' }}>
                                  {t('teslaNetworkNotice')}
                                </p>
                              </>
                            ) : !activeCardResult && (!rawPricing || !walkUpHasCharge) ? (
                              <p className="mobi-note">{t('noTariff')}</p>
                            ) : !activeCardResult ? (
                              /* 2. Preço avulso sem cartão CEME */
                              <>
                                {walkUpEnergyRate > 0 ? (
                                  <div className="breakdown-item">
                                    <span>
                                      {t('breakdownEnergyStation', {
                                        kwh: energyNeeded.toFixed(1),
                                        rate: walkUpEnergyRate.toFixed(3),
                                      })}
                                    </span>
                                    <strong>{formatEuro(energyNeeded * walkUpEnergyRate)}</strong>
                                  </div>
                                ) : (
                                  <div className="breakdown-item">
                                    <span>{t('breakdownEnergyStation', {
                                      kwh: energyNeeded.toFixed(1),
                                      rate: '0.000',
                                    })}</span>
                                    <strong>0,00 €</strong>
                                  </div>
                                )}

                                {walkUpTimeRate > 0 && durationMinutes != null ? (
                                  <div className="breakdown-item">
                                    <span>
                                      {t('breakdownTimeOpc', {
                                        time: Math.ceil(durationMinutes),
                                        rate: walkUpTimeRate.toFixed(3),
                                      })}
                                    </span>
                                    <strong>{formatEuro(walkUpTimeRate * durationMinutes)}</strong>
                                  </div>
                                ) : (
                                  <div className="breakdown-subitem">
                                    <span>{t('breakdownTimeOpcFree')}</span>
                                    <strong>0,00 €</strong>
                                  </div>
                                )}

                                {walkUpFlatFee > 0 && (
                                  <div className="breakdown-subitem">
                                    <span>{t('breakdownActivationFee')}</span>
                                    <strong>{formatEuro(walkUpFlatFee)}</strong>
                                  </div>
                                )}

                                <p className="mobi-note">
                                  {t('publishedTariffLabel')} {rawPricing?.energy?.raw ?? 'n/d'}
                                  {rawPricing && ` · ${getPricingCategoryLabel(rawPricing.category, lang)}`}
                                </p>
                              </>
                            ) : activeCardResult?.cost?.minuteRate != null ? (
                              /* 3. BMW / MINI Active (Time-based model) */
                              <>
                                <div className="breakdown-item">
                                  <span>
                                    {t('breakdownBmwTimeModel', {
                                      name: cardDisplayName,
                                      time: Math.ceil(durationMinutes || 0),
                                      rate: activeCardResult.cost.minuteRate.toFixed(2),
                                    })}
                                  </span>
                                  <strong>{effectiveCost != null ? formatEuro(effectiveCost) : '—'}</strong>
                                </div>
                                <div className="breakdown-subitem">
                                  <span>{t('simEnergyConsumed', { kwh: energyNeeded.toFixed(1) })}</span>
                                  <strong>{t('includedInMinuteRate')}</strong>
                                </div>
                                <p className="mobi-note">
                                  {t('breakdownBmwTimeModelNote')}
                                </p>
                              </>
                            ) : activeCardResult?.cost?.isFlatOverride ? (
                              /* 4. Direct Operator Flat Rate (e.g. Atlante app, Continente store) */
                              <>
                                <div className="breakdown-item">
                                  <span>
                                    {t('breakdownDirectNetwork', {
                                      name: cardDisplayName,
                                      kwh: energyNeeded.toFixed(1),
                                      rate: activeCardResult.cost.flatPerKwh.toFixed(2),
                                    })}
                                  </span>
                                  <strong>{effectiveCost != null ? formatEuro(effectiveCost) : '—'}</strong>
                                </div>
                                <div className="breakdown-subitem">
                                  <span>{t('breakdownTimeOpcFree')}</span>
                                  <strong>0,00 €</strong>
                                </div>
                                <p className="mobi-note">
                                  {t('breakdownDirectNetworkNote')}
                                </p>
                              </>
                            ) : (
                              /* 5. Standard Mobi.E calculation: CEME Energy + OPC Energy (if any) + OPC Time + Activation - Discounts */
                              <>
                                {/* Parcela de Energia */}
                                {activeCardResult ? (
                                  <div className="breakdown-item">
                                    <span>
                                      {t('breakdownEnergyCeme', {
                                        name: cardDisplayName,
                                        kwh: energyNeeded.toFixed(1),
                                        rate: (activeCardResult.card.kwhPrice ?? 0.18).toFixed(3),
                                      })}
                                    </span>
                                    <strong>
                                      {formatEuro(
                                        activeCardResult.cost.cemeBreakdown?.cemeEnergy ??
                                          (activeCardResult.card.kwhPrice ?? 0.18) * energyNeeded,
                                      )}
                                    </strong>
                                  </div>
                                ) : (
                                  <div className="breakdown-item">
                                    <span>
                                      {t('breakdownEnergyStation', {
                                        kwh: energyNeeded.toFixed(1),
                                        rate: opcEnergyRate.toFixed(3),
                                      })}
                                    </span>
                                    <strong>{formatEuro(energyNeeded * opcEnergyRate)}</strong>
                                  </div>
                                )}

                                {/* Parcela de Energia do Posto se cobrada em separado pelo OPC */}
                                {activeCardResult && opcEnergyRate > 0 && (
                                  <div className="breakdown-subitem">
                                    <span>
                                      {t('breakdownEnergyStationExtra', {
                                        kwh: energyNeeded.toFixed(1),
                                        rate: opcEnergyRate.toFixed(3),
                                      })}
                                    </span>
                                    <strong>{formatEuro(energyNeeded * opcEnergyRate)}</strong>
                                  </div>
                                )}

                                {/* Parcela de Tempo / Ocupação OPC */}
                                {opcTimeRate > 0 && durationMinutes != null ? (
                                  <div className="breakdown-item">
                                    <span>
                                      {t('breakdownTimeOpc', {
                                        time: Math.ceil(durationMinutes),
                                        rate: opcTimeRate.toFixed(3),
                                      })}
                                    </span>
                                    <strong>{formatEuro(opcTimeCost)}</strong>
                                  </div>
                                ) : (
                                  <div className="breakdown-subitem">
                                    <span>{t('breakdownTimeOpcFree')}</span>
                                    <strong>0,00 €</strong>
                                  </div>
                                )}

                                {/* Taxas de Ativação / Desbloqueio */}
                                {(opcFlatFee > 0 || (activeCardResult?.card?.activationFee ?? 0) > 0) && (
                                  <div className="breakdown-subitem">
                                    <span>{t('breakdownActivationFee')}</span>
                                    <strong>
                                      {formatEuro(opcFlatFee + (activeCardResult?.card?.activationFee ?? 0))}
                                    </strong>
                                  </div>
                                )}

                                {/* Descontos do Cartão (se aplicável) */}
                                {activeCardResult?.cost?.discountAmount > 0 && (
                                  <div className="breakdown-item discount-text">
                                    <span>{t('breakdownCardDiscount', { name: cardDisplayName })}</span>
                                    <strong>-{formatEuro(activeCardResult.cost.discountAmount)}</strong>
                                  </div>
                                )}

                                <p className="mobi-note">
                                  {t('publishedTariffLabel')} {rawPricing?.energy?.raw ?? 'n/d'}
                                  {rawPricing && ` · ${getPricingCategoryLabel(rawPricing.category, lang)}`}
                                </p>
                              </>
                            )}

                            {/* Total Final */}
                            <div className="breakdown-item total-row">
                              <div>
                                <span>{t('totalExpectedLabel')}</span>
                                <small style={{ fontWeight: 'normal', color: '#688e84', marginLeft: '6px' }}>
                                  ({t('vatIncludedNotice')})
                                </small>
                              </div>
                              <strong>{effectiveCost != null ? formatEuro(effectiveCost) : '—'}</strong>
                            </div>

                            {/* Home Charging Context Tip */}
                            {(() => {
                              const homeTariff = loadHomeTariff()
                              const homeCalc = calculateHomeChargingCost(homeTariff, energyNeeded, 0, false)
                              if (homeCalc.totalCost > 0 && effectiveCost != null && effectiveCost > homeCalc.totalCost) {
                                return (
                                  <div className="home-card-tip">
                                    {t('simHomeCardTip', {
                                      val: formatEuro(homeCalc.totalCost),
                                      rate: homeCalc.appliedRatePerKwh.toFixed(3),
                                    })}
                                  </div>
                                )
                              }
                              return null
                            })()}

                            {bestCardResult && activeCardId !== 'auto' && bestCardResult.card.id !== usedCard?.id && (
                              <div className="alternative-card-tip">
                                {t('alternativeCardTip', {
                                  name: getCardDisplayName(bestCardResult.card, lang),
                                  cost: formatEuro(bestCardResult.cost.totalCost),
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </article>
                    )
                  },
                )}
              </div>

              {!visibleStations.length && (
                <div className="empty-state">
                  {t('noStationsFound')}
                </div>
              )}

              {visibleCount < rankedStations.length && (
                <button
                  className="location-button"
                  type="button"
                  style={{ marginTop: '24px' }}
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  {t('showMoreStations', { count: rankedStations.length - visibleCount })}
                </button>
              )}
            </div>

            <div className="stations-sidebar-column">
              <MonthlyCostSimulator
                selectedStation={selectedSimStation}
                capacity={capacity}
                onOpenCardsManager={() => setIsCardsModalOpen(true)}
                onOpenExplainer={() => setIsExplainerOpen(true)}
              />
            </div>
          </div>
        )}
      </section>

      {/* CEME Cards Management Modal */}
      {isCardsModalOpen && (
        <CardsManager
          cards={cards}
          onCardsChange={handleCardsChange}
          activeCardId={activeCardId}
          onSelectActiveCard={(id) => {
            setActiveCardId(id)
            setIsCardsModalOpen(false)
          }}
          onClose={() => setIsCardsModalOpen(false)}
          onOpenExplainer={() => setIsExplainerOpen(true)}
        />
      )}

      {/* CEME & Mobi.E Explainer Modal */}
      {isExplainerOpen && (
        <CemeExplainer
          onClose={() => setIsExplainerOpen(false)}
          onOpenCardsManager={() => setIsCardsModalOpen(true)}
        />
      )}

      <footer>
        <strong>{t('footerTitle')}</strong>
        <p>{t('footerBody')}</p>
      </footer>
    </main>
  )
}

export default App
