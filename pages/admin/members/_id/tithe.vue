<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Record tithe</h1>
        <p>{{ user.name || 'Member' }} — {{ monthLabel }} {{ year }}</p>
      </div>
      <div class="ds-page-head__actions">
        <NuxtLink class="ds-btn ds-btn--secondary" :to="`/admin/members/${$route.params.id}/view`">
          Back to member
        </NuxtLink>
      </div>
    </div>

    <div class="ds-card" style="margin-bottom:24px">
      <div class="ds-card__body" style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end">
        <div class="ds-field" style="margin-bottom:0;min-width:160px">
          <label class="ds-label" for="recMonth">Month</label>
          <select id="recMonth" v-model="month" class="ds-select" @change="getTithe(user.id)">
            <option v-for="(code, index) in months" :key="code" :value="code">{{ monthNames[index] }}</option>
          </select>
        </div>
        <div class="ds-field" style="margin-bottom:0;min-width:140px">
          <label class="ds-label" for="recYear">Year</label>
          <select id="recYear" v-model="year" class="ds-select" @change="getTithe(user.id)">
            <option v-for="value in generateArrayOfYears()" :key="value" :value="value">{{ value }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="ds-tablewrap">
      <div v-if="pageRefresh" class="ds-tablescroll">
        <table class="ds-table">
          <thead>
            <tr><th>Week</th><th class="ds-col-num">Amount (GHS)</th><th class="ds-col-action">Record</th></tr>
          </thead>
          <tbody>
            <tr v-for="n in 5" :key="n">
              <td><span class="ds-skeleton" style="width:60px"></span></td>
              <td class="ds-col-num"><span class="ds-skeleton" style="width:70px;margin-left:auto"></span></td>
              <td class="ds-col-action"><span class="ds-skeleton" style="width:72px;margin-left:auto"></span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="ds-tablescroll">
        <table class="ds-table ds-table--cards">
          <thead>
            <tr>
              <th>Week</th>
              <th class="ds-col-num">Amount (GHS)</th>
              <th class="ds-col-action">Record</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in weeks" :key="i">
              <td data-label="Week">Week {{ i }}</td>
              <td data-label="Amount (GHS)" class="ds-col-num">{{ formatMoney(tithe['week' + i]) }}</td>
              <td data-label="Record" class="ds-col-action">
                <button class="ds-btn ds-btn--secondary ds-btn--sm" type="button" @click="openRecord(i)">
                  {{ Number(tithe['week' + i]) > 0 ? 'Update' : 'Record' }}
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Total for {{ monthLabel }} {{ year }}</td>
              <td class="ds-col-num">{{ formatMoney(getTotal()) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Record dialog -->
    <div v-if="isDialogOpen" class="ds-overlay" @click.self="closeRecord">
      <div class="ds-modal" role="dialog" aria-modal="true" aria-labelledby="recordTitheTitle">
        <div class="ds-modal__head">
          <div>
            <h2 id="recordTitheTitle" class="ds-h3">Record tithe — week {{ week }}</h2>
            <p>{{ user.name }} · {{ monthLabel }} {{ year }}</p>
          </div>
        </div>

        <div class="ds-modal__body">
          <div class="ds-field" :class="{ 'is-invalid': showErrors && !amountPaid }">
            <label class="ds-label" for="titheAmount">Amount (GHS)</label>
            <input
              id="titheAmount"
              ref="amount"
              v-model="amountPaid"
              class="ds-input ds-input--amount"
              type="text"
              inputmode="decimal"
              placeholder="0.00"
            >
            <span v-if="showErrors && !amountPaid" class="ds-error">Enter the amount received.</span>
          </div>

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !serviceId }" style="margin-bottom:0">
            <label class="ds-label" for="titheService">Service</label>
            <select id="titheService" v-model="serviceId" class="ds-select" :disabled="isServiceLoaded">
              <option value="" disabled>Select a service</option>
              <option v-for="service in serviceOptions" :key="service.id" :value="service.id">
                {{ service.name }}
              </option>
            </select>
            <span v-if="showErrors && !serviceId" class="ds-error">Choose which service this was given at.</span>
          </div>
        </div>

        <div class="ds-modal__foot">
          <button class="ds-btn ds-btn--ghost" type="button" @click="closeRecord">Cancel</button>
          <button class="ds-btn ds-btn--primary" type="button" :disabled="isSaving" @click="recordTithe">
            <span v-if="isSaving" class="ds-btn__spinner"></span>
            {{ isSaving ? 'Saving' : 'Save tithe' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ChurchMember, ServiceList, Tithe } from '../../../../network/Member'
import { mapGetters } from 'vuex'
import { numberWithCommas } from '../../../../resources/constants'

const date = new Date()
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default {
  name: 'record-tithe',
  data () {
    return {
      week: 1,
      pageRefresh: false,
      isServiceLoaded: false,
      isSaving: false,
      isDialogOpen: false,
      showErrors: false,
      user: ChurchMember,
      amountPaid: '',
      tithe: Object.assign({}, Tithe),
      month: MONTHS[date.getMonth()],
      year: date.getFullYear(),
      weeks: [1, 2, 3, 4, 5],
      services: ServiceList,
      serviceId: '',
      months: MONTHS,
      monthNames: MONTH_NAMES
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
    monthLabel () {
      const index = MONTHS.indexOf(this.month)
      return index === -1 ? this.month : MONTH_NAMES[index]
    },
    serviceOptions () {
      return this.services && this.services.data ? this.services.data : []
    }
  },
  beforeMount () {
    this.getServices()
    this.getMember(this.$route.params.id)
  },
  methods: {
    formatMoney (value) {
      return numberWithCommas(Number(value || 0))
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
    openRecord (i) {
      this.week = i
      this.amountPaid = ''
      this.serviceId = ''
      this.showErrors = false
      this.isDialogOpen = true
      this.$nextTick(() => this.$refs.amount && this.$refs.amount.focus())
    },
    closeRecord () {
      this.isDialogOpen = false
    },
    getMember (id) {
      this.pageRefresh = true
      this.$axios.get(`churchmembers/user/${id}`).then(response => {
        this.user = Object.assign({}, ChurchMember, response.data.data)
        if (this.user.dataOfBirth && typeof this.user.dataOfBirth === 'string') {
          this.user.dataOfBirth = this.user.dataOfBirth.split('T')[0]
        }
        this.getTithe(this.user.id)
      }).catch(() => {
        this.pageRefresh = false
      })
    },
    getTithe (id) {
      this.pageRefresh = true
      this.$axios.get(`tithes/${id}/?Month=${this.month}&Year=${this.year}`).then(response => {
        const byMonth = Object.assign({}, response.data.data)
        this.tithe = Object.assign({}, Tithe, byMonth[this.month] || {})
        this.pageRefresh = false
      }).catch(() => {
        this.tithe = Object.assign({}, Tithe)
        this.pageRefresh = false
      })
    },
    getServices () {
      this.isServiceLoaded = true
      this.$axios.get('services').then(response => {
        this.isServiceLoaded = false
        this.services = Object.assign({}, ServiceList, response.data)
      }).catch(() => {
        this.isServiceLoaded = false
      })
    },
    getTotal () {
      if (!this.tithe) { return 0 }
      return [
        this.tithe.week1, this.tithe.week2, this.tithe.week3,
        this.tithe.week4, this.tithe.week5
      ].reduce((a, b) => Number(a || 0) + Number(b || 0), 0)
    },
    recordTithe () {
      if (!this.amountPaid || !this.serviceId) {
        this.showErrors = true
        return
      }
      this.showErrors = false

      const service = this.serviceOptions.filter(item => item.id === this.serviceId)
      if (service.length === 0) {
        this.$toast.error('That service is no longer available. Choose another.')
        return
      }

      this.tithe['week' + this.week] = parseFloat(this.amountPaid)

      const requestBody = {
        userId: this.user.id,
        year: this.year + '',
        signature: this.loggedInUser.data.id,
        serviceId: this.serviceId,
        serviceName: service[0].name,
        month: this.month,
        amountPaid: parseFloat(this.amountPaid),
        week: this.week
      }

      this.isSaving = true
      this.$axios.post('tithes', requestBody).then(response => {
        const byMonth = response.data && response.data.data ? response.data.data : {}
        if (byMonth[this.month]) {
          this.tithe.titheId = byMonth[this.month].titheId
        }
        this.$toast.success(`Tithe recorded for week ${this.week}`)
        this.isSaving = false
        this.isDialogOpen = false
        this.amountPaid = ''
        this.serviceId = ''
      }).catch(error => {
        // Previously reported through $toast.success, so failures looked like successes.
        const message = error && error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Could not record this tithe.'
        this.$toast.error(message)
        this.isSaving = false
      })
    }
  }
}
</script>
