<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Report an issue</h1>
        <p>Send a message to the church office. Someone will follow it up.</p>
      </div>
    </div>

    <form class="ds-card" style="max-width:640px" @submit.prevent="createReport">
      <div class="ds-card__body">
        <div class="ds-field" :class="{ 'is-invalid': showErrors && !title }">
          <label class="ds-label" for="issueTitle">What is this about?</label>
          <input
            id="issueTitle"
            v-model="title"
            class="ds-input"
            type="text"
            placeholder="A short summary"
          >
          <span v-if="showErrors && !title" class="ds-error">Add a short summary so the office can sort it.</span>
        </div>

        <div class="ds-field" :class="{ 'is-invalid': showErrors && !message }" style="margin-bottom:0">
          <label class="ds-label" for="issueMessage">Details</label>
          <textarea
            id="issueMessage"
            v-model="message"
            class="ds-textarea"
            rows="6"
            placeholder="Explain what happened, and what you need"
          ></textarea>
          <span v-if="showErrors && !message" class="ds-error">Tell the office what you need help with.</span>
        </div>
      </div>

      <div class="ds-card__foot" style="display:flex;gap:8px;justify-content:flex-end">
        <button class="ds-btn ds-btn--ghost" type="button" @click="$router.push('/admin/dashboard')">Cancel</button>
        <button class="ds-btn ds-btn--primary" type="submit" :disabled="isLoading">
          <span v-if="isLoading" class="ds-btn__spinner"></span>
          {{ isLoading ? 'Sending' : 'Send to the office' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'report',
  data () {
    return {
      isLoading: false,
      showErrors: false,
      title: '',
      message: ''
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser'])
  },
  methods: {
    createReport () {
      // The old submit button was disabled by a CSS class only, so an empty
      // form could still be posted.
      if (!this.title || !this.message) {
        this.showErrors = true
        return
      }
      this.showErrors = false
      this.isLoading = true

      const requestBody = {
        userId: this.loggedInUser.data.id,
        title: this.title,
        issueMessage: this.message
      }

      this.$axios.post('issues', requestBody).then(() => {
        this.$toast.success('Your issue has been sent to the church office')
        this.isLoading = false
        this.$router.push('/admin/dashboard')
      }).catch(error => {
        // Previously reported through $toast.success, so failures looked like successes.
        const text = error && error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Could not send this right now. Nothing was sent.'
        this.$toast.error(text)
        this.isLoading = false
      })
    }
  }
}
</script>
