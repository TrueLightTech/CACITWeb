<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <div class="ds-page-head__actions">
        <NuxtLink class="ds-btn ds-btn--primary" :to="`${basePath}/new`">
          <svg class="ds-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-linecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New {{ singular }}
        </NuxtLink>
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
            :aria-label="`Search ${pluralLower}`"
            :placeholder="searchPlaceholder"
            @input="onSearch"
          >
          <button v-if="query" class="ds-search__clear" type="button" aria-label="Clear search" @click="clearSearch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="ds-toolbar__right ct__filters">
          <div class="ds-segment">
            <button
              v-for="tab in statusTabs"
              :key="tab.value"
              class="ds-tab"
              :class="{ 'is-active': status === tab.value }"
              type="button"
              @click="setStatus(tab.value)"
            >
              {{ tab.label }}
            </button>
          </div>
          <span class="ds-toolbar__count">{{ countLabel }}</span>
        </div>
      </div>
    </div>

    <div class="ds-tablewrap">
      <!-- Loading -->
      <div v-if="isLoading" class="ds-tablescroll">
        <table class="ds-table">
          <thead>
            <tr>
              <th>{{ primaryHeading }}</th>
              <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
              <th>Status</th>
              <th class="ds-col-action">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in 5" :key="n">
              <td><span class="ds-skeleton" style="width:180px"></span></td>
              <td v-for="column in columns" :key="column.key"><span class="ds-skeleton" style="width:90px"></span></td>
              <td><span class="ds-skeleton ds-skeleton--pill" style="width:70px"></span></td>
              <td class="ds-col-action"><span class="ds-skeleton" style="width:28px;margin-left:auto"></span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Rows -->
      <div v-else-if="rows.length" class="ds-tablescroll">
        <table class="ds-table ds-table--cards">
          <thead>
            <tr>
              <th>{{ primaryHeading }}</th>
              <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
              <th>Status</th>
              <th class="ds-col-action">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td :data-label="primaryHeading">
                <NuxtLink class="ct__primary" :to="`${basePath}/${row.id}/edit`">{{ primaryOf(row) }}</NuxtLink>
                <span v-if="row.isPinned" class="ds-badge ds-badge--info ct__pin">Pinned</span>
                <span v-if="secondaryOf(row)" class="ct__secondary">{{ secondaryOf(row) }}</span>
              </td>
              <td v-for="column in columns" :key="column.key" :data-label="column.label" class="ds-muted">
                {{ cellText(column, row) }}
              </td>
              <td data-label="Status">
                <span class="ds-badge" :class="statusBadge(row.status)">{{ statusLabel(row.status) }}</span>
                <span v-if="row.status === 'scheduled' && row.publishAt" class="ct__when">
                  {{ $moment(row.publishAt).format('D MMM, HH:mm') }}
                </span>
              </td>
              <td data-label="Actions" class="ds-col-action">
                <RowMenu :label="`Actions for ${primaryOf(row)}`">
                  <template #default="{ close }">
                    <NuxtLink class="ds-menu__item" :to="`${basePath}/${row.id}/edit`" @click.native="close()">
                      Edit {{ singular }}
                    </NuxtLink>
                    <button
                      v-if="row.status !== 'published'"
                      class="ds-menu__item"
                      type="button"
                      @click="publishNow(row); close()"
                    >
                      Publish now
                    </button>
                    <span class="ds-menu__sep"></span>
                    <button
                      class="ds-menu__item ds-menu__item--danger"
                      type="button"
                      @click="askArchive(row); close()"
                    >
                      Archive {{ singular }}
                    </button>
                  </template>
                </RowMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty -->
      <div v-else class="ds-empty">
        <span class="ds-empty__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </span>
        <h3 class="ds-h3">{{ emptyHeading }}</h3>
        <p>{{ emptyHint }}</p>
        <button v-if="isFiltered" class="ds-btn ds-btn--secondary ds-btn--sm" type="button" @click="resetFilters">
          Clear filters
        </button>
        <NuxtLink v-else class="ds-btn ds-btn--primary ds-btn--sm" :to="`${basePath}/new`">
          New {{ singular }}
        </NuxtLink>
      </div>
    </div>

    <div v-if="!isLoading && rows.length && paging.totalPages > 1" class="ds-card" style="margin-top:20px">
      <div class="ds-pagination" style="border-top:0">
        <span class="ds-pagination__summary">
          Page <b>{{ paging.page }}</b> of <b>{{ paging.totalPages }}</b>
        </span>
        <div class="ds-pagination__controls">
          <button class="ds-page" type="button" :disabled="paging.page <= 1" @click="load(paging.page - 1)">
            Previous
          </button>
          <button
            class="ds-page"
            type="button"
            :disabled="paging.page >= paging.totalPages"
            @click="load(paging.page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      :busy="isArchiving"
      :title="`Archive this ${singular}?`"
      :message="archiveMessage"
      :confirm-label="`Archive ${singular}`"
      @cancel="confirmOpen = false"
      @confirm="confirmArchive"
    />
  </div>
</template>

<script>
import RowMenu from './RowMenu'
import ConfirmDialog from './ConfirmDialog'
import { rowsOf, pagingOf, errorMessage, STATUS_LABELS, STATUS_BADGE } from '../network/MobileApp'

const SEARCH_DEBOUNCE_MS = 350

/**
 * The list screen for every content resource.
 *
 * Sermons, shorts, events and videos all list the same way — search, a status
 * filter, a status badge per row, publish and archive from a row menu — so the
 * screen exists once and is configured with columns rather than copied four
 * times. This is the same reasoning that turned four reference tables into
 * ReferenceTable.vue.
 */
export default {
  name: 'ContentTable',
  components: { RowMenu, ConfirmDialog },
  props: {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    singular: { type: String, required: true },
    plural: { type: String, required: true },
    /** Console route, e.g. /admin/app/sermons */
    basePath: { type: String, required: true },
    /** API route, e.g. admin/sermons */
    endpoint: { type: String, required: true },
    primaryHeading: { type: String, default: 'Title' },
    primary: { type: Function, default: row => row.title },
    secondary: { type: Function, default: null },
    /** [{ key, label, value(row) }] */
    columns: { type: Array, default: () => [] },
    searchPlaceholder: { type: String, default: 'Search' },
    emptyHint: { type: String, default: '' }
  },
  data () {
    return {
      rows: [],
      paging: { page: 1, totalPages: 0, totalCount: 0 },
      isLoading: false,
      isArchiving: false,
      confirmOpen: false,
      pendingArchive: null,
      query: '',
      status: '',
      searchTimer: null
    }
  },
  computed: {
    statusTabs () {
      return [
        { value: '', label: 'All' },
        { value: 'published', label: 'Live' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'draft', label: 'Drafts' },
        { value: 'archived', label: 'Archived' }
      ]
    },
    pluralLower () {
      return this.plural.toLowerCase()
    },
    isFiltered () {
      return this.query.trim().length > 0 || this.status !== ''
    },
    countLabel () {
      if (this.isLoading) { return 'Loading…' }
      const count = this.paging.totalCount
      return count === 1 ? `1 ${this.singular}` : `${count} ${this.pluralLower}`
    },
    emptyHeading () {
      if (this.query.trim()) { return `No ${this.pluralLower} match that search` }
      if (this.status) { return `No ${this.statusWord} ${this.pluralLower}` }
      return `No ${this.pluralLower} yet`
    },
    statusWord () {
      return (STATUS_LABELS[this.status] || '').toLowerCase()
    },
    archiveMessage () {
      const label = this.pendingArchive ? this.primaryOf(this.pendingArchive) : `This ${this.singular}`
      return `${label} stops appearing in the app. Nothing is deleted — you can find it under Archived.`
    }
  },
  beforeMount () {
    this.load(1)
  },
  beforeDestroy () {
    clearTimeout(this.searchTimer)
  },
  methods: {
    /**
     * A count of zero is a real answer and reads as "0", not as an em dash.
     * `value || '—'` treated it as missing, so every short showed no views
     * rather than none.
     */
    cellText (column, row) {
      const value = column.value(row)
      if (value === 0) { return '0' }
      return value === null || value === undefined || value === '' ? '—' : value
    },
    primaryOf (row) {
      return this.primary(row) || 'Untitled'
    },
    secondaryOf (row) {
      return this.secondary ? this.secondary(row) : ''
    },
    statusLabel (status) {
      return STATUS_LABELS[status] || 'Draft'
    },
    statusBadge (status) {
      return STATUS_BADGE[status] || 'ds-badge--neutral'
    },
    onSearch () {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => this.load(1), SEARCH_DEBOUNCE_MS)
    },
    clearSearch () {
      clearTimeout(this.searchTimer)
      this.query = ''
      this.load(1)
    },
    setStatus (value) {
      this.status = value
      this.load(1)
    },
    resetFilters () {
      this.query = ''
      this.status = ''
      this.load(1)
    },
    load (page = 1) {
      this.isLoading = true

      const params = { Page: page, PageSize: 20 }
      if (this.query.trim()) { params.Query = this.query.trim() }
      if (this.status) { params.Status = this.status }

      this.$axios.get(this.endpoint, { params }).then(response => {
        this.rows = rowsOf(response)
        this.paging = pagingOf(response, page)
        this.isLoading = false
      }).catch(error => {
        this.rows = []
        this.isLoading = false
        this.$toast.error(errorMessage(error, `Could not load ${this.pluralLower}.`))
      })
    },
    publishNow (row) {
      // Only the publishing state is sent.
      //
      // This used to post the row back through the update endpoint, which is
      // quietly destructive: a list row is a RESPONSE, and a response carries a
      // resolved media object where the request expects a media id — so
      // publishing a sermon from the list detached its recording. The dedicated
      // endpoint changes one field and leaves the rest alone.
      this.$axios.put(`${this.endpoint}/${row.id}/publish`, {
        status: 'published',
        publishAt: null
      }).then(() => {
        this.$toast.success(`${this.capitalise(this.singular)} published`)
        this.load(this.paging.page)
      }).catch(error => {
        this.$toast.error(errorMessage(error, `Could not publish this ${this.singular}.`))
      })
    },
    askArchive (row) {
      this.pendingArchive = row
      this.confirmOpen = true
    },
    confirmArchive () {
      if (!this.pendingArchive) { return }
      this.isArchiving = true

      this.$axios.delete(`${this.endpoint}/${this.pendingArchive.id}`).then(() => {
        this.isArchiving = false
        this.confirmOpen = false
        this.pendingArchive = null
        this.$toast.success(`${this.capitalise(this.singular)} archived`)
        this.load(this.paging.page)
      }).catch(error => {
        this.isArchiving = false
        this.confirmOpen = false
        this.$toast.error(errorMessage(error, `Could not archive this ${this.singular}.`))
      })
    },
    capitalise (value) {
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  }
}
</script>

<style scoped>
.ct__filters { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.ct__primary { font-weight: 500; color: inherit; text-decoration: none; }
.ct__primary:hover { text-decoration: underline; }
.ct__secondary { display: block; font-size: var(--ds-text-sm); color: var(--ds-text-muted); margin-top: 2px; }
.ct__pin { margin-left: 8px; vertical-align: middle; }
.ct__when { display: block; font-size: var(--ds-text-sm); color: var(--ds-text-muted); margin-top: 3px; }
</style>
