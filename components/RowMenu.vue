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

    <div v-if="open" class="ds-menu__panel" :style="panelStyle" role="menu">
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
 *
 * The panel is placed against the viewport, not the row: the table wrapper
 * clips what overflows it, so on a table of one or two rows a panel hung off
 * the row was cut off with only its top edge showing. Being fixed, it would
 * drift from its button when the page moves, so scrolling or resizing closes it.
 */
export default {
  name: 'RowMenu',
  props: {
    label: { type: String, default: 'Actions' }
  },
  data () {
    return {
      open: false,
      panelStyle: {}
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
    window.addEventListener('scroll', this.close, true)
    window.addEventListener('resize', this.close)
  },
  beforeDestroy () {
    document.removeEventListener('click', this.onDocumentClick, true)
    document.removeEventListener('keydown', this.onKeydown)
    window.removeEventListener('scroll', this.close, true)
    window.removeEventListener('resize', this.close)
  },
  methods: {
    toggle () {
      if (this.open) {
        this.close()
        return
      }
      const box = this.$refs.trigger.getBoundingClientRect()
      const dropUp = (window.innerHeight - box.bottom) < 240
      this.panelStyle = {
        position: 'fixed',
        right: `${Math.max(8, window.innerWidth - box.right)}px`,
        top: dropUp ? 'auto' : `${box.bottom + 4}px`,
        bottom: dropUp ? `${window.innerHeight - box.top + 4}px` : 'auto',
        zIndex: 60
      }
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
