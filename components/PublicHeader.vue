<template>
  <header class="pub-header">
    <div class="pub-container pub-header__inner">
      <NuxtLink to="/" class="pub-brand" aria-label="CACI Taifa Central Home">
        <img src="~assets/imgs/caci_logo.png" alt="CACI Logo" class="pub-brand__logo" />
        <div class="pub-brand__text">
          <span class="pub-brand__title">CACI TAIFA CENTRAL</span>
          <span class="pub-brand__sub">Miracle Centre • Accra, Ghana</span>
        </div>
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav class="pub-nav" aria-label="Main Navigation">
        <NuxtLink to="/" class="pub-nav__link">Home</NuxtLink>
        <NuxtLink to="/#services" class="pub-nav__link">Service Times</NuxtLink>
        <NuxtLink to="/#ministries" class="pub-nav__link">Ministries</NuxtLink>
        <NuxtLink to="/#app-download" class="pub-nav__link">Mobile App</NuxtLink>
        <NuxtLink to="/support" class="pub-nav__link">Support</NuxtLink>
      </nav>

      <!-- Header CTAs -->
      <div class="pub-header__actions">
        <NuxtLink to="/login" class="pub-btn pub-btn--login">
          <svg class="pub-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          <span>Member Sign In</span>
        </NuxtLink>

        <!-- Mobile Menu Toggle Button -->
        <button
          class="pub-header__toggle"
          type="button"
          :aria-expanded="isMobileNavOpen ? 'true' : 'false'"
          aria-label="Toggle navigation menu"
          @click="toggleMobileNav"
        >
          <span class="pub-hamburger" :class="{ 'is-open': isMobileNavOpen }"></span>
        </button>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <transition name="pub-slide">
      <div v-if="isMobileNavOpen" class="pub-mobile-drawer">
        <div class="pub-mobile-drawer__backdrop" @click="closeMobileNav"></div>
        <div class="pub-mobile-drawer__panel">
          <div class="pub-mobile-drawer__header">
            <div class="pub-brand">
              <img src="~assets/imgs/caci_logo.png" alt="CACI Logo" class="pub-brand__logo" />
              <div class="pub-brand__text">
                <span class="pub-brand__title">CACI TAIFA</span>
                <span class="pub-brand__sub">Miracle Centre</span>
              </div>
            </div>
            <button class="pub-mobile-drawer__close" aria-label="Close menu" @click="closeMobileNav">
              &times;
            </button>
          </div>

          <nav class="pub-mobile-nav">
            <NuxtLink to="/" class="pub-mobile-nav__link" @click.native="closeMobileNav">Home</NuxtLink>
            <NuxtLink to="/#services" class="pub-mobile-nav__link" @click.native="closeMobileNav">Service Times</NuxtLink>
            <NuxtLink to="/#ministries" class="pub-mobile-nav__link" @click.native="closeMobileNav">Ministries</NuxtLink>
            <NuxtLink to="/#app-download" class="pub-mobile-nav__link" @click.native="closeMobileNav">Mobile App</NuxtLink>
            <NuxtLink to="/support" class="pub-mobile-nav__link" @click.native="closeMobileNav">App Support</NuxtLink>
            <NuxtLink to="/privacypolicy" class="pub-mobile-nav__link" @click.native="closeMobileNav">Privacy Policy</NuxtLink>
            <NuxtLink to="/terms" class="pub-mobile-nav__link" @click.native="closeMobileNav">Terms of Service</NuxtLink>
            <NuxtLink to="/delete-account" class="pub-mobile-nav__link" @click.native="closeMobileNav">Delete Account</NuxtLink>
          </nav>

          <div class="pub-mobile-drawer__footer">
            <NuxtLink to="/login" class="pub-btn pub-btn--primary pub-btn--full" @click.native="closeMobileNav">
              Member Sign In
            </NuxtLink>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script>
export default {
  name: 'PublicHeader',
  data() {
    return {
      isMobileNavOpen: false
    }
  },
  watch: {
    '$route'() {
      this.closeMobileNav()
    }
  },
  methods: {
    toggleMobileNav() {
      this.isMobileNavOpen = !this.isMobileNavOpen
      if (this.isMobileNavOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },
    closeMobileNav() {
      this.isMobileNavOpen = false
      document.body.style.overflow = ''
    }
  }
}
</script>

<style scoped>
.pub-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
}

.pub-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.pub-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 76px;
}

.pub-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
}

.pub-brand__logo {
  height: 48px;
  width: auto;
  object-fit: contain;
  transition: transform 0.2s ease;
}

.pub-brand:hover .pub-brand__logo {
  transform: scale(1.04);
}

.pub-brand__text {
  display: flex;
  flex-direction: column;
}

.pub-brand__title {
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #0f172a;
  line-height: 1.2;
}

.pub-brand__sub {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #d97706;
}

/* Desktop Nav */
.pub-nav {
  display: flex;
  align-items: center;
  gap: 28px;
}

.pub-nav__link {
  font-size: 0.925rem;
  font-weight: 500;
  color: #475569;
  text-decoration: none;
  transition: color 0.15s ease;
  position: relative;
  padding: 4px 0;
}

.pub-nav__link:hover,
.pub-nav__link.nuxt-link-exact-active {
  color: #1a56db;
}

.pub-nav__link.nuxt-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #1a56db;
  border-radius: 2px;
}

/* Actions */
.pub-header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pub-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: 9999px;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
}

.pub-btn__icon {
  width: 16px;
  height: 16px;
}

.pub-btn--login {
  background: #0f172a;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.15);
}

.pub-btn--login:hover {
  background: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25);
  color: #ffffff !important;
}

.pub-btn--primary {
  background: linear-gradient(135deg, #1a56db 0%, #1e40af 100%);
  color: #ffffff !important;
}

.pub-btn--primary:hover {
  background: linear-gradient(135deg, #1e40af 0%, #172554 100%);
  color: #ffffff !important;
}

.pub-btn--full {
  width: 100%;
}

/* Mobile Toggle */
.pub-header__toggle {
  display: none;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
}

.pub-hamburger {
  display: block;
  width: 20px;
  height: 2px;
  background: #0f172a;
  position: relative;
  transition: background 0.2s ease;
}

.pub-hamburger::before,
.pub-hamburger::after {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: #0f172a;
  transition: transform 0.2s ease;
}

.pub-hamburger::before {
  top: -6px;
}

.pub-hamburger::after {
  bottom: -6px;
}

.pub-hamburger.is-open {
  background: transparent;
}

.pub-hamburger.is-open::before {
  transform: translateY(6px) rotate(45deg);
}

.pub-hamburger.is-open::after {
  transform: translateY(-6px) rotate(-45deg);
}

/* Mobile Drawer */
.pub-mobile-drawer {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
}

.pub-mobile-drawer__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
}

.pub-mobile-drawer__panel {
  position: relative;
  width: 320px;
  max-width: 85vw;
  margin-left: auto;
  background: #ffffff;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.pub-mobile-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.pub-mobile-drawer__close {
  background: transparent;
  border: none;
  font-size: 28px;
  line-height: 1;
  color: #64748b;
  cursor: pointer;
}

.pub-mobile-nav {
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  gap: 16px;
  flex: 1;
  overflow-y: auto;
}

.pub-mobile-nav__link {
  font-size: 1.05rem;
  font-weight: 500;
  color: #1e293b;
  text-decoration: none;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.pub-mobile-nav__link:hover {
  color: #1a56db;
}

.pub-mobile-drawer__footer {
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 900px) {
  .pub-nav {
    display: none;
  }
  .pub-header__toggle {
    display: block;
  }
  .pub-btn--login {
    padding: 8px 14px;
    font-size: 0.82rem;
  }
}

@media (max-width: 480px) {
  .pub-brand__text {
    display: none;
  }
  .pub-header__inner {
    height: 64px;
  }
  .pub-brand__logo {
    height: 40px;
  }
}
</style>
