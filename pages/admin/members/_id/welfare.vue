<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Welfare</h1>
        <p>{{ member.name || 'Member' }} — contributions and awards for {{ year }}.</p>
      </div>
      <div class="ds-page-head__actions">
        <button class="ds-btn ds-btn--secondary" type="button" @click="openDialog('awarded')">
          Award welfare
        </button>
        <button class="ds-btn ds-btn--primary" type="button" @click="openDialog('paid')">
          <svg class="ds-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-linecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Record welfare
        </button>
      </div>
    </div>

    <div class="ds-card" style="margin-bottom:24px">
      <div class="ds-card__body" style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end">
        <div class="ds-field" style="margin-bottom:0;min-width:140px">
          <label class="ds-label" for="memberWelfareYear">Year</label>
          <select id="memberWelfareYear" v-model="year" class="ds-select" @change="onYearChange">
            <option v-for="value in generateArrayOfYears()" :key="value" :value="String(value)">{{ value }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Totals -->
    <div class="ds-metrics" style="margin-bottom:24px">
      <div class="ds-metric">
        <span class="ds-metric__label"><span class="ds-eyebrow">Paid by member</span></span>
        <strong v-if="!isLoadingTotal" class="ds-metric__value">
          <small>GHS</small>{{ formatMoney(welfareTotals.data.welfareBySelf) }}
        </strong>
        <span v-else class="ds-skeleton" style="height:28px;width:70%"></span>
        <span class="ds-metric__foot">Contributions recorded in {{ year }}</span>
      </div>
      <div class="ds-metric">
        <span class="ds-metric__label"><span class="ds-eyebrow">Awarded by church</span></span>
        <strong v-if="!isLoadingTotal" class="ds-metric__value">
          <small>GHS</small>{{ formatMoney(welfareTotals.data.welfareByChurch) }}
        </strong>
        <span v-else class="ds-skeleton" style="height:28px;width:70%"></span>
        <span class="ds-metric__foot">Support given in {{ year }}</span>
      </div>
    </div>

    <!-- Transactions -->
    <div class="ds-section__head">
      <h2 class="ds-h2">Transactions</h2>
      <div class="ds-segment" role="tablist">
        <button type="button" role="tab" :class="{ 'is-active': isSelf }"
                :aria-selected="isSelf ? 'true' : 'false'" @click="isWelfareSelected(true)">Paid</button>
        <button type="button" role="tab" :class="{ 'is-active': isChurch }"
                :aria-selected="isChurch ? 'true' : 'false'" @click="isWelfareSelected(false)">Awarded</button>
      </div>
    </div>

    <div class="ds-tablewrap">
      <div v-if="isWelfareLoading" class="ds-tablescroll">
        <table class="ds-table">
          <thead>
            <tr><th>Date</th><th class="ds-col-num">Amount (GHS)</th><th>Received by</th><th class="ds-col-action">Remove</th></tr>
          </thead>
          <tbody>
            <tr v-for="n in 4" :key="n">
              <td><span class="ds-skeleton" style="width:110px"></span></td>
              <td class="ds-col-num"><span class="ds-skeleton" style="width:70px;margin-left:auto"></span></td>
              <td><span class="ds-skeleton" style="width:120px"></span></td>
              <td class="ds-col-action"><span class="ds-skeleton" style="width:28px;margin-left:auto"></span></td>
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
              <th>{{ isChurch ? 'Given by' : 'Received by' }}</th>
              <th class="ds-col-action">Remove</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in rows" :key="item.id || index">
              <td data-label="Date">{{ fmtDate(item.createdAt) }}</td>
              <td data-label="Amount (GHS)" class="ds-col-num">{{ formatMoney(item.transactionAmount) }}</td>
              <td v-if="isChurch" data-label="Reason" class="ds-muted">{{ item.description || '—' }}</td>
              <td :data-label="isChurch ? 'Given by' : 'Received by'" class="ds-muted">{{ item.receivedBy || '—' }}</td>
              <td data-label="Remove" class="ds-col-action">
                <button
                  class="ds-btn ds-btn--ghost ds-btn--sm ds-btn--danger-quiet"
                  type="button"
                  :aria-label="`Delete welfare of GHS ${formatMoney(item.transactionAmount)}`"
                  @click="askDelete(item)"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Total shown</td>
              <td class="ds-col-num">{{ formatMoney(rowsTotal) }}</td>
              <td v-if="isChurch"></td>
              <td></td>
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
        <h3 class="ds-h3">{{ isSelf ? 'No welfare paid in ' + year : 'No welfare awarded in ' + year }}</h3>
        <p>{{ isSelf ? 'Record a contribution to add the first one.' : 'Award welfare to add the first one.' }}</p>
        <button class="ds-btn ds-btn--primary ds-btn--sm" type="button" @click="openDialog(isSelf ? 'paid' : 'awarded')">
          {{ isSelf ? 'Record welfare' : 'Award welfare' }}
        </button>
      </div>
    </div>

    <!-- Record / award dialog -->
    <div v-if="isDialogOpen" class="ds-overlay" @click.self="closeDialog">
      <div class="ds-modal" role="dialog" aria-modal="true" aria-labelledby="welfareDialogTitle">
        <div class="ds-modal__head">
          <div>
            <h2 id="welfareDialogTitle" class="ds-h3">
              {{ dialogMode === 'paid' ? 'Record welfare paid' : 'Award welfare' }}
            </h2>
            <p>
              {{ dialogMode === 'paid'
                ? member.name + ' paid this welfare contribution.'
                : 'The church is awarding support to ' + member.name + '.' }}
            </p>
          </div>
        </div>

        <div class="ds-modal__body">
          <div class="ds-field" :class="{ 'is-invalid': showErrors && !isAmountValid }">
            <label class="ds-label" for="welfareAmount">Amount (GHS)</label>
            <input
              id="welfareAmount"
              ref="amount"
              v-model="amount"
              class="ds-input ds-input--amount"
              type="text"
              inputmode="decimal"
              placeholder="0.00"
            >
            <span v-if="showErrors && !isAmountValid" class="ds-error">Enter an amount greater than zero.</span>
          </div>

          <div class="ds-field">
            <label class="ds-label" for="welfareDialogYear">Year</label>
            <select id="welfareDialogYear" v-model="year" class="ds-select">
              <option v-for="value in generateArrayOfYears()" :key="value" :value="String(value)">{{ value }}</option>
            </select>
          </div>

          <div
            v-if="dialogMode === 'awarded'"
            class="ds-field"
            :class="{ 'is-invalid': showErrors && !description }"
            style="margin-bottom:0"
          >
            <label class="ds-label" for="welfareDescription">Reason for the award</label>
            <textarea id="welfareDescription" v-model="description" class="ds-textarea" rows="3"></textarea>
            <span v-if="showErrors && !description" class="ds-error">Say why the church is awarding this.</span>
          </div>
        </div>

        <div class="ds-modal__foot">
          <button class="ds-btn ds-btn--ghost" type="button" @click="closeDialog">Cancel</button>
          <button class="ds-btn ds-btn--primary" type="button" :disabled="isSaving" @click="recordWelfare">
            <span v-if="isSaving" class="ds-btn__spinner"></span>
            {{ isSaving ? 'Saving' : (dialogMode === 'paid' ? 'Record welfare' : 'Award welfare') }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      :busy="isDeleting"
      title="Delete this welfare record?"
      message="The amount will be removed from this member's welfare totals. This cannot be undone."
      confirm-label="Delete record"
      @cancel="confirmOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script>
import { ChurchMember, WelfareList, WelfareTotals } from '../../../../network/Member'
import { mapGetters } from 'vuex'
import { numberWithCommas } from '../../../../resources/constants'
import ConfirmDialog from '../../../../components/ConfirmDialog'

const date = new Date()

export default {
  name: 'member-welfare',
  components: { ConfirmDialog },
  data () {
    return {
      id: '',
      amount: '',
      year: date.getFullYear() + '',
      description: '',
      // The dialog's mode is held separately from the list filter. They shared
      // one pair of flags before, so opening "Award welfare" silently switched
      // the list underneath without refetching it.
      dialogMode: 'paid',
      isDialogOpen: false,
      showErrors: false,
      isSaving: false,
      isDeleting: false,
      confirmOpen: false,
      pendingDelete: null,
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
    },
    isAmountValid () {
      return parseFloat(this.amount) > 0
    }
  },
  mounted () {
    this.id = this.$route.params.id
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
    generateArrayOfYears () {
      const max = new Date().getFullYear()
      const min = max - 12
      const years = []
      for (let i = max; i >= min; i--) {
        years.push(i)
      }
      return years
    },
    onYearChange () {
      this.getWelfares()
      this.getWelfareTotals()
    },
    openDialog (mode) {
      this.dialogMode = mode
      this.amount = ''
      this.description = ''
      this.showErrors = false
      this.isDialogOpen = true
      this.$nextTick(() => this.$refs.amount && this.$refs.amount.focus())
    },
    closeDialog () {
      this.isDialogOpen = false
    },
    isWelfareSelected (type) {
      this.isSelf = type
      this.isChurch = !type
      this.getWelfares()
    },
    askDelete (item) {
      this.pendingDelete = item
      this.confirmOpen = true
    },
    confirmDelete () {
      if (!this.pendingDelete) { return }
      this.isDeleting = true

      this.$axios.delete(`welfaretransactions/${this.pendingDelete.id}`).then(() => {
        this.isDeleting = false
        this.confirmOpen = false
        this.pendingDelete = null
        this.$toast.success('Welfare record deleted')
        this.getWelfares()
        this.getWelfareTotals()
      }).catch(error => {
        this.isDeleting = false
        this.confirmOpen = false
        this.$toast.error(this.errorMessage(error, 'Could not delete this record. Nothing was changed.'))
      })
    },
    errorMessage (error, fallback) {
      return error && error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : fallback
    },
    recordWelfare () {
      const isAward = this.dialogMode === 'awarded'

      if (!this.isAmountValid || (isAward && !this.description)) {
        this.showErrors = true
        return
      }
      this.showErrors = false

      const requestBody = {
        userId: this.id,
        transactionAmount: parseFloat(this.amount),
        year: this.year + '',
        isWelfarePaidBySelf: !isAward,
        isWelfarePaidByChurch: isAward,
        description: this.description
      }

      this.isSaving = true
      this.$axios.post('welfaretransactions', requestBody).then(() => {
        this.$toast.success(isAward ? 'Welfare awarded' : 'Welfare recorded')
        this.isSaving = false
        this.isDialogOpen = false
        this.amount = ''
        this.description = ''
        this.getWelfares()
        this.getWelfareTotals()
      }).catch(error => {
        // Previously reported through $toast.success, so failures looked like successes.
        this.$toast.error(this.errorMessage(error, 'Could not save this welfare record.'))
        this.isSaving = false
      })
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
          this.welfare = Object.assign({}, WelfareList, { data: { results: [] } })
          this.isWelfareLoading = false
        })
    }
  }
}
</script>
