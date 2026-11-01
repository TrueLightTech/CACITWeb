<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Roles</h1>
        <p>Ready-made sets of permissions. Give someone a role, then add or block single permissions on their page.</p>
      </div>
      <div class="ds-page-head__actions">
        <button class="ds-btn ds-btn--primary" type="button" @click="openCreate">
          <svg class="ds-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-linecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New role
        </button>
      </div>
    </div>

    <div class="ds-tablewrap">
      <div v-if="error" class="ds-errorstate">
        <h3 class="ds-h3">Could not load roles</h3>
        <p>{{ error }}</p>
        <button class="ds-btn ds-btn--secondary ds-btn--sm" type="button" @click="load">Try again</button>
      </div>

      <div v-else-if="isLoading" class="ds-tablescroll">
        <table class="ds-table">
          <tbody>
            <tr v-for="row in 4" :key="row">
              <td><span class="ds-skeleton" style="width:160px"></span></td>
              <td><span class="ds-skeleton ds-skeleton--pill"></span></td>
              <td><span class="ds-skeleton" style="width:40px"></span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="ds-tablescroll">
        <table class="ds-table ds-table--cards">
          <thead>
            <tr>
              <th>Role</th>
              <th>Permissions</th>
              <th class="ds-col-num">People</th>
              <th class="ds-col-action">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in roles" :key="role.id">
              <td data-label="Role">
                <span style="font-weight:500">{{ role.name }}</span>
                <span v-if="role.isSystem" class="ds-badge ds-badge--neutral" style="margin-left:6px">Built in</span>
                <div v-if="role.description" class="ds-meta">{{ role.description }}</div>
              </td>
              <td data-label="Permissions">
                <span v-if="role.fullAccess" class="ds-badge ds-badge--warning">Full access</span>
                <span v-else>{{ permissionCount(role) }}</span>
              </td>
              <td data-label="People" class="ds-col-num">{{ role.memberCount || 0 }}</td>
              <td data-label="Actions" class="ds-col-action">
                <RowMenu :label="`Actions for ${role.name}`">
                  <template #default="{ close }">
                    <button class="ds-menu__item" type="button" @click="openEdit(role); close()">
                      {{ role.fullAccess ? 'View role' : 'Edit role' }}
                    </button>
                    <NuxtLink
                      class="ds-menu__item"
                      :to="{ path: '/admin/access', query: { roleId: role.id } }"
                      @click.native="close"
                    >
                      See who has it
                    </NuxtLink>
                    <template v-if="!role.isSystem">
                      <span class="ds-menu__sep"></span>
                      <button class="ds-menu__item ds-menu__item--danger" type="button" @click="askDelete(role); close()">
                        Delete role
                      </button>
                    </template>
                  </template>
                </RowMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create / edit drawer -->
    <div v-if="form" class="ds-overlay" @click.self="closeForm">
      <div class="ds-drawer" role="dialog" aria-modal="true" aria-labelledby="roleFormTitle">
        <div class="ds-drawer__head">
          <h2 id="roleFormTitle" class="ds-h3">{{ formTitle }}</h2>
          <p v-if="form.fullAccess" class="ds-muted" style="margin:4px 0 0;font-size:var(--ds-text-sm)">
            Full access: every permission, everywhere. This role cannot be changed.
          </p>
          <p v-else class="ds-muted" style="margin:4px 0 0;font-size:var(--ds-text-sm)">
            Changes apply to everyone with this role on their next request.
          </p>
        </div>

        <div class="ds-drawer__body">
          <template v-if="!form.fullAccess">
            <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.name.trim() }">
              <label class="ds-label" for="roleName">Name</label>
              <input id="roleName" v-model="form.name" class="ds-input" type="text">
              <span v-if="showErrors && !form.name.trim()" class="ds-error">Give the role a name.</span>
            </div>

            <div class="ds-field">
              <label class="ds-label" for="roleDescription">Description</label>
              <textarea id="roleDescription" v-model="form.description" class="ds-textarea" rows="2"></textarea>
            </div>

            <fieldset v-for="module in catalogue" :key="module.key" class="ds-checkgroup roles__module">
              <legend class="ds-checkgroup__legend">{{ module.label }}</legend>
              <div v-for="item in module.permissions" :key="item.code" class="roles__perm">
                <label class="ds-check" :class="{ 'is-checked': isChecked(item.code) }">
                  <input type="checkbox" :checked="isChecked(item.code)" @change="toggle(item.code, $event.target.checked)">
                  <span>{{ item.label }}</span>
                </label>
                <span v-if="isSensitive(item)" class="ds-badge ds-badge--warning">Sensitive</span>
                <select
                  v-if="item.scopable && isChecked(item.code)"
                  class="ds-select roles__scope"
                  :aria-label="`Where for ${item.label}`"
                  :value="form.permissions[item.code]"
                  @change="setScope(item.code, $event.target.value)"
                >
                  <option value="church">Whole church</option>
                  <option value="own_family">Own family</option>
                </select>
              </div>
            </fieldset>
          </template>

          <div v-else class="ds-alert ds-alert--info">
            <div class="ds-alert__body">
              {{ form.name }} holds every permission, including access control. To give someone less,
              choose another role for them.
            </div>
          </div>
        </div>

        <div class="ds-drawer__foot">
          <button class="ds-btn ds-btn--ghost" type="button" @click="closeForm">
            {{ form.fullAccess ? 'Close' : 'Cancel' }}
          </button>
          <button v-if="!form.fullAccess" class="ds-btn ds-btn--primary" type="button" :disabled="isSaving" @click="save">
            <span v-if="isSaving" class="ds-btn__spinner"></span>
            {{ isSaving ? 'Saving' : (form.id ? 'Save changes' : 'Create role') }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="!!pendingDelete"
      :busy="isSaving"
      title="Delete this role?"
      :message="deleteMessage"
      confirm-label="Delete role"
      @cancel="pendingDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script>
import RowMenu from '../../../components/RowMenu'
import ConfirmDialog from '../../../components/ConfirmDialog'
import { payload, errorMessage } from '../../../network/MobileApp'
import { isSensitive } from '../../../network/Access'

/**
 * Roles are presets: a name and a set of permissions, each church-wide or
 * for the holder's own family. Church Manager is full access and read-only;
 * the built-in roles can be edited but not deleted.
 */
export default {
  name: 'access-roles',
  components: { RowMenu, ConfirmDialog },
  data () {
    return {
      roles: [],
      catalogue: [],
      isLoading: false,
      isSaving: false,
      error: '',
      showErrors: false,
      form: null,
      pendingDelete: null
    }
  },
  computed: {
    formTitle () {
      if (!this.form) { return '' }
      if (this.form.fullAccess) { return this.form.name }
      return this.form.id ? `Edit ${this.form.name || 'role'}` : 'New role'
    },
    deleteMessage () {
      if (!this.pendingDelete) { return '' }
      return this.pendingDelete.memberCount
        ? `${this.pendingDelete.name} is still given to ${this.pendingDelete.memberCount === 1 ? '1 person' : this.pendingDelete.memberCount + ' people'}. Move them to another role first.`
        : `${this.pendingDelete.name} will be removed. This cannot be undone.`
    }
  },
  beforeMount () {
    this.load()
    this.$axios.get('admin/access/catalogue').then(response => {
      this.catalogue = payload(response) || []
    }).catch(error => this.$toast.error(errorMessage(error, 'Could not load the list of permissions.')))
  },
  methods: {
    isSensitive,
    permissionCount (role) {
      const count = (role.permissions || []).length
      return count === 1 ? '1 permission' : `${count} permissions`
    },
    load () {
      this.isLoading = true
      this.error = ''
      this.$axios.get('admin/access/roles').then(response => {
        this.roles = payload(response) || []
        this.isLoading = false
      }).catch(error => {
        this.isLoading = false
        this.error = errorMessage(error, 'The church server did not respond.')
      })
    },

    /** `permissions` is `{ code: scope }` while editing. */
    openCreate () {
      this.showErrors = false
      this.form = { id: '', name: '', description: '', fullAccess: false, permissions: {} }
    },
    openEdit (role) {
      const permissions = {}
      ;(role.permissions || []).forEach(item => { permissions[item.code] = item.scope || 'church' })
      this.showErrors = false
      this.form = {
        id: role.id,
        name: role.name || '',
        description: role.description || '',
        fullAccess: !!role.fullAccess,
        permissions
      }
    },
    closeForm () {
      if (!this.isSaving) { this.form = null }
    },
    isChecked (code) {
      return Object.prototype.hasOwnProperty.call(this.form.permissions, code)
    },
    toggle (code, checked) {
      if (checked) {
        this.$set(this.form.permissions, code, 'church')
      } else {
        this.$delete(this.form.permissions, code)
      }
    },
    setScope (code, scope) {
      this.$set(this.form.permissions, code, scope)
    },
    save () {
      if (!this.form.name.trim()) {
        this.showErrors = true
        return
      }

      const body = {
        name: this.form.name.trim(),
        description: this.form.description.trim(),
        permissions: Object.keys(this.form.permissions).map(code => ({ code, scope: this.form.permissions[code] }))
      }
      const request = this.form.id
        ? this.$axios.put(`admin/access/roles/${this.form.id}`, body)
        : this.$axios.post('admin/access/roles', body)

      this.isSaving = true
      request.then(() => {
        this.isSaving = false
        this.$toast.success(this.form.id ? 'Role saved' : 'Role created')
        this.form = null
        this.load()
      }).catch(error => {
        this.isSaving = false
        this.$toast.error(errorMessage(error, 'Could not save the role. Nothing was changed.'))
      })
    },

    askDelete (role) {
      this.pendingDelete = role
    },
    confirmDelete () {
      const role = this.pendingDelete
      if (!role) { return }

      this.isSaving = true
      this.$axios.delete(`admin/access/roles/${role.id}`).then(() => {
        this.isSaving = false
        this.pendingDelete = null
        this.$toast.success('Role deleted')
        this.load()
      }).catch(error => {
        this.isSaving = false
        this.pendingDelete = null
        this.$toast.error(errorMessage(error, 'Could not delete the role. Nothing was changed.'))
      })
    }
  }
}
</script>

<style scoped>
.roles__module { margin-bottom: 20px; }

.roles__perm {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.roles__scope { width: auto; min-width: 150px; }
</style>
