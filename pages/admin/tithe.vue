<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">My tithe</h1>
        <p>{{ loggedInUser.data.name }} — what you have given, week by week.</p>
      </div>
    </div>

    <!-- The period selector shows the period it is set to, rather than two
         buttons permanently labelled "Month" and "Year". -->
    <div class="ds-card" style="margin-bottom:24px">
      <div class="ds-card__body" style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end">
        <div class="ds-field" style="margin-bottom:0;min-width:160px">
          <label class="ds-label" for="titheMonth">Month</label>
          <select id="titheMonth" v-model="month" class="ds-select" @change="getTithe(loggedInUser.data.id)">
            <option v-for="(name, index) in months" :key="index" :value="name">{{ monthNames[index] }}</option>
          </select>
        </div>

        <div class="ds-field" style="margin-bottom:0;min-width:140px">
          <label class="ds-label" for="titheYear">Year</label>
          <select id="titheYear" v-model="year" class="ds-select" @change="getTithe(loggedInUser.data.id)">
            <option v-for="value in generateArrayOfYears()" :key="value" :value="value">{{ value }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="ds-tablewrap">
      <div v-if="pageRefresh" class="ds-tablescroll">
        <table class="ds-table">
          <thead>
            <tr><th>Week</th><th class="ds-col-num">Amount (GHS)</th></tr>
          </thead>
          <tbody>
            <tr v-for="n in 5" :key="n">
              <td><span class="ds-skeleton" style="width:60px"></span></td>
              <td class="ds-col-num"><span class="ds-skeleton" style="width:70px;margin-left:auto"></span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="ds-tablescroll">
        <table class="ds-table">
          <caption class="sr-only-caption">Tithe for {{ monthLabel }} {{ year }}</caption>
          <thead>
            <tr>
              <th>Week</th>
              <th class="ds-col-num">Amount (GHS)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in weeks" :key="i">
              <td>Week {{ i }}</td>
              <td class="ds-col-num">{{ formatMoney(tithe['week' + i]) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Total for {{ monthLabel }} {{ year }}</td>
              <td class="ds-col-num">{{ formatMoney(getTotal()) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <p v-if="!pageRefresh && getTotal() === 0" class="ds-muted" style="margin-top:16px">
      No tithe is recorded for {{ monthLabel }} {{ year }}.
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Tithe } from '../../network/Member'
import { numberWithCommas } from '../../resources/constants'

const date = new Date()

/** Short codes are what the API expects; full names are what people read. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default {
  name: 'tithe',
  data () {
    return {
      pageRefresh: false,
      tithe: Tithe,
      month: MONTHS[date.getMonth()],
      year: date.getFullYear(),
      weeks: [1, 2, 3, 4, 5],
      months: MONTHS,
      monthNames: MONTH_NAMES
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
    monthLabel () {
      const index = MONTHS.indexOf(this.month)
      return index === -1 ? this.month : MONTH_NAMES[index]
    }
  },
  beforeMount () {
    this.getTithe(this.loggedInUser.data.id)
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
    getTithe (id) {
      this.pageRefresh = true
      this.$axios.get(`tithes/${id}/?Month=${this.month}&Year=${this.year}`).then(response => {
        // The response is keyed by month code. Fall back to an empty week set
        // rather than undefined, which the week rows would then read through.
        const byMonth = Object.assign({}, response.data.data)
        this.tithe = Object.assign({}, Tithe, byMonth[this.month] || {})
        this.pageRefresh = false
      }).catch(() => {
        this.tithe = Object.assign({}, Tithe)
        this.pageRefresh = false
      })
    },
    getTotal () {
      if (!this.tithe) { return 0 }
      return [
        this.tithe.week1, this.tithe.week2, this.tithe.week3,
        this.tithe.week4, this.tithe.week5
      ].reduce((a, b) => Number(a || 0) + Number(b || 0), 0)
    }
  }
}
</script>

<style scoped>
.sr-only-caption {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
</style>
