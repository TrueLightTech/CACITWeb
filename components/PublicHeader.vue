<template>
  <!--
    display: contents, so the header stays sticky against the page. The menu
    sits outside <header> because the header's backdrop-filter makes it the
    containing block for anything fixed inside it, which clipped the menu to
    the header's own height.
  -->
  <div class="ph-root">
    <header class="ph">
      <div class="pub-container ph__inner">
        <NuxtLink to="/" class="ph__brand" aria-label="CACI Taifa Central, home">
          <img src="~assets/imgs/caci_mark.png" alt="" class="ph__mark" width="36" height="36">
          <span class="ph__name">
            <span class="ph__title">CACI Taifa Central</span>
            <span class="ph__sub">Miracle Centre · Accra</span>
          </span>
        </NuxtLink>

        <nav class="ph__nav" aria-label="Main">
          <NuxtLink v-for="item in links" :key="item.to" :to="item.to" class="ph__link">
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="ph__actions">
          <NuxtLink to="/login" class="pub-btn pub-btn--secondary pub-btn--sm ph__signin">Sign in</NuxtLink>

          <button
            ref="toggle"
            class="ph__toggle"
            type="button"
            aria-controls="ph-menu"
            :aria-expanded="open ? 'true' : 'false'"
            @click="open ? close() : show()"
          >
            <span class="ph__bars" :class="{ 'is-open': open }" aria-hidden="true"></span>
            <span class="ph__sr">{{ open ? 'Close menu' : 'Open menu' }}</span>
          </button>
        </div>
      </div>
    </header>

    <transition name="ph-menu">
      <div
        v-if="open"
        id="ph-menu"
        class="ph__menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div class="ph__scrim" @click="close"></div>
        <div ref="panel" class="ph__panel">
          <nav aria-label="Main">
            <ul class="ph__menulist">
              <li v-for="item in links" :key="item.to">
                <NuxtLink :to="item.to" class="ph__menulink" @click.native="close">{{ item.label }}</NuxtLink>
              </li>
            </ul>
          </nav>

          <ul class="ph__menulegal">
            <li v-for="item in legal" :key="item.to">
              <NuxtLink :to="item.to" @click.native="close">{{ item.label }}</NuxtLink>
            </li>
          </ul>

          <NuxtLink to="/login" class="pub-btn pub-btn--primary ph__menucta" @click.native="close">
            Sign in
          </NuxtLink>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'PublicHeader',
  data () {
    return {
      open: false,
      links: [
        { to: '/#services', label: 'Service times' },
        { to: '/#ministries', label: 'Ministries' },
        { to: '/#app-download', label: 'The app' },
        { to: '/support', label: 'Support' }
      ],
      legal: [
        { to: '/privacypolicy', label: 'Privacy' },
        { to: '/terms', label: 'Terms' },
        { to: '/child-safety', label: 'Child safety' },
        { to: '/delete-account', label: 'Delete account' }
      ]
    }
  },
  watch: {
    $route () { this.close() }
  },
  beforeDestroy () {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', this.onKeydown)
  },
  methods: {
    show () {
      this.open = true
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', this.onKeydown)
      this.$nextTick(() => {
        const first = this.$refs.panel && this.$refs.panel.querySelector('a')
        if (first) { first.focus() }
      })
    },
    close () {
      if (!this.open) { return }
      this.open = false
      document.body.style.overflow = ''
      document.removeEventListener('keydown', this.onKeydown)
      this.$nextTick(() => { this.$refs.toggle && this.$refs.toggle.focus() })
    },
    onKeydown (event) {
      if (event.key === 'Escape') { this.close() }
      if (event.key === 'Tab') { this.trapFocus(event) }
    },
    // Keeps Tab inside the open menu, which is the page as far as the
    // visitor is concerned; the toggle stays reachable so it can be closed.
    trapFocus (event) {
      const panel = this.$refs.panel
      if (!panel) { return }
      const focusable = [this.$refs.toggle, ...panel.querySelectorAll('a')]
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }
}
</script>

<style scoped>
.ph-root { display: contents; }

.ph {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.86);
  -webkit-backdrop-filter: saturate(180%) blur(16px);
  backdrop-filter: saturate(180%) blur(16px);
  border-bottom: 1px solid var(--pub-line);
}

.ph__inner {
  display: flex;
  align-items: center;
  gap: 32px;
  height: var(--pub-header-h);
}

.ph__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--pub-text);
  margin-right: auto;
  min-width: 0;
}

.ph__mark { width: 36px; height: 36px; flex-shrink: 0; }

.ph__name { display: grid; line-height: 1.2; min-width: 0; }
.ph__title { font-size: 0.9375rem; font-weight: 600; letter-spacing: -0.01em; color: var(--pub-text); }
.ph__sub { font-size: 0.8125rem; color: var(--pub-text-3); white-space: nowrap; }

.ph__nav { display: flex; align-items: center; gap: 4px; }

.ph__link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 0.9375rem;
  color: var(--pub-text-2);
  text-decoration: none;
  transition: color var(--pub-fast) var(--pub-ease), background-color var(--pub-fast) var(--pub-ease);
}
.ph__link:hover { color: var(--pub-text); background: var(--pub-bg-soft); }
.ph__link.nuxt-link-active:not([href^="/#"]) { color: var(--pub-text); font-weight: 500; }

.ph__actions { display: flex; align-items: center; gap: 8px; }

.ph__toggle {
  display: none;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
}
.ph__toggle:hover { background: var(--pub-bg-soft); }

.ph__bars,
.ph__bars::before,
.ph__bars::after {
  display: block;
  width: 18px;
  height: 1.5px;
  border-radius: 2px;
  background: var(--pub-text);
  transition: transform 200ms var(--pub-ease), background-color 200ms var(--pub-ease);
}
.ph__bars { position: relative; }
.ph__bars::before,
.ph__bars::after { content: ''; position: absolute; left: 0; }
.ph__bars::before { transform: translateY(-5px); }
.ph__bars::after { transform: translateY(5px); }
.ph__bars.is-open { background: transparent; }
.ph__bars.is-open::before { transform: rotate(45deg); }
.ph__bars.is-open::after { transform: rotate(-45deg); }

.ph__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* Menu — below the header, so the toggle stays where the thumb left it. */
.ph__menu {
  position: fixed;
  inset: var(--pub-header-h) 0 0;
  z-index: 999;
}

.ph__scrim { position: absolute; inset: 0; background: rgba(11, 27, 69, 0.24); }

.ph__panel {
  position: relative;
  max-height: 100%;
  overflow-y: auto;
  background: #FFFFFF;
  border-bottom: 1px solid var(--pub-line);
  padding: 8px var(--pub-gutter) 28px;
  display: grid;
  gap: 24px;
}

.ph__menulist { list-style: none; padding: 0; }
.ph__menulist li + li { border-top: 1px solid var(--pub-line); }

.ph__menulink {
  display: flex;
  align-items: center;
  min-height: 56px;
  font-family: var(--pub-serif);
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--pub-text) !important;
  text-decoration: none;
}

.ph__menulegal {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 20px;
}
.ph__menulegal a {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  font-size: var(--pub-small);
  color: var(--pub-text-2);
  text-decoration: none;
}

.ph__menucta { width: 100%; }

.ph-menu-enter-active,
.ph-menu-leave-active { transition: opacity 180ms var(--pub-ease); }
.ph-menu-enter-active .ph__panel,
.ph-menu-leave-active .ph__panel { transition: transform 220ms var(--pub-ease); }
.ph-menu-enter,
.ph-menu-leave-to { opacity: 0; }
.ph-menu-enter .ph__panel,
.ph-menu-leave-to .ph__panel { transform: translateY(-8px); }

@media (max-width: 880px) {
  .ph__nav { display: none; }
  .ph__toggle { display: inline-flex; }
}

@media (max-width: 420px) {
  .ph__signin { display: none; }
}
</style>
