<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Assign role</h1>
        <p v-if="update.name">Change what {{ update.name }} can see and do in the church app.</p>
        <p v-else>Change what this member can see and do in the church app.</p>
      </div>
    </div>

    <div v-if="pageRefresh" class="ds-card" style="max-width:560px">
      <div class="ds-card__body">
        <div style="display:grid;gap:16px">
          <span class="ds-skeleton" style="height:14px;width:30%"></span>
          <span class="ds-skeleton" style="height:22px;width:45%"></span>
          <span class="ds-skeleton" style="height:14px;width:25%"></span>
          <span class="ds-skeleton" style="height:38px"></span>
        </div>
      </div>
    </div>

    <form v-else class="ds-card" style="max-width:560px" @submit.prevent="assignRole">
      <div class="ds-card__body">
        <div class="ds-field">
          <span class="ds-label">Current role</span>
          <p style="margin:0">
            <span class="ds-badge ds-badge--info">{{ getCurrentRole() }}</span>
          </p>
        </div>

        <div class="ds-field" :class="{ 'is-invalid': !emptyRole }" style="margin-bottom:0">
          <label class="ds-label" for="roleSelect">New role</label>
          <select id="roleSelect" v-model="roleId" class="ds-select">
            <option value="" disabled>Select a role</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
          </select>
          <span v-if="!emptyRole" class="ds-error">Select a role before saving.</span>
          <span v-else class="ds-help">{{ roleHelp }}</span>
        </div>
      </div>

      <div class="ds-card__foot" style="display:flex;gap:8px;justify-content:flex-end">
        <button class="ds-btn ds-btn--ghost" type="button" @click="$router.back()">Cancel</button>
        <button class="ds-btn ds-btn--primary" type="submit" :disabled="isLoading">
          <span v-if="isLoading" class="ds-btn__spinner"></span>
          {{ isLoading ? 'Saving' : 'Save role' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ChurchMember } from '../../../../network/Member'

/** Plain-language description of what each role can do, by role id. */
const ROLE_HELP = {
  1: 'Church managers can see all giving, manage members and change settings.',
  2: 'Family group managers can see and record giving for their own church family.',
  3: 'Regular members can see their own tithe, welfare and announcements.'
}

export default {
  name: 'assign-role',
  data () {
    return {
      update: ChurchMember,
      isLoading: false,
      pageRefresh: false,
      roleId: '',
      emptyRole: true,
      roles: []
    }
  },
  computed: {
    roleHelp () {
      return ROLE_HELP[this.roleId] || 'Choose the role that matches what this member does in church.'
    }
  },
  mounted () {
    const id = this.$route.params.id
    this.getMember(id)
    this.getRoles()
  },
  methods: {
    getMember (id) {
      this.pageRefresh = true
      this.$axios.get(`churchmembers/user/${id}`).then(response => {
        this.update = Object.assign(this.update, response.data.data)
        if (this.update.dataOfBirth && typeof this.update.dataOfBirth === 'string') {
          this.update.dataOfBirth = this.update.dataOfBirth.split('T')[0]
        }
        this.pageRefresh = false
      }).catch(() => {
        this.pageRefresh = false
      })
    },
    getRoles () {
      this.$axios.get('roles').then(response => {
        this.roles = response.data.data
      }).catch(() => {})
    },
    getCurrentRole () {
      const role = this.roles.filter(item => item.id === this.update.roleId)
      if (role.length === 0) {
        return 'Not assigned'
      }
      return role[0].name
    },
    async assignRole () {
      if (!this.roleId) {
        this.emptyRole = false
        return
      }
      this.emptyRole = true

      const requestData = {
        userId: this.update.id,
        roleId: this.roleId
      }

      try {
        this.isLoading = true
        // No explicit Authorization header: the auth module is configured with
        // `token.global`, so the bearer token is already on every request. The
        // manual header this replaces read auth._token.local from localStorage,
        // which is never written (the strategy has localStorage disabled), so it
        // sent the literal string "Bearer null" and overrode the real token.
        await this.$axios.post('roles/assign', requestData)
        this.update.roleId = this.roleId
        this.$toast.success('Role updated')
        this.isLoading = false
      } catch (e) {
        const message = e && e.response && e.response.data && e.response.data.message
          ? e.response.data.message
          : 'Could not update this role.'
        this.$toast.error(message, { fitToScreen: true })
        this.isLoading = false
      }
    }
  }
}
</script>
