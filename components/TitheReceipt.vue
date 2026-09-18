<template>
  <div class="receipt-page">
    <div class="receipt-actions">
      <button class="ds-btn ds-btn--secondary ds-btn--sm" type="button" @click="print">
        <svg class="ds-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="6 9 6 2 18 2 18 9"/>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
        Print receipt
      </button>
    </div>

    <article class="receipt">
      <header class="receipt__head">
        <img src="~assets/imgs/caci_logo.png" alt="" class="receipt__logo">
        <div>
          <h1 class="receipt__church">CACI Taifa</h1>
          <p class="receipt__kind">Tithe receipt</p>
        </div>
      </header>

      <div v-if="pageRefresh" class="receipt__loading">
        <span class="ds-skeleton" style="height:14px;width:60%"></span>
        <span class="ds-skeleton" style="height:14px;width:45%"></span>
        <span class="ds-skeleton" style="height:14px;width:70%"></span>
      </div>

      <div v-else-if="error" class="receipt__error">
        <p class="receipt__error-msg">{{ error }}</p>
        <p class="receipt__note">
          If you opened this from a message sent by the church, please contact
          the church office and quote the link you received.
        </p>
      </div>

      <template v-else>
        <dl class="receipt__meta">
          <div>
            <dt>Receipt number</dt>
            <dd class="ds-num">{{ receipt.receiptNumber || '—' }}</dd>
          </div>
          <div>
            <dt>Member</dt>
            <dd>{{ receipt.memberName || '—' }}</dd>
          </div>
          <div>
            <dt>Church family</dt>
            <dd>{{ receipt.familyGroupName || '—' }}</dd>
          </div>
        </dl>

        <table class="receipt__table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Description</th>
              <th class="is-num">Amount (GHS)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(transaction, index) in transactions" :key="index">
              <td>{{ monthName }}</td>
              <td>{{ transaction.description || '—' }}</td>
              <td class="is-num">{{ formatMoney(transaction.amount) }}</td>
            </tr>
            <tr v-if="!transactions.length">
              <td colspan="3" class="receipt__empty">No transactions on this receipt.</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2">Total</td>
              <td class="is-num">{{ formatMoney(receipt.total) }}</td>
            </tr>
          </tfoot>
        </table>

        <footer class="receipt__foot">
          <div>
            <span class="receipt__label">Signed</span>
            <span class="receipt__signature">{{ receipt.signature || '—' }}</span>
          </div>
          <p class="receipt__note">Thank you for your faithfulness.</p>
        </footer>
      </template>
    </article>
  </div>
</template>

<script>
import { numberWithCommas } from '../resources/constants'

const MONTH_NAMES = {
  Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April',
  May: 'May', Jun: 'June', Jul: 'July', Aug: 'August',
  Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December'
}

const EMPTY_RECEIPT = {
  receiptNumber: '',
  memberNumber: '',
  memberName: '',
  familyGroupName: '',
  total: '',
  signature: '',
  paymentDate: '',
  month: '',
  transactions: []
}

/**
 * One receipt component.
 *
 * `/receipt` and `/receipt/:id` were near-identical copies of the same 170-line
 * page. Both now render this, and it carries a print stylesheet — a receipt is
 * a printable artifact, and previously printing it produced the app chrome.
 */
export default {
  name: 'TitheReceipt',
  data () {
    return {
      pageRefresh: false,
      error: '',
      receipt: Object.assign({}, EMPTY_RECEIPT)
    }
  },
  computed: {
    transactions () {
      return Array.isArray(this.receipt.transactions) ? this.receipt.transactions : []
    },
    monthName () {
      return MONTH_NAMES[this.receipt.month] || this.receipt.month || '—'
    }
  },
  beforeMount () {
    // The API mails/SMSes receipt links as `/receipt?id=<id>` (query), while the
    // app's own links use `/receipt/<id>` (route param). Accept both, or links
    // already sent to members render an empty receipt.
    this.getReceipt(this.$route.params.id || this.$route.query.id)
  },
  methods: {
    formatMoney (value) {
      return numberWithCommas(Number(value || 0))
    },
    print () {
      window.print()
    },
    getReceipt (id) {
      // Each failure below sets `error`. Failing silently renders an empty
      // receipt indistinguishable from a real one carrying no transactions,
      // which is how a missing id went unnoticed on links sent to members.
      if (!id) {
        this.error = 'This link is missing a receipt reference.'
        return
      }
      this.error = ''
      this.pageRefresh = true
      this.$axios.get(`tithes/receipt/${id}`).then(response => {
        const data = response.data && response.data.data
        if (data) {
          this.receipt = Object.assign({}, EMPTY_RECEIPT, data)
        } else {
          this.error = 'No receipt was found for this link.'
        }
        this.pageRefresh = false
      }).catch(error => {
        const status = error.response && error.response.status
        this.error = status === 404
          ? 'No receipt was found for this link.'
          : 'This receipt could not be loaded. Please check your connection and try again.'
        this.pageRefresh = false
      })
    }
  }
}
</script>

<style scoped>
.receipt-page {
  min-height: 100vh;
  background: var(--ds-bg);
  padding: 32px 16px 64px;
  font-family: var(--ds-font-sans);
  color: var(--ds-text);
}

.receipt-actions {
  width: min(620px, 100%);
  margin: 0 auto 16px;
  display: flex;
  justify-content: flex-end;
}

.receipt {
  width: min(620px, 100%);
  margin: 0 auto;
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  padding: 32px;
}

.receipt__head {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--ds-text);
  margin-bottom: 24px;
}

.receipt__logo { width: 52px; height: 52px; object-fit: contain; }
.receipt__church { font-size: var(--ds-text-xl); font-weight: 600; margin: 0; letter-spacing: -0.01em; }
.receipt__kind {
  margin: 2px 0 0;
  font-size: var(--ds-text-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ds-text-3);
}

.receipt__loading { display: grid; gap: 12px; }

.receipt__meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin: 0 0 24px;
}

.receipt__meta dt {
  font-size: var(--ds-text-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ds-text-3);
  margin-bottom: 4px;
}

.receipt__meta dd { margin: 0; font-size: var(--ds-text-base); font-weight: 500; overflow-wrap: anywhere; }

.receipt__table { width: 100%; border-collapse: collapse; font-size: var(--ds-text-base); }

.receipt__table th {
  text-align: left;
  padding: 8px 12px 8px 0;
  border-bottom: 1px solid var(--ds-border-strong);
  font-size: var(--ds-text-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ds-text-2);
}

.receipt__table td { padding: 10px 12px 10px 0; border-bottom: 1px solid var(--ds-border); }

.receipt__table .is-num {
  text-align: right;
  padding-right: 0;
  font-family: var(--ds-font-mono);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.receipt__table tfoot td {
  border-top: 2px solid var(--ds-border-strong);
  border-bottom: 0;
  font-weight: 600;
  padding-top: 12px;
}

.receipt__empty { color: var(--ds-text-3); text-align: center; padding: 20px 0; }

.receipt__error { padding: 24px 0; text-align: center; }
.receipt__error-msg { margin: 0 0 8px; font-size: var(--ds-text-base); font-weight: 500; }

.receipt__foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 32px;
}

.receipt__label {
  display: block;
  font-size: var(--ds-text-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ds-text-3);
  margin-bottom: 6px;
}

.receipt__signature {
  display: inline-block;
  min-width: 180px;
  border-bottom: 1px solid var(--ds-text);
  padding-bottom: 2px;
  font-weight: 500;
}

.receipt__note { margin: 0; font-size: var(--ds-text-sm); color: var(--ds-text-3); }

@media print {
  .receipt-page { background: #fff; padding: 0; min-height: 0; }
  .receipt-actions { display: none; }
  .receipt { border: 0; border-radius: 0; padding: 0; width: 100%; }
}
</style>
