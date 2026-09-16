<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Requests</h1>
        <p>Counselling, naming, marriage, funerals, prayer and visitation — what members ask the office for.</p>
      </div>
    </div>

    <!--
      This is the most sensitive data in the system. The app tells members only
      the pastoral team can read it, the API enforces that, and the reminder
      stays on screen so nobody leaves this open on a shared machine.
    -->
    <div class="ds-alert ds-alert--info rq__notice">
      <span class="ds-alert__icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </span>
      <div class="ds-alert__body">
        <b>Pastoral only.</b> Members are told that nobody outside the pastoral team sees these.
        Do not export them or discuss them outside that team.
      </div>
    </div>

    <div class="ds-card" style="margin-bottom:20px">
      <div class="ds-toolbar" style="border-bottom:0">
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
        <div class="ds-toolbar__right">
          <select v-model="type" class="ds-select rq__type" aria-label="Filter by what it is about" @change="load(1)">
            <option value="">All kinds</option>
            <option v-for="(label, value) in requestTypes" :key="value" :value="value">{{ label }}</option>
          </select>
          <span class="ds-toolbar__count">{{ countLabel }}</span>
        </div>
      </div>
    </div>

    <div class="ds-tablewrap">
      <div v-if="isLoading" class="ds-card__body" style="display:grid;gap:12px">
        <span v-for="n in 4" :key="n" class="ds-skeleton" style="height:70px"></span>
      </div>

      <ul v-else-if="requests.length" class="rq__list">
        <li v-for="request in requests" :key="request.id" class="rq__item">
          <div class="rq__head">
            <span class="ds-badge" :class="statusBadge(request.status)">{{ statusLabel(request.status) }}</span>
            <span class="rq__kind">{{ requestTypes[request.type] || request.type }}</span>
            <span class="rq__ref ds-num">{{ request.reference }}</span>
            <span class="rq__when">{{ $moment(request.submittedAt).fromNow() }}</span>
          </div>

          <p class="rq__details">{{ request.details }}</p>

          <div class="rq__meta">
            <span><b>{{ request.userName || 'A member' }}</b></span>
            <span v-if="request.contactPhone">{{ request.contactPhone }}</span>
            <span v-if="request.preferredDate">
              Prefers {{ $moment(request.preferredDate).format('ddd D MMM, HH:mm') }}
            </span>
            <span v-if="request.handledByName" class="ds-muted">
              Last handled by {{ request.handledByName }}
            </span>
          </div>

          <div class="rq__actions">
            <button class="ds-btn ds-btn--secondary ds-btn--sm" type="button" @click="open(request)">
              Update status
            </button>
          </div>
        </li>
      </ul>

      <div v-else class="ds-empty">
        <h3 class="ds-h3">{{ isFiltered ? 'Nothing matches that filter' : 'No requests' }}</h3>
        <p v-if="isFiltered">Try a different status or kind.</p>
        <p v-else>Requests members send from the app arrive here.</p>
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

    <!-- Status update -->
    <div v-if="editing" class="ds-overlay" @click.self="editing = null">
      <div class="ds-modal" role="dialog" aria-modal="true" aria-labelledby="rqUpdateTitle">
        <div class="ds-modal__head">
          <h2 id="rqUpdateTitle" class="ds-h3">{{ editing.reference }}</h2>
        </div>

        <div class="ds-modal__body">
          <div class="ds-field">
            <label class="ds-label" for="rqStatus">Status</label>
            <select id="rqStatus" v-model="draft.status" class="ds-select">
              <option v-for="option in requestStatuses" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="ds-field" style="margin-bottom:0">
            <label class="ds-label" for="rqNote">Note to the member</label>
            <textarea id="rqNote" v-model="draft.statusNote" class="ds-textarea" rows="3"
                      placeholder="Come to the church office on Thursday at 4pm."></textarea>
            <span class="ds-help">
              Sent to them as a notification. Leave it blank and they are told the status only.
            </span>
          </div>
        </div>

        <div class="ds-modal__foot">
          <button class="ds-btn ds-btn--ghost" type="button" @click="editing = null">Cancel</button>
          <button class="ds-btn ds-btn--primary" type="button" :disabled="isSaving" @click="save">
            <span v-if="isSaving" class="ds-btn__spinner"></span>
            {{ isSaving ? 'Saving' : 'Update and tell them' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  rowsOf, pagingOf, errorMessage,
  REQUEST_TYPES, REQUEST_STATUSES, REQUEST_STATUS_BADGE
} from '../../../../network/MobileApp'

export default {
  name: 'AdminAppRequests',
  data () {
    return {
      requests: [],
      paging: { page: 1, totalPages: 0, totalCount: 0 },
      isLoading: false,
      isSaving: false,
      status: 'submitted',
      type: '',
      editing: null,
      draft: { status: '', statusNote: '' }
    }
  },
  computed: {
    requestTypes () {
      return REQUEST_TYPES
    },
    requestStatuses () {
      return REQUEST_STATUSES
    },
    statusTabs () {
      return [
        { value: 'submitted', label: 'New' },
        { value: 'in_review', label: 'In review' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'completed', label: 'Done' },
        { value: '', label: 'All' }
      ]
    },
    isFiltered () {
      return !!this.status || !!this.type
    },
    countLabel () {
      if (this.isLoading) { return 'Loading…' }
      const count = this.paging.totalCount
      return count === 1 ? '1 request' : `${count} requests`
    }
  },
  beforeMount () {
    this.load(1)
  },
  methods: {
    statusLabel (value) {
      const found = REQUEST_STATUSES.find(s => s.value === value)
      return found ? found.label : value
    },
    statusBadge (value) {
      return REQUEST_STATUS_BADGE[value] || 'ds-badge--neutral'
    },
    setStatus (value) {
      this.status = value
      this.load(1)
    },
    load (page = 1) {
      this.isLoading = true

      const params = { Page: page, PageSize: 20 }
      if (this.status) { params.Status = this.status }
      if (this.type) { params.Type = this.type }

      this.$axios.get('admin/requests', { params }).then(response => {
        this.requests = rowsOf(response)
        this.paging = pagingOf(response, page)
        this.isLoading = false
      }).catch(error => {
        this.requests = []
        this.isLoading = false
        this.$toast.error(errorMessage(error, 'Could not load the requests.'))
      })
    },
    open (request) {
      this.editing = request
      this.draft = { status: request.status, statusNote: '' }
    },
    save () {
      if (!this.editing) { return }
      this.isSaving = true

      this.$axios.put(`admin/requests/${this.editing.id}/status`, {
        status: this.draft.status,
        statusNote: this.draft.statusNote || null
      }).then(() => {
        this.isSaving = false
        this.editing = null
        this.$toast.success('Request updated and the member notified')
        this.load(this.paging.page)
      }).catch(error => {
        this.isSaving = false
        this.$toast.error(errorMessage(error, 'Could not update that request.'))
      })
    }
  }
}
</script>

<style scoped>
.rq__notice { margin-bottom: 20px; }
.rq__type { max-width: 180px; }

.rq__list { list-style: none; margin: 0; padding: 0; }
.rq__item { padding: 16px; border-bottom: 1px solid var(--ds-border); }
.rq__item:last-child { border-bottom: 0; }

.rq__head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
.rq__kind { font-weight: 500; }
.rq__ref { color: var(--ds-text-muted); font-size: var(--ds-text-sm); }
.rq__when { color: var(--ds-text-muted); font-size: var(--ds-text-sm); margin-left: auto; }

.rq__details { margin: 0 0 10px; overflow-wrap: anywhere; }

.rq__meta {
  display: flex; gap: 16px; flex-wrap: wrap;
  font-size: var(--ds-text-sm); color: var(--ds-text-muted);
  margin-bottom: 12px;
}

.rq__actions { display: flex; gap: 8px; }
</style>
