<template>
  <div>
    <!-- Identity header -->
    <div v-if="isLoading && !person" class="ds-card" style="margin-bottom:24px">
      <div class="ds-recordhead">
        <div style="display:grid;gap:10px;flex:1;max-width:320px">
          <span class="ds-skeleton" style="height:18px;width:60%"></span>
          <span class="ds-skeleton" style="height:12px;width:80%"></span>
        </div>
      </div>
    </div>

    <div v-else-if="loadError" class="ds-errorstate">
      <h3 class="ds-h3">Could not open this person</h3>
      <p>{{ loadError }}</p>
      <NuxtLink class="ds-btn ds-btn--secondary ds-btn--sm" to="/admin/access">Back to people</NuxtLink>
    </div>

    <template v-else-if="person">
      <div class="ds-card" style="margin-bottom:24px">
        <div class="ds-recordhead">
          <div class="ds-recordhead__copy">
            <h1 class="ds-h1">{{ person.name || 'Member' }}</h1>
            <div class="ds-recordhead__meta">
              <span v-if="person.phoneNumber" class="ds-num">{{ person.phoneNumber }}</span>
              <span class="ds-badge ds-badge--neutral">{{ person.familyName || 'No church family' }}</span>
              <span class="ds-badge" :class="role.fullAccess ? 'ds-badge--warning' : 'ds-badge--info'">
                {{ role.name || 'Member' }}
              </span>
            </div>
          </div>

          <div v-if="canChange" class="ds-recordhead__actions">
            <button class="ds-btn ds-btn--primary" type="button" @click="openRole">Change role</button>
          </div>
        </div>
      </div>

      <div v-if="isSelf" class="ds-alert ds-alert--info" style="margin-bottom:20px">
        <div class="ds-alert__body">This is you. Someone else with access control has to change your access.</div>
      </div>
      <div v-else-if="role.fullAccess" class="ds-alert ds-alert--warning" style="margin-bottom:20px">
        <div class="ds-alert__body">
          <strong>{{ role.name }} has full access.</strong>
          Every permission comes with the role, so there is nothing to grant. Change the role to limit it.
        </div>
      </div>

      <!-- Permissions grid -->
      <section class="ds-section" aria-label="Permissions">
        <div class="ds-section__head">
          <div>
            <h2 class="ds-h2">What {{ firstName }} can do</h2>
            <span class="ds-meta">From the role, plus anything granted or blocked for {{ firstName }} alone.</span>
          </div>
        </div>

        <div v-for="module in catalogue" :key="module.key" class="ds-tablewrap access__module">
          <div class="ds-toolbar">
            <h3 class="ds-h3" style="margin:0">{{ module.label }}</h3>
          </div>
          <div class="ds-tablescroll">
            <table class="ds-table ds-table--cards">
              <thead>
                <tr>
                  <th>Permission</th>
                  <th>Where</th>
                  <th>Why</th>
                  <th v-if="canChange && !role.fullAccess" class="ds-col-action">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in module.permissions" :key="item.code">
                  <td data-label="Permission">
                    <span style="font-weight:500">{{ item.label }}</span>
                    <span v-if="isSensitive(item)" class="ds-badge ds-badge--warning" style="margin-left:6px">Sensitive</span>
                    <div v-if="item.description" class="ds-meta">{{ item.description }}</div>
                  </td>
                  <td data-label="Where">
                    <span v-if="state(item.code).kind === 'denied'" class="ds-status ds-status--danger">
                      <span class="ds-status__dot"></span>Blocked
                    </span>
                    <span v-else-if="state(item.code).kind === 'none'" class="ds-meta">—</span>
                    <span v-else class="ds-status ds-status--success">
                      <span class="ds-status__dot"></span>✓ {{ state(item.code).text }}
                    </span>
                  </td>
                  <td data-label="Why">
                    <ul v-if="state(item.code).sources.length" class="access__sources">
                      <li v-for="(source, index) in state(item.code).sources" :key="index">{{ source }}</li>
                    </ul>
                    <span v-else class="ds-meta">—</span>
                  </td>
                  <td v-if="canChange && !role.fullAccess" data-label="Actions" class="ds-col-action">
                    <RowMenu :label="`Actions for ${item.label}`">
                      <template #default="{ close }">
                        <button class="ds-menu__item" type="button" @click="openGrant(item, 'allow'); close()">
                          Grant…
                        </button>
                        <button
                          v-if="state(item.code).kind !== 'denied'"
                          class="ds-menu__item ds-menu__item--danger"
                          type="button"
                          @click="openGrant(item, 'deny'); close()"
                        >
                          Block…
                        </button>
                      </template>
                    </RowMenu>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Active grants -->
      <section class="ds-section" aria-label="Grants">
        <div class="ds-section__head">
          <div>
            <h2 class="ds-h2">Granted and blocked for {{ firstName }}</h2>
            <span class="ds-meta">Changes take effect on {{ firstName }}'s next request.</span>
          </div>
        </div>

        <div class="ds-tablewrap">
          <div v-if="!grants.length" class="ds-empty">
            <h3 class="ds-h3">Nothing beyond the role</h3>
            <p>Use Grant or Block on a permission above to change it for {{ firstName }} only.</p>
          </div>
          <div v-else class="ds-tablescroll">
            <table class="ds-table ds-table--cards">
              <thead>
                <tr>
                  <th>Permission</th>
                  <th>Change</th>
                  <th>Where</th>
                  <th>Reason</th>
                  <th>By</th>
                  <th>Expires</th>
                  <th v-if="canChange" class="ds-col-action">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="grant in grants" :key="grant.id">
                  <td data-label="Permission" style="font-weight:500">{{ label(grant.permission) }}</td>
                  <td data-label="Change">
                    <span class="ds-badge" :class="grant.effect === 'deny' ? 'ds-badge--danger' : 'ds-badge--success'">
                      {{ grant.effect === 'deny' ? 'Blocked' : 'Allowed' }}
                    </span>
                  </td>
                  <td data-label="Where">{{ grant.effect === 'deny' ? 'Everywhere' : scopeText(grant.scope, grant.familyName) }}</td>
                  <td data-label="Reason" class="ds-muted">{{ grant.reason || '—' }}</td>
                  <td data-label="By" class="ds-muted">
                    {{ grant.grantedByName || '—' }}
                    <div class="ds-meta">{{ fmtDate(grant.grantedAt) }}</div>
                  </td>
                  <td data-label="Expires" class="ds-muted">{{ grant.expiresAt ? fmtDate(grant.expiresAt) : 'Never' }}</td>
                  <td v-if="canChange" data-label="Actions" class="ds-col-action">
                    <button class="ds-btn ds-btn--danger-quiet ds-btn--sm" type="button" @click="askRevoke(grant)">
                      Revoke
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- History -->
      <section class="ds-section" aria-label="History">
        <div class="ds-section__head">
          <h2 class="ds-h2">History</h2>
        </div>
        <div class="ds-card">
          <div v-if="!history.length" class="ds-card__body ds-muted">No changes to {{ firstName }}'s access yet.</div>
          <ul v-else class="access__history">
            <li v-for="entry in history" :key="entry.id">
              <span>{{ entry.summary }}</span>
              <span class="ds-meta">{{ entry.actorName || 'Someone' }} · {{ fmtDateTime(entry.createdAt) }}</span>
            </li>
          </ul>
        </div>
      </section>
    </template>

    <!-- Change role -->
    <div v-if="isRoleOpen" class="ds-overlay" @click.self="closeRole">
      <div class="ds-modal" role="dialog" aria-modal="true" aria-labelledby="roleTitle">
        <div class="ds-modal__head">
          <div>
            <h2 id="roleTitle" class="ds-h3">Change {{ firstName }}'s role</h2>
            <p>Grants and blocks made for {{ firstName }} alone stay as they are.</p>
          </div>
        </div>

        <div class="ds-modal__body">
          <div class="ds-field" :class="{ 'is-invalid': showErrors && !roleForm.roleId }">
            <label class="ds-label" for="roleSelect">Role</label>
            <select id="roleSelect" v-model="roleForm.roleId" class="ds-select">
              <option value="" disabled>Select a role</option>
              <option v-for="option in roles" :key="option.id" :value="option.id">{{ option.name }}</option>
            </select>
            <span v-if="showErrors && !roleForm.roleId" class="ds-error">Choose a role.</span>
            <span v-else-if="selectedRole && selectedRole.description" class="ds-help">{{ selectedRole.description }}</span>
          </div>

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !roleForm.reason.trim() }" style="margin-bottom:0">
            <label class="ds-label" for="roleReason">Reason</label>
            <textarea id="roleReason" v-model="roleForm.reason" class="ds-textarea" rows="3"></textarea>
            <span v-if="showErrors && !roleForm.reason.trim()" class="ds-error">Say why. It is kept in the access history.</span>
          </div>
        </div>

        <div class="ds-modal__foot">
          <button class="ds-btn ds-btn--ghost" type="button" @click="closeRole">Cancel</button>
          <button class="ds-btn ds-btn--primary" type="button" :disabled="isSaving" @click="saveRole">
            <span v-if="isSaving" class="ds-btn__spinner"></span>
            {{ isSaving ? 'Saving' : 'Save role' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Grant or block one permission -->
    <div v-if="grantForm" class="ds-overlay" @click.self="closeGrant">
      <div class="ds-modal" role="dialog" aria-modal="true" aria-labelledby="grantTitle">
        <div class="ds-modal__head">
          <div>
            <h2 id="grantTitle" class="ds-h3">
              {{ grantForm.effect === 'deny' ? 'Block' : 'Grant' }}: {{ grantForm.permission.label }}
            </h2>
            <p v-if="grantForm.effect === 'deny'">
              {{ firstName }} will not be able to do this anywhere, even if the role allows it.
            </p>
            <p v-else>{{ grantForm.permission.description || `In addition to what ${firstName}'s role gives.` }}</p>
          </div>
        </div>

        <div class="ds-modal__body">
          <template v-if="grantForm.effect === 'allow'">
            <div class="ds-field">
              <label class="ds-label" for="grantScope">Where</label>
              <select id="grantScope" v-model="grantForm.scope" class="ds-select" :disabled="!grantForm.permission.scopable">
                <option v-for="option in scopeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
              <span v-if="!grantForm.permission.scopable" class="ds-help">This one always covers the whole church.</span>
              <span v-else-if="grantForm.scope === 'own_family'" class="ds-help">
                {{ person.familyName ? `Currently ${person.familyName}.` : `${firstName} is not in a church family yet.` }}
                Follows {{ firstName }} if they move family.
              </span>
            </div>

            <div
              v-if="grantForm.scope === 'family'"
              class="ds-field"
              :class="{ 'is-invalid': showErrors && !grantForm.familyId }"
            >
              <label class="ds-label" for="grantFamily">Church family</label>
              <select id="grantFamily" v-model="grantForm.familyId" class="ds-select">
                <option value="" disabled>Select a family</option>
                <option v-for="family in families" :key="family.id" :value="family.id">{{ family.name }}</option>
              </select>
              <span v-if="showErrors && !grantForm.familyId" class="ds-error">Choose a family.</span>
            </div>

            <div class="ds-field">
              <label class="ds-label" for="grantExpires">Expires</label>
              <input id="grantExpires" v-model="grantForm.expiresOn" class="ds-input" type="date" :min="today">
              <span class="ds-help">Optional. Leave empty to keep it until it is revoked.</span>
            </div>
          </template>

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !grantForm.reason.trim() }" style="margin-bottom:0">
            <label class="ds-label" for="grantReason">Reason</label>
            <textarea id="grantReason" v-model="grantForm.reason" class="ds-textarea" rows="3"></textarea>
            <span v-if="showErrors && !grantForm.reason.trim()" class="ds-error">Say why. It is kept in the access history.</span>
          </div>
        </div>

        <div class="ds-modal__foot">
          <button class="ds-btn ds-btn--ghost" type="button" @click="closeGrant">Cancel</button>
          <button
            class="ds-btn"
            :class="grantForm.effect === 'deny' ? 'ds-btn--danger' : 'ds-btn--primary'"
            type="button"
            :disabled="isSaving"
            @click="saveGrant"
          >
            <span v-if="isSaving" class="ds-btn__spinner"></span>
            {{ isSaving ? 'Saving' : (grantForm.effect === 'deny' ? 'Block' : 'Grant') }}
          </button>
        </div>
      </div>
    </div>

    <ReasonDialog
      :open="!!pendingRevoke"
      :busy="isSaving"
      title="Revoke this?"
      :message="revokeMessage"
      confirm-label="Revoke"
      @cancel="pendingRevoke = null"
      @confirm="confirmRevoke"
    />
  </div>
</template>

<script>
import RowMenu from '../../../../components/RowMenu'
import ReasonDialog from '../../../../components/ReasonDialog'
import { payload, errorMessage } from '../../../../network/MobileApp'
import { indexCatalogue, isSensitive, permissionLabel, scopeLabel, SCOPE_LABELS } from '../../../../network/Access'

/**
 * One person's access: their role, what it and their own grants add up to,
 * and why.
 *
 * Every number on this page comes from the API's `effective` list; nothing is
 * worked out here. The API also refuses anything the signed-in manager may
 * not do (their own access, a permission they do not hold themselves, the
 * last person with access control), and its message is shown as it is.
 */
export default {
  name: 'access-person',
  components: { RowMenu, ReasonDialog },
  data () {
    return {
      person: null,
      role: {},
      grants: [],
      effective: [],
      history: [],
      catalogue: [],
      roles: [],
      families: [],
      isLoading: false,
      isSaving: false,
      loadError: '',
      showErrors: false,
      isRoleOpen: false,
      roleForm: { roleId: '', reason: '' },
      grantForm: null,
      pendingRevoke: null,
      today: this.$moment().format('YYYY-MM-DD')
    }
  },
  computed: {
    userId () {
      return this.$route.params.id
    },
    firstName () {
      const name = (this.person && this.person.name) || ''
      return name.split(' ')[0] || 'this person'
    },
    isSelf () {
      const me = this.$store.state.access.me
      return !!(me && this.person && me.userId === this.person.userId)
    },
    canChange () {
      return !this.isSelf
    },
    catalogueIndex () {
      return indexCatalogue(this.catalogue)
    },
    effectiveByCode () {
      const map = {}
      this.effective.forEach(entry => { map[entry.code] = entry })
      return map
    },
    selectedRole () {
      return this.roles.filter(role => role.id === this.roleForm.roleId)[0] || null
    },
    scopeOptions () {
      if (!this.grantForm || !this.grantForm.permission.scopable) {
        return [{ value: 'church', label: SCOPE_LABELS.church }]
      }
      return ['church', 'own_family', 'family'].map(value => ({ value, label: SCOPE_LABELS[value] }))
    },
    revokeMessage () {
      if (!this.pendingRevoke) { return '' }
      const what = this.label(this.pendingRevoke.permission)
      return this.pendingRevoke.effect === 'deny'
        ? `${what} will no longer be blocked for ${this.firstName}; the role decides again.`
        : `${this.firstName} will lose "${what}" unless the role gives it.`
    }
  },
  beforeMount () {
    this.load()
    this.loadReference()
  },
  methods: {
    isSensitive,
    label (code) {
      return permissionLabel(this.catalogueIndex, code)
    },
    scopeText (scope, familyName) {
      return scopeLabel(scope, familyName)
    },
    fmtDate (value) {
      return value ? this.$moment(value).format('D MMM YYYY') : '—'
    },
    fmtDateTime (value) {
      return value ? this.$moment(value).format('D MMM YYYY, HH:mm') : ''
    },
    /** What the grid shows for one permission, from the API's effective list. */
    state (code) {
      const entry = this.effectiveByCode[code]
      if (!entry) { return { kind: 'none', text: '', sources: [] } }

      const sources = entry.sources || []
      if (entry.denied) { return { kind: 'denied', text: '', sources } }
      if (entry.church) { return { kind: 'allowed', text: 'Whole church', sources } }

      const names = entry.familyNames && entry.familyNames.length ? entry.familyNames : []
      if (names.length) { return { kind: 'allowed', text: names.join(', '), sources } }
      if ((entry.familyIds || []).length) { return { kind: 'allowed', text: 'Some families', sources } }
      return { kind: 'none', text: '', sources }
    },
    showError (error, fallback) {
      this.$toast.error(errorMessage(error, fallback))
    },
    load () {
      this.isLoading = true
      this.loadError = ''

      return this.$axios.get(`admin/access/people/${this.userId}`).then(response => {
        const data = payload(response) || {}
        this.person = data.person || null
        this.role = data.role || {}
        this.grants = data.grants || []
        this.effective = data.effective || []
        this.history = data.history || []
        this.isLoading = false
      }).catch(error => {
        this.isLoading = false
        this.loadError = errorMessage(error, 'The church server did not respond. Nothing was changed.')
      })
    },
    loadReference () {
      this.$axios.get('admin/access/catalogue').then(response => {
        this.catalogue = payload(response) || []
      }).catch(error => this.showError(error, 'Could not load the list of permissions.'))

      this.$axios.get('admin/access/roles').then(response => {
        this.roles = payload(response) || []
      }).catch(() => { this.roles = [] })

      this.$axios.get('churchfamilies').then(response => {
        this.families = payload(response) || []
      }).catch(() => { this.families = [] })
    },

    openRole () {
      this.roleForm = { roleId: this.role.id || '', reason: '' }
      this.showErrors = false
      this.isRoleOpen = true
    },
    closeRole () {
      if (!this.isSaving) { this.isRoleOpen = false }
    },
    saveRole () {
      if (!this.roleForm.roleId || !this.roleForm.reason.trim()) {
        this.showErrors = true
        return
      }

      this.isSaving = true
      this.$axios.put(`admin/access/people/${this.userId}/role`, {
        roleId: this.roleForm.roleId,
        reason: this.roleForm.reason.trim()
      }).then(() => {
        this.isSaving = false
        this.isRoleOpen = false
        this.$toast.success('Role changed')
        this.load()
      }).catch(error => {
        this.isSaving = false
        this.showError(error, 'Could not change the role. Nothing was changed.')
      })
    },

    openGrant (permission, effect) {
      this.showErrors = false
      this.grantForm = {
        permission,
        effect,
        scope: 'church',
        familyId: '',
        expiresOn: '',
        reason: ''
      }
    },
    closeGrant () {
      if (!this.isSaving) { this.grantForm = null }
    },
    saveGrant () {
      const form = this.grantForm
      const needsFamily = form.effect === 'allow' && form.scope === 'family'
      if (!form.reason.trim() || (needsFamily && !form.familyId)) {
        this.showErrors = true
        return
      }

      // A block covers the permission everywhere, so it carries no scope of
      // its own beyond the church.
      const body = {
        permission: form.permission.code,
        effect: form.effect,
        scope: form.effect === 'deny' ? 'church' : form.scope,
        reason: form.reason.trim()
      }
      if (needsFamily) { body.familyId = form.familyId }
      if (form.effect === 'allow' && form.expiresOn) {
        // Good for the whole of the chosen day.
        body.expiresAt = this.$moment(form.expiresOn, 'YYYY-MM-DD').endOf('day').toISOString()
      }

      this.isSaving = true
      this.$axios.post(`admin/access/people/${this.userId}/grants`, body).then(() => {
        this.isSaving = false
        this.grantForm = null
        this.$toast.success(body.effect === 'deny' ? 'Blocked' : 'Granted')
        this.load()
      }).catch(error => {
        this.isSaving = false
        this.showError(error, 'Could not save. Nothing was changed.')
      })
    },

    askRevoke (grant) {
      this.pendingRevoke = grant
    },
    confirmRevoke (reason) {
      const grant = this.pendingRevoke
      if (!grant) { return }

      this.isSaving = true
      this.$axios.delete(`admin/access/grants/${grant.id}`, { params: { reason } }).then(() => {
        this.isSaving = false
        this.pendingRevoke = null
        this.$toast.success('Revoked')
        this.load()
      }).catch(error => {
        this.isSaving = false
        this.showError(error, 'Could not revoke. Nothing was changed.')
      })
    }
  }
}
</script>

<style scoped>
.access__module { margin-bottom: 16px; }

.access__sources {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: var(--ds-text-sm);
  color: var(--ds-text-2);
}

.access__history {
  list-style: none;
  margin: 0;
  padding: 0;
}

.access__history li {
  display: grid;
  gap: 2px;
  padding: 12px 20px;
  border-top: 1px solid var(--ds-border);
}

.access__history li:first-child { border-top: 0; }
</style>
