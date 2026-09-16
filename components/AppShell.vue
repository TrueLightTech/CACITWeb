<template>
  <!--
    Signed-out screens (login, register, password reset, public receipts,
    privacy policy) render with no chrome, exactly as they did when AdminHeader
    gated itself on `isAuthenticated`.
  -->
  <div v-if="!isAuthenticated" class="ds-root">
    <slot />
  </div>

  <div v-else class="ds-root ds-shell">
    <button
      v-if="isNavOpen"
      class="ds-nav-backdrop"
      type="button"
      aria-label="Close navigation"
      @click="closeNav"
    ></button>

    <AppSidebar :open="isNavOpen" @navigate="closeNav" />

    <div class="ds-main">
      <header class="ds-topbar ds-topbar--mobile">
        <button
          class="ds-iconbtn ds-topbar__menu"
          type="button"
          aria-label="Open navigation"
          :aria-expanded="isNavOpen ? 'true' : 'false'"
          @click="openNav"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <NuxtLink class="ds-topbar__brand" to="/admin/dashboard">
          <img class="ds-topbar__mark" src="~assets/imgs/caci_logo.png" alt="">
          <span>CACI Taifa</span>
        </NuxtLink>
      </header>

      <div class="ds-content">
        <AppBreadcrumbs />
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AppSidebar from './AppSidebar'
import AppBreadcrumbs from './AppBreadcrumbs'

export default {
  name: 'AppShell',
  components: { AppSidebar, AppBreadcrumbs },
  data () {
    return {
      isNavOpen: false
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated'])
  },
  watch: {
    // A route change from anywhere — a breadcrumb, an in-page link, the back
    // button — closes the drawer, so it never covers the screen you asked for.
    '$route' () {
      this.closeNav()
    }
  },
  mounted () {
    document.addEventListener('keydown', this.onKeydown)
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.onKeydown)
    this.unlockScroll()
  },
  methods: {
    openNav () {
      this.isNavOpen = true
      this.lockScroll()
    },
    closeNav () {
      this.isNavOpen = false
      this.unlockScroll()
    },
    onKeydown (event) {
      if (event.key === 'Escape' && this.isNavOpen) {
        this.closeNav()
      }
    },
    lockScroll () {
      if (process.client) {
        document.body.style.overflow = 'hidden'
      }
    },
    unlockScroll () {
      if (process.client) {
        document.body.style.overflow = ''
      }
    }
  }
}
</script>
