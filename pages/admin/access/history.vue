<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Access history</h1>
        <p>Every role change, grant, block and revoke, newest first, with who made it and why.</p>
      </div>
    </div>

    <div class="ds-tablewrap">
      <div v-if="error" class="ds-errorstate">
        <h3 class="ds-h3">Could not load the history</h3>
        <p>{{ error }}</p>
        <button class="ds-btn ds-btn--secondary ds-btn--sm" type="button" @click="load(paging.page)">Try again</button>
      </div>

      <div v-else-if="isLoading" class="ds-tablescroll">
        <table class="ds-table">
          <tbody>
            <tr v-for="row in 8" :key="row">
              <td><span class="ds-skeleton" style="width:110px"></span></td>
              <td><span class="ds-skeleton" style="width:120px"></span></td>
              <td><span class="ds-skeleton" :style="{ width: (180 + (row % 3) * 40) + 'px' }"></span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="!rows.length" class="ds-empty">
        <h3 class="ds-h3">No changes yet</h3>
        <p>Changes to anyone's access will be listed here.</p>
      </div>

      <div v-else class="ds-tablescroll">
        <table class="ds-table ds-table--cards">
          <thead>
            <tr>
              <th>When</th>
              <th>By</th>
              <th>What changed</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in rows" :key="entry.id">
              <td data-label="When" class="ds-muted">{{ fmtDateTime(entry.createdAt) }}</td>
              <td data-label="By">{{ entry.actorName || '—' }}</td>
              <td data-label="What changed">{{ entry.summary }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!isLoading && !error && paging.totalPages > 1" class="ds-pagination">
        <span class="ds-pagination__summary">Page <b>{{ paging.page }}</b> of <b>{{ paging.totalPages }}</b></span>
        <div class="ds-pagination__controls">
          <button class="ds-page" type="button" :disabled="paging.page <= 1" @click="load(paging.page - 1)">Previous</button>
          <button class="ds-page" type="button" :disabled="paging.page >= paging.totalPages" @click="load(paging.page + 1)">
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { rowsOf, pagingOf, errorMessage } from '../../../network/MobileApp'

const PAGE_SIZE = 25

/** The access audit log, church-wide. One person's is on their own page. */
export default {
  name: 'access-history',
  data () {
    return {
      rows: [],
      paging: { page: 1, totalPages: 0, totalCount: 0 },
      isLoading: false,
      error: ''
    }
  },
  beforeMount () {
    this.load(1)
  },
  methods: {
    fmtDateTime (value) {
      return value ? this.$moment(value).format('D MMM YYYY, HH:mm') : '—'
    },
    load (page) {
      this.isLoading = true
      this.error = ''
      this.$axios.get('admin/access/history', { params: { page, pageSize: PAGE_SIZE } }).then(response => {
        this.rows = rowsOf(response)
        this.paging = pagingOf(response, page)
        this.isLoading = false
      }).catch(error => {
        this.isLoading = false
        this.error = errorMessage(error, 'The church server did not respond.')
      })
    }
  }
}
</script>
