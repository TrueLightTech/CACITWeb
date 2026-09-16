<template>
  <div v-if="open" class="ds-overlay" @click.self="cancel">
    <div
      class="ds-modal"
      role="alertdialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="bodyId"
    >
      <div class="ds-modal__body" style="text-align:center">
        <span v-if="destructive" class="ds-confirm__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </span>
        <h3 :id="titleId" class="ds-h3" style="margin-bottom:8px">{{ title }}</h3>
        <p :id="bodyId" class="ds-muted" style="margin:0">{{ message }}</p>
      </div>
      <div class="ds-modal__foot">
        <button ref="cancel" class="ds-btn ds-btn--ghost" type="button" @click="cancel">
          {{ cancelLabel }}
        </button>
        <button
          class="ds-btn"
          :class="destructive ? 'ds-btn--danger' : 'ds-btn--primary'"
          type="button"
          :disabled="busy"
          @click="confirm"
        >
          <span v-if="busy" class="ds-btn__spinner"></span>
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
let uid = 0

/**
 * One confirm dialog for the whole application.
 *
 * Replaces the delete-confirm markup that was copy-pasted inline across five
 * screens with hard-coded Bootstrap modal ids. Driven by a prop rather than
 * `data-bs-toggle`, so the calling screen owns the state and nothing depends
 * on Bootstrap's JS bundle being loaded.
 */
export default {
  name: 'ConfirmDialog',
  props: {
    open: { type: Boolean, default: false },
    title: { type: String, default: 'Are you sure?' },
    message: { type: String, default: '' },
    confirmLabel: { type: String, default: 'Continue' },
    cancelLabel: { type: String, default: 'Cancel' },
    destructive: { type: Boolean, default: true },
    busy: { type: Boolean, default: false }
  },
  data () {
    uid += 1
    return {
      titleId: `ds-confirm-title-${uid}`,
      bodyId: `ds-confirm-body-${uid}`
    }
  },
  watch: {
    open (isOpen) {
      if (isOpen) {
        // Focus the safe choice, not the destructive one.
        this.$nextTick(() => this.$refs.cancel && this.$refs.cancel.focus())
      }
    }
  },
  mounted () {
    document.addEventListener('keydown', this.onKeydown)
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.onKeydown)
  },
  methods: {
    onKeydown (event) {
      if (event.key === 'Escape' && this.open) {
        this.cancel()
      }
    },
    cancel () {
      this.$emit('cancel')
    },
    confirm () {
      this.$emit('confirm')
    }
  }
}
</script>
