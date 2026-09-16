<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Offerings</h1>
        <p>Offerings received, by service and offering type.</p>
      </div>
      <div class="ds-page-head__actions">
        <button class="ds-btn ds-btn--primary" type="button" @click="openCreate">
          <svg class="ds-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-linecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add offering
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
            aria-label="Search offerings by name"
            placeholder="Search by offering name"
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

      <!-- Loading -->
      <div v-if="isLoading" class="ds-tablescroll">
        <table class="ds-table">
          <thead>
            <tr>
              <th>Offering</th><th class="ds-col-num">Amount (GHS)</th><th>Service</th>
              <th>Type</th><th>Assigned to</th><th>Date</th><th class="ds-col-action">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in 6" :key="n">
              <td><span class="ds-skeleton" style="width:120px"></span></td>
              <td class="ds-col-num"><span class="ds-skeleton" style="width:70px;margin-left:auto"></span></td>
              <td><span class="ds-skeleton" style="width:110px"></span></td>
              <td><span class="ds-skeleton ds-skeleton--pill"></span></td>
              <td><span class="ds-skeleton" style="width:90px"></span></td>
              <td><span class="ds-skeleton" style="width:80px"></span></td>
              <td class="ds-col-action"><span class="ds-skeleton" style="width:28px;margin-left:auto"></span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty -->
      <div v-else-if="!rows.length" class="ds-empty">
        <span class="ds-empty__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </span>
        <h3 class="ds-h3">{{ isSearching ? 'No offerings match that search' : 'No offerings recorded' }}</h3>
        <p v-if="isSearching">Check the spelling, or clear the search to see everything.</p>
        <p v-else>Offerings you record will appear here, grouped by service and type.</p>
        <button v-if="isSearching" class="ds-btn ds-btn--secondary ds-btn--sm" type="button" @click="clearSearch">
          Clear search
        </button>
        <button v-else class="ds-btn ds-btn--primary ds-btn--sm" type="button" @click="openCreate">Add offering</button>
      </div>

      <!-- Rows -->
      <div v-else class="ds-tablescroll">
        <table class="ds-table ds-table--cards">
          <thead>
            <tr>
              <th>Offering</th>
              <th class="ds-col-num">Amount (GHS)</th>
              <th>Service</th>
              <th>Type</th>
              <th>Assigned to</th>
              <th>Date</th>
              <th v-if="isChurchManager" class="ds-col-action">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(offering, index) in rows" :key="offering.id || index">
              <td data-label="Offering" style="font-weight:500">{{ offering.name }}</td>
              <td data-label="Amount (GHS)" class="ds-col-num">{{ formatMoney(offering.amount) }}</td>
              <td data-label="Service" class="ds-muted">{{ offering.serviceName || '—' }}</td>
              <td data-label="Type">
                <span v-if="offering.offeringTypeName" class="ds-badge ds-badge--neutral">
                  {{ offering.offeringTypeName }}
                </span>
                <span v-else class="ds-meta">—</span>
              </td>
              <td data-label="Assigned to" class="ds-muted">
                {{ cleanString(offering.assignFamilyName, offering.userName) || 'Not assigned' }}
              </td>
              <td data-label="Date" class="ds-muted">{{ fmtDate(offering.createdAt) }}</td>
              <td v-if="isChurchManager" data-label="Actions" class="ds-col-action">
                <RowMenu :label="`Actions for ${offering.name}`">
                  <template #default="{ close }">
                    <button class="ds-menu__item" type="button" @click="openEdit(offering); close()">Edit offering</button>
                    <button class="ds-menu__item" type="button" @click="openAssign(offering, 'family'); close()">
                      Assign to family
                    </button>
                    <button class="ds-menu__item" type="button" @click="openAssign(offering, 'member'); close()">
                      Assign to member
                    </button>
                    <span class="ds-menu__sep"></span>
                    <button class="ds-menu__item ds-menu__item--danger" type="button" @click="askDelete(offering); close()">
                      Delete offering
                    </button>
                  </template>
                </RowMenu>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Total shown</td>
              <td class="ds-col-num">{{ formatMoney(rowsTotal) }}</td>
              <td></td><td></td><td></td><td></td>
              <td v-if="isChurchManager"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div v-if="!isLoading && rows.length && numberOfPages > 1" class="ds-pagination">
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

    <!-- Create / edit drawer. One form, instead of three modals repeating the
         same name and amount fields. -->
    <div v-if="isFormOpen" class="ds-overlay" @click.self="closeForm">
      <div class="ds-drawer" role="dialog" aria-modal="true" aria-labelledby="offeringFormTitle">
        <div class="ds-drawer__head">
          <h2 id="offeringFormTitle" class="ds-h3">{{ offeringId ? 'Edit offering' : 'Add offering' }}</h2>
          <p class="ds-muted" style="margin:4px 0 0;font-size:var(--ds-text-sm)">
            Assignment is optional — you can assign it later from the list.
          </p>
        </div>

        <div class="ds-drawer__body">
          <div class="ds-field" :class="{ 'is-invalid': showErrors && !offeringName }">
            <label class="ds-label" for="offName">Offering name</label>
            <input id="offName" v-model="offeringName" class="ds-input" type="text">
            <span v-if="showErrors && !offeringName" class="ds-error">Give this offering a name.</span>
          </div>

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !isAmountValid }">
            <label class="ds-label" for="offAmount">Amount (GHS)</label>
            <input id="offAmount" v-model="amount" class="ds-input ds-input--amount" type="text" inputmode="decimal" placeholder="0.00">
            <span v-if="showErrors && !isAmountValid" class="ds-error">Enter an amount greater than zero.</span>
          </div>

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !offeringTypeId }">
            <label class="ds-label" for="offType">Offering type</label>
            <select id="offType" v-model="offeringTypeId" class="ds-select">
              <option value="" disabled>Select a type</option>
              <option v-for="type in offeringTypeOptions" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
            <span v-if="showErrors && !offeringTypeId" class="ds-error">Choose an offering type.</span>
          </div>

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !serviceId }">
            <label class="ds-label" for="offService">Service</label>
            <select id="offService" v-model="serviceId" class="ds-select">
              <option value="" disabled>Select a service</option>
              <option v-for="service in serviceOptions" :key="service.id" :value="service.id">{{ service.name }}</option>
            </select>
            <span v-if="showErrors && !serviceId" class="ds-error">Choose which service this came from.</span>
          </div>

          <div class="ds-field">
            <label class="ds-label" for="offDate">Date</label>
            <input id="offDate" v-model="offeringDate" class="ds-input" type="date">
          </div>

          <div class="ds-field">
            <label class="ds-label" for="offFamily">Assign to church family</label>
            <select id="offFamily" v-model="familyId" class="ds-select">
              <option value="">Not assigned</option>
              <option v-for="family in familyOptions" :key="family.id" :value="family.id">{{ family.name }}</option>
            </select>
          </div>

          <div class="ds-field" style="margin-bottom:0">
            <label class="ds-label" for="offMember">Assign to member</label>
            <MemberPicker id-prefix="offMember" :value="membersQuery" @select="onMemberSelected" />
            <span class="ds-help">Optional. Start typing a name.</span>
          </div>
        </div>

        <div class="ds-drawer__foot">
          <button class="ds-btn ds-btn--ghost" type="button" @click="closeForm">Cancel</button>
          <button class="ds-btn ds-btn--primary" type="button" :disabled="isSaving" @click="saveOffering">
            <span v-if="isSaving" class="ds-btn__spinner"></span>
            {{ isSaving ? 'Saving' : (offeringId ? 'Save changes' : 'Add offering') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Assign dialog -->
    <div v-if="isAssignOpen" class="ds-overlay" @click.self="isAssignOpen = false">
      <div class="ds-modal" role="dialog" aria-modal="true" aria-labelledby="assignTitle">
        <div class="ds-modal__head">
          <div>
            <h2 id="assignTitle" class="ds-h3">
              Assign to {{ assignMode === 'family' ? 'a church family' : 'a member' }}
            </h2>
            <p>{{ offeringName }} · GHS {{ formatMoney(amount) }}</p>
          </div>
        </div>

        <div class="ds-modal__body">
          <div v-if="assignMode === 'family'" class="ds-field" style="margin-bottom:0">
            <label class="ds-label" for="assignFamily">Church family</label>
            <select id="assignFamily" v-model="familyId" class="ds-select">
              <option value="" disabled>Select a family</option>
              <option v-for="family in familyOptions" :key="family.id" :value="family.id">{{ family.name }}</option>
            </select>
          </div>

          <div v-else class="ds-field" style="margin-bottom:0">
            <label class="ds-label" for="assignMember">Member</label>
            <MemberPicker id-prefix="assignMember" :value="membersQuery" @select="onMemberSelected" />
          </div>
        </div>

        <div class="ds-modal__foot">
          <button class="ds-btn ds-btn--ghost" type="button" @click="isAssignOpen = false">Cancel</button>
          <button class="ds-btn ds-btn--primary" type="button" :disabled="isSaving" @click="saveAssignment">
            <span v-if="isSaving" class="ds-btn__spinner"></span>
            {{ isSaving ? 'Saving' : 'Save assignment' }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      :busy="isDeleting"
      title="Delete this offering?"
      :message="`${pendingDelete ? pendingDelete.name : 'This offering'} will be removed from accounting totals. This cannot be undone.`"
      confirm-label="Delete offering"
      @cancel="confirmOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ChurchFamilyList, OfferingList, OfferingType, ServiceList } from '../../network/Member'
import { numberWithCommas } from '../../resources/constants'
import { ROLE_CHURCH_MANAGER } from '../../resources/navigation'
import RowMenu from '../../components/RowMenu'
import ConfirmDialog from '../../components/ConfirmDialog'
import MemberPicker from '../../components/MemberPicker'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 350

export default {
  name: 'offerings',
  components: { RowMenu, ConfirmDialog, MemberPicker },
  data () {
    return {
      isLoading: false,
      isSaving: false,
      isDeleting: false,
      isFormOpen: false,
      isAssignOpen: false,
      assignMode: 'family',
      confirmOpen: false,
      pendingDelete: null,
      showErrors: false,
      searchTimer: null,

      services: ServiceList,
      offeringTypes: OfferingType,
      families: ChurchFamilyList,
      offerings: OfferingList,

      numberOfPages: 0,
      currentPage: 1,
      totalCount: 0,

      offeringName: '',
      offeringDate: null,
      amount: '',
      searchQuery: '',
      membersQuery: '',
      offeringId: '',
      offeringTypeId: '',
      serviceId: '',
      familyId: '',
      userId: ''
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
    isChurchManager () {
      return this.loggedInUser && this.loggedInUser.data &&
        this.loggedInUser.data.roleId === ROLE_CHURCH_MANAGER
    },
    rows () {
      return this.offerings && Array.isArray(this.offerings.results) ? this.offerings.results : []
    },
    rowsTotal () {
      return this.rows.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    },
    serviceOptions () {
      return this.services && this.services.data ? this.services.data : []
    },
    offeringTypeOptions () {
      return this.offeringTypes && this.offeringTypes.data ? this.offeringTypes.data : []
    },
    familyOptions () {
      return this.families && this.families.data ? this.families.data : []
    },
    isSearching () {
      return this.searchQuery.trim().length > 0
    },
    isAmountValid () {
      return parseFloat(this.amount) > 0
    },
    countLabel () {
      if (this.isLoading) { return 'Loading…' }
      return this.totalCount === 1 ? '1 offering' : `${this.totalCount} offerings`
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
    this.fetchFamilies()
    this.getServices()
    this.getOfferingType()
    this.fetchOfferings()
  },
  beforeDestroy () {
    clearTimeout(this.searchTimer)
  },
  methods: {
    formatMoney (value) {
      return numberWithCommas(Number(value || 0))
    },
    fmtDate (value) {
      if (!value) { return '—' }
      const parsed = this.$moment(value)
      return parsed.isValid() ? parsed.format('D MMM YYYY') : '—'
    },
    cleanString (first, second) {
      if (first && second) { return [first, second].join(', ') }
      return first || second || ''
    },
    errorMessage (error, fallback) {
      return error && error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : fallback
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
        this.searchByName()
      } else {
        this.fetchOfferings(this.currentPage)
      }
    },
    goToPage (page) {
      if (page < 1 || page > this.numberOfPages || page === this.currentPage) { return }
      this.fetchOfferings(page)
    },
    applyResponse (response) {
      this.offerings = Object.assign({}, OfferingList, response.data.data)
      this.numberOfPages = this.offerings.totalPages || 0
      this.totalCount = this.offerings.totalCount || 0
    },
    fetchOfferings (page = 1, pageSize = PAGE_SIZE) {
      this.currentPage = page
      this.isLoading = true
      this.$axios.get(`offerings?Page=${page}&PageSize=${pageSize}`).then(response => {
        this.applyResponse(response)
        this.isLoading = false
      }).catch(() => {
        this.isLoading = false
      })
    },
    searchByName () {
      this.isLoading = true
      this.$axios.get(`offerings?Name=${encodeURIComponent(this.searchQuery.trim())}&Page=1&PageSize=${PAGE_SIZE}`)
        .then(response => {
          this.applyResponse(response)
          this.currentPage = 1
          this.isLoading = false
        }).catch(() => {
          this.isLoading = false
        })
    },

    clearFields () {
      this.offeringName = ''
      this.amount = ''
      this.serviceId = ''
      this.offeringId = ''
      this.offeringTypeId = ''
      this.familyId = ''
      this.userId = ''
      this.membersQuery = ''
      this.offeringDate = null
      this.showErrors = false
    },
    openCreate () {
      this.clearFields()
      this.isFormOpen = true
    },
    openEdit (offering) {
      this.loadOffering(offering)
      this.showErrors = false
      this.isFormOpen = true
    },
    openAssign (offering, mode) {
      this.loadOffering(offering)
      this.assignMode = mode
      this.isAssignOpen = true
    },
    loadOffering (data) {
      this.offeringId = data.id
      this.offeringName = data.name
      this.amount = data.amount
      this.serviceId = data.serviceId || ''
      this.offeringTypeId = data.offeringTypeId || ''
      this.familyId = data.assignFamilyId || ''
      this.userId = data.userId || ''
      this.membersQuery = data.userName || ''
      this.offeringDate = data.createdAt ? String(data.createdAt).split('T')[0] : null
    },
    closeForm () {
      this.isFormOpen = false
    },
    onMemberSelected (member) {
      this.userId = member.id
      this.membersQuery = member.name
    },

    saveOffering () {
      if (!this.offeringName || !this.isAmountValid || !this.offeringTypeId || !this.serviceId) {
        this.showErrors = true
        return
      }
      this.showErrors = false

      const service = this.serviceOptions.filter(item => item.id === this.serviceId)

      const requestBody = {
        name: this.offeringName,
        amount: parseFloat(this.amount),
        serviceId: this.serviceId,
        offeringTypeId: this.offeringTypeId,
        serviceName: service.length ? service[0].name : '',
        userId: this.userId,
        assignFamilyId: this.familyId,
        createdAt: this.offeringDate
      }

      this.isSaving = true
      const request = this.offeringId
        ? this.$axios.put(`offerings/${this.offeringId}`, requestBody)
        : this.$axios.post('offerings', requestBody)

      request.then(() => {
        this.$toast.success(this.offeringId ? 'Offering updated' : 'Offering added')
        this.isSaving = false
        this.isFormOpen = false
        this.clearFields()
        this.load()
      }).catch(error => {
        // Previously reported through $toast.success, so failures looked like successes.
        this.$toast.error(this.errorMessage(error, 'Could not save this offering.'))
        this.isSaving = false
      })
    },

    saveAssignment () {
      const isFamily = this.assignMode === 'family'
      const target = isFamily ? this.familyId : this.userId

      if (!target) {
        this.$toast.error(isFamily ? 'Choose a church family first.' : 'Choose a member first.')
        return
      }

      const url = isFamily
        ? `offerings/assign-family/${this.offeringId}`
        : `offerings/assign-user/${this.offeringId}`
      const body = isFamily ? { familyId: this.familyId } : { userId: this.userId }

      this.isSaving = true
      this.$axios.put(url, body).then(() => {
        this.$toast.success(isFamily ? 'Offering assigned to family' : 'Offering assigned to member')
        this.isSaving = false
        this.isAssignOpen = false
        this.clearFields()
        this.load()
      }).catch(error => {
        this.$toast.error(this.errorMessage(error, 'Could not assign this offering.'))
        this.isSaving = false
      })
    },

    askDelete (offering) {
      this.pendingDelete = offering
      this.confirmOpen = true
    },
    confirmDelete () {
      if (!this.pendingDelete) { return }
      this.isDeleting = true
      this.$axios.delete(`offerings/${this.pendingDelete.id}`).then(() => {
        this.isDeleting = false
        this.confirmOpen = false
        this.pendingDelete = null
        this.$toast.success('Offering deleted')
        this.load()
      }).catch(error => {
        this.isDeleting = false
        this.confirmOpen = false
        this.$toast.error(this.errorMessage(error, 'Could not delete this offering.'))
      })
    },

    fetchFamilies () {
      this.$axios.get('churchfamilies').then(response => {
        this.families = Object.assign({}, ChurchFamilyList, response.data)
      }).catch(() => {})
    },
    getServices () {
      this.$axios.get('services').then(response => {
        this.services = Object.assign({}, ServiceList, response.data)
      }).catch(() => {})
    },
    getOfferingType () {
      this.$axios.get('offeringtype').then(response => {
        this.offeringTypes = Object.assign({}, OfferingType, response.data)
      }).catch(() => {})
    }
  }
}
</script>
