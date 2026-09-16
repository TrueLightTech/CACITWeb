<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Push Messages</h1>
        <p>A one-off message to the congregation. Publishing a sermon or moving an event already notifies members on its own.</p>
      </div>
    </div>

    <div class="ph__layout">
      <form class="ds-card ph__form" @submit.prevent="review">
        <div class="ds-card__head">
          <h2 class="ds-h3">Write the message</h2>
        </div>

        <div class="ds-card__body">
          <AiAssist
            resource="push"
            noun="message"
            :current="aiCurrent"
            :has-content="!!form.title"
            @apply="applyDraft"
          />

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.title }">
            <label class="ds-label" for="pushTitle">Title</label>
            <input id="pushTitle" v-model="form.title" class="ds-input" type="text" maxlength="60">
            <span class="ds-help"><b>{{ form.title.length }}/60</b> — this is the bold line on the lock screen.</span>
            <span v-if="showErrors && !form.title" class="ds-error">Give the message a title.</span>
          </div>

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.body }">
            <label class="ds-label" for="pushBody">Message</label>
            <textarea id="pushBody" v-model="form.body" class="ds-textarea" rows="4" maxlength="180"></textarea>
            <span class="ds-help"><b>{{ form.body.length }}/180</b> — phones cut off longer messages.</span>
            <span v-if="showErrors && !form.body" class="ds-error">Write the message.</span>
          </div>

          <div class="ds-field">
            <label class="ds-label" for="pushAudience">Who gets it</label>
            <select id="pushAudience" v-model="form.audienceFamilyId" class="ds-select" @change="loadAudience">
              <option value="">Everyone</option>
              <option v-for="family in families" :key="family.id" :value="family.id">
                {{ family.name }} family group
              </option>
            </select>
            <span class="ds-help">Family groups are the only segment for now.</span>
          </div>

          <div class="ds-field" style="margin-bottom:0">
            <label class="ds-label" for="pushCategory">Category</label>
            <select id="pushCategory" v-model="form.category" class="ds-select">
              <option value="general">General</option>
              <option value="announcement">Announcement</option>
              <option value="event">Event</option>
              <option value="sermon">Sermon</option>
              <option value="live">Live service</option>
            </select>
            <span class="ds-help">Groups it in the member's notification list.</span>
          </div>
        </div>

        <div class="ds-card__foot" style="display:flex;justify-content:flex-end">
          <button class="ds-btn ds-btn--primary" type="submit" :disabled="isSending">
            Review and send
          </button>
        </div>
      </form>

      <aside class="ph__side">
        <!-- What it looks like on a phone, which is the only place it is read -->
        <section class="ds-card">
          <div class="ds-card__head"><h2 class="ds-h3">On a phone</h2></div>
          <div class="ds-card__body">
            <div class="ph__preview">
              <div class="ph__app">
                <span class="ph__appmark">CT</span>
                <span class="ph__appname">CACI Taifa</span>
                <span class="ph__now">now</span>
              </div>
              <p class="ph__ptitle">{{ form.title || 'Your title' }}</p>
              <p class="ph__pbody">{{ form.body || 'Your message appears here.' }}</p>
            </div>
          </div>
        </section>

        <section class="ds-card">
          <div class="ds-card__head"><h2 class="ds-h3">Who this reaches</h2></div>
          <div class="ds-card__body">
            <div v-if="isLoadingAudience" class="ds-skeleton" style="height:44px"></div>
            <template v-else>
              <p class="ph__count ds-num">{{ audience.memberCount }}</p>
              <p class="ds-muted ph__countlabel">
                members in {{ audience.audienceLabel || 'the whole congregation' }}
              </p>
              <p class="ds-help ph__devices">
                {{ audience.deviceCount }} of them have the app installed with notifications on.
              </p>
            </template>
          </div>
        </section>
      </aside>
    </div>

    <!--
      Sending to two thousand people should not feel like saving a draft, so the
      confirmation names the number rather than asking "are you sure?".
    -->
    <ConfirmDialog
      :open="confirmOpen"
      :busy="isSending"
      title="Send this now?"
      :message="confirmMessage"
      confirm-label="Send the message"
      :destructive="false"
      @cancel="confirmOpen = false"
      @confirm="send"
    />
  </div>
</template>

<script>
import ConfirmDialog from '../../../components/ConfirmDialog'
import AiAssist from '../../../components/AiAssist'
import { payload, errorMessage } from '../../../network/MobileApp'

export default {
  name: 'AdminAppPush',
  components: { AiAssist, ConfirmDialog },
  data () {
    return {
      families: [],
      audience: { memberCount: 0, deviceCount: 0, audienceLabel: '' },
      isLoadingAudience: false,
      isSending: false,
      showErrors: false,
      confirmOpen: false,
      form: {
        title: '',
        body: '',
        category: 'general',
        audienceFamilyId: ''
      }
    }
  },
  computed: {
    /** What a redraft should improve rather than replace. */
    aiCurrent () {
      return { title: this.form.title, body: this.form.body }
    },
    confirmMessage () {
      const count = this.audience.memberCount
      const where = this.audience.audienceLabel || 'the whole congregation'
      const people = count === 1 ? '1 member' : `${count} members`
      return `"${this.form.title}" goes to ${people} in ${where}. A push cannot be taken back once it is sent.`
    }
  },
  beforeMount () {
    this.loadFamilies()
    this.loadAudience()
  },
  methods: {

    /**
     * Fold a draft into the form. Only fields the draft returned are touched,
     * and everything stays editable afterwards.
     */
    applyDraft (fields) {
      const set = (key, value) => { if (value !== undefined && value !== null && value !== '') { this.$set(this.form, key, value) } }
      set('title', fields.title)
      set('body', fields.body)
      set('category', fields.category)
    },
    loadFamilies () {
      this.$axios.get('churchfamilies')
        .then(response => { this.families = payload(response) || [] })
        .catch(() => { this.families = [] })
    },
    loadAudience () {
      this.isLoadingAudience = true

      const params = {}
      if (this.form.audienceFamilyId) { params.familyId = this.form.audienceFamilyId }

      this.$axios.get('admin/push/audience', { params }).then(response => {
        this.audience = payload(response) || { memberCount: 0, deviceCount: 0 }
        this.isLoadingAudience = false
      }).catch(() => {
        this.audience = { memberCount: 0, deviceCount: 0, audienceLabel: '' }
        this.isLoadingAudience = false
      })
    },
    review () {
      if (!this.form.title || !this.form.body) {
        this.showErrors = true
        return
      }
      this.showErrors = false
      this.confirmOpen = true
    },
    send () {
      this.isSending = true

      this.$axios.post('admin/push', {
        title: this.form.title.trim(),
        body: this.form.body.trim(),
        category: this.form.category,
        audienceFamilyId: this.form.audienceFamilyId || null
      }).then(response => {
        const result = payload(response) || {}
        this.isSending = false
        this.confirmOpen = false
        this.$toast.success(`Sent to ${result.membersNotified || 0} members`)
        this.form.title = ''
        this.form.body = ''
      }).catch(error => {
        this.isSending = false
        this.confirmOpen = false
        this.$toast.error(errorMessage(error, 'Could not send that message.'))
      })
    }
  }
}
</script>

<style scoped>
.ph__layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 320px); gap: 20px; align-items: start; }
@media (max-width: 900px) { .ph__layout { grid-template-columns: 1fr; } }

.ph__side { display: grid; gap: 20px; }

.ph__preview {
  border-radius: 14px;
  padding: 13px 15px;
  background: var(--ds-surface-2);
  border: 1px solid var(--ds-border);
}
.ph__app { display: flex; align-items: center; gap: 7px; margin-bottom: 7px; }
.ph__appmark {
  width: 18px; height: 18px; border-radius: 4px;
  background: var(--ds-primary); color: #fff;
  font-size: 9px; font-weight: 700; display: grid; place-items: center;
}
.ph__appname { font-size: 11.5px; font-weight: 600; color: var(--ds-text-muted); }
.ph__now { font-size: 11.5px; color: var(--ds-text-muted); margin-left: auto; }
.ph__ptitle { margin: 0 0 2px; font-weight: 600; font-size: 14px; overflow-wrap: anywhere; }
.ph__pbody { margin: 0; font-size: 13.5px; color: var(--ds-text-muted); overflow-wrap: anywhere; }

.ph__count { margin: 0; font-size: 34px; font-weight: 700; line-height: 1; }
.ph__countlabel { margin: 6px 0 0; font-size: var(--ds-text-sm); }
.ph__devices { margin: 10px 0 0; }
</style>
