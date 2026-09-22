<template>
  <div class="stores" :class="`stores--${variant}`">
    <a
      v-for="store in stores"
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
  </div>
</template>

<script>
import { APP_STORES } from '../resources/appLinks'

/**
 * The two store badges, as real links.
 *
 * The home page carried this markup as plain divs — the badges looked like
 * buttons and went nowhere, so the only route to the app was to search for it
 * by name.
 */
export default {
  name: 'AppStoreLinks',
  props: {
    /** `dark` sits on the navy app section; `light` on a white card. */
    variant: {
      type: String,
      default: 'light',
      validator: value => ['light', 'dark'].indexOf(value) !== -1
    }
  },
  data () {
    return { stores: APP_STORES }
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
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px 10px 14px;
  border-radius: 10px;
  text-decoration: none;
  border: 1px solid transparent;
  transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.stores__badge:hover { transform: translateY(-1px); }

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
  background: #111827;
  border-color: #111827;
  color: #ffffff;
}
.stores--light .stores__badge:hover { background: #1f2937; border-color: #1f2937; }

@media (max-width: 520px) {
  .stores { flex-direction: column; }
  .stores__badge { justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  .stores__badge { transition: none; }
  .stores__badge:hover { transform: none; }
}
</style>
