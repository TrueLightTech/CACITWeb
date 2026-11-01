<template>
  <div class="ds-card">
    <div class="ds-card__head top__head">
      <div v-if="allowOffering" class="ds-segment" role="group" aria-label="What to rank">
        <button type="button" :class="{ 'is-active': kind === 'tithe' }" @click="setKind('tithe')">Tithe</button>
        <button type="button" :class="{ 'is-active': kind === 'offering' }" @click="setKind('offering')">Offering</button>
      </div>
      <span v-else class="ds-eyebrow">Tithe</span>

      <select v-model="year" class="ds-select top__year" aria-label="Period" @change="load">
        <option v-for="option in yearOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <div v-if="loading" class="ds-card__body" style="display:grid;gap:12px">
      <span v-for="n in 5" :key="n" class="ds-skeleton" style="height:18px;width:100%"></span>
    </div>

    <p v-else-if="error" class="ds-card__body ds-error">{{ error }}</p>

    <div v-else-if="!rows.length" class="ds-empty">
      <h3 class="ds-h3">No {{ kind }} recorded {{ periodLabel }}</h3>
      <p>Members appear here once their {{ kind }} is recorded against their name.</p>
    </div>

    <ol v-else class="top__list">
      <li v-for="row in rows" :key="row.userId" class="top__row">
        <span class="top__rank" :class="{ 'is-podium': row.rank <= 3 }">{{ row.rank }}</span>
        <span class="top__who">
          <NuxtLink :to="`/admin/members/${row.userId}/view`" class="top__name">{{ row.name || 'A member' }}</NuxtLink>
          <span class="ds-meta">
            {{ row.familyName || 'No family' }} · {{ row.count }} {{ row.count === 1 ? 'record' : 'records' }}
          </span>
        </span>
        <span class="top__amount">
          <small>GHS</small>{{ formatMoney(row.total) }}
        </span>
      </li>
    </ol>
  </div>
</template>

<script>
import { payload, errorMessage } from '../network/MobileApp'
import { numberWithCommas } from '../resources/constants'

/**
 * The members who have given the most, for the dashboard.
 *
 * The API scopes a family manager to their own family whatever is asked, so
 * this only has to decide whether to offer the offering ranking — family
 * managers do not see offerings anywhere else either.
 */
export default {
  name: 'TopContributors',
  props: {
    allowOffering: { type: Boolean, default: false },
    limit: { type: Number, default: 10 }
  },
  data () {
    const thisYear = new Date().getFullYear()
    return {
      kind: 'tithe',
      year: String(thisYear),
      rows: [],
      loading: true,
      error: '',
      yearOptions: [
        { value: String(thisYear), label: `This year (${thisYear})` },
        { value: String(thisYear - 1), label: `Last year (${thisYear - 1})` },
        { value: 'all', label: 'All time' }
      ]
    }
  },
  computed: {
    periodLabel () {
      return this.year === 'all' ? 'yet' : `in ${this.year}`
    }
  },
  beforeMount () {
    this.load()
  },
  methods: {
    formatMoney (value) {
      return numberWithCommas(Number(value || 0))
    },
    setKind (kind) {
      if (kind === this.kind) { return }
      this.kind = kind
      this.load()
    },
    load () {
      this.loading = true
      this.error = ''

      this.$axios.get('accounting/top-contributors', {
        params: { Kind: this.kind, Year: this.year, Limit: this.limit }
      }).then(response => {
        this.rows = payload(response) || []
        this.loading = false
      }).catch(error => {
        this.loading = false
        this.error = errorMessage(error, 'Could not load top contributors.')
      })
    }
  }
}
</script>

<style scoped>
.top__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.top__year { width: auto; min-width: 170px; }

.top__list { list-style: none; margin: 0; padding: 0; }

.top__row {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--ds-border);
}

.top__row:last-child { border-bottom: 0; }

.top__rank {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--ds-radius-full);
  background: var(--ds-surface-2);
  color: var(--ds-text-2);
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-weight-semibold);
}

.top__rank.is-podium { background: var(--ds-navy-soft); color: var(--ds-navy); }

.top__who { display: grid; gap: 2px; min-width: 0; }

.top__name {
  color: var(--ds-text);
  font-weight: var(--ds-weight-medium);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top__name:hover { text-decoration: underline; }

.top__amount {
  font-variant-numeric: tabular-nums;
  font-weight: var(--ds-weight-semibold);
  color: var(--ds-text);
  white-space: nowrap;
}

.top__amount small { color: var(--ds-text-3); font-weight: var(--ds-weight-normal); margin-right: 4px; }
</style>
