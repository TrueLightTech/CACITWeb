<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <span class="ds-eyebrow">People</span>
        <h1 class="ds-h1" style="margin-top:6px">Attendance</h1>
        <p v-if="view === 'members'">
          Members whose phone reported them on the church premises. Counted
          automatically by the mobile app — one entry per member per day.
        </p>
        <p v-else-if="view === 'devices'">
          Every phone with the app that came on or near the church premises,
          whether or not anybody was signed in — one entry per phone per day.
        </p>
        <p v-else>
          Where each phone last was, for finding people in an emergency. Only
          phones whose owners turned on location sharing in the app appear here.
        </p>
      </div>
    </div>

    <div v-if="summaryLoaded && !isConfigured" class="ds-alert ds-alert--warning" style="margin-bottom:20px">
      <div class="ds-alert__body">
        <strong>The church location has not been set.</strong>
        Nothing is counted until <code>AttendanceConfig</code> on the API has the church's
        latitude and longitude.
      </div>
    </div>

    <div v-if="isManager" class="ds-tabs">
      <button class="ds-tab" :class="{ 'is-active': view === 'members' }" type="button" @click="switchView('members')">
        Members
      </button>
      <button class="ds-tab" :class="{ 'is-active': view === 'devices' }" type="button" @click="switchView('devices')">
        All phones
      </button>
      <button class="ds-tab" :class="{ 'is-active': view === 'map' }" type="button" @click="switchView('map')">
        Emergency map
      </button>
    </div>

    <section v-if="view === 'map'" class="ds-section" aria-label="Emergency map">
      <div class="ds-alert ds-alert--info" style="margin-bottom:16px">
        <div class="ds-alert__body">
          Opening this map is recorded in the audit log with your name.
          Locations are kept for {{ mapData.retentionDays || 7 }} days after a phone last reports, and are
          deleted at once when its owner turns sharing off.
        </div>
      </div>

      <div v-if="mapLoaded && !mapData.enabled" class="ds-alert ds-alert--warning" style="margin-bottom:16px">
        <div class="ds-alert__body">Location sharing is switched off on the server.</div>
      </div>

      <div class="ds-toolbar">
        <div class="ds-field" style="margin-bottom:0">
          <label class="ds-label" for="mapWithin">Last seen</label>
          <select id="mapWithin" v-model="mapWithin" class="ds-select" @change="loadMap">
            <option value="1">In the last hour</option>
            <option value="6">In the last 6 hours</option>
            <option value="24">In the last 24 hours</option>
            <option value="">Any time</option>
          </select>
        </div>
        <div class="ds-field" style="margin-bottom:0">
          <label class="ds-label" for="mapWho">Who</label>
          <select id="mapWho" v-model="mapWho" class="ds-select" @change="loadMap">
            <option value="">Everyone</option>
            <option value="member">Signed-in members</option>
            <option value="guest">Not signed in</option>
          </select>
        </div>
        <div class="ds-field" style="margin-bottom:0;min-width:220px">
          <label class="ds-label" for="mapSearch">Search</label>
          <input id="mapSearch" v-model="mapSearch" class="ds-input" type="search" placeholder="Name, phone number or model" @input="onMapSearch">
        </div>
        <div class="ds-field" style="margin-bottom:0;align-self:flex-end">
          <button class="ds-btn ds-btn--secondary" type="button" :disabled="mapLoading" @click="loadMap">Refresh</button>
        </div>
      </div>

      <p v-if="mapError" class="ds-error">{{ mapError }}</p>

      <div ref="mapCard" class="ds-card" style="margin-top:16px">
        <div class="ds-card__body">
          <client-only>
            <LocationMap
              :locations="mapData.locations"
              :church="mapChurch"
              :focus="mapFocus"
            />
            <span slot="placeholder" class="ds-skeleton" style="height:480px;width:100%;display:block"></span>
          </client-only>
        </div>
      </div>

      <div class="ds-section__head" style="margin-top:24px">
        <h2 class="ds-h2">{{ mapData.locations.length }} {{ mapData.locations.length === 1 ? 'phone' : 'phones' }}</h2>
        <span class="ds-meta">Most recent first — choose one to find it on the map</span>
      </div>

      <div v-if="mapLoading" style="display:grid;gap:8px">
        <span v-for="n in 3" :key="n" class="ds-skeleton" style="height:48px;width:100%"></span>
      </div>

      <div v-else-if="!mapData.locations.length" class="ds-card">
        <div class="ds-empty">
          <h3 class="ds-h3">No shared locations</h3>
          <p>No phone has shared its location{{ mapWithin ? ' in this time' : '' }}. Phones appear once their owners turn on location sharing in the app.</p>
        </div>
      </div>

      <div v-else class="ds-tablewrap">
        <table class="ds-table">
          <thead>
            <tr>
              <th>Person</th>
              <th>Phone</th>
              <th>Last seen</th>
              <th>From church</th>
              <th>Battery</th>
              <th class="ds-col-action"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in mapData.locations" :key="row.deviceId">
              <td data-label="Person">
                <template v-if="!row.isGuest">
                  <NuxtLink class="ds-table__primary" :to="`/admin/members/${row.userId}/view`">{{ row.name || 'A member' }}</NuxtLink>
                  <span v-if="row.phoneNumber" class="ds-meta" style="display:block">
                    <a :href="`tel:+${row.phoneNumber}`">+{{ row.phoneNumber }}</a>
                  </span>
                </template>
                <span v-else class="ds-badge ds-badge--neutral">Not signed in</span>
              </td>
              <td data-label="Phone">
                <span class="att__phone">{{ phoneName(row) }}</span>
                <span class="ds-meta">{{ phoneDetail(row) }}</span>
              </td>
              <td data-label="Last seen">{{ ago(row.minutesAgo) }}</td>
              <td data-label="From church">{{ km(row.distanceFromChurchMeters) }}</td>
              <td data-label="Battery">{{ row.batteryPercent != null ? row.batteryPercent + '%' : '—' }}</td>
              <td class="ds-col-action">
                <button class="ds-btn ds-btn--secondary ds-btn--sm" type="button" @click="showOnMap(row)">Show on map</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="view !== 'map'" class="ds-section" aria-label="Last 14 days">
      <div class="ds-section__head">
        <h2 class="ds-h2">Last 14 days</h2>
        <span class="ds-meta">
          {{ view === 'members' ? 'Members present' : 'Phones on the premises' }} — choose a day
        </span>
      </div>
      <div class="ds-card">
        <div class="ds-card__body">
          <span v-if="!summaryLoaded" class="ds-skeleton" style="height:120px;width:100%;display:block"></span>
          <AttendanceTrend
            v-else
            :series="trend"
            :selected="date"
            :field="view === 'members' ? 'count' : 'devicesOnSite'"
            :unit="view === 'members' ? 'present' : 'phones on site'"
            clickable
            :label="view === 'members' ? 'Members present per day, last 14 days' : 'Phones on the premises per day, last 14 days'"
            @select="pickDate"
          />
        </div>
      </div>
    </section>

    <section v-if="view !== 'map'" class="ds-section" aria-label="Register">
      <div class="ds-section__head">
        <div>
          <h2 class="ds-h2">{{ dateLabel }}</h2>
          <span v-if="!loading" class="ds-meta">
            <template v-if="view === 'members'">{{ totalCount }} present</template>
            <template v-else>{{ totalCount }} {{ totalCount === 1 ? 'phone' : 'phones' }}</template>
          </span>
        </div>
      </div>

      <div v-if="view === 'devices' && date === today && devices" class="ds-metrics" style="margin-bottom:16px">
        <div class="ds-metric">
          <span class="ds-metric__label"><span class="ds-eyebrow">On the premises</span></span>
          <strong class="ds-metric__value">{{ devices.onSite }}</strong>
          <span class="ds-metric__foot">Phones with the app, today</span>
        </div>
        <div class="ds-metric">
          <span class="ds-metric__label"><span class="ds-eyebrow">Not signed in</span></span>
          <strong class="ds-metric__value">{{ devices.guestsOnSite }}</strong>
          <span class="ds-metric__foot">Of those on the premises — visitors, or members signed out</span>
        </div>
        <div class="ds-metric">
          <span class="ds-metric__label"><span class="ds-eyebrow">Nearby only</span></span>
          <strong class="ds-metric__value">{{ devices.nearby }}</strong>
          <span class="ds-metric__foot">Within {{ nearbyLabel }} but never on the premises</span>
        </div>
      </div>

      <div class="ds-toolbar">
        <div class="ds-field" style="margin-bottom:0">
          <label class="ds-label" for="attDate">Day</label>
          <input id="attDate" v-model="date" class="ds-input" type="date" :max="today" @change="load(1)">
        </div>

        <template v-if="view === 'members'">
          <div v-if="isManager" class="ds-field" style="margin-bottom:0;min-width:200px">
            <label class="ds-label" for="attFamily">Church family</label>
            <select id="attFamily" v-model="familyId" class="ds-select" @change="load(1)">
              <option value="">All families</option>
              <option v-for="family in families" :key="family.id" :value="family.id">{{ family.name }}</option>
            </select>
          </div>
        </template>

        <template v-else>
          <div class="ds-field" style="margin-bottom:0">
            <label class="ds-label" for="attZone">Where</label>
            <select id="attZone" v-model="zone" class="ds-select" @change="load(1)">
              <option value="">On site and nearby</option>
              <option value="on_site">On the premises</option>
              <option value="nearby">Nearby only</option>
            </select>
          </div>
          <div class="ds-field" style="margin-bottom:0">
            <label class="ds-label" for="attWho">Who</label>
            <select id="attWho" v-model="who" class="ds-select" @change="load(1)">
              <option value="">Everyone</option>
              <option value="guest">Not signed in</option>
              <option value="member">Signed-in members</option>
            </select>
          </div>
          <div class="ds-field" style="margin-bottom:0">
            <label class="ds-label" for="attPlatform">Phone</label>
            <select id="attPlatform" v-model="platformFilter" class="ds-select" @change="load(1)">
              <option value="">iPhone and Android</option>
              <option value="ios">iPhone</option>
              <option value="android">Android</option>
            </select>
          </div>
        </template>

        <div class="ds-field" style="margin-bottom:0;min-width:220px">
          <label class="ds-label" for="attSearch">Search</label>
          <input
            id="attSearch"
            v-model="search"
            class="ds-input"
            type="search"
            :placeholder="view === 'members' ? 'Member name' : 'Name, model or make'"
            @input="onSearch"
          >
        </div>
      </div>

      <div v-if="loading" style="display:grid;gap:8px;margin-top:16px">
        <span v-for="n in 4" :key="n" class="ds-skeleton" style="height:48px;width:100%"></span>
      </div>

      <p v-else-if="error" class="ds-error">{{ error }}</p>

      <div v-else-if="!rows.length" class="ds-card" style="margin-top:16px">
        <div class="ds-empty">
          <h3 class="ds-h3">Nobody recorded</h3>
          <p v-if="view === 'members'">
            No member's phone reported them at church on this day{{ search ? ' matching that name' : '' }}.
          </p>
          <p v-else>No phone with the app was at or near the church on this day{{ filtered ? ' matching these filters' : '' }}.</p>
        </div>
      </div>

      <div v-else-if="view === 'members'" class="ds-tablewrap" style="margin-top:16px">
        <table class="ds-table">
          <thead>
            <tr>
              <th class="ds-col-num">#</th>
              <th>Name</th>
              <th>Church family</th>
              <th>Arrived</th>
              <th>Last seen</th>
              <th>Time on site</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in rows" :key="row.userId">
              <td data-label="#" class="ds-col-num">{{ (page - 1) * pageSize + index + 1 }}</td>
              <td data-label="Name">
                <NuxtLink class="ds-table__primary" :to="`/admin/members/${row.userId}/view`">{{ row.name }}</NuxtLink>
              </td>
              <td data-label="Church family">{{ row.familyName || '—' }}</td>
              <td data-label="Arrived">{{ time(row.firstSeenAt) }}</td>
              <td data-label="Last seen">{{ time(row.lastSeenAt) }}</td>
              <td data-label="Time on site">{{ duration(row.minutesOnSite) }}</td>
              <td data-label="Phone">{{ platform(row.platform) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="ds-tablewrap" style="margin-top:16px">
        <table class="ds-table">
          <thead>
            <tr>
              <th class="ds-col-num">#</th>
              <th>Phone</th>
              <th>Signed in as</th>
              <th>Where</th>
              <th>Arrived</th>
              <th>Last seen</th>
              <th>Time on site</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in rows" :key="row.deviceId">
              <td data-label="#" class="ds-col-num">{{ (page - 1) * pageSize + index + 1 }}</td>
              <td data-label="Phone">
                <span class="att__phone">{{ phoneName(row) }}</span>
                <span class="ds-meta">{{ phoneDetail(row) }}</span>
              </td>
              <td data-label="Signed in as">
                <NuxtLink v-if="row.userId" class="ds-table__primary" :to="`/admin/members/${row.userId}/view`">
                  {{ row.name || 'A member' }}
                </NuxtLink>
                <span v-else class="ds-badge ds-badge--neutral">Not signed in</span>
              </td>
              <td data-label="Where">
                <span v-if="row.zone === 'on_site'" class="ds-status ds-status--success">
                  <span class="ds-status__dot"></span>On site
                </span>
                <span v-else class="ds-status ds-status--neutral">
                  <span class="ds-status__dot"></span>Nearby · {{ row.closestDistanceMeters }} m
                </span>
              </td>
              <td data-label="Arrived">{{ row.arrivedAt ? time(row.arrivedAt) : '—' }}</td>
              <td data-label="Last seen">{{ time(row.lastSeenAt) }}</td>
              <td data-label="Time on site">{{ row.arrivedAt ? duration(row.minutesOnSite) : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!loading && totalPages > 1" class="ds-pagination">
        <span class="ds-pagination__summary">Page <b>{{ page }}</b> of <b>{{ totalPages }}</b></span>
        <div class="ds-pagination__controls">
          <button class="ds-page" type="button" :disabled="page <= 1" @click="load(page - 1)">Previous</button>
          <button class="ds-page" type="button" :disabled="page >= totalPages" @click="load(page + 1)">Next</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AttendanceTrend from '../../components/AttendanceTrend'
import LocationMap from '../../components/LocationMap'
import { payload, errorMessage } from '../../network/MobileApp'
import { ROLE_CHURCH_MANAGER } from '../../resources/navigation'

/**
 * Who came to church, from the app's location check-ins.
 *
 * Two views. Members is the register, limited to a family manager's own
 * family by the API. All phones counts every install of the app that came
 * on or near the premises, signed in or not — church manager only, since a
 * visitor's phone belongs to no family.
 *
 * Emergency map shows where phones whose owners chose to share their
 * location last were. It is its own tab, loaded only when opened, because
 * every load is written to the audit log against whoever opened it.
 */
export default {
  name: 'AttendancePage',
  components: { AttendanceTrend, LocationMap },
  data () {
    const today = this.$moment().format('YYYY-MM-DD')
    return {
      today,
      view: ['devices', 'map'].indexOf(this.$route.query.view) !== -1 ? this.$route.query.view : 'members',
      date: this.$route.query.date || today,
      familyId: '',
      zone: '',
      who: '',
      platformFilter: '',
      search: '',
      families: [],
      rows: [],
      trend: [],
      devices: null,
      nearbyMeters: 500,
      isConfigured: true,
      summaryLoaded: false,
      totalCount: 0,
      totalPages: 0,
      page: 1,
      pageSize: 50,
      loading: true,
      error: '',
      searchTimer: null,
      mapData: { enabled: true, retentionDays: 7, locations: [] },
      mapLoaded: false,
      mapLoading: false,
      mapError: '',
      mapWithin: '24',
      mapWho: '',
      mapSearch: '',
      mapFocus: '',
      mapTimer: null
    }
  },
  computed: {
    ...mapGetters(['loggedInUser']),
    isManager () {
      const user = this.loggedInUser && this.loggedInUser.data ? this.loggedInUser.data : {}
      return user.roleId === ROLE_CHURCH_MANAGER
    },
    dateLabel () {
      return this.date === this.today
        ? 'Today'
        : this.$moment(this.date, 'YYYY-MM-DD').format('dddd, D MMMM YYYY')
    },
    filtered () {
      return !!(this.zone || this.who || this.platformFilter || this.search)
    },
    mapChurch () {
      return this.mapData.churchLatitude || this.mapData.churchLongitude
        ? {
            latitude: this.mapData.churchLatitude,
            longitude: this.mapData.churchLongitude,
            radiusMeters: this.mapData.churchRadiusMeters
          }
        : null
    },
    nearbyLabel () {
      return this.nearbyMeters >= 1000 ? `${this.nearbyMeters / 1000} km` : `${this.nearbyMeters} m`
    }
  },
  beforeMount () {
    if (!this.isManager) { this.view = 'members' }
    this.loadSummary()
    this.loadSite()
    if (this.view === 'map') { this.loadMap() } else { this.load(1) }
    if (this.isManager) { this.loadFamilies() }
  },
  beforeDestroy () {
    clearTimeout(this.searchTimer)
    clearTimeout(this.mapTimer)
  },
  methods: {
    time (value) {
      return value ? this.$moment(value).format('h:mm a') : '—'
    },
    duration (minutes) {
      if (!minutes) { return 'Brief' }
      if (minutes < 60) { return `${minutes} min` }
      const hours = Math.floor(minutes / 60)
      const rest = minutes % 60
      return rest ? `${hours} h ${rest} min` : `${hours} h`
    },
    platform (value) {
      return { ios: 'iPhone', android: 'Android' }[value] || '—'
    },
    phoneName (row) {
      if (row.deviceModel) { return row.deviceModel }
      return row.platform === 'ios' ? 'iPhone' : row.platform === 'android' ? 'Android phone' : 'Unknown phone'
    },
    phoneDetail (row) {
      const os = row.platform === 'ios' ? 'iOS' : row.platform === 'android' ? 'Android' : ''
      const make = row.manufacturer && !(row.deviceModel || '').toLowerCase().startsWith(row.manufacturer.toLowerCase())
        ? row.manufacturer
        : ''
      return [make, [os, row.osVersion].filter(Boolean).join(' ')].filter(Boolean).join(' · ') || '—'
    },
    switchView (view) {
      if (view === this.view) { return }
      this.view = view
      this.search = ''
      this.$router.replace({ query: Object.assign({}, this.$route.query, { view }) })
      if (view === 'map') { this.loadMap() } else { this.load(1) }
    },
    ago (minutes) {
      if (minutes < 1) { return 'Just now' }
      if (minutes < 60) { return `${minutes} min ago` }
      if (minutes < 1440) { return `${Math.floor(minutes / 60)} h ago` }
      return `${Math.floor(minutes / 1440)} d ago`
    },
    km (meters) {
      if (meters == null) { return '—' }
      return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`
    },
    showOnMap (row) {
      // Cleared first so choosing the same phone twice still re-centres.
      this.mapFocus = ''
      this.$nextTick(() => {
        this.mapFocus = row.deviceId
        if (this.$refs.mapCard) { this.$refs.mapCard.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
      })
    },
    onMapSearch () {
      clearTimeout(this.mapTimer)
      this.mapTimer = setTimeout(() => this.loadMap(), 400)
    },
    loadMap () {
      this.mapLoading = true
      this.mapError = ''

      this.$axios.get('admin/locations', {
        params: {
          WithinHours: this.mapWithin || undefined,
          Who: this.mapWho || undefined,
          Search: this.mapSearch || undefined
        }
      }).then(response => {
        const data = payload(response) || {}
        this.mapData = Object.assign({ enabled: true, retentionDays: 7, locations: [] }, data)
        this.mapLoaded = true
        this.mapLoading = false
      }).catch(error => {
        this.mapLoading = false
        this.mapError = errorMessage(error, 'Could not load locations.')
      })
    },
    pickDate (key) {
      this.date = key
      this.load(1)
    },
    onSearch () {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => this.load(1), 300)
    },
    loadSummary () {
      this.$axios.get('admin/attendance/summary', { params: { days: 14 } }).then(response => {
        const data = payload(response) || {}
        this.trend = data.days || []
        this.devices = data.devices || null
        this.isConfigured = data.isConfigured !== false
        this.summaryLoaded = true
      }).catch(() => {
        this.summaryLoaded = true
      })
    },
    loadSite () {
      this.$axios.get('attendance/site').then(response => {
        const data = payload(response) || {}
        if (data.nearbyRadiusMeters) { this.nearbyMeters = data.nearbyRadiusMeters }
      }).catch(() => {})
    },
    loadFamilies () {
      this.$axios.get('churchfamilies').then(response => {
        this.families = (response.data && response.data.data) || []
      }).catch(() => { this.families = [] })
    },
    load (page) {
      this.page = page
      this.loading = true
      this.error = ''

      const devices = this.view === 'devices'
      const params = devices
        ? {
            Date: this.date || undefined,
            Zone: this.zone || undefined,
            Who: this.who || undefined,
            Platform: this.platformFilter || undefined,
            Search: this.search || undefined,
            Page: page,
            PageSize: this.pageSize
          }
        : {
            Date: this.date || undefined,
            FamilyId: this.familyId || undefined,
            Search: this.search || undefined,
            Page: page,
            PageSize: this.pageSize
          }

      this.$axios.get(devices ? 'admin/attendance/devices' : 'admin/attendance', { params }).then(response => {
        // A response for the other view, if the tab changed mid-request.
        if ((this.view === 'devices') !== devices) { return }
        const data = payload(response) || {}
        this.rows = data.results || []
        this.totalCount = data.totalCount || 0
        this.totalPages = data.totalPages || 0
        this.loading = false
      }).catch(error => {
        if ((this.view === 'devices') !== devices) { return }
        this.loading = false
        this.error = errorMessage(error, 'Could not load attendance.')
      })
    }
  }
}
</script>

<style scoped>
.att__phone { display: block; font-weight: var(--ds-weight-medium); color: var(--ds-text); }
</style>
