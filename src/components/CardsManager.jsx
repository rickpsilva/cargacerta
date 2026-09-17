import { useState } from 'react'
import { CARD_PRESETS, CARD_PROVIDERS, getCardDisplayName, getCardDisplayNotes } from '../lib/cards'
import { useI18n } from '../lib/i18n'

let nextIdCounter = 1

function generateCardId(prefix = 'card') {
  return `${prefix}-${Date.now()}-${nextIdCounter++}`
}

export function CardsManager({
  cards,
  onCardsChange,
  activeCardId,
  onSelectActiveCard,
  onClose,
  onOpenExplainer,
}) {
  const { t, lang, formatEuro } = useI18n()
  const [editingCardId, setEditingCardId] = useState(null)
  const [isCreatingCustom, setIsCreatingCustom] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Custom card form state
  const [customProvider, setCustomProvider] = useState('CUSTOM')
  const [customName, setCustomName] = useState('')
  const [customKwhPrice, setCustomKwhPrice] = useState('0.18')
  const [customActivationFee, setCustomActivationFee] = useState('0.00')
  const [customMinuteFee, setCustomMinuteFee] = useState('0.00')
  const [customMonthlyFee, setCustomMonthlyFee] = useState('0.00')
  const [customDiscount, setCustomDiscount] = useState('0')
  const [customNotes, setCustomNotes] = useState('')

  // Edit card form state
  const [editForm, setEditForm] = useState(null)

  const totalMonthlyFees = cards
    .filter((c) => c.enabled !== false)
    .reduce((sum, c) => sum + (c.monthlyFee || 0), 0)

  const handleToggleCard = (cardId) => {
    const updated = cards.map((c) => (c.id === cardId ? { ...c, enabled: !c.enabled } : c))
    onCardsChange(updated)
  }

  const handleDeleteCard = (cardId) => {
    const updated = cards.filter((c) => c.id !== cardId)
    onCardsChange(updated)
    if (activeCardId === cardId) {
      onSelectActiveCard('auto')
    }
  }

  const handleAddPreset = (preset) => {
    const existing = cards.find((c) => c.presetId === preset.presetId || c.name === preset.name)
    if (existing) {
      const updated = cards.map((c) => (c.id === existing.id ? { ...c, enabled: true } : c))
      onCardsChange(updated)
      return
    }

    const newCard = {
      ...preset,
      id: generateCardId('preset'),
      enabled: true,
    }
    onCardsChange([...cards, newCard])
  }

  const handleStartEdit = (card) => {
    setEditingCardId(card.id)
    setEditForm({
      name: card.name,
      kwhPrice: String(card.kwhPrice ?? 0.18),
      activationFee: String(card.activationFee ?? 0),
      minuteFee: String(card.minuteFee ?? 0),
      monthlyFee: String(card.monthlyFee ?? 0),
      discountPercent: String(card.discountPercent ?? 0),
      notes: card.notes || '',
    })
  }

  const handleSaveEdit = (cardId) => {
    if (!editForm) return
    const updated = cards.map((c) => {
      if (c.id !== cardId) return c
      return {
        ...c,
        name: editForm.name.trim() || c.name,
        kwhPrice: Math.max(0, Number.parseFloat(editForm.kwhPrice) || 0),
        activationFee: Math.max(0, Number.parseFloat(editForm.activationFee) || 0),
        minuteFee: Math.max(0, Number.parseFloat(editForm.minuteFee) || 0),
        monthlyFee: Math.max(0, Number.parseFloat(editForm.monthlyFee) || 0),
        discountPercent: Math.max(0, Number.parseFloat(editForm.discountPercent) || 0),
        notes: editForm.notes,
      }
    })
    onCardsChange(updated)
    setEditingCardId(null)
    setEditForm(null)
  }

  const handleCreateCustom = (e) => {
    e.preventDefault()
    const name = customName.trim() || CARD_PROVIDERS[customProvider]?.name || (lang === 'pt' ? 'Cartão CEME' : 'CEME Card')
    const newCard = {
      id: generateCardId('custom'),
      provider: customProvider,
      name,
      monthlyFee: Math.max(0, Number.parseFloat(customMonthlyFee) || 0),
      kwhPrice: Math.max(0, Number.parseFloat(customKwhPrice) || 0),
      activationFee: Math.max(0, Number.parseFloat(customActivationFee) || 0),
      minuteFee: Math.max(0, Number.parseFloat(customMinuteFee) || 0),
      discountPercent: Math.max(0, Number.parseFloat(customDiscount) || 0),
      pricingMode: 'standard',
      specialRates: {},
      notes: customNotes.trim() || (lang === 'pt' ? 'Cartão CEME personalizado' : 'Custom CEME card'),
      enabled: true,
    }

    onCardsChange([...cards, newCard])
    setIsCreatingCustom(false)
    setCustomName('')
    setCustomNotes('')
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="cards-modal-title">
      <div className="cards-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <span className="eyebrow">{t('cardsModalEyebrow')}</span>
            <h2 id="cards-modal-title">{t('cardsModalTitle')}</h2>
            <p className="modal-subtitle">
              {t('cardsModalSubtitle')}
            </p>
          </div>
          <button type="button" className="close-button" onClick={onClose} aria-label={t('dismissBtn')}>
            ✕
          </button>
        </header>

        <div className="cards-summary-bar">
          <div className="summary-stat">
            <span className="stat-label">{t('cardsActiveCountStat')}</span>
            <strong className="stat-value">{cards.filter((c) => c.enabled !== false).length} {lang === 'pt' ? 'de' : 'of'} {cards.length}</strong>
          </div>
          <div className="summary-stat">
            <span className="stat-label">{t('cardsTotalFeesStat')}</span>
            <strong className="stat-value">{formatEuro(totalMonthlyFees)}<small>{lang === 'pt' ? '/mês' : '/mo'}</small></strong>
          </div>
          <button
            type="button"
            className="explainer-link-btn"
            onClick={() => {
              onClose()
              onOpenExplainer()
            }}
          >
            {t('cardsHowItWorksBtn')}
          </button>
        </div>

        <div className="modal-scroll-content">
          <section className="cards-list-section">
            <div className="section-header-row">
              <h3>{t('cardsSavedTitle', { count: cards.length })}</h3>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsCreatingCustom(!isCreatingCustom)}
              >
                {isCreatingCustom ? t('cardsCancelBtn') : t('cardsNewCustomBtn')}
              </button>
            </div>

            {isCreatingCustom && (
              <form className="custom-card-form" onSubmit={handleCreateCustom}>
                <h4>{t('cardsAddCustomHeading')}</h4>
                <div className="form-grid">
                  <label>
                    {t('cardsFieldProvider')}
                    <select
                      value={customProvider}
                      onChange={(e) => setCustomProvider(e.target.value)}
                    >
                      {Object.values(CARD_PROVIDERS).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.icon} {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {t('cardsFieldName')}
                    <input
                      type="text"
                      placeholder="Ex: BMW Charging Active, Tesla App, Galp..."
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    {t('cardsFieldKwhPrice')}
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={customKwhPrice}
                      onChange={(e) => setCustomKwhPrice(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    {t('cardsFieldActivationFee')}
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={customActivationFee}
                      onChange={(e) => setCustomActivationFee(e.target.value)}
                    />
                  </label>
                  <label>
                    {t('cardsFieldMinuteFee')}
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={customMinuteFee}
                      onChange={(e) => setCustomMinuteFee(e.target.value)}
                    />
                  </label>
                  <label>
                    {t('cardsFieldMonthlyFee')}
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={customMonthlyFee}
                      onChange={(e) => setCustomMonthlyFee(e.target.value)}
                    />
                  </label>
                  <label>
                    {t('cardsFieldDiscount')}
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={customDiscount}
                      onChange={(e) => setCustomDiscount(e.target.value)}
                    />
                  </label>
                  <label className="span-full">
                    {t('cardsFieldNotes')}
                    <input
                      type="text"
                      placeholder="Ex: Loyalty cashback, Home electricity discount..."
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                    />
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {t('cardsSaveCardBtn')}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsCreatingCustom(false)}
                  >
                    {t('cardsCancelBtn')}
                  </button>
                </div>
              </form>
            )}

            {cards.length === 0 ? (
              <div className="empty-cards-notice">
                <p>{t('cardsEmptyNotice')}</p>
              </div>
            ) : (
              <div className="cards-grid">
                {cards.map((card) => {
                  const provider = CARD_PROVIDERS[card.provider] || CARD_PROVIDERS.CUSTOM
                  const isEditing = editingCardId === card.id
                  const isSelectedActive = activeCardId === card.id
                  const displayName = getCardDisplayName(card, lang)
                  const displayNotes = getCardDisplayNotes(card, lang)

                  return (
                    <article
                      key={card.id}
                      className={`user-card-item ${card.enabled === false ? 'disabled' : ''} ${isSelectedActive ? 'is-active-card' : ''}`}
                    >
                      <div className="card-topline">
                        <div className="provider-badge" style={{ background: provider.bg, color: provider.textColor }}>
                          <span>{provider.icon}</span>
                          <span>{provider.name}</span>
                        </div>
                        <div className="card-controls">
                          <label className="toggle-label" title={card.enabled !== false ? 'Desativar / Disable' : 'Ativar / Enable'}>
                            <input
                              type="checkbox"
                              checked={card.enabled !== false}
                              onChange={() => handleToggleCard(card.id)}
                            />
                            <span className="toggle-switch"></span>
                          </label>
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="card-edit-inline">
                          <label>
                            {t('cardsFieldName')}
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                          </label>
                          <div className="edit-inline-grid">
                            <label>
                              €/kWh
                              <input
                                type="number"
                                step="0.001"
                                min="0"
                                value={editForm.kwhPrice}
                                onChange={(e) => setEditForm({ ...editForm, kwhPrice: e.target.value })}
                              />
                            </label>
                            <label>
                              {lang === 'pt' ? 'Ativação (€)' : 'Activation (€)'}
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editForm.activationFee}
                                onChange={(e) => setEditForm({ ...editForm, activationFee: e.target.value })}
                              />
                            </label>
                            <label>
                              {lang === 'pt' ? 'Mensalidade (€)' : 'Monthly (€)'}
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editForm.monthlyFee}
                                onChange={(e) => setEditForm({ ...editForm, monthlyFee: e.target.value })}
                              />
                            </label>
                            <label>
                              {lang === 'pt' ? 'Desconto (%)' : 'Discount (%)'}
                              <input
                                type="number"
                                step="1"
                                min="0"
                                max="100"
                                value={editForm.discountPercent}
                                onChange={(e) => setEditForm({ ...editForm, discountPercent: e.target.value })}
                              />
                            </label>
                          </div>
                          <label>
                            {t('cardsFieldNotes')}
                            <input
                              type="text"
                              value={editForm.notes}
                              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            />
                          </label>
                          <div className="card-edit-actions">
                            <button type="button" className="btn-primary-sm" onClick={() => handleSaveEdit(card.id)}>
                              {t('cardsSaveInlineBtn')}
                            </button>
                            <button type="button" className="btn-secondary-sm" onClick={() => setEditingCardId(null)}>
                              {t('cardsCancelBtn')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 className="card-title">{displayName}</h4>
                          <div className="card-rates">
                            <div className="rate-pill">
                              <span className="rate-type">{t('cardsRateEnergy')}</span>
                              <strong>
                                {card.pricingMode === 'time_or_kwh'
                                  ? `${card.specialRates?.acMinuteRate ?? 0.05}€/min AC · ${card.specialRates?.dcMinuteRate ?? 0.31}€/min DC`
                                  : `${(card.kwhPrice ?? 0).toFixed(3)} €/kWh`}
                              </strong>
                            </div>
                            {card.specialRates?.ionityKwhRate != null && (
                              <div className="rate-pill">
                                <span className="rate-type">{t('cardsRateIonity')}</span>
                                <strong>{card.specialRates.ionityKwhRate.toFixed(2)} €/kWh</strong>
                              </div>
                            )}
                            {card.activationFee > 0 && (
                              <div className="rate-pill">
                                <span className="rate-type">{t('cardsRateActivation')}</span>
                                <strong>{formatEuro(card.activationFee)}{lang === 'pt' ? '/sessão' : '/session'}</strong>
                              </div>
                            )}
                            {card.monthlyFee > 0 && (
                              <div className="rate-pill highlight-fee">
                                <span className="rate-type">{t('cardsRateMonthly')}</span>
                                <strong>{formatEuro(card.monthlyFee)}{lang === 'pt' ? '/mês' : '/mo'}</strong>
                              </div>
                            )}
                            {card.discountPercent > 0 && (
                              <div className="rate-pill discount-pill">
                                <span className="rate-type">{t('cardsRateDiscount')}</span>
                                <strong>-{card.discountPercent}%</strong>
                              </div>
                            )}
                          </div>
                          {displayNotes && <p className="card-notes">{displayNotes}</p>}

                          <div className="card-footer-actions">
                            <button
                              type="button"
                              className={`btn-select-active ${isSelectedActive ? 'selected' : ''}`}
                              onClick={() => onSelectActiveCard(card.id)}
                            >
                              {isSelectedActive ? t('cardsIsActiveBadge') : t('cardsSetActiveBtn')}
                            </button>
                            <div className="inline-btns">
                              <button
                                type="button"
                                className="icon-btn"
                                onClick={() => handleStartEdit(card)}
                                title={t('cardsEditBtnTitle')}
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                className="icon-btn delete"
                                onClick={() => handleDeleteCard(card.id)}
                                title={t('cardsDeleteBtnTitle')}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          <section className="presets-section">
            <div className="section-header-row">
              <div>
                <h3>{t('cardsCatalogTitle')}</h3>
                <p className="section-sub">
                  {t('cardsCatalogSub')}
                </p>
              </div>
            </div>

            <div className="category-filter-chips">
              <button
                type="button"
                className={`chip-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                {t('cardsCatAll', { count: CARD_PRESETS.length })}
              </button>
              <button
                type="button"
                className={`chip-btn ${selectedCategory === 'auto' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('auto')}
              >
                {t('cardsCatAuto')}
              </button>
              <button
                type="button"
                className={`chip-btn ${selectedCategory === 'retail' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('retail')}
              >
                {t('cardsCatRetail')}
              </button>
              <button
                type="button"
                className={`chip-btn ${selectedCategory === 'energy' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('energy')}
              >
                {t('cardsCatEnergy')}
              </button>
              <button
                type="button"
                className={`chip-btn ${selectedCategory === 'apps' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('apps')}
              >
                {t('cardsCatApps')}
              </button>
            </div>

            <div className="presets-grid">
              {CARD_PRESETS.filter((preset) => {
                if (selectedCategory === 'all') return true
                const provider = CARD_PROVIDERS[preset.provider]
                return provider?.category === selectedCategory
              }).map((preset) => {
                const provider = CARD_PROVIDERS[preset.provider] || CARD_PROVIDERS.CUSTOM
                const isAdded = cards.some((c) => c.presetId === preset.presetId || c.name === preset.name)
                const presetName = getCardDisplayName(preset, lang)
                const presetNotes = getCardDisplayNotes(preset, lang)

                return (
                  <div key={preset.id} className="preset-card">
                    <div className="preset-header">
                      <span className="preset-badge" style={{ background: provider.bg, color: provider.textColor }}>
                        {provider.icon} {provider.name}
                      </span>
                      {preset.monthlyFee > 0 ? (
                        <span className="monthly-tag">{formatEuro(preset.monthlyFee)}{lang === 'pt' ? '/mês' : '/mo'}</span>
                      ) : (
                        <span className="monthly-tag-free">{t('cardsFreeMonthlyTag')}</span>
                      )}
                    </div>
                    <h4>{presetName}</h4>
                    <p className="preset-notes">{presetNotes}</p>
                    <button
                      type="button"
                      className={`btn-preset-add ${isAdded ? 'added' : ''}`}
                      onClick={() => handleAddPreset(preset)}
                    >
                      {isAdded ? t('cardsAddedPresetBtn') : t('cardsAddPresetBtn')}
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <footer className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            {t('cardsModalDoneBtn')}
          </button>
        </footer>
      </div>
    </div>
  )
}
