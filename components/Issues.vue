<template>
  <div>
    <div class="ds-section__head">
      <div>
        <h2 class="ds-h2">Reported issues</h2>
        <p class="ds-muted" style="margin:4px 0 0;font-size:var(--ds-text-sm)">
          Messages sent to the church office from the app and the website.
        </p>
      </div>

      <div class="ds-segment" role="tablist">
        <button
          type="button"
          role="tab"
          :class="{ 'is-active': !isResolved }"
          :aria-selected="!isResolved ? 'true' : 'false'"
          @click="selectFilter(false)"
        >
          Unresolved
        </button>
        <button
          type="button"
          role="tab"
          :class="{ 'is-active': isResolved }"
          :aria-selected="isResolved ? 'true' : 'false'"
          @click="selectFilter(true)"
        >
          Resolved
        </button>
      </div>
    </div>

    <div class="ds-tablewrap">
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
            aria-label="Search issues by name"
            placeholder="Search by name"
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
          <span class="ds-toolbar__count">
            {{ isLoading ? 'Loading…' : rows.length + (rows.length === 1 ? ' issue' : ' issues') }}
          </span>
        </div>
      </div>

      <div v-if="isLoading" class="ds-tablescroll">
        <table class="ds-table">
          <thead><tr><th>From</th><th>Issue</th><th>Status</th><th class="ds-col-action">Actions</th></tr></thead>
          <tbody>
            <tr v-for="n in 4" :key="n">
              <td><span class="ds-skeleton" style="width:120px"></span></td>
              <td><span class="ds-skeleton" style="width:80%"></span></td>
              <td><span class="ds-skeleton ds-skeleton--pill"></span></td>
              <td class="ds-col-action"><span class="ds-skeleton" style="width:28px;margin-left:auto"></span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="rows.length" class="ds-tablescroll">
        <table class="ds-table ds-table--cards">
          <thead>
            <tr>
              <th>From</th>
              <th>Issue</th>
              <th>Status</th>
              <th v-if="isChurchManager" class="ds-col-action">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(issue, index) in rows" :key="issue.id || index">
              <td data-label="From" class="issue-from">
                <span class="issue-from__name">{{ issue.userName || '—' }}</span>
                <!-- A website message has no account to call back from, so
                     the number it was sent with is shown here. -->
                <a v-if="issue.contactPhone" :href="`tel:+${issue.contactPhone}`" class="issue-from__phone">
                  +{{ issue.contactPhone }}
                </a>
              </td>
              <td data-label="Issue" class="issue-cell">
                <span v-if="issue.kind === 'account_deletion'" class="ds-badge ds-badge--danger issue-cell__badge">Account deletion</span>
                <span v-else-if="issue.source === 'website'" class="ds-badge ds-badge--info issue-cell__badge">Website</span>
                <strong>{{ issue.title }}</strong>
                <!-- The message was rendered untruncated in a table cell, so one
                     long report destroyed the row grid. -->
                <p>
                  {{ expanded === issue.id ? issue.issueMessage : truncate(issue.issueMessage) }}
                  <button
                    v-if="isLong(issue.issueMessage)"
                    class="issue-cell__toggle"
                    type="button"
                    @click="toggle(issue.id)"
                  >
                    {{ expanded === issue.id ? 'Show less' : 'Show more' }}
                  </button>
                </p>
              </td>
              <td data-label="Status">
                <span class="ds-status" :class="isResolved ? 'ds-status--success' : 'ds-status--warning'">
                  <span class="ds-status__dot"></span>{{ isResolved ? 'Resolved' : 'Unresolved' }}
                </span>
              </td>
              <td v-if="isChurchManager" data-label="Actions" class="ds-col-action">
                <RowMenu :label="`Actions for issue from ${issue.userName}`">
                  <template #default="{ close }">
                    <button v-if="!isResolved" class="ds-menu__item" type="button" @click="updateState(issue); close()">
                      Mark resolved
                    </button>
                    <span v-if="!isResolved" class="ds-menu__sep"></span>
                    <button class="ds-menu__item ds-menu__item--danger" type="button" @click="askDelete(issue); close()">
                      Delete issue
                    </button>
                  </template>
                </RowMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="ds-empty">
        <span class="ds-empty__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </span>
        <h3 class="ds-h3">
          {{ isSearching ? 'No issues match that search' : (isResolved ? 'No resolved issues' : 'Nothing outstanding') }}
        </h3>
        <p v-if="isSearching">Check the spelling, or clear the search.</p>
        <p v-else-if="isResolved">Issues you resolve will be listed here.</p>
        <p v-else>No members are waiting on a reply right now.</p>
        <button v-if="isSearching" class="ds-btn ds-btn--secondary ds-btn--sm" type="button" @click="clearSearch">
          Clear search
        </button>
      </div>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      :busy="isDeleting"
      title="Delete this issue?"
      message="The member's report will be removed permanently. This cannot be undone."
      confirm-label="Delete issue"
      @cancel="confirmOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { IssuesList } from '../network/Member'
import { ROLE_CHURCH_MANAGER } from '../resources/navigation'
import RowMenu from './RowMenu'
import ConfirmDialog from './ConfirmDialog'

const SEARCH_DEBOUNCE_MS = 350
const TRUNCATE_AT = 140

export default {
  name: 'Issues',
  components: { RowMenu, ConfirmDialog },
  props: {
    isActive: { type: Boolean, default: false }
  },
  data () {
    return {
      isLoading: false,
      isDeleting: false,
      confirmOpen: false,
      pendingDelete: null,
      searchQuery: '',
      searchTimer: null,
      isResolved: false,
      expanded: null,
      issues: IssuesList
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
    isChurchManager () {
      return this.loggedInUser && this.loggedInUser.data &&
        this.loggedInUser.data.roleId === ROLE_CHURCH_MANAGER
    },
    rows () {
      return this.issues && Array.isArray(this.issues.results) ? this.issues.results : []
    },
    isSearching () {
      return this.searchQuery.trim().length > 0
    }
  },
  watch: {
    isActive (isVisible) {
      if (isVisible) {
        this.fetchIssues()
      }
    }
  },
  beforeMount () {
    this.fetchIssues()
  },
  beforeDestroy () {
    clearTimeout(this.searchTimer)
  },
  methods: {
    errorMessage (error, fallback) {
      return error && error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : fallback
    },
    isLong (message) {
      return !!message && message.length > TRUNCATE_AT
    },
    truncate (message) {
      if (!message) { return '—' }
      return this.isLong(message) ? message.slice(0, TRUNCATE_AT) + '… ' : message
    },
    toggle (id) {
      this.expanded = this.expanded === id ? null : id
    },
    selectFilter (status) {
      this.isResolved = status
      this.expanded = null
      this.load()
    },
    onSearchInput () {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => this.load(), SEARCH_DEBOUNCE_MS)
    },
    clearSearch () {
      clearTimeout(this.searchTimer)
      this.searchQuery = ''
      this.load()
    },
    load () {
      if (this.isSearching) {
        this.searchByName()
      } else {
        this.fetchIssues()
      }
    },
    fetchIssues () {
      this.isLoading = true
      this.$axios.get(`issues?IsResolved=${this.isResolved}`).then(response => {
        this.issues = Object.assign({}, IssuesList, response.data.data)
        this.isLoading = false
      }).catch(() => {
        this.isLoading = false
      })
    },
    searchByName () {
      this.isLoading = true
      this.$axios.get(`issues?IsResolved=${this.isResolved}&UserName=${encodeURIComponent(this.searchQuery.trim())}`)
        .then(response => {
          this.issues = Object.assign({}, IssuesList, response.data.data)
          this.isLoading = false
        }).catch(() => {
          this.isLoading = false
        })
    },
    updateState (issue) {
      const requestBody = {
        userId: this.loggedInUser.data.id,
        isResolved: true
      }

      this.$axios.put(`issues/${issue.id}`, requestBody).then(() => {
        this.$toast.success('Issue marked resolved')
        this.load()
      }).catch(error => {
        // Previously reported through $toast.success, so failures looked like successes.
        this.$toast.error(this.errorMessage(error, 'Could not update this issue.'))
      })
    },
    askDelete (issue) {
      this.pendingDelete = issue
      this.confirmOpen = true
    },
    confirmDelete () {
      if (!this.pendingDelete) { return }
      this.isDeleting = true

      this.$axios.delete(`issues/${this.pendingDelete.id}`).then(() => {
        this.isDeleting = false
        this.confirmOpen = false
        this.pendingDelete = null
        this.$toast.success('Issue deleted')
        this.load()
      }).catch(error => {
        this.isDeleting = false
        this.confirmOpen = false
        this.$toast.error(this.errorMessage(error, 'Could not delete this issue.'))
      })
    }
  }
}
</script>

<style scoped>
.issue-cell { max-width: 460px; }
.issue-cell strong { display: block; font-weight: 600; margin-bottom: 2px; }
.issue-cell p { margin: 0; color: var(--ds-text-2); font-size: var(--ds-text-base); overflow-wrap: anywhere; white-space: pre-line; }
.issue-cell__badge { margin-bottom: 6px; }

.issue-from { display: grid; gap: 2px; align-content: start; }
.issue-from__name { font-weight: 500; }
.issue-from__phone { font-size: var(--ds-text-sm); color: var(--ds-text-2); text-decoration: none; white-space: nowrap; }
.issue-from__phone:hover { color: var(--ds-navy); text-decoration: underline; }

.issue-cell__toggle {
  border: 0;
  background: none;
  padding: 0;
  font: inherit;
  font-weight: 500;
  color: var(--ds-navy);
  cursor: pointer;
  text-decoration: underline;
}
</style>
