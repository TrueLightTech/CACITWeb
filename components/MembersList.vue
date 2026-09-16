<template>
  <div>
    <div v-if="!embedded" class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Members</h1>
        <p>{{ summaryLine }}</p>
      </div>
      <div class="ds-page-head__actions">
        <NuxtLink class="ds-btn ds-btn--primary" to="/admin/members/new">
          <svg class="ds-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-linecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add member
        </NuxtLink>
      </div>
    </div>

    <div v-else class="ds-section__head">
      <h2 class="ds-h2">Members</h2>
      <NuxtLink class="ds-btn ds-btn--primary ds-btn--sm" to="/admin/members/new">Add member</NuxtLink>
    </div>

    <div class="ds-tablewrap">
      <!-- Toolbar stays mounted while results load, so the page keeps its shape -->
      <div class="ds-toolbar">
        <div class="ds-toolbar__search ds-search">
          <svg class="ds-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            class="ds-input"
            type="search"
            aria-label="Search members by name or phone number"
            placeholder="Search by name or phone number"
            @input="onSearchInput"
          >
          <button
            v-if="searchQuery"
            class="ds-search__clear"
            type="button"
            aria-label="Clear search"
            @click="clearSearch"
          >
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

      <!-- Error -->
      <div v-if="hasError" class="ds-errorstate">
        <span class="ds-errorstate__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </span>
        <h3 class="ds-h3">Could not load members</h3>
        <p>The church server did not respond. Nothing was changed.</p>
        <button class="ds-btn ds-btn--secondary ds-btn--sm" type="button" @click="retry">Try again</button>
      </div>

      <!-- Loading — skeleton rows keep the table's shape -->
      <div v-else-if="isLoading" class="ds-tablescroll">
        <table class="ds-table">
          <thead>
            <tr>
              <th>Name</th><th>Phone</th><th>Church family</th><th class="ds-col-action">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in 6" :key="row">
              <td>
                <div class="ds-table__person">
                  <span class="ds-skeleton ds-skeleton--avatar"></span>
                  <span class="ds-skeleton" :style="{ width: (90 + (row % 3) * 34) + 'px' }"></span>
                </div>
              </td>
              <td><span class="ds-skeleton" style="width:96px"></span></td>
              <td><span class="ds-skeleton ds-skeleton--pill"></span></td>
              <td class="ds-col-action"><span class="ds-skeleton" style="width:28px;margin-left:auto"></span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty -->
      <div v-else-if="!hasResults" class="ds-empty">
        <span class="ds-empty__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </span>
        <h3 class="ds-h3">{{ isSearching ? 'No members match that search' : 'No members yet' }}</h3>
        <p v-if="isSearching">Check the spelling, or search by phone number instead.</p>
        <p v-else>Members you add will appear here, with their church family and giving history.</p>
        <button v-if="isSearching" class="ds-btn ds-btn--secondary ds-btn--sm" type="button" @click="clearSearch">
          Clear search
        </button>
        <NuxtLink v-else class="ds-btn ds-btn--primary ds-btn--sm" to="/admin/members/new">Add member</NuxtLink>
      </div>

      <!-- Results -->
      <div v-else class="ds-tablescroll">
        <table class="ds-table ds-table--cards">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Church family</th>
              <th class="ds-col-action">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in members.results" :key="member.id">
              <td data-label="Name">
                <div class="ds-table__person">
                  <img :src="getProfileImage(member.profilePicture)" alt="" class="ds-table__avatar">
                  <NuxtLink class="ds-table__primary" :to="`/admin/members/${member.id}/view`">
                    {{ member.name }}
                  </NuxtLink>
                </div>
              </td>
              <td data-label="Phone" class="ds-muted">{{ member.phoneNumber || '—' }}</td>
              <td data-label="Church family">
                <span v-if="member.churchFamilyName" class="ds-badge ds-badge--neutral">
                  {{ member.churchFamilyName }}
                </span>
                <span v-else class="ds-meta">Not assigned</span>
              </td>
              <td data-label="Actions" class="ds-col-action">
                <RowMenu :label="`Actions for ${member.name}`">
                  <template #default="{ close }">
                    <NuxtLink class="ds-menu__item" :to="`/admin/members/${member.id}/view`" @click.native="close">
                      View details
                    </NuxtLink>
                    <NuxtLink class="ds-menu__item" :to="`/admin/members/${member.id}`" @click.native="close">
                      Edit member
                    </NuxtLink>
                    <NuxtLink class="ds-menu__item" :to="`/admin/members/${member.id}/tithe`" @click.native="close">
                      Record tithe
                    </NuxtLink>
                    <template v-if="isChurchManager">
                      <NuxtLink class="ds-menu__item" :to="`/admin/members/${member.id}/welfare`" @click.native="close">
                        Welfare
                      </NuxtLink>
                      <NuxtLink class="ds-menu__item" :to="`/admin/members/${member.id}/membership-form`" @click.native="close">
                        Membership form
                      </NuxtLink>
                      <NuxtLink class="ds-menu__item" :to="`/admin/members/${member.id}/role`" @click.native="close">
                        Assign role
                      </NuxtLink>
                      <span class="ds-menu__sep"></span>
                      <button
                        class="ds-menu__item ds-menu__item--danger"
                        type="button"
                        @click="askDelete(member); close()"
                      >
                        Delete member
                      </button>
                    </template>
                  </template>
                </RowMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination — bounds-checked, so Previous on page 1 cannot request Page=0 -->
      <div v-if="!isLoading && !hasError && hasResults && numberOfPages > 1" class="ds-pagination">
        <span class="ds-pagination__summary">
          Page <b>{{ currentPage }}</b> of <b>{{ numberOfPages }}</b>
        </span>
        <div class="ds-pagination__controls">
          <button class="ds-page" type="button" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
            Previous
          </button>
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
          <button
            class="ds-page"
            type="button"
            :disabled="currentPage >= numberOfPages"
            @click="goToPage(currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      :busy="isDeleting"
      title="Delete this member?"
      :message="confirmMessage"
      confirm-label="Delete member"
      @cancel="confirmOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { MemberList } from '../network/Member'
import { profileImageBaseUrl } from '../resources/constants'
import { ROLE_CHURCH_MANAGER, ROLE_FAMILY_MANAGER } from '../resources/navigation'
import RowMenu from './RowMenu'
import ConfirmDialog from './ConfirmDialog'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 350

export default {
  name: 'MembersList',
  components: { RowMenu, ConfirmDialog },
  props: {
    // Set when the list is rendered inside the Manage tabs rather than on its
    // own page, so the page-level header is not duplicated.
    embedded: { type: Boolean, default: false },
    // Manage only mounts its tabs once, so it tells the list when it becomes
    // visible. Preserved from the component this replaces.
    isActive: { type: Boolean, default: false }
  },
  data () {
    return {
      members: MemberList,
      numberOfPages: 0,
      currentPage: 1,
      totalCount: 0,
      searchQuery: '',
      isLoading: false,
      isDeleting: false,
      hasError: false,
      confirmOpen: false,
      pendingDelete: null,
      searchTimer: null
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
    currentUser () {
      return this.loggedInUser && this.loggedInUser.data ? this.loggedInUser.data : {}
    },
    isChurchManager () {
      return this.currentUser.roleId === ROLE_CHURCH_MANAGER
    },
    isFamilyManager () {
      return this.currentUser.roleId === ROLE_FAMILY_MANAGER
    },
    hasResults () {
      return !!(this.members && this.members.results && this.members.results.length)
    },
    isSearching () {
      return this.searchQuery.trim().length > 0
    },
    countLabel () {
      if (this.isLoading) { return 'Loading…' }
      if (this.hasError) { return '' }
      if (this.totalCount === 1) { return '1 member' }
      return `${this.totalCount} members`
    },
    summaryLine () {
      if (this.isFamilyManager) {
        return 'Everyone assigned to your church family.'
      }
      return 'Everyone on the church register.'
    },
    confirmMessage () {
      const name = this.pendingDelete ? this.pendingDelete.name : 'this member'
      return `${name} will be removed from the register. Their giving history stays in accounting reports. This cannot be undone.`
    },
    /** Truncated page list — never renders every page number. */
    visiblePages () {
      const total = this.numberOfPages
      const current = this.currentPage
      const pages = []
      const push = number => pages.push({ key: `p${number}`, number: number, gap: false })
      const gap = key => pages.push({ key: key, number: 0, gap: true })

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
  watch: {
    isActive (isVisible) {
      if (isVisible) {
        this.fetchMembers(this.currentPage)
      }
    }
  },
  beforeMount () {
    this.fetchMembers()
  },
  beforeDestroy () {
    clearTimeout(this.searchTimer)
  },
  methods: {
    getProfileImage (image) {
      if (image) {
        return `${profileImageBaseUrl}/${image}`
      }
      return require('~/assets/imgs/user.svg')
    },

    onSearchInput () {
      // Debounced: the list this replaces fired a request on every keystroke.
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

    retry () {
      this.load()
    },

    goToPage (page) {
      if (page < 1 || page > this.numberOfPages || page === this.currentPage) {
        return
      }
      this.fetchMembers(page)
    },

    load () {
      if (this.isSearching) {
        this.searchMembers()
      } else {
        this.fetchMembers(this.currentPage)
      }
    },

    applyResponse (response) {
      this.members = Object.assign({}, MemberList, response.data.data)
      this.numberOfPages = this.members.totalPages || 0
      this.totalCount = this.members.totalCount || 0
    },

    fetchMembers (page = 1, pageSize = PAGE_SIZE) {
      this.currentPage = page
      this.isLoading = true
      this.hasError = false

      // Family managers see only their own church family — unchanged.
      let familyFilter = ''
      if (this.currentUser.roleId === ROLE_FAMILY_MANAGER) {
        familyFilter = `&FamilyId=${this.currentUser.churchFamilyId}`
      }

      this.$axios.get(`churchmembers?Page=${page}&PageSize=${pageSize}${familyFilter}`)
        .then(response => {
          this.applyResponse(response)
          this.isLoading = false
        })
        .catch(() => {
          this.isLoading = false
          this.hasError = true
        })
    },

    searchMembers () {
      const query = this.searchQuery.trim()

      // Numeric input is treated as a phone number — unchanged.
      const filterBy = isNaN(query) ? `Name=${encodeURIComponent(query)}` : `Number=${encodeURIComponent(query)}`

      this.isLoading = true
      this.hasError = false

      this.$axios.get(`churchmembers?${filterBy}&Page=1&PageSize=${PAGE_SIZE}`)
        .then(response => {
          this.applyResponse(response)
          this.currentPage = 1
          this.isLoading = false
        })
        .catch(() => {
          this.isLoading = false
          this.hasError = true
        })
    },

    askDelete (member) {
      this.pendingDelete = member
      this.confirmOpen = true
    },

    confirmDelete () {
      if (!this.pendingDelete) { return }
      this.isDeleting = true

      // The delete endpoint is keyed by phone number, not id — unchanged.
      this.$axios.delete(`churchmembers/${this.pendingDelete.phoneNumber}`)
        .then(() => {
          this.isDeleting = false
          this.confirmOpen = false
          this.pendingDelete = null
          this.$toast.success('Member deleted')
          this.load()
        })
        .catch(error => {
          this.isDeleting = false
          this.confirmOpen = false
          const message = error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : 'Could not delete this member. Nothing was changed.'
          this.$toast.error(message)
        })
    }
  }
}
</script>
