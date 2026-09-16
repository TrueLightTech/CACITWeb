<template>
  <div>
    <div class="ds-section__head">
      <div>
        <h2 class="ds-h2">{{ title }}</h2>
        <p class="ds-muted" style="margin:4px 0 0;font-size:var(--ds-text-sm)">{{ description }}</p>
      </div>
      <button v-if="canEdit" class="ds-btn ds-btn--primary ds-btn--sm" type="button" @click="openCreate">
        <svg class="ds-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-linecap="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add {{ singular }}
      </button>
    </div>

    <div class="ds-tablewrap">
      <div v-if="isLoading" class="ds-tablescroll">
        <table class="ds-table">
          <thead><tr><th>Name</th><th>Description</th><th class="ds-col-action">Actions</th></tr></thead>
          <tbody>
            <tr v-for="n in 4" :key="n">
              <td><span class="ds-skeleton" style="width:130px"></span></td>
              <td><span class="ds-skeleton" style="width:80%"></span></td>
              <td class="ds-col-action"><span class="ds-skeleton" style="width:28px;margin-left:auto"></span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="rows.length" class="ds-tablescroll">
        <table class="ds-table ds-table--cards">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th v-if="canEdit" class="ds-col-action">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in rows" :key="item.id">
              <td data-label="Name" style="font-weight:500">{{ item.name }}</td>
              <td data-label="Description" class="ds-muted">{{ item.description || '—' }}</td>
              <td v-if="canEdit" data-label="Actions" class="ds-col-action">
                <RowMenu :label="`Actions for ${item.name}`">
                  <template #default="{ close }">
                    <button class="ds-menu__item" type="button" @click="openEdit(item); close()">
                      Edit {{ singular }}
                    </button>
                    <span class="ds-menu__sep"></span>
                    <button class="ds-menu__item ds-menu__item--danger" type="button" @click="askDelete(item); close()">
                      Delete {{ singular }}
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
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
        </span>
        <h3 class="ds-h3">No {{ pluralLower }} yet</h3>
        <p>{{ emptyHint }}</p>
        <button v-if="canEdit" class="ds-btn ds-btn--primary ds-btn--sm" type="button" @click="openCreate">
          Add {{ singular }}
        </button>
      </div>
    </div>

    <!-- Create / edit -->
    <div v-if="isFormOpen" class="ds-overlay" @click.self="closeForm">
      <div class="ds-modal" role="dialog" aria-modal="true" :aria-labelledby="`${idPrefix}FormTitle`">
        <div class="ds-modal__head">
          <div>
            <h2 :id="`${idPrefix}FormTitle`" class="ds-h3">
              {{ editingId ? 'Edit ' + singular : 'Add ' + singular }}
            </h2>
          </div>
        </div>

        <div class="ds-modal__body">
          <div class="ds-field" :class="{ 'is-invalid': showErrors && !name }">
            <label class="ds-label" :for="`${idPrefix}Name`">Name</label>
            <input :id="`${idPrefix}Name`" ref="name" v-model="name" class="ds-input" type="text">
            <span v-if="showErrors && !name" class="ds-error">Give this {{ singular }} a name.</span>
          </div>

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !itemDescription }" style="margin-bottom:0">
            <label class="ds-label" :for="`${idPrefix}Description`">Description</label>
            <textarea
              :id="`${idPrefix}Description`"
              v-model="itemDescription"
              class="ds-textarea"
              rows="3"
            ></textarea>
            <span v-if="showErrors && !itemDescription" class="ds-error">Add a short description.</span>
          </div>
        </div>

        <div class="ds-modal__foot">
          <button class="ds-btn ds-btn--ghost" type="button" @click="closeForm">Cancel</button>
          <button class="ds-btn ds-btn--primary" type="button" :disabled="isSaving" @click="save">
            <span v-if="isSaving" class="ds-btn__spinner"></span>
            {{ isSaving ? 'Saving' : (editingId ? 'Save changes' : 'Add ' + singular) }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      :busy="isDeleting"
      :title="`Delete this ${singular}?`"
      :message="deleteMessage"
      :confirm-label="`Delete ${singular}`"
      @cancel="confirmOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ROLE_CHURCH_MANAGER } from '../resources/navigation'
import RowMenu from './RowMenu'
import ConfirmDialog from './ConfirmDialog'

/**
 * Reference data table — name, description, edit, delete.
 *
 * Church Groups, Church Families, Services and Offering Types were four
 * near-identical 240-line components, each with its own hard-coded Bootstrap
 * modal ids. They are one component now, configured by endpoint and wording.
 */
export default {
  name: 'ReferenceTable',
  components: { RowMenu, ConfirmDialog },
  props: {
    title: { type: String, required: true },
    singular: { type: String, required: true },
    plural: { type: String, required: true },
    description: { type: String, default: '' },
    emptyHint: { type: String, default: '' },
    /** Base path used for GET, PUT and DELETE. */
    endpoint: { type: String, required: true },
    /** Church groups create at `churchgroups/me`, so this is separate. */
    createEndpoint: { type: String, default: '' },
    idPrefix: { type: String, required: true },
    isActive: { type: Boolean, default: false }
  },
  data () {
    return {
      items: [],
      isLoading: false,
      isSaving: false,
      isDeleting: false,
      isFormOpen: false,
      confirmOpen: false,
      showErrors: false,
      editingId: '',
      name: '',
      itemDescription: '',
      pendingDelete: null
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
    canEdit () {
      return this.loggedInUser && this.loggedInUser.data &&
        this.loggedInUser.data.roleId === ROLE_CHURCH_MANAGER
    },
    rows () {
      return Array.isArray(this.items) ? this.items : []
    },
    pluralLower () {
      return this.plural.toLowerCase()
    },
    deleteMessage () {
      const label = this.pendingDelete ? this.pendingDelete.name : `This ${this.singular}`
      return `${label} will be removed. Records already linked to it keep their history. This cannot be undone.`
    }
  },
  watch: {
    isActive (isVisible) {
      if (isVisible) {
        this.fetchItems()
      }
    }
  },
  beforeMount () {
    this.fetchItems()
  },
  methods: {
    errorMessage (error, fallback) {
      return error && error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : fallback
    },
    clearFields () {
      this.editingId = ''
      this.name = ''
      this.itemDescription = ''
      this.showErrors = false
    },
    openCreate () {
      this.clearFields()
      this.isFormOpen = true
      this.$nextTick(() => this.$refs.name && this.$refs.name.focus())
    },
    openEdit (item) {
      this.editingId = item.id
      this.name = item.name
      this.itemDescription = item.description
      this.showErrors = false
      this.isFormOpen = true
      this.$nextTick(() => this.$refs.name && this.$refs.name.focus())
    },
    closeForm () {
      this.isFormOpen = false
    },
    fetchItems () {
      this.isLoading = true
      this.$axios.get(this.endpoint).then(response => {
        this.items = response.data && Array.isArray(response.data.data) ? response.data.data : []
        this.isLoading = false
      }).catch(() => {
        this.items = []
        this.isLoading = false
      })
    },
    save () {
      if (!this.name || !this.itemDescription) {
        this.showErrors = true
        return
      }
      this.showErrors = false

      const requestBody = { name: this.name, description: this.itemDescription }
      this.isSaving = true

      const request = this.editingId
        ? this.$axios.put(`${this.endpoint}/${this.editingId}`, requestBody)
        : this.$axios.post(this.createEndpoint || this.endpoint, requestBody)

      request.then(() => {
        this.$toast.success(this.editingId
          ? `${this.capitalise(this.singular)} updated`
          : `${this.capitalise(this.singular)} added`)
        this.isSaving = false
        this.isFormOpen = false
        this.clearFields()
        this.fetchItems()
      }).catch(error => {
        // Previously reported through $toast.success, so failures looked like successes.
        this.$toast.error(this.errorMessage(error, `Could not save this ${this.singular}.`))
        this.isSaving = false
      })
    },
    capitalise (value) {
      return value.charAt(0).toUpperCase() + value.slice(1)
    },
    askDelete (item) {
      this.pendingDelete = item
      this.confirmOpen = true
    },
    confirmDelete () {
      if (!this.pendingDelete) { return }
      this.isDeleting = true

      this.$axios.delete(`${this.endpoint}/${this.pendingDelete.id}`).then(() => {
        this.isDeleting = false
        this.confirmOpen = false
        this.pendingDelete = null
        this.$toast.success(`${this.capitalise(this.singular)} deleted`)
        this.fetchItems()
      }).catch(error => {
        this.isDeleting = false
        this.confirmOpen = false
        this.$toast.error(this.errorMessage(error, `Could not delete this ${this.singular}.`))
      })
    }
  }
}
</script>
