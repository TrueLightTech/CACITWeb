<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Accounting</h1>
        <p>Everything received between the selected dates, across offerings, tithe and welfare.</p>
      </div>
    </div>

    <!-- Filter bar. Applies to every section below, and shows what is applied. -->
    <div class="ds-card" style="margin-bottom:24px">
      <div class="ds-card__body">
        <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end">
          <div class="ds-field" style="margin-bottom:0;min-width:210px">
            <label class="ds-label" for="acctFamily">Church family</label>
            <select id="acctFamily" class="ds-select" @change="onFamilyChange($event)">
              <option value="">All families</option>
              <option v-for="family in familyOptions" :key="family.id" :value="family.id">{{ family.name }}</option>
            </select>
          </div>

          <div class="ds-field" style="margin-bottom:0;min-width:210px">
            <label class="ds-label" for="acctService">Service</label>
            <select id="acctService" class="ds-select" @change="onServiceChange($event)">
              <option value="">All services</option>
              <option v-for="service in serviceOptions" :key="service.id" :value="service.id">{{ service.name }}</option>
            </select>
          </div>

          <div class="ds-field" style="margin-bottom:0;min-width:260px">
            <span class="ds-label">Date range</span>
            <date-range-picker
              ref="picker"
              v-model="totalsDateRange"
              class="accounting-range"
              :locale-data="{ format: 'yyyy-mm-dd' }"
              :time-picker="false"
              @update="datePickerCallback($event)"
            >
              <template v-slot:input="picker">
                {{ $moment(picker.startDate).format('D MMM YYYY') }} — {{ $moment(picker.endDate).format('D MMM YYYY') }}
              </template>
            </date-range-picker>
          </div>
        </div>

        <div v-if="hasActiveFilters" class="ds-chips" style="margin-top:16px">
          <span v-if="selectedFamily" class="ds-chip">
            Family: {{ selectedFamilyName }}
            <button class="ds-chip__x" type="button" aria-label="Clear family filter" @click="clearFamily">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </span>
          <span v-if="selectedService" class="ds-chip">
            Service: {{ selectedServiceName }}
            <button class="ds-chip__x" type="button" aria-label="Clear service filter" @click="clearService">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Totals -->
    <section class="ds-section" aria-label="Totals">
      <div class="ds-section__head">
        <h2 class="ds-h2">Totals</h2>
        <span class="ds-meta">{{ rangeLabel }}</span>
      </div>

      <div class="ds-metrics">
        <div class="ds-metric">
          <span class="ds-metric__label"><span class="ds-eyebrow">Total received</span></span>
          <strong v-if="!isAccountingLoading" class="ds-metric__value"><small>GHS</small>{{ formatMoney(accountTotals.total) }}</strong>
          <span v-else class="ds-skeleton" style="height:28px;width:70%"></span>
          <span class="ds-metric__foot">All sources combined</span>
        </div>
        <div class="ds-metric">
          <span class="ds-metric__label"><span class="ds-eyebrow">Offering</span></span>
          <strong v-if="!isAccountingLoading" class="ds-metric__value"><small>GHS</small>{{ formatMoney(accountTotals.offeringSum) }}</strong>
          <span v-else class="ds-skeleton" style="height:28px;width:70%"></span>
          <span class="ds-metric__foot">Across all offering types</span>
        </div>
        <div class="ds-metric">
          <span class="ds-metric__label"><span class="ds-eyebrow">Tithe</span></span>
          <strong v-if="!isAccountingLoading" class="ds-metric__value"><small>GHS</small>{{ formatMoney(accountTotals.titheSum) }}</strong>
          <span v-else class="ds-skeleton" style="height:28px;width:70%"></span>
          <span class="ds-metric__foot">From all church families</span>
        </div>
        <div class="ds-metric">
          <span class="ds-metric__label"><span class="ds-eyebrow">Welfare</span></span>
          <strong v-if="!isAccountingLoading" class="ds-metric__value"><small>GHS</small>{{ formatMoney(accountTotals.welfareSum) }}</strong>
          <span v-else class="ds-skeleton" style="height:28px;width:70%"></span>
          <span class="ds-metric__foot">Contributions received</span>
        </div>
      </div>
    </section>

    <!-- Section navigation, so the four reports are not one unbroken scroll -->
    <div class="ds-tabs" role="tablist" style="margin-bottom:24px">
      <button
        v-for="section in sections"
        :key="section.key"
        class="ds-tab"
        :class="{ 'is-active': activeSection === section.key }"
        type="button"
        role="tab"
        :aria-selected="activeSection === section.key ? 'true' : 'false'"
        @click="selectSection(section.key)"
      >
        {{ section.label }}
      </button>
    </div>

    <!-- Offerings by type -->
    <section v-if="activeSection === 'offerings'" aria-label="Offerings by type">
      <div v-if="isOfferingLoading" class="ds-card">
        <div class="ds-card__body" style="display:grid;gap:12px">
          <span v-for="n in 5" :key="n" class="ds-skeleton" style="height:16px"></span>
        </div>
      </div>

      <div v-else-if="offeringGroups.length" style="display:grid;gap:20px">
        <div v-for="(group, gi) in offeringGroups" :key="gi" class="ds-tablewrap">
          <div class="ds-card__head">
            <h3 class="ds-h3">{{ group.offeringTypeName || 'Unnamed offering type' }}</h3>
            <span class="ds-num" style="font-weight:600">GHS {{ formatMoney(groupTotal(group)) }}</span>
          </div>
          <div class="ds-tablescroll">
            <table class="ds-table ds-table--cards">
              <thead>
                <tr><th>Service</th><th>Church family</th><th class="ds-col-num">Amount (GHS)</th></tr>
              </thead>
              <tbody>
                <tr v-for="(off, oi) in group.data" :key="oi">
                  <td data-label="Service">{{ off.serviceName || '—' }}</td>
                  <td data-label="Church family" class="ds-muted">{{ off.assignFamilyName || 'Not assigned' }}</td>
                  <td data-label="Amount (GHS)" class="ds-col-num">{{ formatMoney(off.amount) }}</td>
                </tr>
              </tbody>
              <tfoot v-if="group.data && group.data.length">
                <tr>
                  <td>Total</td><td></td>
                  <td class="ds-col-num">{{ formatMoney(groupTotal(group)) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div v-else class="ds-tablewrap">
        <div class="ds-empty">
          <h3 class="ds-h3">No offerings in this range</h3>
          <p>Widen the date range, or clear the family and service filters.</p>
        </div>
      </div>
    </section>

    <!-- Tithe by family, with drill-down -->
    <section v-else-if="activeSection === 'tithe'" aria-label="Tithe by family">
      <div class="ds-tablewrap">
        <div v-if="isIndividualTitheClicked" class="ds-toolbar">
          <button class="ds-btn ds-btn--ghost ds-btn--sm" type="button" @click="goBack">
            <svg class="ds-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            All families
          </button>
          <span class="ds-toolbar__count" style="margin-left:auto">
            {{ drilldownFamilyName }} — individual tithe
          </span>
        </div>

        <div v-if="isTitheLoading || isLoadingIndividualTithe" class="ds-tablescroll">
          <table class="ds-table">
            <thead><tr><th>Church family</th><th class="ds-col-num">Amount (GHS)</th><th class="ds-col-action"></th></tr></thead>
            <tbody>
              <tr v-for="n in 5" :key="n">
                <td><span class="ds-skeleton" style="width:130px"></span></td>
                <td class="ds-col-num"><span class="ds-skeleton" style="width:80px;margin-left:auto"></span></td>
                <td class="ds-col-action"><span class="ds-skeleton" style="width:70px;margin-left:auto"></span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Drill-down: individual members -->
        <div v-else-if="isIndividualTitheClicked" class="ds-tablescroll">
          <table v-if="individualRows.length" class="ds-table ds-table--cards">
            <thead><tr><th>Member</th><th>Service</th><th class="ds-col-num">Amount (GHS)</th></tr></thead>
            <tbody>
              <tr v-for="(tithe, index) in individualRows" :key="index">
                <td data-label="Member" style="font-weight:500">{{ tithe.userName }}</td>
                <td data-label="Service" class="ds-muted">{{ tithe.serviceName || '—' }}</td>
                <td data-label="Amount (GHS)" class="ds-col-num">{{ formatMoney(tithe.amountPaid) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td><td></td>
                <td class="ds-col-num">{{ formatMoney(sumBy(individualRows, 'amountPaid')) }}</td>
              </tr>
            </tfoot>
          </table>
          <div v-else class="ds-empty">
            <h3 class="ds-h3">No individual tithe in this range</h3>
            <p>Nobody in {{ drilldownFamilyName }} has tithe recorded between these dates.</p>
          </div>
        </div>

        <!-- Aggregate by family -->
        <div v-else-if="titheRows.length" class="ds-tablescroll">
          <table class="ds-table ds-table--cards">
            <thead>
              <tr><th>Church family</th><th class="ds-col-num">Amount (GHS)</th><th class="ds-col-action">Members</th></tr>
            </thead>
            <tbody>
              <tr v-for="(tithe, index) in titheRows" :key="index">
                <td data-label="Church family" style="font-weight:500">{{ tithe.userFamilyName || 'Not assigned' }}</td>
                <td data-label="Amount (GHS)" class="ds-col-num">{{ formatMoney(tithe.totalAmount) }}</td>
                <td data-label="Members" class="ds-col-action">
                  <button
                    class="ds-btn ds-btn--secondary ds-btn--sm"
                    type="button"
                    @click="fetchTitheMembers(tithe.userFamilyId, tithe.userFamilyName)"
                  >
                    View members
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td class="ds-col-num">{{ formatMoney(sumBy(titheRows, 'totalAmount')) }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div v-else class="ds-empty">
          <h3 class="ds-h3">No tithe in this range</h3>
          <p>Widen the date range, or clear the family and service filters.</p>
        </div>
      </div>
    </section>

    <!-- Welfare -->
    <section v-else aria-label="Welfare">
      <div class="ds-tablewrap">
        <div v-if="isLoadingWelfareList" class="ds-tablescroll">
          <table class="ds-table">
            <thead><tr><th>Member</th><th>Received by</th><th class="ds-col-num">Amount (GHS)</th></tr></thead>
            <tbody>
              <tr v-for="n in 5" :key="n">
                <td><span class="ds-skeleton" style="width:140px"></span></td>
                <td><span class="ds-skeleton" style="width:120px"></span></td>
                <td class="ds-col-num"><span class="ds-skeleton" style="width:80px;margin-left:auto"></span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="welfareRows.length" class="ds-tablescroll">
          <table class="ds-table ds-table--cards">
            <thead><tr><th>Member</th><th>Received by</th><th class="ds-col-num">Amount (GHS)</th></tr></thead>
            <tbody>
              <tr v-for="(record, index) in welfareRows" :key="index">
                <td data-label="Member" style="font-weight:500">{{ record.name }}</td>
                <td data-label="Received by" class="ds-muted">{{ record.collectorName || '—' }}</td>
                <td data-label="Amount (GHS)" class="ds-col-num">{{ formatMoney(record.amount) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td><td></td>
                <td class="ds-col-num">{{ formatMoney(sumBy(welfareRows, 'amount')) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div v-else class="ds-empty">
          <h3 class="ds-h3">No welfare in this range</h3>
          <p>Widen the date range to see welfare contributions.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import {
  ChurchFamilyList, ChurchWelfareList,
  DashboardAccountingTotal, IndividualTitheList, OfferingAltList,
  ServiceList, TitheAggregateList
} from '../../network/Member'
import DateRangePicker from 'vue2-daterange-picker'
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css'
import moment from 'moment'
import { numberWithCommas } from '../../resources/constants'

const SECTIONS = [
  { key: 'offerings', label: 'Offerings by type' },
  { key: 'tithe', label: 'Tithe by family' },
  { key: 'welfare', label: 'Welfare' }
]

export default {
  name: 'accounting',
  components: { DateRangePicker },
  data () {
    return {
      sections: SECTIONS,
      selectedService: '',
      selectedFamily: '',
      selectedServiceName: 'All',
      selectedFamilyName: 'All',
      drilldownFamilyName: '',
      services: ServiceList,
      families: ChurchFamilyList,
      welfare: ChurchWelfareList,
      accountTotals: DashboardAccountingTotal,
      titheAggregate: TitheAggregateList,
      offerings: OfferingAltList,
      individualTithe: IndividualTitheList,
      isAccountingLoading: false,
      isLoadingIndividualTithe: false,
      isLoadingWelfareList: false,
      isOfferingLoading: false,
      isTitheLoading: false,
      isIndividualTitheClicked: false,
      totalsDateRange: {
        startDate: `${moment().format('YYYY-MM-DD')}`,
        endDate: `${moment().format('YYYY-MM-DD')}`
      }
    }
  },
  computed: {
    activeSection () {
      const requested = String(this.$route.query.section || '')
      return SECTIONS.some(s => s.key === requested) ? requested : 'offerings'
    },
    serviceOptions () {
      return this.services && this.services.data ? this.services.data : []
    },
    familyOptions () {
      return this.families && this.families.data ? this.families.data : []
    },
    offeringGroups () {
      return this.offerings && Array.isArray(this.offerings.data) ? this.offerings.data : []
    },
    titheRows () {
      return this.titheAggregate && Array.isArray(this.titheAggregate.data) ? this.titheAggregate.data : []
    },
    individualRows () {
      return this.individualTithe && Array.isArray(this.individualTithe.results) ? this.individualTithe.results : []
    },
    welfareRows () {
      return this.welfare && Array.isArray(this.welfare.results) ? this.welfare.results : []
    },
    hasActiveFilters () {
      return !!(this.selectedFamily || this.selectedService)
    },
    rangeLabel () {
      const start = this.$moment(this.totalsDateRange.startDate)
      const end = this.$moment(this.totalsDateRange.endDate)
      if (start.isSame(end, 'day')) {
        return start.format('dddd, D MMMM YYYY')
      }
      return `${start.format('D MMM YYYY')} — ${end.format('D MMM YYYY')}`
    }
  },
  beforeMount () {
    this.getAccounting()
    this.fetchServices()
    this.fetchFamilies()
    this.fetchOfferings()
    this.fetchTitheAggregate()
    this.fetchMembersWelfare()
  },
  methods: {
    formatMoney (value) {
      return numberWithCommas(Number(value || 0))
    },
    sumBy (list, key) {
      return list.reduce((sum, item) => sum + Number(item[key] || 0), 0)
    },
    groupTotal (group) {
      return Array.isArray(group.data) ? this.sumBy(group.data, 'amount') : 0
    },
    selectSection (key) {
      if (this.activeSection === key) { return }
      this.$router.replace({ query: Object.assign({}, this.$route.query, { section: key }) })
    },
    goBack () {
      this.isIndividualTitheClicked = false
      this.drilldownFamilyName = ''
    },

    onFamilyChange (event) {
      const id = event.target.value
      const match = this.familyOptions.filter(f => f.id === id)
      this.filterByFamilyId(match.length ? match[0] : '')
    },
    onServiceChange (event) {
      const id = event.target.value
      const match = this.serviceOptions.filter(s => s.id === id)
      this.filterByService(match.length ? match[0] : '')
    },
    clearFamily () {
      this.filterByFamilyId('')
    },
    clearService () {
      this.filterByService('')
    },
    filterByFamilyId (value) {
      this.isIndividualTitheClicked = false
      this.selectedFamily = value ? value.id : ''
      this.selectedFamilyName = value ? value.name : 'All'
      this.fetchTitheAggregate()
      this.fetchOfferings()
    },
    filterByService (value) {
      this.isIndividualTitheClicked = false
      this.selectedService = value ? value.id : ''
      this.selectedServiceName = value ? value.name : 'All'
      this.getAccounting()
      this.fetchOfferings()
      this.fetchTitheAggregate()
    },
    datePickerCallback (date) {
      this.totalsDateRange.startDate = moment(date.startDate).format('YYYY-MM-DD')
      this.totalsDateRange.endDate = moment(date.endDate).format('YYYY-MM-DD')
      this.isIndividualTitheClicked = false
      this.getAccounting()
      this.fetchOfferings()
      this.fetchTitheAggregate()
      this.fetchMembersWelfare()
    },

    getAccounting () {
      const filter = this.selectedService ? `&ServiceId=${this.selectedService}` : ''
      this.isAccountingLoading = true
      this.$axios.get(`accounting/total?StartDate=${this.totalsDateRange.startDate}&EndDate=${this.totalsDateRange.endDate}${filter}`)
        .then(response => {
          this.accountTotals = Object.assign({}, DashboardAccountingTotal, response.data.data)
          this.isAccountingLoading = false
        }).catch(() => {
          this.isAccountingLoading = false
        })
    },
    fetchServices () {
      this.$axios.get('services').then(response => {
        this.services = Object.assign({}, ServiceList, response.data)
      }).catch(() => {})
    },
    fetchFamilies () {
      this.$axios.get('churchfamilies').then(response => {
        this.families = Object.assign({}, ChurchFamilyList, response.data)
      }).catch(() => {})
    },
    fetchOfferings () {
      this.isOfferingLoading = true
      const filter = this.selectedService ? `&ServiceId=${this.selectedService}` : ''
      const filterFamilyId = this.selectedFamily ? `&FamilyId=${this.selectedFamily}` : ''

      this.$axios.get(`accounting/offeringtypes?StartDate=${this.totalsDateRange.startDate}&EndDate=${this.totalsDateRange.endDate}${filter}${filterFamilyId}`)
        .then(response => {
          this.offerings = Object.assign({}, OfferingAltList.data, response.data)
          this.isOfferingLoading = false
        }).catch(() => {
          this.isOfferingLoading = false
        })
    },
    fetchTitheAggregate () {
      this.isTitheLoading = true
      const filter = this.selectedFamily ? `&FamilyId=${this.selectedFamily}` : ''
      const filterService = this.selectedService ? `&ServiceId=${this.selectedService}` : ''

      this.$axios.get(`/accounting/tithe-aggregate?StartDate=${this.totalsDateRange.startDate}&EndDate=${this.totalsDateRange.endDate}${filter}${filterService}`)
        .then(response => {
          this.titheAggregate = Object.assign({}, TitheAggregateList, response.data.data)
          this.isTitheLoading = false
        }).catch(() => {
          this.isTitheLoading = false
        })
    },
    fetchTitheMembers (familyId, familyName) {
      this.isLoadingIndividualTithe = true
      this.drilldownFamilyName = familyName || 'this family'

      this.$axios.get(`/accounting/members-tithe?FamilyId=${familyId}&StartDate=${this.totalsDateRange.startDate}&EndDate=${this.totalsDateRange.endDate}`)
        .then(response => {
          this.individualTithe = Object.assign({}, IndividualTitheList, response.data.data)
          this.isLoadingIndividualTithe = false
          this.isIndividualTitheClicked = true
        }).catch(() => {
          this.isLoadingIndividualTithe = false
        })
    },
    fetchMembersWelfare () {
      this.isLoadingWelfareList = true
      this.$axios.get(`/accounting/members-welfare?StartDate=${this.totalsDateRange.startDate}&EndDate=${this.totalsDateRange.endDate}&PageSize=1000`)
        .then(response => {
          this.welfare = Object.assign({}, ChurchWelfareList, response.data.data)
          this.isLoadingWelfareList = false
        }).catch(() => {
          this.isLoadingWelfareList = false
        })
    }
  }
}
</script>

<style scoped>
/* The date-range picker ships its own markup; this aligns its trigger with
   the design system's inputs without touching the library's internals. */
.accounting-range >>> .reportrange-text {
  border: 1px solid var(--ds-border-strong);
  border-radius: var(--ds-radius-sm);
  background: var(--ds-surface);
  color: var(--ds-text);
  font-family: var(--ds-font-sans);
  font-size: var(--ds-text-base);
  min-height: 38px;
  display: flex;
  align-items: center;
  padding: 8px 12px;
}

.accounting-range >>> .reportrange-text:hover { background: var(--ds-surface-2); }
.accounting-range { width: 100%; }
</style>
