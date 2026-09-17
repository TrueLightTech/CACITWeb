<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Live Service</h1>
        <p>Members opening the app on a Sunday morning see this first. It is the one control that is urgent.</p>
      </div>
    </div>

    <section class="ds-card lv__state" :class="{ 'is-live': status.isLive }">
      <div class="ds-card__body">
        <span class="lv__label">
          <span class="lv__dot" :class="{ 'is-on': status.isLive }"></span>
          {{ status.isLive ? 'On air' : 'Off air' }}
        </span>

        <h2 class="ds-h2 lv__title">
          {{ status.isLive ? (status.title || 'Live service') : 'Nothing is streaming' }}
        </h2>

        <p class="ds-muted lv__meta">
          <template v-if="status.isLive">
            {{ status.subtitle }}
            <template v-if="status.startedAt"> · started {{ $moment(status.startedAt).fromNow() }}</template>
            <template v-if="status.viewerCount"> · {{ status.viewerCount }} watching</template>
          </template>
          <template v-else-if="status.nextServiceAt">
            Next service {{ $moment(status.nextServiceAt).format('dddd D MMMM, HH:mm') }}
          </template>
        </p>
      </div>
    </section>

    <form class="ds-card lv__form" @submit.prevent="save">
      <div class="ds-card__head">
        <h2 class="ds-h3">{{ status.isLive ? 'While you are live' : 'Start a broadcast' }}</h2>
      </div>

      <div class="ds-card__body">
        <div class="ds-field">
          <label class="ds-label" for="liveTitle">What is it?</label>
          <input id="liveTitle" v-model="form.title" class="ds-input" type="text"
                 placeholder="Sunday Worship Service">
        </div>

        <div class="ds-field">
          <label class="ds-label" for="liveSubtitle">Who is preaching, and where?</label>
          <input id="liveSubtitle" v-model="form.subtitle" class="ds-input" type="text"
                 placeholder="Rev. Dr. Emmanuel Asante · Main Auditorium">
        </div>

        <div class="ds-field" style="margin-bottom:0">
          <label class="ds-label" for="liveNext">Next service</label>
          <input id="liveNext" v-model="form.nextServiceAt" class="ds-input" type="datetime-local">
          <span class="ds-help">Shown when nothing is streaming, so the home screen is never blank.</span>
        </div>

        <label v-if="!status.isLive" class="ds-check" style="margin-top:16px">
          <input v-model="form.sendPush" type="checkbox">
          <span>Send push notification to congregation when going live</span>
        </label>
      </div>

      <div class="ds-card__foot lv__foot">
        <button
          v-if="status.isLive"
          class="ds-btn ds-btn--danger"
          type="button"
          :disabled="isSaving"
          @click="confirmOpen = true"
        >
          End the broadcast
        </button>
        <button v-else class="ds-btn ds-btn--primary" type="submit" :disabled="isSaving">
          <span v-if="isSaving" class="ds-btn__spinner"></span>
          Go live
        </button>

        <button v-if="status.isLive" class="ds-btn ds-btn--secondary" type="submit" :disabled="isSaving">
          <span v-if="isSaving" class="ds-btn__spinner"></span>
          Save details
        </button>
      </div>
    </form>

    <!--
      Going live puts a banner in front of the whole congregation, so it is
      confirmed rather than fired on a single click.
    -->
    <ConfirmDialog
      :open="confirmOpen"
      :busy="isSaving"
      title="End the broadcast?"
      message="The live banner disappears from every member's home screen straight away."
      confirm-label="End the broadcast"
      @cancel="confirmOpen = false"
      @confirm="endBroadcast"
    />
  </div>
</template>

<script>
import ConfirmDialog from '../../../components/ConfirmDialog'
import { payload, errorMessage, toUtcIso, toLocalInput } from '../../../network/MobileApp'

export default {
  name: 'AdminAppLive',
  components: { ConfirmDialog },
  data () {
    return {
      status: { isLive: false },
      isSaving: false,
      confirmOpen: false,
      pollTimer: null,
      form: { title: '', subtitle: '', nextServiceAt: '', sendPush: true }
    }
  },
  beforeMount () {
    this.load()
    // The page is left open through a service, so it keeps itself current.
    this.pollTimer = setInterval(this.load, 30000)
  },
  beforeDestroy () {
    clearInterval(this.pollTimer)
  },
  methods: {
    load () {
      this.$axios.get('live/status').then(response => {
        const data = payload(response) || { isLive: false }
        this.status = data

        if (!this.form.title) { this.form.title = data.title || '' }
        if (!this.form.subtitle) { this.form.subtitle = data.subtitle || '' }
        if (!this.form.nextServiceAt) { this.form.nextServiceAt = toLocalInput(data.nextServiceAt) }
      }).catch(() => {
        // A polling failure is not worth interrupting the office mid-service.
      })
    },
    save () {
      this.send(true, this.status.isLive ? 'Details saved' : 'You are live')
    },
    endBroadcast () {
      this.send(false, 'Broadcast ended')
    },
    send (isLive, message) {
      this.isSaving = true

      this.$axios.put('admin/live/status', {
        isLive,
        title: this.form.title || null,
        subtitle: this.form.subtitle || null,
        nextServiceAt: this.form.nextServiceAt ? toUtcIso(this.form.nextServiceAt) : null,
        sendPush: isLive ? this.form.sendPush : false
      }).then(response => {
        this.status = payload(response) || { isLive }
        this.isSaving = false
        this.confirmOpen = false
        this.$toast.success(message)
      }).catch(error => {
        this.isSaving = false
        this.confirmOpen = false
        this.$toast.error(errorMessage(error, 'Could not change the live status.'))
      })
    }
  }
}
</script>

<style scoped>
.lv__state { border-left: 3px solid var(--ds-border); margin-bottom: 20px; }
.lv__state.is-live { border-left-color: #b02b26; }

.lv__label {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 11.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
  color: var(--ds-text-muted);
}
.lv__dot { width: 9px; height: 9px; border-radius: 50%; background: var(--ds-border-strong, #bfc8d8); }
.lv__dot.is-on { background: #b02b26; box-shadow: 0 0 0 3px rgba(176, 43, 38, .18); }

.lv__title { margin: 8px 0 4px; }
.lv__meta { margin: 0; font-size: var(--ds-text-sm); }

.lv__form { max-width: 620px; }
.lv__foot { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
</style>
