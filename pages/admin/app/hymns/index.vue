<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Hymnal (Dwom)</h1>
        <p>Served from here, not bundled with the app — a correction reaches members without an app release.</p>
      </div>
      <div class="ds-page-head__actions">
        <NuxtLink class="ds-btn ds-btn--primary" to="/admin/app/hymns/new">Add hymn</NuxtLink>
      </div>
    </div>

    <div class="ds-card" style="margin-bottom:20px">
      <div class="ds-toolbar" style="border-bottom:0">
        <div class="ds-toolbar__search ds-search">
          <svg class="ds-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="query"
            class="ds-input"
            type="search"
            aria-label="Search hymns by number, title or a line"
            placeholder="Hymn number, title, or a line from a verse"
            @input="onSearch"
          >
          <button v-if="query" class="ds-search__clear" type="button" aria-label="Clear search" @click="clearSearch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="ds-toolbar__right">
          <span class="ds-toolbar__count">{{ countLabel }}</span>
        </div>
      </div>
    </div>

    <div class="ds-tablewrap">
      <div v-if="isLoading" class="ds-tablescroll">
        <table class="ds-table">
          <thead><tr><th>No.</th><th>Title</th><th>Category</th><th>Verses</th><th class="ds-col-action">Actions</th></tr></thead>
          <tbody>
            <tr v-for="n in 8" :key="n">
              <td><span class="ds-skeleton" style="width:30px"></span></td>
              <td><span class="ds-skeleton" style="width:220px"></span></td>
              <td><span class="ds-skeleton" style="width:90px"></span></td>
              <td><span class="ds-skeleton" style="width:40px"></span></td>
              <td class="ds-col-action"><span class="ds-skeleton" style="width:28px;margin-left:auto"></span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="hymns.length" class="ds-tablescroll">
        <table class="ds-table ds-table--cards">
          <thead>
            <tr><th>No.</th><th>Title</th><th>Category</th><th>Verses</th><th class="ds-col-action">Actions</th></tr>
          </thead>
          <tbody>
            <tr v-for="hymn in hymns" :key="hymn.id">
              <td data-label="No." class="ds-num" style="font-weight:600">{{ hymn.number }}</td>
              <td data-label="Title">
                <NuxtLink class="hy__title" :to="`/admin/app/hymns/${hymn.id}/edit`">{{ hymn.title }}</NuxtLink>
                <span v-if="hymn.titleEn" class="hy__en">{{ hymn.titleEn }}</span>
              </td>
              <td data-label="Category" class="ds-muted">{{ hymn.category || '—' }}</td>
              <td data-label="Verses" class="ds-muted ds-num">
                {{ (hymn.verses || []).length }}<span v-if="hymn.chorus"> + chorus</span>
              </td>
              <td data-label="Actions" class="ds-col-action">
                <NuxtLink class="ds-btn ds-btn--secondary ds-btn--sm" :to="`/admin/app/hymns/${hymn.id}/edit`">
                  Correct
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="ds-empty">
        <h3 class="ds-h3">{{ query ? 'No hymns match that' : 'The hymnal is empty' }}</h3>
        <p v-if="query">Try the hymn number, or a different line.</p>
        <p v-else>
          Add hymns here and the app downloads the whole hymnal on first open, so it works
          in a hall with no signal.
        </p>
      </div>
    </div>

    <div v-if="!isLoading && paging.totalPages > 1" class="ds-card" style="margin-top:20px">
      <div class="ds-pagination" style="border-top:0">
        <span class="ds-pagination__summary">Page <b>{{ paging.page }}</b> of <b>{{ paging.totalPages }}</b></span>
        <div class="ds-pagination__controls">
          <button class="ds-page" type="button" :disabled="paging.page <= 1" @click="load(paging.page - 1)">Previous</button>
          <button class="ds-page" type="button" :disabled="paging.page >= paging.totalPages" @click="load(paging.page + 1)">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { rowsOf, pagingOf, errorMessage } from '../../../../network/MobileApp'

const SEARCH_DEBOUNCE_MS = 350

export default {
  name: 'AdminAppHymns',
  data () {
    return {
      hymns: [],
      paging: { page: 1, totalPages: 0, totalCount: 0 },
      isLoading: false,
      query: '',
      searchTimer: null
    }
  },
  computed: {
    countLabel () {
      if (this.isLoading) { return 'Loading…' }
      const count = this.paging.totalCount
      return count === 1 ? '1 hymn' : `${count} hymns`
    }
  },
  beforeMount () {
    this.load(1)
  },
  beforeDestroy () {
    clearTimeout(this.searchTimer)
  },
  methods: {
    onSearch () {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => this.load(1), SEARCH_DEBOUNCE_MS)
    },
    clearSearch () {
      clearTimeout(this.searchTimer)
      this.query = ''
      this.load(1)
    },
    load (page = 1) {
      this.isLoading = true

      const params = { Page: page, PageSize: 25 }
      if (this.query.trim()) { params.Query = this.query.trim() }

      this.$axios.get('hymns', { params }).then(response => {
        this.hymns = rowsOf(response)
        this.paging = pagingOf(response, page)
        this.isLoading = false
      }).catch(error => {
        this.hymns = []
        this.isLoading = false
        this.$toast.error(errorMessage(error, 'Could not load the hymnal.'))
      })
    }
  }
}
</script>

<style scoped>
.hy__title { font-weight: 500; color: inherit; text-decoration: none; overflow-wrap: anywhere; }
.hy__title:hover { text-decoration: underline; }
.hy__en { display: block; font-size: var(--ds-text-sm); color: var(--ds-text-muted); margin-top: 2px; }
</style>
