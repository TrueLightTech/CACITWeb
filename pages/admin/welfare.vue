<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">My welfare</h1>
        <p>{{ member.name || 'Your' }} welfare contributions and awards for {{ year }}.</p>
      </div>
      <div class="ds-page-head__actions">
        <div class="ds-field" style="margin-bottom:0;min-width:130px">
          <label class="ds-label sr-only-label" for="welfareYear">Year</label>
          <select id="welfareYear" v-model="year" class="ds-select" @change="onYearChange">
            <option v-for="value in generateArrayOfYears()" :key="value" :value="String(value)">{{ value }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Totals -->
    <div class="ds-metrics" style="margin-bottom:24px">
      <div class="ds-metric">
        <span class="ds-metric__label"><span class="ds-eyebrow">Paid by you</span></span>
        <strong v-if="!isLoadingTotal" class="ds-metric__value">
          <small>GHS</small>{{ formatMoney(welfareTotals.data.welfareBySelf) }}
        </strong>
        <span v-else class="ds-skeleton" style="height:28px;width:70%"></span>
        <span class="ds-metric__foot">Your welfare contributions in {{ year }}</span>
      </div>

      <div class="ds-metric">
        <span class="ds-metric__label"><span class="ds-eyebrow">Awarded by the church</span></span>
        <strong v-if="!isLoadingTotal" class="ds-metric__value">
          <small>GHS</small>{{ formatMoney(welfareTotals.data.welfareByChurch) }}
        </strong>
        <span v-else class="ds-skeleton" style="height:28px;width:70%"></span>
        <span class="ds-metric__foot">Support received from the church in {{ year }}</span>
      </div>
    </div>

    <!-- Transactions -->
    <div class="ds-section__head">
      <h2 class="ds-h2">Transactions</h2>
      <div class="ds-segment" role="tablist">
        <button
          type="button"
          role="tab"
          :class="{ 'is-active': isSelf }"
          :aria-selected="isSelf ? 'true' : 'false'"
          @click="isWelfareSelected(true)"
        >
          Paid
        </button>
        <button
          type="button"
          role="tab"
          :class="{ 'is-active': isChurch }"
          :aria-selected="isChurch ? 'true' : 'false'"
          @click="isWelfareSelected(false)"
        >
          Awarded
        </button>
      </div>
    </div>

    <div class="ds-tablewrap">
      <div v-if="isWelfareLoading" class="ds-tablescroll">
        <table class="ds-table">
          <thead>
            <tr><th>Date</th><th class="ds-col-num">Amount (GHS)</th><th>Received by</th></tr>
          </thead>
          <tbody>
            <tr v-for="n in 4" :key="n">
              <td><span class="ds-skeleton" style="width:110px"></span></td>
              <td class="ds-col-num"><span class="ds-skeleton" style="width:70px;margin-left:auto"></span></td>
              <td><span class="ds-skeleton" style="width:120px"></span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="rows.length" class="ds-tablescroll">
        <table class="ds-table ds-table--cards">
          <thead>
            <tr>
              <th>Date</th>
              <th class="ds-col-num">Amount (GHS)</th>
              <th v-if="isChurch">Reason</th>
              <th>Received by</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in rows" :key="item.id || index">
              <td data-label="Date">{{ fmtDate(item.createdAt) }}</td>
              <td data-label="Amount (GHS)" class="ds-col-num">{{ formatMoney(item.transactionAmount) }}</td>
              <td v-if="isChurch" data-label="Reason" class="ds-muted">{{ item.description || '—' }}</td>
              <td data-label="Received by" class="ds-muted">{{ item.receivedBy || '—' }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Total shown</td>
              <td class="ds-col-num">{{ formatMoney(rowsTotal) }}</td>
              <td v-if="isChurch"></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div v-else class="ds-empty">
        <span class="ds-empty__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/>
          </svg>
        </span>
        <h3 class="ds-h3">
          {{ isSelf ? 'No welfare paid in ' + year : 'No welfare awarded in ' + year }}
        </h3>
        <p>
          {{ isSelf
            ? 'Welfare contributions recorded for you will appear here.'
            : 'Support awarded to you by the church will appear here.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ChurchMember, WelfareList, WelfareTotals } from '../../network/Member'
import { numberWithCommas } from '../../resources/constants'

const date = new Date()

export default {
  name: 'welfare',
  data () {
    return {
      id: '',
      year: date.getFullYear() + '',
      isLoadingMember: false,
      member: ChurchMember,
      isWelfareLoading: false,
      isLoadingTotal: false,
      welfare: WelfareList,
      welfareTotals: WelfareTotals,
      isSelf: true,
      isChurch: false
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
    rows () {
      return this.welfare && this.welfare.data && Array.isArray(this.welfare.data.results)
        ? this.welfare.data.results
        : []
    },
    rowsTotal () {
      return this.rows.reduce((sum, item) => sum + Number(item.transactionAmount || 0), 0)
    }
  },
  mounted () {
    this.id = this.loggedInUser.data.id
    this.getWelfares()
    this.getWelfareTotals()
    this.getMemberDetails()
  },
  methods: {
    formatMoney (value) {
      return numberWithCommas(Number(value || 0))
    },
    fmtDate (value) {
      if (!value) { return '—' }
      const parsed = this.$moment(value)
      return parsed.isValid() ? parsed.format('D MMMM YYYY') : '—'
    },
    onYearChange () {
      this.getWelfares()
      this.getWelfareTotals()
    },
    generateArrayOfYears () {
      const max = new Date().getFullYear()
      const min = max - 12
      const years = []
      for (let i = max; i >= min; i--) {
        years.push(i)
      }
      return years
    },
    isWelfareSelected (type) {
      this.isSelf = type
      this.isChurch = !type
      this.getWelfares()
    },
    getWelfareTotals () {
      this.isLoadingTotal = true
      this.$axios.get(`welfaretransactions/total?userId=${this.id}&year=${this.year}`).then(response => {
        this.welfareTotals = Object.assign({}, WelfareTotals, response.data)
        this.isLoadingTotal = false
      }).catch(() => {
        this.isLoadingTotal = false
      })
    },
    getMemberDetails () {
      this.isLoadingMember = true
      this.$axios.get(`churchmembers/user/${this.id}`).then(response => {
        this.member = Object.assign({}, ChurchMember, response.data.data)
        this.isLoadingMember = false
      }).catch(() => {
        this.isLoadingMember = false
      })
    },
    getWelfares () {
      this.isWelfareLoading = true
      this.$axios.get(`welfaretransactions?UserId=${this.id}&IsWelfarePaidBySelf=${this.isSelf}&IsWelfarePaidByChurch=${this.isChurch}&Year=${this.year}&PageSize=20`)
        .then(response => {
          this.welfare = Object.assign({}, WelfareList, response.data)
          this.isWelfareLoading = false
        }).catch(() => {
          // Previously raised a success toast on failure; an empty list is
          // shown instead, which is what the screen can actually say.
          this.welfare = Object.assign({}, WelfareList, { data: { results: [] } })
          this.isWelfareLoading = false
        })
    }
  }
}
</script>

<style scoped>
.sr-only-label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
</style>
