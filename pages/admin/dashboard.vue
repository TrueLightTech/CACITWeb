<template>
  <main class="dashboard-page">
    <section class="dashboard-shell">
      <section class="dashboard-hero">
        <div class="hero-copy">
          <span class="dashboard-kicker">{{ dashboardRoleLabel }}</span>
          <h1>{{ dashboardTitle }}</h1>
          <p>{{ dashboardSubtitle }}</p>
        </div>

        <NuxtLink v-if="hasPrimaryAction" :to="primaryActionPath" class="primary-action">
          {{ primaryActionLabel }}
        </NuxtLink>
      </section>

      <section v-if="isManager" class="metrics-grid" aria-label="Dashboard totals">
        <article class="metric-card metric-card-featured">
          <div class="metric-topline">
            <span>Total today</span>
            <span class="metric-currency">GHS</span>
          </div>
          <strong v-if="!isAccountingLoading" class="metric-value">{{ formatMoney(accountTotals.total) }}</strong>
          <span v-else class="metric-loading"></span>
          <p>All money received across offerings and tithes.</p>
        </article>

        <article class="metric-card">
          <div class="metric-topline">
            <span>Offering</span>
            <span class="metric-currency">GHS</span>
          </div>
          <strong v-if="!isAccountingLoading" class="metric-value">{{ formatMoney(accountTotals.offeringSum) }}</strong>
          <span v-else class="metric-loading"></span>
          <p>Total offering received today.</p>
        </article>

        <article class="metric-card">
          <div class="metric-topline">
            <span>Tithe</span>
            <span class="metric-currency">GHS</span>
          </div>
          <strong v-if="!isAccountingLoading" class="metric-value">{{ formatMoney(accountTotals.titheSum) }}</strong>
          <span v-else class="metric-loading"></span>
          <p>Total tithe received today.</p>
        </article>

        <article class="metric-card">
          <div class="metric-topline">
            <span>Open issues</span>
            <span class="metric-status">Needs care</span>
          </div>
          <strong v-if="!isIssueLoading" class="metric-value">{{ unResolvedIssuesCount }}</strong>
          <span v-else class="metric-loading"></span>
          <p>Unresolved items awaiting follow up.</p>
        </article>

        <article class="metric-card metric-card-wide">
          <div class="metric-topline metric-topline-spread">
            <span>Members</span>
            <div class="dropdown family-filter">
              <button
                class="family-filter-button dropdown-toggle"
                type="button"
                id="familyFilter"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {{ selectedFamilyName }}
              </button>
              <ul v-if="!isChurchFamiliesLoading" class="dropdown-menu dropdown-menu-end" aria-labelledby="familyFilter">
                <li>
                  <button class="dropdown-item" type="button" @click="getMembersCount('')">
                    All families
                  </button>
                </li>
                <li v-for="family in families.data" :key="family.id">
                  <button class="dropdown-item" type="button" @click="getMembersCount(family)">
                    {{ family.name }}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <strong v-if="!isMembersLoading" class="metric-value">{{ totalMembersCount }}</strong>
          <span v-else class="metric-loading"></span>
          <p>Members in {{ selectedFamilyName === 'All' ? 'all church families' : selectedFamilyName }}.</p>
        </article>
      </section>

      <section v-else-if="isFamilyManager" class="metrics-grid family-manager-grid" aria-label="Family dashboard totals">
        <article class="metric-card metric-card-featured">
          <div class="metric-topline">
            <span>Family tithe</span>
            <span class="metric-currency">GHS</span>
          </div>
          <strong v-if="!isAccountingLoading" class="metric-value">{{ formatMoney(accountTotals.titheSum) }}</strong>
          <span v-else class="metric-loading"></span>
          <p>Total tithe received from your family group.</p>
        </article>

        <article class="metric-card">
          <div class="metric-topline">
            <span>Members</span>
            <span class="metric-status">Family group</span>
          </div>
          <strong v-if="!isMembersLoading" class="metric-value">{{ totalMembersCount }}</strong>
          <span v-else class="metric-loading"></span>
          <p>People currently assigned to your church family.</p>
        </article>
      </section>

      <section class="announcements-panel">
        <div class="section-heading">
          <div>
            <span class="section-kicker">{{ totalCount }} total</span>
            <h2>Announcements</h2>
          </div>
          <NuxtLink v-if="isManager" to="/admin/announcements" class="secondary-action">
            Manage
          </NuxtLink>
        </div>

        <page-loader v-if="isLoading" class="panel-loader"></page-loader>

        <div v-else-if="hasAnnouncements" class="announcement-list">
          <article
            v-for="(announcement, index) in announcementItems"
            :key="announcement.id || index"
            class="announcement-item"
          >
            <img :src="getImage(announcement.image)" :alt="announcement.title" class="announcement-image">

            <div class="announcement-copy">
              <h3>{{ announcement.title }}</h3>
              <time :datetime="announcement.createdAt">
                {{ $moment(announcement.createdAt).format('Do MMMM, YYYY') }}
              </time>
              <p>{{ truncateMessage(announcement.body) }}</p>
            </div>

            <NuxtLink :to="'/admin/announcements/' + announcement.id" class="announcement-link">
              View
            </NuxtLink>
          </article>
        </div>

        <div v-else class="empty-state">
          <h3>No announcements yet</h3>
          <p>New church updates will appear here when they are published.</p>
        </div>

        <nav v-if="numberOfPages > 1" class="premium-pagination" aria-label="Announcement pages">
          <button
            type="button"
            :disabled="currentPage <= 1"
            @click="goToAnnouncementPage(currentPage - 1)"
          >
            Previous
          </button>
          <span>Page {{ currentPage }} of {{ numberOfPages }}</span>
          <button
            type="button"
            :disabled="currentPage >= numberOfPages"
            @click="goToAnnouncementPage(currentPage + 1)"
          >
            Next
          </button>
        </nav>
      </section>
    </section>
  </main>
</template>

<script>

import {mapGetters} from 'vuex'
import {AnnouncementList} from "../../network/Announcement";
import {numberWithCommas, profileImageBaseUrl} from "../../resources/constants";
import {ChurchFamilyList, DashboardAccountingTotal} from "../../network/Member";
import PageLoader from "../../components/PageLoader";


export default {
  name: "dashboard",
  components: {PageLoader},
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
    currentRoleId() {
      return this.loggedInUser && this.loggedInUser.data ? this.loggedInUser.data.roleId : ''
    },
    dashboardUserName() {
      return this.loggedInUser && this.loggedInUser.data && this.loggedInUser.data.name
        ? this.loggedInUser.data.name
        : 'there'
    },
    isManager() {
      return this.currentRoleId === '1'
    },
    isFamilyManager() {
      return this.currentRoleId === '2'
    },
    dashboardRoleLabel() {
      if (this.isManager) {
        return 'Church manager'
      }
      if (this.isFamilyManager) {
        return 'Family group manager'
      }
      return 'Member dashboard'
    },
    dashboardTitle() {
      if (this.isManager) {
        return 'Financial overview'
      }
      return `Welcome back, ${this.dashboardUserName}`
    },
    dashboardSubtitle() {
      if (this.isManager) {
        return "Today's giving, membership, and updates in one calm view."
      }
      if (this.isFamilyManager) {
        return 'Your family records, tithe summary, and announcements are ready.'
      }
      return 'Your church updates are ready.'
    },
    primaryActionPath() {
      return this.isManager ? '/admin/accounting' : '/admin/records'
    },
    primaryActionLabel() {
      return this.isManager ? 'Open accounting' : 'Open records'
    },
    hasPrimaryAction() {
      return this.isManager || this.isFamilyManager
    },
    announcementItems() {
      return this.announcements && this.announcements.results ? this.announcements.results : []
    },
    hasAnnouncements() {
      return this.announcementItems.length > 0
    }
  },
  beforeMount() {
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
  data() {
    return {
      user: JSON.parse(window.localStorage.getItem('auth.user')),
      unResolvedIssuesCount: 0,
      selectedFamilyName: 'All',
      families: ChurchFamilyList,
      numberOfPages: 0,
      currentPage: 0,
      totalCount: 0,
      totalMembersCount: 0,
      searchQuery: '',
      isLoading: false,
      isIssueLoading: false,
      isAccountingLoading: false,
      isChurchFamiliesLoading: false,
      isMembersLoading: false,
      announcements: AnnouncementList,
      accountTotals: DashboardAccountingTotal
    }
  },
  methods: {
    formatMoney(value) {
      return numberWithCommas(Number(value || 0))
    },
    getMembersCount(family = "") {
      let famId = ""
      if (this.isFamilyManager) {
        famId = this.loggedInUser.data.churchFamilyId
      }

      if (family && family.id) {
        famId = family.id
        this.selectedFamilyName = family.name
      } else {
        this.selectedFamilyName = "All"
      }
      this.isMembersLoading = true
      this.$axios.get(`accounting/users?FamilyId=${famId}`).then(response => {
        this.totalMembersCount = response.data.data.totalCount
        this.isMembersLoading = false
      }).catch(error => {
        this.isMembersLoading = false
      })
    },
    fetchFamilies() {
      this.isChurchFamiliesLoading = true
      this.$axios.get(`churchfamilies`).then(response => {
        this.families = Object.assign(ChurchFamilyList, response.data)
        this.isChurchFamiliesLoading = false
      }).catch(error => {
        this.isChurchFamiliesLoading = false
      })
    },
    getUnresolvedIssuesCount() {
      this.isIssueLoading = true
      this.$axios.get(`accounting/issues?IsResolved=false`).then(response => {
        this.unResolvedIssuesCount = response.data.data.totalCount
        this.isIssueLoading = false
      }).catch(error => {
        this.isIssueLoading = false
      })
    },
    getAccounting() {
      this.isAccountingLoading = true
      this.$axios.get(`accounting/total`).then(response => {
        this.accountTotals = Object.assign(DashboardAccountingTotal, response.data.data)

        this.isAccountingLoading = false
      }).catch(error => {
        this.isAccountingLoading = false
      })
    },
    getAccountingForFamilyManager() {
      this.isAccountingLoading = true
      this.$axios.get(`accounting/tithe-total?ChurchFamilyId=${this.loggedInUser.data.churchFamilyId}`).then(response => {
        this.accountTotals = Object.assign(DashboardAccountingTotal, response.data.data)

        this.isAccountingLoading = false
      }).catch(error => {
        this.isAccountingLoading = false
      })
    },
    fetchAnnouncement(page = 1, pageSize = 5) {
      this.currentPage = page
      this.isLoading = true

      this.$axios.get(`announcements?Page=${page}&PageSize=${pageSize}`).then(response => {
        this.announcements = Object.assign(AnnouncementList, response.data.data)
        this.numberOfPages = this.announcements.totalPages
        this.totalCount = this.announcements.totalCount

        this.isLoading = false
      }).catch(error => {
        this.isLoading = false
      })
    },
    goToAnnouncementPage(page) {
      if (page < 1 || page > this.numberOfPages || page === this.currentPage) {
        return
      }
      this.fetchAnnouncement(page)
    },
    truncateMessage(message) {
      if (!message) {
        return ''
      }

      if (message.length >= 96) {
        return message.toString().substring(0, 96) + " ..."
      }
      return message
    },
    getImage(image) {
      if (image) {
        return `${profileImageBaseUrl}/${image}`
      }
      return require(`~/assets/imgs/no_image.png`)
    }
  },
  mounted() {
  }
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(20, 110, 253, 0.08), transparent 32rem),
    linear-gradient(180deg, #f7f9fc 0%, #ffffff 46%, #f8fafc 100%);
  color: #172033;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  padding: 104px 20px 56px;
}

.dashboard-shell {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.dashboard-hero,
.announcements-panel {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(222, 229, 241, 0.92);
  border-radius: 24px;
  box-shadow: 0 18px 52px rgba(29, 45, 78, 0.08);
}

.dashboard-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
  overflow: hidden;
  padding: 30px;
  position: relative;
}

.dashboard-hero::after {
  background: linear-gradient(135deg, rgba(20, 110, 253, 0.12), rgba(70, 190, 145, 0.1));
  border-radius: 999px;
  content: "";
  height: 210px;
  position: absolute;
  right: -92px;
  top: -120px;
  width: 210px;
}

.hero-copy {
  position: relative;
  z-index: 1;
}

.dashboard-kicker,
.section-kicker {
  color: #62718a;
  display: block;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0;
  margin-bottom: 9px;
  text-transform: uppercase;
}

.dashboard-hero h1,
.section-heading h2 {
  color: #101828;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.08;
  margin: 0;
}

.dashboard-hero h1 {
  font-size: clamp(2rem, 4vw, 3.3rem);
}

.dashboard-hero p {
  color: #69758a;
  font-size: 1rem;
  line-height: 1.7;
  margin: 13px 0 0;
  max-width: 560px;
}

.primary-action,
.secondary-action,
.announcement-link {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.92rem;
  font-weight: 700;
  justify-content: center;
  letter-spacing: 0;
  min-height: 44px;
  padding: 0 18px;
  position: relative;
  transition: background-color 220ms ease, border-color 220ms ease, color 220ms ease, transform 220ms ease;
  z-index: 1;
}

.primary-action {
  background: #146efd;
  color: #ffffff;
  min-width: 160px;
}

.primary-action:hover {
  background: #0758d8;
  color: #ffffff;
  transform: translateY(-1px);
}

.secondary-action,
.announcement-link {
  background: #f4f7fb;
  border: 1px solid #e3e9f2;
  color: #1f2a44;
}

.secondary-action:hover,
.announcement-link:hover {
  background: #eaf2ff;
  border-color: #cdddfa;
  color: #146efd;
}

.metrics-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin-bottom: 18px;
}

.family-manager-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.metric-card {
  background: #ffffff;
  border: 1px solid #e6ecf5;
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(29, 45, 78, 0.055);
  grid-column: span 2;
  min-height: 188px;
  padding: 22px;
  transition: border-color 220ms ease, transform 220ms ease, box-shadow 220ms ease;
}

.metric-card:hover {
  border-color: #cedbee;
  box-shadow: 0 18px 46px rgba(29, 45, 78, 0.09);
  transform: translateY(-2px);
}

.metric-card-featured,
.metric-card-wide {
  grid-column: span 3;
}

.metric-topline {
  align-items: center;
  color: #63718a;
  display: flex;
  font-size: 0.78rem;
  font-weight: 700;
  justify-content: space-between;
  letter-spacing: 0;
  margin-bottom: 18px;
  text-transform: uppercase;
}

.metric-topline-spread {
  align-items: flex-start;
  gap: 14px;
}

.metric-currency,
.metric-status {
  background: #f2f6fb;
  border-radius: 999px;
  color: #146efd;
  font-size: 0.7rem;
  padding: 6px 10px;
  text-transform: none;
}

.metric-value {
  color: #101828;
  display: block;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 750;
  letter-spacing: 0;
  line-height: 1;
  margin-bottom: 14px;
}

.metric-card p {
  color: #69758a;
  font-size: 0.92rem;
  line-height: 1.55;
  margin: 0;
}

.metric-loading {
  animation: pulse 1.4s ease-in-out infinite;
  background: linear-gradient(90deg, #eef2f7, #f8fafc, #eef2f7);
  background-size: 200% 100%;
  border-radius: 14px;
  display: block;
  height: 48px;
  margin-bottom: 18px;
  width: min(180px, 70%);
}

.family-filter {
  min-width: 150px;
  text-align: right;
}

.family-filter-button {
  background: #ffffff;
  border: 1px solid #dfe6f0;
  border-radius: 999px;
  color: #1f2a44;
  font-size: 0.82rem;
  font-weight: 700;
  max-width: 190px;
  min-height: 38px;
  overflow: hidden;
  padding: 0 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.family-filter-button:focus {
  border-color: #146efd;
  box-shadow: none;
  outline: none;
}

.dropdown-menu {
  border: 1px solid #e4ebf4;
  border-radius: 14px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
  padding: 8px;
}

.dropdown-item {
  border-radius: 10px;
  color: #27364f;
  font-size: 0.9rem;
  padding: 9px 12px;
}

.dropdown-item:active,
.dropdown-item:hover {
  background: #edf4ff;
  color: #146efd;
}

.announcements-panel {
  padding: 24px;
}

.section-heading {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.section-heading h2 {
  font-size: 1.35rem;
}

.announcement-list {
  display: grid;
  gap: 12px;
}

.announcement-item {
  align-items: center;
  background: #fbfcfe;
  border: 1px solid #edf1f7;
  border-radius: 18px;
  display: grid;
  gap: 16px;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  padding: 14px;
  transition: background-color 220ms ease, border-color 220ms ease, transform 220ms ease;
}

.announcement-item:hover {
  background: #ffffff;
  border-color: #dce7f7;
  transform: translateY(-1px);
}

.announcement-image {
  aspect-ratio: 1;
  background: #edf2f7;
  border-radius: 16px;
  height: 72px;
  object-fit: cover;
  width: 72px;
}

.announcement-copy {
  min-width: 0;
}

.announcement-copy h3 {
  color: #172033;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.3;
  margin: 0 0 5px;
  overflow-wrap: anywhere;
}

.announcement-copy time {
  color: #7a879a;
  display: block;
  font-size: 0.8rem;
  margin-bottom: 7px;
}

.announcement-copy p,
.empty-state p {
  color: #657187;
  font-size: 0.92rem;
  line-height: 1.55;
  margin: 0;
}

.empty-state {
  align-items: center;
  background: #fbfcfe;
  border: 1px dashed #d7e1ee;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 210px;
  padding: 28px;
  text-align: center;
}

.empty-state h3 {
  color: #172033;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0;
  margin: 0 0 8px;
}

.panel-loader {
  padding: 48px 0;
}

.premium-pagination {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 18px;
}

.premium-pagination button {
  background: #ffffff;
  border: 1px solid #dfe7f2;
  border-radius: 999px;
  color: #1f2a44;
  font-size: 0.88rem;
  font-weight: 700;
  min-height: 40px;
  padding: 0 15px;
  transition: background-color 220ms ease, border-color 220ms ease, color 220ms ease;
}

.premium-pagination button:hover:not(:disabled) {
  background: #edf4ff;
  border-color: #cadcf8;
  color: #146efd;
}

.premium-pagination button:disabled {
  color: #aab4c3;
  cursor: not-allowed;
}

.premium-pagination span {
  color: #6c788d;
  font-size: 0.88rem;
  font-weight: 600;
}

@keyframes pulse {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 991px) {
  .metrics-grid,
  .family-manager-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-card,
  .metric-card-featured,
  .metric-card-wide {
    grid-column: span 1;
  }
}

@media (max-width: 767px) {
  .dashboard-page {
    padding: 92px 14px 36px;
  }

  .dashboard-hero,
  .section-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .dashboard-hero {
    padding: 24px;
  }

  .primary-action,
  .secondary-action {
    width: 100%;
  }

  .metrics-grid,
  .family-manager-grid {
    grid-template-columns: 1fr;
  }

  .metric-card {
    min-height: 164px;
    padding: 20px;
  }

  .metric-topline-spread {
    align-items: stretch;
    flex-direction: column;
  }

  .family-filter,
  .family-filter-button {
    max-width: none;
    text-align: left;
    width: 100%;
  }

  .announcements-panel {
    padding: 18px;
  }

  .announcement-item {
    align-items: flex-start;
    grid-template-columns: 58px minmax(0, 1fr);
  }

  .announcement-image {
    border-radius: 14px;
    height: 58px;
    width: 58px;
  }

  .announcement-link {
    grid-column: 1 / -1;
    width: 100%;
  }

  .premium-pagination {
    align-items: stretch;
    flex-direction: column;
  }

  .premium-pagination span {
    order: -1;
    text-align: center;
  }
}
</style>
