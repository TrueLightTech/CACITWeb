<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">{{ isEdit ? 'Edit event' : 'New event' }}</h1>
        <p>Members see upcoming events on their home screen and can say they are going.</p>
      </div>
      <div class="ds-page-head__actions">
        <NuxtLink class="ds-btn ds-btn--secondary" to="/admin/app/events">All events</NuxtLink>
      </div>
    </div>

    <div v-if="isLoadingRecord" class="ds-card" style="max-width:720px">
      <div class="ds-card__body" style="display:grid;gap:16px">
        <span class="ds-skeleton" style="height:14px;width:28%"></span>
        <span class="ds-skeleton" style="height:38px"></span>
        <span class="ds-skeleton" style="height:120px"></span>
      </div>
    </div>

    <form v-else class="ds-card" style="max-width:720px" @submit.prevent="submit">
      <div class="ds-card__body">
        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">The event</h2>
          </div>

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.title }">
            <label class="ds-label" for="eventTitle">Title</label>
            <input id="eventTitle" v-model="form.title" class="ds-input" type="text" maxlength="120">
            <span v-if="showErrors && !form.title" class="ds-error">Give the event a title.</span>
          </div>

          <div class="ds-formgrid">
            <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.startsAt }">
              <label class="ds-label" for="eventStarts">Starts</label>
              <input id="eventStarts" v-model="form.startsAt" class="ds-input" type="datetime-local">
              <span v-if="showErrors && !form.startsAt" class="ds-error">Say when it starts.</span>
            </div>

            <div class="ds-field" :class="{ 'is-invalid': showErrors && endsBeforeStart }">
              <label class="ds-label" for="eventEnds">Ends</label>
              <input id="eventEnds" v-model="form.endsAt" class="ds-input" type="datetime-local">
              <span v-if="showErrors && endsBeforeStart" class="ds-error">
                The event cannot end before it starts.
              </span>
              <span v-else class="ds-help">Optional.</span>
            </div>
          </div>

          <label class="ds-check" style="margin-bottom:14px">
            <input v-model="form.isAllDay" type="checkbox">
            <span>Runs all day</span>
          </label>

          <div class="ds-formgrid">
            <div class="ds-field">
              <label class="ds-label" for="eventLocation">Where</label>
              <input id="eventLocation" v-model="form.location" class="ds-input" type="text"
                     placeholder="Main Auditorium">
            </div>
            <div class="ds-field">
              <label class="ds-label" for="eventCategory">Category</label>
              <input id="eventCategory" v-model="form.category" class="ds-input" type="text"
                     placeholder="Prayer &amp; Revival">
            </div>
          </div>

          <div class="ds-field" style="margin-bottom:0">
            <label class="ds-label" for="eventDescription">Description</label>
            <textarea id="eventDescription" v-model="form.description" class="ds-textarea" rows="4"></textarea>
          </div>
        </div>

        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">Picture</h2>
          </div>
          <MediaUpload :value="imageMediaId" kind="image" :label="form.title" @input="setImage" />
        </div>

        <!--
          Status and note are how a change reaches members who already planned
          around the old details. Moving the start time sets rescheduled on its
          own, so nobody has to remember a second step.
        -->
        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">Has anything changed?</h2>
            <p>Members who said they were going are told when this is anything but confirmed.</p>
          </div>

          <div class="ds-field">
            <label class="ds-label" for="eventStatus">Status</label>
            <select id="eventStatus" v-model="form.eventStatus" class="ds-select">
              <option v-for="option in eventStatuses" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <span v-if="willReschedule" class="ds-help ef__warn">
              You changed the start time, so this is set to Rescheduled and members will be told.
            </span>
          </div>

          <div v-if="form.eventStatus !== 'confirmed'" class="ds-field" style="margin-bottom:0">
            <label class="ds-label" for="eventNote">What should members know?</label>
            <input id="eventNote" v-model="form.statusNote" class="ds-input" type="text"
                   placeholder="Moved from the Fellowship Hall">
            <span class="ds-help">Shown on the event and sent with the notification.</span>
          </div>
        </div>

        <div class="ds-formsection">
          <label class="ds-check">
            <input v-model="form.registrationRequired" type="checkbox">
            <span>Members must register to attend</span>
          </label>
        </div>

        <PublishControls
          :status.sync="form.status"
          :publish-at.sync="form.publishAt"
          noun="event"
          :show-errors="showErrors"
          :allow-archive="isEdit"
        />
      </div>

      <div class="ds-card__foot" style="display:flex;gap:8px;justify-content:flex-end">
        <button class="ds-btn ds-btn--ghost" type="button" @click="$router.push('/admin/app/events')">Cancel</button>
        <button class="ds-btn ds-btn--primary" type="submit" :disabled="isSaving">
          <span v-if="isSaving" class="ds-btn__spinner"></span>
          {{ isSaving ? 'Saving' : saveLabel }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import MediaUpload from './MediaUpload'
import PublishControls from './PublishControls'
import { payload, errorMessage, toUtcIso, toLocalInput, EVENT_STATUSES } from '../network/MobileApp'

export default {
  name: 'EventForm',
  components: { MediaUpload, PublishControls },
  props: {
    isEdit: { type: Boolean, default: false }
  },
  data () {
    return {
      isLoadingRecord: false,
      isSaving: false,
      showErrors: false,
      imageMediaId: '',
      originalStartsAt: '',
      form: {
        title: '',
        startsAt: '',
        endsAt: '',
        isAllDay: false,
        location: '',
        category: '',
        description: '',
        imageUrl: '',
        eventStatus: 'confirmed',
        statusNote: '',
        registrationRequired: false,
        status: 'draft',
        publishAt: ''
      }
    }
  },
  computed: {
    eventStatuses () {
      return EVENT_STATUSES
    },
    endsBeforeStart () {
      if (!this.form.startsAt || !this.form.endsAt) { return false }
      return new Date(this.form.endsAt) < new Date(this.form.startsAt)
    },
    willReschedule () {
      return this.isEdit &&
        this.originalStartsAt &&
        this.form.startsAt !== this.originalStartsAt &&
        this.form.eventStatus === 'confirmed'
    },
    saveLabel () {
      if (this.form.status === 'published') { return this.isEdit ? 'Save changes' : 'Publish event' }
      if (this.form.status === 'scheduled') { return 'Schedule event' }
      if (this.form.status === 'archived') { return 'Archive event' }
      return 'Save draft'
    }
  },
  beforeMount () {
    if (this.isEdit) { this.loadEvent() }
  },
  methods: {
    setImage (mediaId) {
      this.imageMediaId = mediaId
      if (!mediaId) {
        this.form.imageUrl = ''
        return
      }
      this.$axios.get(`media/${mediaId}`).then(response => {
        const asset = payload(response)
        this.form.imageUrl = asset && asset.sourceUrl ? asset.sourceUrl : ''
      }).catch(() => { this.form.imageUrl = '' })
    },
    loadEvent () {
      this.isLoadingRecord = true

      this.$axios.get(`admin/events/${this.$route.params.id}`).then(response => {
        const data = payload(response) || {}

        this.form = {
          title: data.title || '',
          startsAt: toLocalInput(data.startsAt),
          endsAt: toLocalInput(data.endsAt),
          isAllDay: !!data.isAllDay,
          location: data.location || '',
          category: data.category || '',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          eventStatus: data.eventStatus || 'confirmed',
          statusNote: data.statusNote || '',
          registrationRequired: !!data.registrationRequired,
          status: data.status || 'draft',
          publishAt: toLocalInput(data.publishAt)
        }

        this.originalStartsAt = this.form.startsAt
        this.isLoadingRecord = false
      }).catch(error => {
        this.isLoadingRecord = false
        this.$toast.error(errorMessage(error, 'Could not load that event.'))
        this.$router.push('/admin/app/events')
      })
    },
    submit () {
      if (!this.form.title || !this.form.startsAt || this.endsBeforeStart ||
          (this.form.status === 'scheduled' && !this.form.publishAt)) {
        this.showErrors = true
        return
      }

      this.showErrors = false
      this.isSaving = true

      const body = {
        title: this.form.title.trim(),
        startsAt: toUtcIso(this.form.startsAt),
        endsAt: this.form.endsAt ? toUtcIso(this.form.endsAt) : null,
        isAllDay: this.form.isAllDay,
        location: this.form.location || null,
        category: this.form.category || null,
        description: this.form.description || null,
        imageUrl: this.form.imageUrl || null,
        eventStatus: this.form.eventStatus,
        statusNote: this.form.eventStatus === 'confirmed' ? null : (this.form.statusNote || null),
        registrationRequired: this.form.registrationRequired,
        status: this.form.status,
        publishAt: this.form.status === 'scheduled' ? toUtcIso(this.form.publishAt) : null
      }

      const request = this.isEdit
        ? this.$axios.put(`admin/events/${this.$route.params.id}`, body)
        : this.$axios.post('admin/events', body)

      request.then(() => {
        this.$toast.success(this.form.status === 'published' ? 'Event published' : 'Event saved')
        this.isSaving = false
        this.$router.push('/admin/app/events')
      }).catch(error => {
        this.isSaving = false
        this.$toast.error(errorMessage(error, 'Could not save this event.'))
      })
    }
  }
}
</script>

<style scoped>
.ef__warn { color: var(--ds-warning, #7a4f00); }
</style>
