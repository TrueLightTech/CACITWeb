<template>
  <div class="stores" :class="`stores--${variant}`">
    <template v-for="store in stores">
      <a
        v-if="store.live"
        :key="store.key"
        :href="store.href"
        class="stores__badge"
        target="_blank"
        rel="noopener"
      >
        <svg class="stores__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path :d="store.path" />
        </svg>
        <span class="stores__copy">
          <span class="stores__sub">{{ store.sub }}</span>
          <span class="stores__name">{{ store.name }}</span>
        </span>
      </a>

      <!-- A listing that is not live yet says when instead. -->
      <button
        v-else
        :key="store.key"
        type="button"
        class="stores__badge"
        aria-haspopup="dialog"
        @click="comingSoon = true"
      >
        <svg class="stores__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path :d="store.path" />
        </svg>
        <span class="stores__copy">
          <span class="stores__sub">Coming {{ launch.short }}</span>
          <span class="stores__name">{{ store.name }}</span>
        </span>
      </button>
    </template>

    <AppComingSoon v-if="!allLive" :open="comingSoon" @close="comingSoon = false" />
  </div>
</template>

<script>
import { APP_STORES, APP_LAUNCH, isStoreLive } from '../resources/appLinks'
import AppComingSoon from './AppComingSoon'

/**
 * The two store badges, as real links once the app is out.
 *
 * The home page carried this markup as plain divs — the badges looked like
 * buttons and went nowhere, so the only route to the app was to search for it
 * by name. A store that is not live yet opens AppComingSoon; each badge
 * becomes a link by itself on its store's day.
 */
export default {
  name: 'AppStoreLinks',
  components: { AppComingSoon },
  props: {
    /** `dark` sits on the navy app section; `light` on a white card. */
    variant: {
      type: String,
      default: 'light',
      validator: value => ['light', 'dark'].indexOf(value) !== -1
    }
  },
  data () {
    return {
      stores: APP_STORES.map(store => ({ ...store, live: isStoreLive(store.key) })),
      launch: APP_LAUNCH,
      comingSoon: false
    }
  },
  computed: {
    allLive () { return this.stores.every(store => store.live) }
  }
}
</script>

<style scoped>
.stores {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.stores__badge {
  font: inherit;
  cursor: pointer;
  text-align: left;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding: 8px 20px 8px 16px;
  border-radius: 12px;
  text-decoration: none;
  border: 1px solid transparent;
  transition: background-color 0.16s ease, border-color 0.16s ease;
}

.stores__icon { width: 26px; height: 26px; flex-shrink: 0; }

.stores__copy { display: flex; flex-direction: column; line-height: 1.15; min-width: 0; }
.stores__sub { font-size: 0.68rem; letter-spacing: 0.04em; text-transform: uppercase; opacity: 0.75; }
.stores__name { font-size: 1rem; font-weight: 600; }

/* On the navy app section */
.stores--dark .stores__badge {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.22);
  color: #ffffff;
}
.stores--dark .stores__badge:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.4);
}

/* On a white card */
.stores--light .stores__badge {
  background: #0B1B45;
  border-color: #0B1B45;
  color: #ffffff;
}
.stores--light .stores__badge:hover { background: #1B3D8F; border-color: #1B3D8F; }

@media (max-width: 520px) {
  .stores { flex-direction: column; }
  .stores__badge { justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  .stores__badge { transition: none; }
}
</style>
