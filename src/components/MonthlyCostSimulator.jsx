import { useState } from 'react'
import { CARD_PROVIDERS, getCardDisplayName } from '../lib/cards'
import { operatorLabel } from '../lib/operators'
import { DEFAULT_FUEL_PRICES, loadFuelPrices, saveFuelPrices } from '../lib/fuel'
import {
  DEFAULT_HOME_TARIFF,
  HOME_TARIFF_PRESETS,
  loadHomeTariff,
  saveHomeTariff,
  calculateHomeChargingCost,
} from '../lib/homeTariff'
import { useI18n } from '../lib/i18n'

export function MonthlyCostSimulator({
  selectedStation,
  capacity,
  onOpenCardsManager,
  onOpenExplainer,
}) {
  const { t, lang, formatEuro } = useI18n()

  // Simulator inputs state
  const [weeklyKm, setWeeklyKm] = useState(100)
  const [consumptionKwh100, setConsumptionKwh100] = useState(16.5) // Standard EV ~16.5 kWh / 100km
  const [idleMinutesPerSession, setIdleMinutesPerSession] = useState(0) // Extra parking/idle minutes

  // Fuel prices state (DGEG reference or customized)
  const [fuelPrices, setFuelPrices] = useState(() => loadFuelPrices())
  const [showFuelConfig, setShowFuelConfig] = useState(false)

  // Home Electricity Tariff state (Galp, EDP, etc.)
  const [homeTariff, setHomeTariff] = useState(() => loadHomeTariff())
  const [showHomeConfig, setShowHomeConfig] = useState(false)

  const handleFuelPriceChange = (key, value) => {
    const updated = { ...fuelPrices, [key]: Number(value) }
    setFuelPrices(updated)
    saveFuelPrices(updated)
  }

  const handleHomeTariffChange = (key, value) => {
    const updated = { ...homeTariff, [key]: value }
    setHomeTariff(updated)
    saveHomeTariff(updated)
  }

  const handleSelectHomePreset = (presetId) => {
    const found = HOME_TARIFF_PRESETS.find((p) => p.id === presetId)
    if (found) {
      setHomeTariff(found)
      saveHomeTariff(found)
    }
  }

  // Calculations
  const monthlyKm = (weeklyKm * 52) / 12 // Average km per month
  const monthlyEnergyKwh = (monthlyKm * consumptionKwh100) / 100

  // Standard charge session size (e.g. 20% to 80% = 60% battery capacity)
  const sessionCapacityKwh = Math.max(10, (capacity || 64) * 0.6)
  const sessionsPerMonth = Math.max(1, monthlyEnergyKwh / sessionCapacityKwh)

  // Sockets and power for chosen station (or generic average if no station selected)
  const station = selectedStation?.station
  const headlineSocket = selectedStation?.headlineSocket
  const stationPower = selectedStation?.power || (station?.tipoPosto === 'Rápido' ? 50 : station?.tipoPosto === 'Ultrarrápido' ? 150 : 11)

  // Active or best card
  const activeCardResult = selectedStation?.activeCardResult
  const usedCard = activeCardResult?.card || null
  const provider = usedCard ? CARD_PROVIDERS[usedCard.provider] || CARD_PROVIDERS.CUSTOM : null
  const cardDisplayName = usedCard ? getCardDisplayName(usedCard, lang) : ''

  // Card monthly fee
  const cardMonthlySubscription = usedCard?.monthlyFee || 0

  // Cost per session at selected station
  // If station has activeCardResult, we use the effective unit cost (€/kWh) calculated for the session
  const effectiveCostPerSession = selectedStation?.effectiveCost != null
    ? selectedStation.effectiveCost
    : null

  // Total energy cost at station
  const monthlyEnergyCost = effectiveCostPerSession != null
    ? (effectiveCostPerSession / Math.max(1, selectedStation.energyNeeded || sessionCapacityKwh)) * monthlyEnergyKwh
    : null

  // Idle / OPC Time Surcharge cost (when car stays plugged after charging)
  // Check if station socket has TIME tariff
  const opcTarifas = headlineSocket?.tarifas || []
  const timeTarifa = opcTarifas.find((t) => t.tipo === 'TIME' && t.valor != null)?.valor ?? 0
  const monthlyIdleCost = idleMinutesPerSession > 0 ? timeTarifa * idleMinutesPerSession * sessionsPerMonth : 0

  // Grand Total Monthly Cost (Street / Public Charging)
  const totalMonthlyCost = monthlyEnergyCost != null
    ? monthlyEnergyCost + cardMonthlySubscription + monthlyIdleCost
    : null

  const costPerKm = totalMonthlyCost != null && monthlyKm > 0 ? totalMonthlyCost / monthlyKm : null
  const costPer100Km = costPerKm != null ? costPerKm * 100 : null

  // Home Charging Cost Calculation (Incremental EV consumption at home or Full with Fixed Terms)
  const homeChargingMonthly = calculateHomeChargingCost(homeTariff, monthlyEnergyKwh, 30.4)
  const homeMonthlyCost = homeChargingMonthly.totalCost
  const homeCostPer100Km = monthlyKm > 0 ? (homeMonthlyCost / monthlyKm) * 100 : null
  const monthlySavingsHomeVsStreet = totalMonthlyCost != null ? totalMonthlyCost - homeMonthlyCost : null

  // Combustion comparisons
  // 1. Gasolina 95
  const gasolineMonthlyCost = (monthlyKm * fuelPrices.consumptionGasolineL100 * fuelPrices.gasoline95) / 100
  const monthlySavingsVsGasoline = totalMonthlyCost != null ? gasolineMonthlyCost - totalMonthlyCost : null

  // 2. Gasóleo Simples (Diesel)
  const dieselMonthlyCost = (monthlyKm * fuelPrices.consumptionDieselL100 * fuelPrices.diesel) / 100
  const monthlySavingsVsDiesel = totalMonthlyCost != null ? dieselMonthlyCost - totalMonthlyCost : null

  return (
    <aside className="monthly-simulator-card" aria-labelledby="simulator-heading">
      <div className="simulator-header">
        <div className="simulator-title-row">
          <span className="simulator-icon">📊</span>
          <div>
            <h3 id="simulator-heading">{t('simHeading')}</h3>
            <p className="simulator-subtitle">{t('simSubtitle')}</p>
          </div>
        </div>
      </div>

      <div className="simulator-body">
        {/* User Usage Profile Inputs */}
        <div className="simulator-inputs-group">
          <label className="sim-field">
            <div className="sim-label-row">
              <span>{t('simKmPerWeek')}</span>
              <strong>{weeklyKm} km/sem <small>({t('simKmPerMonth', { km: Math.round(monthlyKm) })})</small></strong>
            </div>
            <input
              type="range"
              min="30"
              max="1000"
              step="10"
              value={weeklyKm}
              onChange={(e) => setWeeklyKm(Number(e.target.value))}
            />
          </label>

          <div className="sim-grid-fields">
            <label className="sim-subfield">
              <span>{t('simAvgConsumption')}</span>
              <div className="input-unit-wrap">
                <input
                  type="number"
                  step="0.5"
                  min="10"
                  max="35"
                  value={consumptionKwh100}
                  onChange={(e) => setConsumptionKwh100(Number(e.target.value))}
                />
                <span className="unit-label">kWh/100km</span>
              </div>
            </label>

            <label className="sim-subfield">
              <span>{t('simExtraTimeOpc')}</span>
              <div className="input-unit-wrap">
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="120"
                  value={idleMinutesPerSession}
                  onChange={(e) => setIdleMinutesPerSession(Number(e.target.value))}
                />
                <span className="unit-label">min</span>
              </div>
            </label>
          </div>
        </div>

        {/* Selected Station Context */}
        <div className="sim-station-context">
          <div className="sim-station-top">
            <span className="sim-badge-label">{t('simRefStationLabel')}</span>
            {selectedStation ? (
              <span className="sim-station-name">
                {station?.municipio} ({operatorLabel(station?.operador)}) · {stationPower} kW
              </span>
            ) : (
              <span className="sim-station-name auto-selected">
                {t('simRefStationAuto')}
              </span>
            )}
          </div>

          <div className="sim-card-used">
            <span>{station?.isTeslaSupercharger ? t('simMethodLabel') : t('simCardLabel')}</span>
            {usedCard ? (
              <strong style={{ color: provider?.textColor }}>
                {provider?.icon} {cardDisplayName}
              </strong>
            ) : station?.isTeslaSupercharger ? (
              <strong style={{ color: '#a31115' }}>⚡ {t('teslaDirectTag')}</strong>
            ) : (
              <strong>{t('adhocTag')}</strong>
            )}
          </div>
        </div>

        {/* Monthly Cost Breakdown */}
        <div className="monthly-totals-box">
          <div className="grand-total-row">
            <div>
              <span className="total-label">{t('simEstimatedTotal')}</span>
              <span className="total-sub">{t('simTotalSubtext')}</span>
            </div>
            <strong className="grand-total-value">
              {totalMonthlyCost != null ? formatEuro(totalMonthlyCost) : '—'}
              <small>/mês</small>
            </strong>
          </div>

          <div className="sim-breakdown-list">
            <div className="sim-breakdown-row">
              <span>{t('simEnergyConsumed', { kwh: monthlyEnergyKwh.toFixed(0) })}</span>
              <strong>{monthlyEnergyCost != null ? formatEuro(monthlyEnergyCost) : '—'}</strong>
            </div>

            {cardMonthlySubscription > 0 && (
              <div className="sim-breakdown-row">
                <span>{t('simCardSubscription', { name: cardDisplayName })}</span>
                <strong>{formatEuro(cardMonthlySubscription)}/mês</strong>
              </div>
            )}

            {monthlyIdleCost > 0 && (
              <div className="sim-breakdown-row warning-row">
                <span>{t('simIdlePenalty')}</span>
                <strong>+{formatEuro(monthlyIdleCost)}</strong>
              </div>
            )}

            <div className="sim-breakdown-row highlight-subrow">
              <span>{t('simCostPer100Km')}</span>
              <strong>{costPer100Km != null ? `${formatEuro(costPer100Km)} / 100km` : '—'}</strong>
            </div>
          </div>
        </div>

        {/* Home Charging Comparison Card */}
        <div className="home-comparison-card">
          <div className="comp-card-header">
            <div className="comp-card-title">
              <span>🏠</span>
              <div>
                <strong>{t('simHomeCompTitle')}</strong>
                <span className="comp-card-sub">{t('simHomeSubtitle')}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn-toggle-fuel-config"
              onClick={() => setShowHomeConfig(!showHomeConfig)}
              title={t('simHomeConfigBtn')}
            >
              {showHomeConfig ? t('simCloseConfigBtn') : t('simHomeConfigBtn')}
            </button>
          </div>

          {showHomeConfig && (
            <div className="fuel-config-drawer home-config-drawer">
              {/* Presets selector */}
              <div className="home-presets-selector">
                <span className="field-label-sm">{t('simHomePresetLabel')}</span>
                <div className="home-preset-chips">
                  {HOME_TARIFF_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`chip-btn ${homeTariff.id === p.id ? 'active' : ''}`}
                      onClick={() => handleSelectHomePreset(p.id)}
                    >
                      {p.provider === 'Galp'
                        ? t('simHomePresetGalp')
                        : p.provider === 'EDP'
                          ? t('simHomePresetEdp')
                          : p.provider === 'Goldenergy'
                            ? t('simHomePresetGold')
                            : t('simHomePresetCustom')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="home-config-grid">
                <div className="home-config-row-2col">
                  <label className="fuel-field">
                    <span>{t('simHomeCycleLabel')}</span>
                    <select
                      value={homeTariff.cycle || 'simple'}
                      onChange={(e) => handleHomeTariffChange('cycle', e.target.value)}
                    >
                      <option value="simple">{t('simHomeCycleSimple')}</option>
                      <option value="bi-hourly">{t('simHomeCycleBiHourly')}</option>
                      <option value="tri-hourly">{t('simHomeCycleTriHourly')}</option>
                    </select>
                  </label>

                  {homeTariff.cycle === 'tri-hourly' ? (
                    <label className="fuel-field">
                      <span>{t('simHomeTriHourlySlotLabel')}</span>
                      <select
                        value={homeTariff.triHourlySlot || 'vazio'}
                        onChange={(e) => handleHomeTariffChange('triHourlySlot', e.target.value)}
                      >
                        <option value="vazio">{t('simHomeSlotVazio')}</option>
                        <option value="cheias">{t('simHomeSlotCheias')}</option>
                        <option value="ponta">{t('simHomeSlotPonta')}</option>
                      </select>
                    </label>
                  ) : homeTariff.cycle === 'bi-hourly' ? (
                    <label className="fuel-field">
                      <span>{t('simHomeEnergyRateVazioLabel')}</span>
                      <input
                        type="number"
                        step="0.001"
                        min="0.01"
                        max="0.50"
                        value={homeTariff.energyRateVazio ?? 0.102}
                        onChange={(e) => handleHomeTariffChange('energyRateVazio', Number(e.target.value))}
                      />
                    </label>
                  ) : (
                    <label className="fuel-field">
                      <span>{t('simHomeEnergyRateLabel')}</span>
                      <input
                        type="number"
                        step="0.001"
                        min="0.01"
                        max="0.50"
                        value={homeTariff.energyRateSimple ?? 0.1467}
                        onChange={(e) => handleHomeTariffChange('energyRateSimple', Number(e.target.value))}
                      />
                    </label>
                  )}
                </div>

                {homeTariff.cycle === 'tri-hourly' && (
                  <div className="tri-hourly-rates-box">
                    <span className="field-label-sm">{t('simHomeRatesTriSection')}</span>
                    <div className="tri-hourly-rates-3col">
                      <label className="fuel-field mini-field">
                        <span>🌙 {t('simHomeRateVazioShort')}</span>
                        <input
                          type="number"
                          step="0.001"
                          min="0.01"
                          max="0.50"
                          value={homeTariff.energyRateVazio ?? 0.102}
                          onChange={(e) => handleHomeTariffChange('energyRateVazio', Number(e.target.value))}
                        />
                      </label>

                      <label className="fuel-field mini-field">
                        <span>☀️ {t('simHomeRateCheiasShort')}</span>
                        <input
                          type="number"
                          step="0.001"
                          min="0.01"
                          max="0.50"
                          value={homeTariff.energyRateCheias ?? 0.158}
                          onChange={(e) => handleHomeTariffChange('energyRateCheias', Number(e.target.value))}
                        />
                      </label>

                      <label className="fuel-field mini-field">
                        <span>⚡ {t('simHomeRatePontaShort')}</span>
                        <input
                          type="number"
                          step="0.001"
                          min="0.01"
                          max="0.50"
                          value={homeTariff.energyRatePonta ?? 0.225}
                          onChange={(e) => handleHomeTariffChange('energyRatePonta', Number(e.target.value))}
                        />
                      </label>
                    </div>
                  </div>
                )}

                <div className="home-config-row-2col">
                  <label className="fuel-field">
                    <span>{t('simHomeFixedDailyLabel')}</span>
                    <input
                      type="number"
                      step="0.005"
                      min="0"
                      max="2.0"
                      value={homeTariff.fixedTermDaily ?? 0.4274}
                      onChange={(e) => handleHomeTariffChange('fixedTermDaily', Number(e.target.value))}
                    />
                  </label>

                  <label className="fuel-field">
                    <span>{t('simHomeDiscountLabel')}</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="50"
                      value={homeTariff.monthlyDiscount ?? 4.17}
                      onChange={(e) => handleHomeTariffChange('monthlyDiscount', Number(e.target.value))}
                    />
                  </label>
                </div>
              </div>

              <div className="home-config-checkboxes">
                <label className="tax-checkbox-row">
                  <input
                    type="checkbox"
                    checked={!!homeTariff.applyFixedTerm}
                    onChange={(e) => handleHomeTariffChange('applyFixedTerm', e.target.checked)}
                  />
                  <span>{t('simHomeApplyFixedTermLabel')}</span>
                </label>

                <label className="tax-checkbox-row">
                  <input
                    type="checkbox"
                    checked={!!homeTariff.applyDiscount}
                    onChange={(e) => handleHomeTariffChange('applyDiscount', e.target.checked)}
                  />
                  <span>{t('simHomeApplyDiscountLabel')}</span>
                </label>

                <label className="tax-checkbox-row">
                  <input
                    type="checkbox"
                    checked={homeTariff.applyTaxes !== false}
                    onChange={(e) => handleHomeTariffChange('applyTaxes', e.target.checked)}
                  />
                  <span>{t('simHomeApplyTaxesLabel')}</span>
                </label>
              </div>

              <button
                type="button"
                className="btn-reset-fuel"
                onClick={() => {
                  setHomeTariff(DEFAULT_HOME_TARIFF)
                  saveHomeTariff(DEFAULT_HOME_TARIFF)
                }}
              >
                {t('simResetHomeBtn')}
              </button>
            </div>
          )}

          <div className="fuel-comparison-rows">
            <div className="fuel-row-pill home-row-pill">
              <div className="fuel-meta">
                <span className="fuel-name">
                  {t('simHomeVsStreet', { name: homeTariff.name || homeTariff.provider })}
                </span>
                <span className="fuel-sub">
                  {formatEuro(homeMonthlyCost)}/mês (
                  {t('simHomeCostDetail', {
                    rate: homeChargingMonthly.appliedRatePerKwh.toFixed(3),
                    cost100: homeCostPer100Km != null ? homeCostPer100Km.toFixed(2) : '—',
                  })}
                  )
                </span>
              </div>
              <div className="fuel-saving">
                {monthlySavingsHomeVsStreet != null && monthlySavingsHomeVsStreet > 0 ? (
                  <span className="text-green">
                    {t('simHomeSavesVsStreet', { val: formatEuro(monthlySavingsHomeVsStreet) })}
                  </span>
                ) : (
                  <span className="text-muted">
                    {formatEuro(homeMonthlyCost)}/mês
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gasoline & Diesel Comparison & Savings */}
        <div className="combustion-comparison-card">
          <div className="comp-card-header">
            <div className="comp-card-title">
              <span>⛽</span>
              <strong>{t('simCombustionCompTitle')}</strong>
            </div>
            <button
              type="button"
              className="btn-toggle-fuel-config"
              onClick={() => setShowFuelConfig(!showFuelConfig)}
              title={t('simAdjustPricesBtn')}
            >
              {showFuelConfig ? t('simCloseConfigBtn') : t('simAdjustPricesBtn')}
            </button>
          </div>

          {showFuelConfig && (
            <div className="fuel-config-drawer">
              <p className="fuel-config-help">
                {t('simFuelConfigHelp')}
              </p>
              <div className="fuel-config-grid">
                <label className="fuel-field">
                  <span>{t('simGasoline95Field')}</span>
                  <input
                    type="number"
                    step="0.005"
                    min="1.0"
                    max="3.0"
                    value={fuelPrices.gasoline95}
                    onChange={(e) => handleFuelPriceChange('gasoline95', e.target.value)}
                  />
                </label>
                <label className="fuel-field">
                  <span>{t('simGasolineConsumptionField')}</span>
                  <input
                    type="number"
                    step="0.1"
                    min="3.0"
                    max="15.0"
                    value={fuelPrices.consumptionGasolineL100}
                    onChange={(e) => handleFuelPriceChange('consumptionGasolineL100', e.target.value)}
                  />
                </label>
                <label className="fuel-field">
                  <span>{t('simDieselField')}</span>
                  <input
                    type="number"
                    step="0.005"
                    min="1.0"
                    max="3.0"
                    value={fuelPrices.diesel}
                    onChange={(e) => handleFuelPriceChange('diesel', e.target.value)}
                  />
                </label>
                <label className="fuel-field">
                  <span>{t('simDieselConsumptionField')}</span>
                  <input
                    type="number"
                    step="0.1"
                    min="3.0"
                    max="15.0"
                    value={fuelPrices.consumptionDieselL100}
                    onChange={(e) => handleFuelPriceChange('consumptionDieselL100', e.target.value)}
                  />
                </label>
              </div>
              <button
                type="button"
                className="btn-reset-fuel"
                onClick={() => {
                  setFuelPrices(DEFAULT_FUEL_PRICES)
                  saveFuelPrices(DEFAULT_FUEL_PRICES)
                }}
              >
                {t('simResetFuelBtn')}
              </button>
            </div>
          )}

          <div className="fuel-comparison-rows">
            {/* Vs Gasolina */}
            {monthlySavingsVsGasoline != null && (
              <div className="fuel-row-pill">
                <div className="fuel-meta">
                  <span className="fuel-name">
                    {t('simVsGasoline', {
                      price: fuelPrices.gasoline95.toFixed(3),
                      cons: fuelPrices.consumptionGasolineL100,
                    })}
                  </span>
                  <span className="fuel-sub">
                    {formatEuro(gasolineMonthlyCost)}/mês (~{((gasolineMonthlyCost / (monthlyKm || 1)) * 100).toFixed(2)}€/100km)
                  </span>
                </div>
                <div className="fuel-saving">
                  {monthlySavingsVsGasoline > 0 ? (
                    <span className="text-green">{t('simSavesMonthly', { val: formatEuro(monthlySavingsVsGasoline) })}</span>
                  ) : (
                    <span className="text-red">{t('simCostsMoreMonthly', { val: formatEuro(Math.abs(monthlySavingsVsGasoline)) })}</span>
                  )}
                </div>
              </div>
            )}

            {/* Vs Gasóleo */}
            {monthlySavingsVsDiesel != null && (
              <div className="fuel-row-pill">
                <div className="fuel-meta">
                  <span className="fuel-name">
                    {t('simVsDiesel', {
                      price: fuelPrices.diesel.toFixed(3),
                      cons: fuelPrices.consumptionDieselL100,
                    })}
                  </span>
                  <span className="fuel-sub">
                    {formatEuro(dieselMonthlyCost)}/mês (~{((dieselMonthlyCost / (monthlyKm || 1)) * 100).toFixed(2)}€/100km)
                  </span>
                </div>
                <div className="fuel-saving">
                  {monthlySavingsVsDiesel > 0 ? (
                    <span className="text-green">{t('simSavesMonthly', { val: formatEuro(monthlySavingsVsDiesel) })}</span>
                  ) : (
                    <span className="text-red">{t('simCostsMoreMonthly', { val: formatEuro(Math.abs(monthlySavingsVsDiesel)) })}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pro Tips and Links */}
        <div className="sim-actions-footer">
          <button
            type="button"
            className="sim-action-btn"
            onClick={onOpenCardsManager}
          >
            {t('simManageCardsBtn')}
          </button>
          <button
            type="button"
            className="sim-action-btn subtle"
            onClick={onOpenExplainer}
          >
            {t('simUnderstandOpcBtn')}
          </button>
        </div>
      </div>
    </aside>
  )
}
