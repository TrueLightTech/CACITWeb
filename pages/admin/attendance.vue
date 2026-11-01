<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <span class="ds-eyebrow">People</span>
        <h1 class="ds-h1" style="margin-top:6px">Attendance</h1>
        <p>
          Members whose phone reported them on the church premises. Counted
          automatically by the mobile app — one entry per member per day.
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

    <section class="ds-section" aria-label="Last 14 days">
      <div class="ds-section__head">
        <h2 class="ds-h2">Last 14 days</h2>
        <span class="ds-meta">Choose a day to see who came</span>
      </div>
      <div class="ds-card">
        <div class="ds-card__body">
          <span v-if="!summaryLoaded" class="ds-skeleton" style="height:120px;width:100%;display:block"></span>
          <AttendanceTrend
            v-else
            :series="trend"
            :selected="date"
            clickable
            label="Members present per day, last 14 days"
            @select="pickDate"
          />
        </div>
      </div>
    </section>

    <section class="ds-section" aria-label="Register">
      <div class="ds-section__head">
        <div>
          <h2 class="ds-h2">{{ dateLabel }}</h2>
          <span v-if="!loading" class="ds-meta">{{ totalCount }} present</span>
        </div>
      </div>

      <div class="ds-toolbar">
        <div class="ds-field" style="margin-bottom:0">
          <label class="ds-label" for="attDate">Day</label>
          <input id="attDate" v-model="date" class="ds-input" type="date" :max="today" @change="load(1)">
        </div>

        <div v-if="isManager" class="ds-field" style="margin-bottom:0;min-width:200px">
          <label class="ds-label" for="attFamily">Church family</label>
          <select id="attFamily" v-model="familyId" class="ds-select" @change="load(1)">
            <option value="">All families</option>
            <option v-for="family in families" :key="family.id" :value="family.id">{{ family.name }}</option>
          </select>
        </div>

        <div class="ds-field" style="margin-bottom:0;min-width:220px">
          <label class="ds-label" for="attSearch">Search</label>
          <input id="attSearch" v-model="search" class="ds-input" type="search" placeholder="Member name" @input="onSearch">
        </div>
      </div>

      <div v-if="loading" style="display:grid;gap:8px;margin-top:16px">
        <span v-for="n in 4" :key="n" class="ds-skeleton" style="height:48px;width:100%"></span>
      </div>

      <p v-else-if="error" class="ds-error">{{ error }}</p>

      <div v-else-if="!rows.length" class="ds-card" style="margin-top:16px">
        <div class="ds-empty">
          <h3 class="ds-h3">Nobody recorded</h3>
          <p>No member's phone reported them at church on this day{{ search ? ' matching that name' : '' }}.</p>
        </div>
      </div>

      <div v-else class="ds-tablewrap" style="margin-top:16px">
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
import { payload, errorMessage } from '../../network/MobileApp'
import { ROLE_CHURCH_MANAGER } from '../../resources/navigation'

/**
 * Who came to church, from the app's location check-ins.
 *
 * A family manager's register is limited to their own family by the API, so
 * the family picker is only offered to the church manager.
 */
export default {
  name: 'AttendancePage',
  components: { AttendanceTrend },
  data () {
    const today = this.$moment().format('YYYY-MM-DD')
    return {
      today,
      date: this.$route.query.date || today,
      familyId: '',
      search: '',
      families: [],
      rows: [],
      trend: [],
      isConfigured: true,
      summaryLoaded: false,
      totalCount: 0,
      totalPages: 0,
      page: 1,
      pageSize: 50,
      loading: true,
      error: '',
      searchTimer: null
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
    }
  },
  beforeMount () {
    this.loadSummary()
    this.load(1)
    if (this.isManager) { this.loadFamilies() }
  },
  beforeDestroy () {
    clearTimeout(this.searchTimer)
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
        this.isConfigured = data.isConfigured !== false
        this.summaryLoaded = true
      }).catch(() => {
        this.summaryLoaded = true
      })
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

      this.$axios.get('admin/attendance', {
        params: {
          Date: this.date || undefined,
          FamilyId: this.familyId || undefined,
          Search: this.search || undefined,
          Page: page,
          PageSize: this.pageSize
        }
      }).then(response => {
        const data = payload(response) || {}
        this.rows = data.results || []
        this.totalCount = data.totalCount || 0
        this.totalPages = data.totalPages || 0
        this.loading = false
      }).catch(error => {
        this.loading = false
        this.error = errorMessage(error, 'Could not load attendance.')
      })
    }
  }
}
</script>
