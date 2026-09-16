<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Tithe records</h1>
        <p>Tithe recorded for your church family between the selected dates.</p>
      </div>
    </div>

    <div class="ds-card" style="margin-bottom:24px">
      <div class="ds-card__body">
        <div class="ds-field" style="margin-bottom:0;max-width:300px">
          <span class="ds-label">Date range</span>
          <date-range-picker
            ref="picker"
            v-model="totalsDateRange"
            class="records-range"
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
    </div>

    <div class="ds-tablewrap">
      <div class="ds-toolbar">
        <span class="ds-toolbar__count">{{ rangeLabel }}</span>
        <div class="ds-toolbar__right">
          <span class="ds-toolbar__count">
            {{ isLoadingIndividualTithe ? 'Loading…' : rows.length + (rows.length === 1 ? ' record' : ' records') }}
          </span>
        </div>
      </div>

      <div v-if="isLoadingIndividualTithe" class="ds-tablescroll">
        <table class="ds-table">
          <thead><tr><th>Member</th><th>Service</th><th class="ds-col-num">Amount (GHS)</th></tr></thead>
          <tbody>
            <tr v-for="n in 5" :key="n">
              <td><span class="ds-skeleton" style="width:140px"></span></td>
              <td><span class="ds-skeleton" style="width:120px"></span></td>
              <td class="ds-col-num"><span class="ds-skeleton" style="width:80px;margin-left:auto"></span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="rows.length" class="ds-tablescroll">
        <table class="ds-table ds-table--cards">
          <thead>
            <tr><th>Member</th><th>Service</th><th class="ds-col-num">Amount (GHS)</th></tr>
          </thead>
          <tbody>
            <tr v-for="(tithe, index) in rows" :key="index">
              <td data-label="Member" style="font-weight:500">{{ tithe.userName }}</td>
              <td data-label="Service" class="ds-muted">{{ tithe.serviceName || '—' }}</td>
              <td data-label="Amount (GHS)" class="ds-col-num">{{ formatMoney(tithe.amountPaid) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td></td>
              <td class="ds-col-num">{{ formatMoney(total) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div v-else class="ds-empty">
        <span class="ds-empty__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </span>
        <h3 class="ds-h3">No tithe recorded in this range</h3>
        <p>Choose a wider date range to see records for your church family.</p>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import { IndividualTitheList } from '../../network/Member'
import { numberWithCommas } from '../../resources/constants'
import DateRangePicker from 'vue2-daterange-picker'
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css'

export default {
  name: 'records',
  components: { DateRangePicker },
  data () {
    return {
      isLoadingIndividualTithe: false,
      individualTithe: IndividualTitheList,
      totalsDateRange: {
        startDate: `${moment().format('YYYY-MM-DD')}`,
        endDate: `${moment().format('YYYY-MM-DD')}`
      }
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
    rows () {
      return this.individualTithe && Array.isArray(this.individualTithe.results)
        ? this.individualTithe.results
        : []
    },
    total () {
      return this.rows.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0)
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
  mounted () {
    this.fetchTitheMembers(this.loggedInUser.data.churchFamilyId)
  },
  methods: {
    formatMoney (value) {
      return numberWithCommas(Number(value || 0))
    },
    datePickerCallback (date) {
      this.totalsDateRange.startDate = moment(date.startDate).format('YYYY-MM-DD')
      this.totalsDateRange.endDate = moment(date.endDate).format('YYYY-MM-DD')
      this.fetchTitheMembers(this.loggedInUser.data.churchFamilyId)
    },
    fetchTitheMembers (familyId) {
      this.isLoadingIndividualTithe = true
      this.$axios.get(`/accounting/members-tithe?FamilyId=${familyId}&StartDate=${this.totalsDateRange.startDate}&EndDate=${this.totalsDateRange.endDate}`)
        .then(response => {
          this.individualTithe = Object.assign({}, IndividualTitheList, response.data.data)
          this.isLoadingIndividualTithe = false
        }).catch(() => {
          this.isLoadingIndividualTithe = false
        })
    }
  }
}
</script>

<style scoped>
.records-range >>> .reportrange-text {
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

.records-range >>> .reportrange-text:hover { background: var(--ds-surface-2); }
.records-range { width: 100%; }
</style>
