<template>
  <div class="reg">
    <div class="ds-pagehead">
      <div>
        <h1 class="ds-h2">Registrations</h1>
        <p class="ds-help">
          People who signed up in the app. They cannot sign in until you approve them.
        </p>
      </div>
    </div>

    <div class="ds-tabs reg__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="ds-tab"
        :class="{ 'is-active': status === tab.value }"
        type="button"
        @click="switchTo(tab.value)"
      >
        {{ tab.label }}
        <span v-if="tab.value === 'pending' && pendingCount" class="ds-badge ds-badge--warning reg__count">
          {{ pendingCount }}
        </span>
      </button>
    </div>

    <div class="ds-field reg__search">
      <input
        v-model="search"
        class="ds-input"
        type="search"
        placeholder="Search by name or phone number"
        @input="onSearch"
      >
    </div>

    <div v-if="loading" class="reg__state">
      <span class="ds-skeleton" style="height:56px;width:100%"></span>
      <span class="ds-skeleton" style="height:56px;width:100%;margin-top:8px"></span>
    </div>

    <p v-else-if="error" class="ds-error">{{ error }}</p>

    <p v-else-if="!rows.length" class="ds-help reg__state">
      {{ emptyMessage }}
    </p>

    <div v-else class="ds-tablewrap">
      <table class="ds-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Church family</th>
            <th>Registered</th>
            <th v-if="status !== 'pending'">Reviewed by</th>
            <th class="ds-col-action">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td data-label="Name" style="font-weight:500">{{ row.name || '—' }}</td>
            <td data-label="Phone">{{ row.phoneNumber || '—' }}</td>
            <td data-label="Church family">{{ row.churchFamilyName || '—' }}</td>
            <td data-label="Registered">{{ formatDate(row.createdAt) }}</td>
            <td v-if="status !== 'pending'" data-label="Reviewed by">
              {{ row.reviewedByName || '—' }}
            </td>
            <td data-label="Actions" class="ds-col-action">
              <RowMenu :label="`Actions for ${row.name}`">
                <template #default="{ close }">
                  <button
                    v-if="row.status !== 'approved'"
                    class="ds-menu__item"
                    type="button"
                    @click="approve(row); close()"
                  >
                    Approve
                  </button>
                  <button
                    v-if="row.status === 'pending'"
                    class="ds-menu__item ds-menu__item--danger"
                    type="button"
                    @click="askReject(row); close()"
                  >
                    Reject
                  </button>
                  <!--
                    Only for an account already turned away. The API refuses to
                    delete an approved member, and offering it here would be
                    offering something that fails.
                  -->
                  <template v-if="row.status === 'rejected'">
                    <span class="ds-menu__sep"></span>
                    <button
                      class="ds-menu__item ds-menu__item--danger"
                      type="button"
                      @click="askDelete(row); close()"
                    >
                      Delete account
                    </button>
                  </template>
                </template>
              </RowMenu>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmDialog
      :open="rejectOpen"
      :busy="busy"
      title="Reject this registration?"
      :message="rejectMessage"
      confirm-label="Reject"
      @cancel="rejectOpen = false"
      @confirm="confirmReject"
    />

    <ConfirmDialog
      :open="deleteOpen"
      :busy="busy"
      title="Delete this account?"
      :message="deleteMessage"
      confirm-label="Delete account"
      @cancel="deleteOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script>
import RowMenu from '../../../components/RowMenu'
import ConfirmDialog from '../../../components/ConfirmDialog'
import { payload, errorMessage } from '../../../network/MobileApp'

/**
 * Who gets into the congregation.
 *
 * Registering in the app used to be the whole of joining: the form returned a
 * token, and whoever filled it in could read the church feed, comment beside
 * the congregation and open the giving screens. This is the review that was
 * missing, and the reason a self-registration now waits.
 */
export default {
  name: 'MemberRegistrationsPage',
  components: { RowMenu, ConfirmDialog },
  data () {
    return {
      status: 'pending',
      search: '',
      rows: [],
      pendingCount: 0,
      loading: true,
      error: '',
      busy: false,
      rejectOpen: false,
      deleteOpen: false,
      selected: null,
      searchTimer: null,
      tabs: [
        { value: 'pending', label: 'Waiting' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
      ]
    }
  },
  computed: {
    emptyMessage () {
      return {
        pending: 'Nobody is waiting. New registrations from the app appear here.',
        approved: 'No approved members match this search.',
        rejected: 'Nobody has been rejected.'
      }[this.status]
    },
    rejectMessage () {
      const name = this.selected ? this.selected.name : 'This person'
      return `${name} will not be able to sign in. The record is kept, so you can`
        + ` approve them later if this was wrong.`
    },
    deleteMessage () {
      const name = this.selected ? this.selected.name : 'This account'
      return `${name}'s account will be removed for good. This cannot be undone.`
    }
  },
  beforeMount () {
    this.load()
    this.loadCount()
  },
  beforeDestroy () {
    clearTimeout(this.searchTimer)
  },
  methods: {
    formatDate (value) {
      if (!value) { return '—' }
      const date = new Date(value)
      return isNaN(date.getTime()) ? '—' : this.$moment(date).format('D MMM YYYY')
    },
    switchTo (value) {
      this.status = value
      this.load()
    },
    onSearch () {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => this.load(), 300)
    },
    load () {
      this.loading = true
      this.error = ''

      this.$axios.get('admin/member-approvals', {
        params: { Status: this.status, Search: this.search || undefined, Page: 1, PageSize: 100 }
      }).then(response => {
        const data = payload(response)
        this.rows = (data && data.results) || []
        this.loading = false
      }).catch(error => {
        this.loading = false
        this.error = errorMessage(error, 'Could not load registrations.')
      })
    },
    /** Drives the badge, and is refreshed after every decision. */
    loadCount () {
      this.$axios.get('admin/member-approvals/count').then(response => {
        this.pendingCount = payload(response) || 0
      }).catch(() => { this.pendingCount = 0 })
    },
    approve (row) {
      this.busy = true
      this.$axios.post(`admin/member-approvals/${row.id}/approve`).then(() => {
        this.busy = false
        this.$toast.success(`${row.name} approved`)
        this.load()
        this.loadCount()
      }).catch(error => {
        this.busy = false
        this.$toast.error(errorMessage(error, 'Could not approve this registration.'))
      })
    },
    askReject (row) {
      this.selected = row
      this.rejectOpen = true
    },
    confirmReject () {
      if (!this.selected) { return }
      this.busy = true

      this.$axios.post(`admin/member-approvals/${this.selected.id}/reject`, { note: null }).then(() => {
        this.busy = false
        this.rejectOpen = false
        this.$toast.success(`${this.selected.name} rejected`)
        this.selected = null
        this.load()
        this.loadCount()
      }).catch(error => {
        this.busy = false
        this.rejectOpen = false
        this.$toast.error(errorMessage(error, 'Could not reject this registration.'))
      })
    },
    askDelete (row) {
      this.selected = row
      this.deleteOpen = true
    },
    confirmDelete () {
      if (!this.selected) { return }
      this.busy = true

      this.$axios.delete(`admin/member-approvals/${this.selected.id}`).then(() => {
        this.busy = false
        this.deleteOpen = false
        this.$toast.success('Account deleted')
        this.selected = null
        this.load()
        this.loadCount()
      }).catch(error => {
        this.busy = false
        this.deleteOpen = false
        this.$toast.error(errorMessage(error, 'Could not delete this account.'))
      })
    }
  }
}
</script>

<style scoped>
.reg__tabs { margin-bottom: 16px; }
.reg__count { margin-left: 6px; }
.reg__search { max-width: 340px; margin-bottom: 16px; }
.reg__state { padding: 24px 0; }
</style>
