<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <span class="ds-eyebrow">{{ dashboardRoleLabel }}</span>
        <h1 class="ds-h1" style="margin-top:6px">{{ dashboardTitle }}</h1>
        <p>{{ dashboardSubtitle }}</p>
      </div>
      <div v-if="hasPrimaryAction" class="ds-page-head__actions">
        <NuxtLink :to="primaryActionPath" class="ds-btn ds-btn--primary">
          {{ primaryActionLabel }}
        </NuxtLink>
      </div>
    </div>

    <!-- Manager totals -->
    <section v-if="isManager" class="ds-section" aria-label="Today's totals">
      <div class="ds-section__head">
        <h2 class="ds-h2">Today</h2>
        <span class="ds-meta">{{ todayLabel }}</span>
      </div>

      <div class="ds-metrics">
        <NuxtLink class="ds-metric" to="/admin/accounting">
          <span class="ds-metric__label"><span class="ds-eyebrow">Total received</span></span>
          <strong v-if="!isAccountingLoading" class="ds-metric__value">
            <small>GHS</small>{{ formatMoney(accountTotals.total) }}
          </strong>
          <span v-else class="ds-skeleton" style="height:28px;width:70%"></span>
          <span class="ds-metric__foot">Offerings and tithes together</span>
        </NuxtLink>

        <NuxtLink class="ds-metric" to="/admin/offering">
          <span class="ds-metric__label"><span class="ds-eyebrow">Offering</span></span>
          <strong v-if="!isAccountingLoading" class="ds-metric__value">
            <small>GHS</small>{{ formatMoney(accountTotals.offeringSum) }}
          </strong>
          <span v-else class="ds-skeleton" style="height:28px;width:70%"></span>
          <span class="ds-metric__foot">Received today</span>
        </NuxtLink>

        <NuxtLink class="ds-metric" to="/admin/accounting">
          <span class="ds-metric__label"><span class="ds-eyebrow">Tithe</span></span>
          <strong v-if="!isAccountingLoading" class="ds-metric__value">
            <small>GHS</small>{{ formatMoney(accountTotals.titheSum) }}
          </strong>
          <span v-else class="ds-skeleton" style="height:28px;width:70%"></span>
          <span class="ds-metric__foot">Received today</span>
        </NuxtLink>

        <NuxtLink class="ds-metric" to="/admin/manage">
          <span class="ds-metric__label">
            <span class="ds-eyebrow">Open issues</span>
            <span v-if="!isIssueLoading && unResolvedIssuesCount > 0" class="ds-badge ds-badge--warning">
              Needs attention
            </span>
          </span>
          <strong v-if="!isIssueLoading" class="ds-metric__value">{{ unResolvedIssuesCount }}</strong>
          <span v-else class="ds-skeleton" style="height:28px;width:40%"></span>
          <span class="ds-metric__foot">Reported by members, not yet resolved</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Manager membership -->
    <section v-if="isManager" class="ds-section" aria-label="Membership">
      <div class="ds-section__head">
        <h2 class="ds-h2">Membership</h2>
        <NuxtLink to="/admin/members" class="ds-btn ds-btn--secondary ds-btn--sm">View members</NuxtLink>
      </div>

      <div class="ds-card">
        <div class="ds-card__body" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px">
          <div>
            <span class="ds-eyebrow">Members</span>
            <strong v-if="!isMembersLoading" class="ds-metric__value" style="display:block;margin-top:8px">
              {{ totalMembersCount }}
            </strong>
            <span v-else class="ds-skeleton" style="height:28px;width:120px;display:block;margin-top:8px"></span>
            <p class="ds-muted" style="margin:8px 0 0;font-size:var(--ds-text-sm)">
              {{ selectedFamilyName === 'All' ? 'Across all church families' : 'In ' + selectedFamilyName }}
            </p>
          </div>

          <div class="ds-field" style="margin-bottom:0;min-width:200px">
            <label class="ds-label" for="familyFilter">Church family</label>
            <select
              id="familyFilter"
              class="ds-select"
              :disabled="isChurchFamiliesLoading"
              @change="onFamilyChange($event)"
            >
              <option value="">All families</option>
              <option v-for="family in familyOptions" :key="family.id" :value="family.id">
                {{ family.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Family manager totals -->
    <section v-else-if="isFamilyManager" class="ds-section" aria-label="Your family group">
      <div class="ds-section__head">
        <h2 class="ds-h2">Your church family</h2>
        <NuxtLink to="/admin/records" class="ds-btn ds-btn--secondary ds-btn--sm">View tithe records</NuxtLink>
      </div>

      <div class="ds-metrics">
        <NuxtLink class="ds-metric" to="/admin/records">
          <span class="ds-metric__label"><span class="ds-eyebrow">Family tithe</span></span>
          <strong v-if="!isAccountingLoading" class="ds-metric__value">
            <small>GHS</small>{{ formatMoney(accountTotals.titheSum) }}
          </strong>
          <span v-else class="ds-skeleton" style="height:28px;width:70%"></span>
          <span class="ds-metric__foot">Total received from your family group</span>
        </NuxtLink>

        <NuxtLink class="ds-metric" to="/admin/members">
          <span class="ds-metric__label"><span class="ds-eyebrow">Members</span></span>
          <strong v-if="!isMembersLoading" class="ds-metric__value">{{ totalMembersCount }}</strong>
          <span v-else class="ds-skeleton" style="height:28px;width:40%"></span>
          <span class="ds-metric__foot">Assigned to your church family</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Member quick links -->
    <section v-else class="ds-section" aria-label="Your records">
      <div class="ds-section__head">
        <h2 class="ds-h2">Your records</h2>
      </div>
      <div class="ds-metrics">
        <NuxtLink class="ds-metric" to="/admin/tithe">
          <span class="ds-metric__label"><span class="ds-eyebrow">My tithe</span></span>
          <strong class="ds-metric__value" style="font-size:var(--ds-text-lg)">View by month</strong>
          <span class="ds-metric__foot">What you have given, week by week</span>
        </NuxtLink>
        <NuxtLink class="ds-metric" to="/admin/welfare">
          <span class="ds-metric__label"><span class="ds-eyebrow">My welfare</span></span>
          <strong class="ds-metric__value" style="font-size:var(--ds-text-lg)">View by year</strong>
          <span class="ds-metric__foot">What you have paid and been awarded</span>
        </NuxtLink>
        <NuxtLink class="ds-metric" to="/admin/report">
          <span class="ds-metric__label"><span class="ds-eyebrow">Need help?</span></span>
          <strong class="ds-metric__value" style="font-size:var(--ds-text-lg)">Report an issue</strong>
          <span class="ds-metric__foot">Send a message to the church office</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Announcements -->
    <section class="ds-section" aria-label="Announcements">
      <div class="ds-section__head">
        <div>
          <h2 class="ds-h2">Announcements</h2>
          <span v-if="!isLoading && totalCount" class="ds-meta">{{ totalCount }} in total</span>
        </div>
        <NuxtLink v-if="isManager" to="/admin/announcements" class="ds-btn ds-btn--secondary ds-btn--sm">
          Manage
        </NuxtLink>
      </div>

      <div class="ds-card">
        <div v-if="isLoading" class="ds-card__body" style="display:grid;gap:14px">
          <div v-for="n in 3" :key="n" style="display:grid;grid-template-columns:56px 1fr;gap:14px;align-items:center">
            <span class="ds-skeleton" style="height:56px;width:56px;border-radius:6px"></span>
            <div style="display:grid;gap:8px">
              <span class="ds-skeleton" style="height:14px;width:45%"></span>
              <span class="ds-skeleton" style="height:12px;width:80%"></span>
            </div>
          </div>
        </div>

        <ul v-else-if="hasAnnouncements" class="announcement-list">
          <li
            v-for="(announcement, index) in announcementItems"
            :key="announcement.id || index"
            class="announcement-item"
          >
            <img :src="getImage(announcement.image)" alt="" class="announcement-item__image">

            <div class="announcement-item__copy">
              <h3 class="ds-h3">{{ announcement.title }}</h3>
              <time class="ds-meta" :datetime="announcement.createdAt">
                {{ $moment(announcement.createdAt).format('D MMMM YYYY') }}
              </time>
              <p class="ds-muted">{{ truncateMessage(announcement.body) }}</p>
            </div>

            <NuxtLink :to="'/admin/announcements/' + announcement.id" class="ds-btn ds-btn--secondary ds-btn--sm">
              Read
            </NuxtLink>
          </li>
        </ul>

        <div v-else class="ds-empty">
          <span class="ds-empty__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </span>
          <h3 class="ds-h3">No announcements yet</h3>
          <p>Church updates will appear here once they are published.</p>
          <NuxtLink v-if="isManager" to="/admin/announcements/new" class="ds-btn ds-btn--primary ds-btn--sm">
            Add announcement
          </NuxtLink>
        </div>

        <div v-if="!isLoading && numberOfPages > 1" class="ds-pagination">
          <span class="ds-pagination__summary">Page <b>{{ currentPage }}</b> of <b>{{ numberOfPages }}</b></span>
          <div class="ds-pagination__controls">
            <button class="ds-page" type="button" :disabled="currentPage <= 1" @click="goToAnnouncementPage(currentPage - 1)">
              Previous
            </button>
            <button class="ds-page" type="button" :disabled="currentPage >= numberOfPages" @click="goToAnnouncementPage(currentPage + 1)">
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { AnnouncementList } from '../../network/Announcement'
import { numberWithCommas, profileImageBaseUrl } from '../../resources/constants'
import { ChurchFamilyList, DashboardAccountingTotal } from '../../network/Member'
import { ROLE_CHURCH_MANAGER, ROLE_FAMILY_MANAGER } from '../../resources/navigation'

export default {
  name: 'dashboard',
  data () {
    return {
      unResolvedIssuesCount: 0,
      selectedFamilyName: 'All',
      families: ChurchFamilyList,
      numberOfPages: 0,
      currentPage: 0,
      totalCount: 0,
      totalMembersCount: 0,
      isLoading: false,
      isIssueLoading: false,
      isAccountingLoading: false,
      isChurchFamiliesLoading: false,
      isMembersLoading: false,
      announcements: AnnouncementList,
      accountTotals: DashboardAccountingTotal
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
    currentUser () {
      return this.loggedInUser && this.loggedInUser.data ? this.loggedInUser.data : {}
    },
    currentRoleId () {
      return this.currentUser.roleId || ''
    },
    dashboardUserName () {
      return this.currentUser.name || 'there'
    },
    isManager () {
      return this.currentRoleId === ROLE_CHURCH_MANAGER
    },
    isFamilyManager () {
      return this.currentRoleId === ROLE_FAMILY_MANAGER
    },
    /** The totals below are for today only — say so rather than leaving it implicit. */
    todayLabel () {
      return this.$moment().format('dddd, D MMMM YYYY')
    },
    dashboardRoleLabel () {
      if (this.isManager) { return 'Church manager' }
      if (this.isFamilyManager) { return 'Family group manager' }
      return 'Member'
    },
    dashboardTitle () {
      if (this.isManager) { return 'Financial overview' }
      return `Welcome back, ${this.dashboardUserName}`
    },
    dashboardSubtitle () {
      if (this.isManager) {
        return "Today's giving, membership and church updates in one view."
      }
      if (this.isFamilyManager) {
        return 'Your family records, tithe summary and announcements.'
      }
      return 'Your giving records and church updates.'
    },
    primaryActionPath () {
      return this.isManager ? '/admin/accounting' : '/admin/records'
    },
    primaryActionLabel () {
      return this.isManager ? 'Open accounting' : 'Open records'
    },
    hasPrimaryAction () {
      return this.isManager || this.isFamilyManager
    },
    familyOptions () {
      return this.families && this.families.data ? this.families.data : []
    },
    announcementItems () {
      return this.announcements && this.announcements.results ? this.announcements.results : []
    },
    hasAnnouncements () {
      return this.announcementItems.length > 0
    }
  },
  beforeMount () {
    this.fetchAnnouncement()

    if (this.isManager) {
      this.getUnresolvedIssuesCount()
      this.fetchFamilies()
      this.getMembersCount()
      this.getAccounting()
    } else if (this.isFamilyManager) {
      this.getMembersCount()
      this.getAccountingForFamilyManager()
    }
  },
  methods: {
    formatMoney (value) {
      return numberWithCommas(Number(value || 0))
    },
    onFamilyChange (event) {
      const id = event.target.value
      if (!id) {
        this.getMembersCount('')
        return
      }
      const match = this.familyOptions.filter(family => family.id === id)
      this.getMembersCount(match.length ? match[0] : '')
    },
    getMembersCount (family = '') {
      let famId = ''
      if (this.isFamilyManager) {
        famId = this.currentUser.churchFamilyId
      }

      if (family && family.id) {
        famId = family.id
        this.selectedFamilyName = family.name
      } else {
        this.selectedFamilyName = 'All'
      }

      this.isMembersLoading = true
      this.$axios.get(`accounting/users?FamilyId=${famId}`).then(response => {
        this.totalMembersCount = response.data.data.totalCount
        this.isMembersLoading = false
      }).catch(() => {
        this.isMembersLoading = false
      })
    },
    fetchFamilies () {
      this.isChurchFamiliesLoading = true
      this.$axios.get('churchfamilies').then(response => {
        this.families = Object.assign({}, ChurchFamilyList, response.data)
        this.isChurchFamiliesLoading = false
      }).catch(() => {
        this.isChurchFamiliesLoading = false
      })
    },
    getUnresolvedIssuesCount () {
      this.isIssueLoading = true
      this.$axios.get('accounting/issues?IsResolved=false').then(response => {
        this.unResolvedIssuesCount = response.data.data.totalCount
        this.isIssueLoading = false
      }).catch(() => {
        this.isIssueLoading = false
      })
    },
    getAccounting () {
      this.isAccountingLoading = true
      this.$axios.get('accounting/total').then(response => {
        this.accountTotals = Object.assign({}, DashboardAccountingTotal, response.data.data)
        this.isAccountingLoading = false
      }).catch(() => {
        this.isAccountingLoading = false
      })
    },
    getAccountingForFamilyManager () {
      this.isAccountingLoading = true
      this.$axios.get(`accounting/tithe-total?ChurchFamilyId=${this.currentUser.churchFamilyId}`).then(response => {
        this.accountTotals = Object.assign({}, DashboardAccountingTotal, response.data.data)
        this.isAccountingLoading = false
      }).catch(() => {
        this.isAccountingLoading = false
      })
    },
    fetchAnnouncement (page = 1, pageSize = 5) {
      this.currentPage = page
      this.isLoading = true

      this.$axios.get(`announcements?Page=${page}&PageSize=${pageSize}`).then(response => {
        this.announcements = Object.assign({}, AnnouncementList, response.data.data)
        this.numberOfPages = this.announcements.totalPages
        this.totalCount = this.announcements.totalCount
        this.isLoading = false
      }).catch(() => {
        this.isLoading = false
      })
    },
    goToAnnouncementPage (page) {
      if (page < 1 || page > this.numberOfPages || page === this.currentPage) {
        return
      }
      this.fetchAnnouncement(page)
    },
    truncateMessage (message) {
      if (!message) {
        return ''
      }
      if (message.length >= 96) {
        return message.toString().substring(0, 96) + ' …'
      }
      return message
    },
    getImage (image) {
      if (image) {
        return `${profileImageBaseUrl}/${image}`
      }
      return require('~/assets/imgs/no_image.png')
    }
  }
}
</script>

<style scoped>
.announcement-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.announcement-item {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--ds-border);
}

.announcement-item:last-child { border-bottom: 0; }
.announcement-item:hover { background: var(--ds-surface-2); }

.announcement-item__image {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  object-fit: cover;
  background: var(--ds-surface-2);
  border: 1px solid var(--ds-border);
}

.announcement-item__copy { min-width: 0; }
.announcement-item__copy h3 { margin: 0 0 2px; overflow-wrap: anywhere; }
.announcement-item__copy time { display: block; margin-bottom: 6px; }
.announcement-item__copy p {
  margin: 0;
  font-size: var(--ds-text-base);
  overflow-wrap: anywhere;
}

@media (max-width: 640px) {
  .announcement-item {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .announcement-item__image { width: 100%; height: 140px; }
}
</style>
