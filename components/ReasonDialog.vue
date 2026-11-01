<template>
  <div v-if="open" class="ds-overlay" @click.self="cancel">
    <div class="ds-modal" role="dialog" aria-modal="true" :aria-labelledby="titleId">
      <div class="ds-modal__head">
        <div>
          <h2 :id="titleId" class="ds-h3">{{ title }}</h2>
          <p v-if="message">{{ message }}</p>
        </div>
      </div>

      <div class="ds-modal__body">
        <div class="ds-field" :class="{ 'is-invalid': showErrors && !reason.trim() }" style="margin-bottom:0">
          <label class="ds-label" :for="`${titleId}-reason`">Reason</label>
          <textarea :id="`${titleId}-reason`" v-model="reason" class="ds-textarea" rows="3"></textarea>
          <span v-if="showErrors && !reason.trim()" class="ds-error">Say why. It is kept in the access history.</span>
          <span v-else class="ds-help">Kept in the access history with your name.</span>
        </div>
      </div>

      <div class="ds-modal__foot">
        <button class="ds-btn ds-btn--ghost" type="button" @click="cancel">Cancel</button>
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
 * A confirm dialog that asks why.
 *
 * Every change to someone's access needs a reason — the API refuses one
 * without — so revoking a grant or deleting a role asks for it here rather
 * than in a bare "are you sure?".
 */
export default {
  name: 'ReasonDialog',
  props: {
    open: { type: Boolean, default: false },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    confirmLabel: { type: String, default: 'Continue' },
    destructive: { type: Boolean, default: true },
    busy: { type: Boolean, default: false }
  },
  data () {
    uid += 1
    return {
      titleId: `reason-dialog-${uid}`,
      reason: '',
      showErrors: false
    }
  },
  watch: {
    open (isOpen) {
      if (isOpen) {
        this.reason = ''
        this.showErrors = false
      }
    }
  },
  methods: {
    cancel () {
      if (!this.busy) { this.$emit('cancel') }
    },
    confirm () {
      if (!this.reason.trim()) {
        this.showErrors = true
        return
      }
      this.$emit('confirm', this.reason.trim())
    }
  }
}
</script>
