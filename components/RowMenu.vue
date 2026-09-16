<template>
  <div class="ds-menu">
    <button
      ref="trigger"
      class="ds-btn ds-btn--ghost ds-btn--sm"
      type="button"
      :aria-expanded="open ? 'true' : 'false'"
      aria-haspopup="true"
      :aria-label="label"
      @click="toggle"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="5" r="1.8"/>
        <circle cx="12" cy="12" r="1.8"/>
        <circle cx="12" cy="19" r="1.8"/>
      </svg>
    </button>

    <div v-if="open" class="ds-menu__panel" :class="{ 'ds-menu__panel--up': dropUp }" role="menu">
      <slot :close="close" />
    </div>
  </div>
</template>

<script>
/**
 * Row-level action menu.
 *
 * The Bootstrap dropdown it replaces clipped inside the table's scroll
 * container and stayed open when the route changed. This one closes on outside
 * click, Escape and navigation, and flips upward near the bottom of the
 * viewport so the last rows of a table are still usable.
 */
export default {
  name: 'RowMenu',
  props: {
    label: { type: String, default: 'Actions' }
  },
  data () {
    return {
      open: false,
      dropUp: false
    }
  },
  watch: {
    '$route' () {
      this.close()
    }
  },
  mounted () {
    document.addEventListener('click', this.onDocumentClick, true)
    document.addEventListener('keydown', this.onKeydown)
  },
  beforeDestroy () {
    document.removeEventListener('click', this.onDocumentClick, true)
    document.removeEventListener('keydown', this.onKeydown)
  },
  methods: {
    toggle () {
      if (this.open) {
        this.close()
        return
      }
      const box = this.$refs.trigger.getBoundingClientRect()
      this.dropUp = (window.innerHeight - box.bottom) < 240
      this.open = true
    },
    close () {
      this.open = false
    },
    onDocumentClick (event) {
      if (this.open && !this.$el.contains(event.target)) {
        this.close()
      }
    },
    onKeydown (event) {
      if (event.key === 'Escape' && this.open) {
        this.close()
        this.$refs.trigger.focus()
      }
    }
  }
}
</script>
