<template>
  <div class="locmap">
    <div ref="map" class="locmap__canvas" role="region" aria-label="Map of shared phone locations"></div>
    <div class="locmap__legend" aria-hidden="true">
      <span><i class="locmap__key locmap__key--member"></i>Member</span>
      <span><i class="locmap__key locmap__key--guest"></i>Not signed in</span>
      <span><i class="locmap__key locmap__key--stale"></i>Over a day old</span>
      <span><i class="locmap__key locmap__key--church"></i>Church</span>
    </div>
  </div>
</template>

<script>
/**
 * Last-known phone locations on an OpenStreetMap base.
 *
 * Leaflet touches `window`, so it is loaded in `mounted` — never during the
 * server render. Pins are redrawn whenever `locations` changes; the view is
 * fitted to them on the first draw and when `focus` changes, and otherwise
 * left where the person looking at it put it.
 */
const STALE_MINUTES = 24 * 60

export default {
  name: 'LocationMap',
  props: {
    locations: { type: Array, default: () => [] },
    church: { type: Object, default: null },
    /** deviceId to centre on and open. */
    focus: { type: String, default: '' }
  },
  data () {
    return { fitted: false }
  },
  watch: {
    locations () { this.draw() },
    church () { this.draw() },
    focus (id) { this.open(id) }
  },
  async mounted () {
    const L = await import('leaflet')
    this.L = L.default || L

    this.map = this.L.map(this.$refs.map, { zoomControl: true, scrollWheelZoom: true })
    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map)

    this.layer = this.L.layerGroup().addTo(this.map)
    this.markers = {}
    this.draw()
  },
  beforeDestroy () {
    if (this.map) { this.map.remove() }
  },
  methods: {
    draw () {
      if (!this.map) { return }
      const L = this.L
      this.layer.clearLayers()
      this.markers = {}
      const points = []

      if (this.church && (this.church.latitude || this.church.longitude)) {
        const at = [this.church.latitude, this.church.longitude]
        L.circle(at, {
          radius: this.church.radiusMeters || 150,
          color: '#b91c1c',
          weight: 2,
          fillOpacity: 0.08
        }).addTo(this.layer).bindTooltip('Church premises')
        points.push(at)
      }

      this.locations.forEach(row => {
        const at = [row.latitude, row.longitude]
        const stale = row.minutesAgo > STALE_MINUTES
        const color = row.isGuest ? '#6b7280' : '#1e3a8a'

        // The accuracy circle, so a pin that could be anywhere in a
        // kilometre does not look as certain as one good to ten metres.
        if (row.accuracyMeters && row.accuracyMeters > 30) {
          L.circle(at, {
            radius: row.accuracyMeters,
            color,
            weight: 1,
            opacity: 0.3,
            fillOpacity: 0.05,
            interactive: false
          }).addTo(this.layer)
        }

        const marker = L.circleMarker(at, {
          radius: 8,
          color: '#ffffff',
          weight: 2,
          fillColor: color,
          fillOpacity: stale ? 0.35 : 0.95
        }).addTo(this.layer).bindPopup(this.popup(row))

        this.markers[row.deviceId] = marker
        points.push(at)
      })

      if (!this.fitted && points.length) {
        this.fit(points)
        this.fitted = true
      }

      // A phone chosen before the pins existed (from the phones list, while
      // the map was still loading) is opened once they do.
      if (this.focus) { this.open(this.focus) }
    },
    fit (points) {
      if (points.length === 1) {
        this.map.setView(points[0], 15)
      } else {
        this.map.fitBounds(points, { padding: [32, 32], maxZoom: 16 })
      }
    },
    open (deviceId) {
      const marker = this.markers && this.markers[deviceId]
      if (!marker) { return }
      this.map.setView(marker.getLatLng(), Math.max(this.map.getZoom(), 16))
      marker.openPopup()
    },
    popup (row) {
      const esc = value => String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

      const who = row.isGuest ? 'Not signed in' : esc(row.name || 'A member')
      const phone = row.phoneNumber
        ? `<a href="tel:+${esc(row.phoneNumber)}">+${esc(row.phoneNumber)}</a><br>`
        : ''
      const device = [row.deviceModel || row.platform, row.manufacturer].filter(Boolean).map(esc).join(' · ')
      const battery = row.batteryPercent != null ? ` · battery ${esc(row.batteryPercent)}%` : ''
      const zone = { on_site: 'At church', nearby: 'Near church', away: 'Not at church' }[row.zone] || ''
      const directions = `https://www.google.com/maps/search/?api=1&query=${row.latitude},${row.longitude}`

      return `<div class="locmap__popup">
        <strong>${who}</strong><br>
        ${phone}
        <span>${device}${battery}</span><br>
        <span>Seen ${esc(this.ago(row.minutesAgo))}${row.accuracyMeters ? ` · ±${Math.round(row.accuracyMeters)} m` : ''}</span><br>
        <span>${zone ? `<strong>${zone}</strong> · ` : ''}${esc(this.distance(row.distanceFromChurchMeters))} from church</span><br>
        <a href="${directions}" target="_blank" rel="noopener">Open in Google Maps</a>
      </div>`
    },
    ago (minutes) {
      if (minutes < 1) { return 'just now' }
      if (minutes < 60) { return `${minutes} min ago` }
      if (minutes < 1440) { return `${Math.floor(minutes / 60)} h ago` }
      return `${Math.floor(minutes / 1440)} d ago`
    },
    distance (meters) {
      if (!meters && meters !== 0) { return '—' }
      return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`
    }
  }
}
</script>

<style src="leaflet/dist/leaflet.css"></style>

<style scoped>
.locmap { position: relative; }

.locmap__canvas {
  height: 480px;
  border-radius: var(--ds-radius-md);
  border: 1px solid var(--ds-border);
  z-index: 0;
}

.locmap__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin-top: 10px;
  font-size: var(--ds-text-xs);
  color: var(--ds-text-2);
}

.locmap__key {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 6px;
  border-radius: 50%;
  vertical-align: -1px;
}

.locmap__key--member { background: #1e3a8a; }
.locmap__key--guest { background: #6b7280; }
.locmap__key--stale { background: #1e3a8a; opacity: 0.35; }
.locmap__key--church { background: transparent; border: 2px solid #b91c1c; }

@media (max-width: 640px) {
  .locmap__canvas { height: 360px; }
}
</style>
