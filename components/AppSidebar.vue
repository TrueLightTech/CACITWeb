<template>
  <aside class="ds-sidebar" :class="{ 'is-open': open }" aria-label="Main navigation">
    <NuxtLink class="ds-sidebar__brand" to="/admin/dashboard" @click.native="$emit('navigate')">
      <img class="ds-sidebar__mark" src="~assets/imgs/caci_logo.png" alt="">
      <span class="ds-sidebar__name">
        <strong>CACI Taifa</strong>
        <span>Church management</span>
      </span>
    </NuxtLink>

    <nav class="ds-sidebar__nav">
      <div v-for="group in groups" :key="group.title" class="ds-navgroup">
        <p class="ds-navgroup__title">{{ group.title }}</p>
        <ul>
          <li v-for="item in group.items" :key="item.to">
            <NuxtLink
              class="ds-navlink"
              :to="item.to"
              active-class="is-active"
              @click.native="$emit('navigate')"
            >
              <NavIcon :name="item.icon" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>

    <div class="ds-sidebar__foot">
      <NuxtLink class="ds-userchip" to="/admin/account" @click.native="$emit('navigate')">
        <img class="ds-userchip__avatar" :src="profileImage" alt="">
        <span class="ds-userchip__copy">
          <strong>{{ userName }}</strong>
          <span>{{ roleLabel }}</span>
        </span>
      </NuxtLink>

      <button class="ds-navlink ds-navlink--danger" type="button" @click="logout">
        <svg class="ds-navlink__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Log out</span>
      </button>
    </div>
  </aside>
</template>

<script>
import { mapGetters } from 'vuex'
import { profileImageBaseUrl } from '../resources/constants'
import { navigationForRole } from '../resources/navigation'
import NavIcon from './NavIcon'

export default {
  name: 'AppSidebar',
  components: { NavIcon },
  props: {
    open: { type: Boolean, default: false }
  },
  data () {
    return {
      roles: []
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
    currentUser () {
      return this.loggedInUser && this.loggedInUser.data ? this.loggedInUser.data : {}
    },
    userName () {
      return this.currentUser.name || 'My account'
    },
    groups () {
      return navigationForRole(this.currentUser.roleId)
    },
    profileImage () {
      if (this.currentUser.profilePicture) {
        return `${profileImageBaseUrl}/${this.currentUser.profilePicture}`
      }
      return require('~/assets/imgs/user.svg')
    },
    roleLabel () {
      const match = this.roles.filter(role => role.id === this.currentUser.roleId)
      return match.length === 0 ? 'Member' : match[0].name
    }
  },
  mounted () {
    this.getRoles()
  },
  methods: {
    getRoles () {
      this.$axios.get('roles').then(response => {
        this.roles = response.data.data
      }).catch(() => {
        // The role name is a label only — a failure here must not block navigation.
      })
    },
    async logout () {
      this.$emit('navigate')
      await this.$auth.logout()
      this.$toast.success('Logged out')
    }
  }
}
</script>
