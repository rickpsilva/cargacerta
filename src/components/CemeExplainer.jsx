import { useI18n } from '../lib/i18n'

export function CemeExplainer({ onClose, onOpenCardsManager }) {
  const { t, lang } = useI18n()

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="explainer-title">
      <div className="explainer-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <span className="eyebrow">{t('explainerEyebrow')}</span>
            <h2 id="explainer-title">{t('explainerTitle')}</h2>
            <p className="modal-subtitle">
              {t('explainerSubtitle')}
            </p>
          </div>
          <button type="button" className="close-button" onClick={onClose} aria-label={t('dismissBtn')}>
            ✕
          </button>
        </header>

        <div className="modal-scroll-content">
          <div className="explainer-grid">
            <div className="explainer-card">
              <div className="explainer-icon">🏛️</div>
              <h3>{t('explainerSec1Title')}</h3>
              <p>{t('explainerSec1Body')}</p>
            </div>

            <div className="explainer-card">
              <div className="explainer-icon">🔌</div>
              <h3>{t('explainerSec2Title')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('explainerSec2Body')}</p>
            </div>

            <div className="explainer-card">
              <div className="explainer-icon">🧾</div>
              <h3>{t('explainerSec3Title')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('explainerSec3Body')}</p>
            </div>

            <div className="explainer-card">
              <div className="explainer-icon">💰</div>
              <h3>{t('explainerSec4Title')}</h3>
              <p>{t('explainerSec4Body')}</p>
            </div>

            <div className="explainer-card">
              <div className="explainer-icon">🚗</div>
              <h3>{t('explainerSec5Title')}</h3>
              <p>{t('explainerSec5Body')}</p>
            </div>

            <div className="explainer-card">
              <div className="explainer-icon">⚡</div>
              <h3>{t('explainerSec6Title')}</h3>
              <p>{t('explainerSec6Body')}</p>
            </div>
          </div>

          <div className="explainer-protip-box">
            <p>{t('explainerProTip')}</p>
          </div>
        </div>

        <footer className="modal-footer flex-between">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              onClose()
              if (onOpenCardsManager) onOpenCardsManager()
            }}
          >
            💳 {t('cardsModalTitle')}
          </button>
          <button type="button" className="btn-primary" onClick={onClose}>
            {lang === 'pt' ? 'Entendido, Ver Postos' : 'Understood, Back to Stations'}
          </button>
        </footer>
      </div>
    </div>
  )
}
