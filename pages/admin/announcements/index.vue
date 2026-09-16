<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Announcements</h1>
        <p>Church updates published to every member's dashboard.</p>
      </div>
      <div v-if="isChurchManager" class="ds-page-head__actions">
        <NuxtLink class="ds-btn ds-btn--primary" to="/admin/announcements/new">
          <svg class="ds-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-linecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New announcement
        </NuxtLink>
      </div>
    </div>

    <div class="ds-card" style="margin-bottom:24px">
      <div class="ds-toolbar" style="border-bottom:0">
        <div class="ds-toolbar__search ds-search">
          <svg class="ds-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            class="ds-input"
            type="search"
            aria-label="Search announcements by title"
            placeholder="Search by title"
            @input="onSearchInput"
          >
          <button v-if="searchQuery" class="ds-search__clear" type="button" aria-label="Clear search" @click="clearSearch">
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

    <!-- Loading -->
    <div v-if="isLoading" class="announcement-grid">
      <div v-for="n in 6" :key="n" class="ds-card">
        <span class="ds-skeleton" style="height:170px;border-radius:6px 6px 0 0;display:block"></span>
        <div class="ds-card__body" style="display:grid;gap:10px">
          <span class="ds-skeleton" style="height:16px;width:65%"></span>
          <span class="ds-skeleton" style="height:12px;width:40%"></span>
          <span class="ds-skeleton" style="height:12px"></span>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-else-if="rows.length" class="announcement-grid">
      <article v-for="(announcement, index) in rows" :key="announcement.id || index" class="ds-card announcement">
        <img :src="getAnnouncementImage(announcement.image)" alt="" class="announcement__image">
        <div class="ds-card__body announcement__body">
          <h2 class="ds-h3">{{ announcement.title }}</h2>
          <div class="announcement__meta">
            <span v-if="announcement.isPinned" class="ds-badge ds-badge--info">Pinned</span>
            <span
              v-if="announcement.status && announcement.status !== 'published'"
              class="ds-badge"
              :class="statusBadge(announcement.status)"
            >{{ statusLabel(announcement.status) }}</span>
            <time class="ds-meta" :datetime="announcement.createdAt">
              {{ $moment(announcement.createdAt).format('D MMMM YYYY') }}
            </time>
          </div>
          <p class="ds-muted announcement__excerpt">{{ truncateMessage(announcement.body) }}</p>
          <NuxtLink :to="'/admin/announcements/' + announcement.id" class="ds-btn ds-btn--secondary ds-btn--sm">
            Read announcement
          </NuxtLink>
        </div>
      </article>
    </div>

    <!-- Empty -->
    <div v-else class="ds-tablewrap">
      <div class="ds-empty">
        <span class="ds-empty__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </span>
        <h3 class="ds-h3">{{ isSearching ? 'No announcements match that search' : 'No announcements yet' }}</h3>
        <p v-if="isSearching">Check the spelling, or clear the search.</p>
        <p v-else>Announcements you publish appear here and on every member's dashboard.</p>
        <button v-if="isSearching" class="ds-btn ds-btn--secondary ds-btn--sm" type="button" @click="clearSearch">
          Clear search
        </button>
        <NuxtLink v-else-if="isChurchManager" class="ds-btn ds-btn--primary ds-btn--sm" to="/admin/announcements/new">
          New announcement
        </NuxtLink>
      </div>
    </div>

    <div v-if="!isLoading && rows.length && numberOfPages > 1" class="ds-card" style="margin-top:24px">
      <div class="ds-pagination" style="border-top:0">
        <span class="ds-pagination__summary">Page <b>{{ currentPage }}</b> of <b>{{ numberOfPages }}</b></span>
        <div class="ds-pagination__controls">
          <button class="ds-page" type="button" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">Previous</button>
          <button
            v-for="page in visiblePages"
            :key="page.key"
            class="ds-page"
            :class="{ 'is-active': page.number === currentPage, 'ds-page--gap': page.gap }"
            type="button"
            :disabled="page.gap"
            @click="!page.gap && goToPage(page.number)"
          >
            {{ page.gap ? '…' : page.number }}
          </button>
          <button class="ds-page" type="button" :disabled="currentPage >= numberOfPages" @click="goToPage(currentPage + 1)">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { profileImageBaseUrl } from '../../../resources/constants'
import { AnnouncementList } from '../../../network/Announcement'
import { ROLE_CHURCH_MANAGER } from '../../../resources/navigation'
import { STATUS_LABELS, STATUS_BADGE } from '../../../network/MobileApp'

const PAGE_SIZE = 9
const SEARCH_DEBOUNCE_MS = 350

export default {
  name: 'announcements',
  data () {
    return {
      numberOfPages: 0,
      currentPage: 1,
      totalCount: 0,
      searchQuery: '',
      searchTimer: null,
      isLoading: false,
      announcements: AnnouncementList
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
    isChurchManager () {
      return this.loggedInUser && this.loggedInUser.data &&
        this.loggedInUser.data.roleId === ROLE_CHURCH_MANAGER
    },
    rows () {
      return this.announcements && Array.isArray(this.announcements.results)
        ? this.announcements.results
        : []
    },
    isSearching () {
      return this.searchQuery.trim().length > 0
    },
    countLabel () {
      if (this.isLoading) { return 'Loading…' }
      return this.totalCount === 1 ? '1 announcement' : `${this.totalCount} announcements`
    },
    visiblePages () {
      const total = this.numberOfPages
      const current = this.currentPage
      const pages = []
      const push = n => pages.push({ key: `p${n}`, number: n, gap: false })
      const gap = k => pages.push({ key: k, number: 0, gap: true })

      if (total <= 7) {
        for (let i = 1; i <= total; i++) { push(i) }
        return pages
      }
      push(1)
      if (current > 3) { gap('start') }
      const from = Math.max(2, current - 1)
      const to = Math.min(total - 1, current + 1)
      for (let i = from; i <= to; i++) { push(i) }
      if (current < total - 2) { gap('end') }
      push(total)
      return pages
    }
  },
  beforeMount () {
    this.fetchAnnouncement()
  },
  beforeDestroy () {
    clearTimeout(this.searchTimer)
  },
  methods: {
    statusLabel (status) {
      return STATUS_LABELS[status] || ''
    },
    statusBadge (status) {
      return STATUS_BADGE[status] || 'ds-badge--neutral'
    },
    onSearchInput () {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.currentPage = 1
        this.load()
      }, SEARCH_DEBOUNCE_MS)
    },
    clearSearch () {
      clearTimeout(this.searchTimer)
      this.searchQuery = ''
      this.currentPage = 1
      this.load()
    },
    load () {
      if (this.isSearching) {
        this.searchByTitle()
      } else {
        this.fetchAnnouncement(this.currentPage)
      }
    },
    goToPage (page) {
      if (page < 1 || page > this.numberOfPages || page === this.currentPage) { return }
      this.fetchAnnouncement(page)
    },
    applyResponse (response) {
      this.announcements = Object.assign({}, AnnouncementList, response.data.data)
      this.numberOfPages = this.announcements.totalPages || 0
      this.totalCount = this.announcements.totalCount || 0
    },
    searchByTitle () {
      this.isLoading = true
      this.$axios.get(`admin/announcements?Title=${encodeURIComponent(this.searchQuery.trim())}&Page=1&PageSize=${PAGE_SIZE}`)
        .then(response => {
          this.applyResponse(response)
          this.currentPage = 1
          this.isLoading = false
        }).catch(() => {
          this.isLoading = false
        })
    },
    fetchAnnouncement (page = 1, pageSize = PAGE_SIZE) {
      this.currentPage = page
      this.isLoading = true

      this.$axios.get(`admin/announcements?Page=${page}&PageSize=${pageSize}`).then(response => {
        this.applyResponse(response)
        this.isLoading = false
      }).catch(() => {
        this.isLoading = false
      })
    },
    truncateMessage (message) {
      if (!message) { return '' }
      if (message.length >= 110) {
        return message.toString().substring(0, 110) + ' …'
      }
      return message
    },
    getAnnouncementImage (image) {
      if (image) {
        return `${profileImageBaseUrl}/${image}`
      }
      return require('~/assets/imgs/no_image.png')
    }
  }
}
</script>

<style scoped>
.announcement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.announcement { display: flex; flex-direction: column; overflow: hidden; }

.announcement__image {
  width: 100%;
  height: 170px;
  object-fit: cover;
  background: var(--ds-surface-2);
  border-bottom: 1px solid var(--ds-border);
}

.announcement__body { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.announcement__body h2 { margin: 0; overflow-wrap: anywhere; }
.announcement__meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.announcement__excerpt { margin: 4px 0 12px; font-size: var(--ds-text-base); overflow-wrap: anywhere; }
.announcement__body .ds-btn { margin-top: auto; align-self: flex-start; }
</style>
