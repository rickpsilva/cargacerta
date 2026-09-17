import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { operatorLabel } from '../lib/operators'
import { getChargingSpeedLabel } from '../lib/pricing'
import { getCardDisplayName, CARD_PROVIDERS } from '../lib/cards'
import { useI18n } from '../lib/i18n'

// Fix standard Leaflet icon paths in bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function createCustomMarkerIcon(stationItem, isSelected) {
  const isTesla = stationItem.station?.isTeslaSupercharger
  const power = stationItem.power || 0
  const isHpc = power >= 150
  const isFast = power >= 50 && power < 150

  const color = isTesla ? '#e82127' : isHpc ? '#0e683b' : isFast ? '#0070ba' : '#477168'
  const symbol = isTesla ? '⚡' : isHpc ? '⚡⚡' : isFast ? '⚡' : '🔌'
  const size = isSelected ? 38 : 28

  const html = `
    <div style="
      background: ${color};
      color: white;
      border: ${isSelected ? '3.5px solid #e5ff6d' : '2px solid white'};
      box-shadow: ${isSelected ? '0 0 0 4px rgba(22, 75, 66, 0.4), 0 6px 14px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.3)'};
      border-radius: 50%;
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${isSelected ? '14px' : '10px'};
      font-weight: 800;
      cursor: pointer;
      transform: translate(-50%, -50%);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    ">
      ${symbol}
    </div>
  `

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

function createUserLocationIcon() {
  const html = `
    <div class="user-gps-pulse-marker" style="
      width: 22px;
      height: 22px;
      background: #0070ba;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 8px rgba(0, 112, 186, 0.25), 0 3px 8px rgba(0,0,0,0.4);
      transform: translate(-50%, -50%);
    "></div>
  `
  return L.divIcon({
    className: 'custom-user-marker',
    html,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

export function StationsMap({
  stations = [],
  userLocation,
  radiusKm,
  selectedStationId,
  onSelectStation,
  onViewDetails,
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersLayerRef = useRef(null)
  const userLayerRef = useRef(null)
  const markersMapRef = useRef(new Map())
  const prevSelectedIdRef = useRef(null)
  const lastFitSignatureRef = useRef('')
  const { lang, formatEuro, t } = useI18n()

  // 1. Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const initialCenter = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [39.5, -8.0]
    const initialZoom = userLocation ? 12 : 7

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      maxZoom: 18,
      minZoom: 5,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    mapInstanceRef.current = map
    markersLayerRef.current = L.layerGroup().addTo(map)
    userLayerRef.current = L.layerGroup().addTo(map)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // 2. Update user location & radius circle on map
  useEffect(() => {
    const map = mapInstanceRef.current
    const userLayer = userLayerRef.current
    if (!map || !userLayer) return

    userLayer.clearLayers()

    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserLocationIcon(),
        zIndexOffset: 1000,
      })
      userMarker.bindPopup(`<strong>📍 ${t('yourLocationTitle') || 'A sua localização'}</strong>`)
      userLayer.addLayer(userMarker)

      if (radiusKm) {
        const circle = L.circle([userLocation.lat, userLocation.lng], {
          radius: radiusKm * 1000,
          color: '#0070ba',
          fillColor: '#0070ba',
          fillOpacity: 0.08,
          weight: 2,
          dashArray: '5, 5',
        })
        userLayer.addLayer(circle)
      }
    }
  }, [userLocation, radiusKm, t])

  // 3. Populate station markers when stations or filters change
  useEffect(() => {
    const map = mapInstanceRef.current
    const markersLayer = markersLayerRef.current
    if (!map || !markersLayer) return

    markersLayer.clearLayers()
    markersMapRef.current.clear()

    const stationsWithCoords = stations
      .filter((s) => s.station?.lat != null && s.station?.lng != null)
      .slice(0, 400)

    const bounds = L.latLngBounds([])

    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng])
    }

    stationsWithCoords.forEach((item) => {
      const {
        station,
        power,
        durationMinutes,
        effectiveCost,
        benchmarkCost,
        savings,
        activeCardResult,
        distanceKm,
        connectors,
        opcTimeRate,
      } = item
      const isSelected = selectedStationId === station.id
      const marker = L.marker([station.lat, station.lng], {
        icon: createCustomMarkerIcon(item, isSelected),
        zIndexOffset: isSelected ? 500 : 10,
      })

      const usedCard = activeCardResult?.card || null
      const provider = usedCard ? CARD_PROVIDERS[usedCard.provider] || CARD_PROVIDERS.CUSTOM : null
      const cardDisplayName = usedCard ? getCardDisplayName(usedCard, lang) : ''
      const priceText = effectiveCost != null ? formatEuro(effectiveCost) : t('noTariff')
      const speedText = getChargingSpeedLabel(station.tipoPosto, lang)
      const distText = distanceKm != null ? `📍 ${distanceKm.toFixed(1)} km` : ''
      const durationText = durationMinutes != null ? `~${Math.ceil(durationMinutes)} min` : '—'

      // Complete rich merged popup
      const popupHtml = `
        <div class="leaflet-rich-station-popup">
          <div class="popup-topline">
            <span class="popup-speed-badge">${speedText}</span>
            <span class="popup-power-badge">${power ? `${power} kW` : t('powerNotAvailable')}</span>
            ${distText ? `<span class="popup-dist-badge">${distText}</span>` : ''}
          </div>

          <h4 class="popup-title">${station.municipio}, ${station.distrito ?? 'Distrito n/d'}</h4>
          <p class="popup-operator"><strong>${t('operatorLabelPrefix')}</strong> ${operatorLabel(station.operador)}</p>
          <p class="popup-address">${station.morada || t('addressNotAvailable')}</p>

          ${
            connectors?.length || station.isTeslaSupercharger
              ? `
            <div class="popup-tags">
              ${(connectors || []).map((c) => `<span class="popup-tag">${c}</span>`).join('')}
              ${station.isTeslaSupercharger ? `<span class="popup-tag tesla">${t('requiresTeslaApp')}</span>` : ''}
            </div>
          `
              : ''
          }

          <div class="popup-card-badge-row">
            ${
              usedCard
                ? `
              <div class="popup-card-tag" style="background: ${provider?.bg || '#164b42'}; color: ${provider?.textColor || '#ffffff'};">
                <span>${provider?.icon || '💳'}</span>
                <span>${cardDisplayName}</span>
              </div>
            `
                : station.isTeslaSupercharger
                  ? `
              <div class="popup-card-tag tesla-direct">
                <span>⚡</span>
                <span>${t('teslaDirectTag')}</span>
              </div>
            `
                  : `
              <div class="popup-card-tag adhoc">
                <span>🏷️</span>
                <span>${t('adhocTag')}</span>
              </div>
            `
            }
            ${
              savings > 0.05
                ? `
              <div class="popup-savings-badge">
                ${t('saveBadge', { val: formatEuro(savings) })}
              </div>
            `
                : ''
            }
          </div>

          ${
            !station.isTeslaSupercharger
              ? `
            <div class="popup-opc-timerate-row">
              ${
                opcTimeRate > 0
                  ? `<span class="popup-opc-timerate with-fee">${t('opcTimeRateBadge', { rate: opcTimeRate.toFixed(3) })}</span>`
                  : `<span class="popup-opc-timerate free">${t('opcNoTimeFeeBadge')}</span>`
              }
            </div>
          `
              : ''
          }

          <div class="popup-estimates-grid">
            <div class="popup-est-col">
              <span class="popup-est-label">${t('costEstimateLabel')}</span>
              <strong class="popup-est-value">${priceText}</strong>
              ${
                benchmarkCost != null && usedCard && Math.abs(benchmarkCost - effectiveCost) > 0.05
                  ? `<small class="popup-ref-cost">${t('stdRefCost', { val: formatEuro(benchmarkCost) })}</small>`
                  : ''
              }
            </div>
            <div class="popup-est-col border-left">
              <span class="popup-est-label">${t('timeEstimateLabel')}</span>
              <strong class="popup-est-value time">${durationText}</strong>
            </div>
          </div>

          <div class="popup-actions-row">
            <button
              type="button"
              class="popup-btn-select ${isSelected ? 'active' : ''}"
              id="popup-btn-select-${station.id}"
            >
              ${isSelected ? t('selectedInSimBtn') : t('useInSimBtn')}
            </button>
            <button
              type="button"
              class="popup-btn-details"
              id="popup-btn-details-${station.id}"
            >
              ${t('mapSelectedViewDetails')}
            </button>
          </div>
        </div>
      `

      marker.bindPopup(popupHtml, {
        maxWidth: 320,
        minWidth: 260,
        autoPan: true,
        autoPanPaddingTopLeft: L.point(30, 90),
        autoPanPaddingBottomRight: L.point(30, 40),
      })

      marker.on('popupopen', () => {
        const selectBtn = document.getElementById(`popup-btn-select-${station.id}`)
        if (selectBtn) {
          selectBtn.onclick = () => {
            if (onSelectStation) onSelectStation(station.id)
            selectBtn.classList.add('active')
            selectBtn.textContent = t('selectedInSimBtn')
          }
        }

        const detailsBtn = document.getElementById(`popup-btn-details-${station.id}`)
        if (detailsBtn) {
          detailsBtn.onclick = () => {
            if (onViewDetails) onViewDetails(station.id)
          }
        }
      })

      marker.on('click', () => {
        if (onSelectStation) onSelectStation(station.id)
      })

      markersLayer.addLayer(marker)
      markersMapRef.current.set(station.id, { marker, item })
      bounds.extend([station.lat, station.lng])
    })

    // Check if bounds/filter signature actually changed before resetting zoom/view
    const currentSignature = `${userLocation?.lat ?? ''}_${userLocation?.lng ?? ''}_${radiusKm ?? ''}_${stations.length}_${stations[0]?.station?.id ?? ''}`
    if (lastFitSignatureRef.current !== currentSignature) {
      lastFitSignatureRef.current = currentSignature

      if (userLocation && radiusKm) {
        map.setView([userLocation.lat, userLocation.lng], radiusKm <= 10 ? 12 : radiusKm <= 25 ? 11 : 10)
      } else if (stationsWithCoords.length > 0 && stationsWithCoords.length <= 50 && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
      }
    }
  }, [stations, userLocation, radiusKm, lang, formatEuro, onSelectStation, onViewDetails, t])

  // 4. Smoothly handle selection change without zooming out or resetting map bounds
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const prevId = prevSelectedIdRef.current
    if (prevId && prevId !== selectedStationId) {
      const prevEntry = markersMapRef.current.get(prevId)
      if (prevEntry) {
        prevEntry.marker.setIcon(createCustomMarkerIcon(prevEntry.item, false))
        prevEntry.marker.setZIndexOffset(10)
      }
    }

    if (selectedStationId) {
      const newEntry = markersMapRef.current.get(selectedStationId)
      if (newEntry) {
        newEntry.marker.setIcon(createCustomMarkerIcon(newEntry.item, true))
        newEntry.marker.setZIndexOffset(1000)
        newEntry.marker.openPopup()
      }
    }

    prevSelectedIdRef.current = selectedStationId
  }, [selectedStationId])

  return (
    <div className="stations-map-wrapper">
      <div ref={mapContainerRef} className="leaflet-map-root" />
    </div>
  )
}

