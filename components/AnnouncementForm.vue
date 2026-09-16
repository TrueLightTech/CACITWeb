<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">{{ isEdit ? 'Edit announcement' : 'New announcement' }}</h1>
        <p>{{ isEdit ? 'Update what the church sees on their dashboard.' : 'Published to every member on their dashboard.' }}</p>
      </div>
      <div class="ds-page-head__actions">
        <NuxtLink class="ds-btn ds-btn--secondary" to="/admin/announcements">All announcements</NuxtLink>
      </div>
    </div>

    <div v-if="pageRefresh" class="ds-card" style="max-width:680px">
      <div class="ds-card__body" style="display:grid;gap:16px">
        <span class="ds-skeleton" style="height:180px;border-radius:6px"></span>
        <span class="ds-skeleton" style="height:14px;width:30%"></span>
        <span class="ds-skeleton" style="height:38px"></span>
        <span class="ds-skeleton" style="height:14px;width:30%"></span>
        <span class="ds-skeleton" style="height:96px"></span>
      </div>
    </div>

    <form v-else class="ds-card" style="max-width:680px" @submit.prevent="submit">
      <div class="ds-card__body">
        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">Image</h2>
            <p>Shown beside the announcement on the dashboard.</p>
          </div>

          <div class="announcement-image">
            <img :src="imagePreview" alt="" class="announcement-image__preview">
            <div>
              <label class="ds-btn ds-btn--secondary ds-btn--sm" for="announcementImage">
                {{ hasImage ? 'Change image' : 'Choose image' }}
                <input
                  id="announcementImage"
                  class="sr-only-input"
                  type="file"
                  accept="image/*"
                  @change="imageUploaded($event)"
                >
              </label>
              <p class="ds-help" style="margin-top:8px">JPG, PNG or GIF. Optional.</p>
            </div>
          </div>
        </div>

        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">Message</h2>
          </div>

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.title }">
            <label class="ds-label" for="announcementTitle">Title</label>
            <input id="announcementTitle" v-model="form.title" class="ds-input" type="text">
            <span v-if="showErrors && !form.title" class="ds-error">Give the announcement a title.</span>
          </div>

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.body }">
            <label class="ds-label" for="announcementBody">Announcement</label>
            <textarea id="announcementBody" v-model="form.body" class="ds-textarea" rows="6"></textarea>
            <span v-if="showErrors && !form.body" class="ds-error">Write the announcement.</span>
          </div>

          <div class="ds-field" style="margin-bottom:0">
            <label class="ds-label" for="announcementSummary">Short summary</label>
            <textarea id="announcementSummary" v-model="form.announcementSummaryMessage" class="ds-textarea" rows="3"></textarea>
            <span class="ds-help">Optional. Used where there is only room for a line or two.</span>
          </div>
        </div>

        <PublishControls
          :status.sync="form.status"
          :publish-at.sync="form.publishAt"
          :is-pinned.sync="form.isPinned"
          pinnable
          pin-note=" of the announcements list"
          noun="announcement"
          :show-errors="showErrors"
          :allow-archive="isEdit"
        />
      </div>

      <div class="ds-card__foot" style="display:flex;gap:8px;justify-content:flex-end">
        <button class="ds-btn ds-btn--ghost" type="button" @click="$router.push('/admin/announcements')">Cancel</button>
        <button class="ds-btn ds-btn--primary" type="submit" :disabled="isLoading">
          <span v-if="isLoading" class="ds-btn__spinner"></span>
          {{ isLoading ? 'Saving' : saveLabel }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import PublishControls from './PublishControls'
import { profileImageBaseUrl } from '../resources/constants'
import { toUtcIso, toLocalInput } from '../network/MobileApp'

/**
 * Create and edit share one form. They were two near-identical pages, each
 * with its own copy of the image handling and an "activate" helper that
 * returned an enabled class unconditionally.
 */
export default {
  name: 'AnnouncementForm',
  components: { PublishControls },
  props: {
    isEdit: { type: Boolean, default: false }
  },
  data () {
    return {
      isLoading: false,
      pageRefresh: false,
      showErrors: false,
      hasImageEdited: false,
      form: {
        title: '',
        body: '',
        announcementSummaryMessage: '',
        image: '',
        isPinned: false,
        status: 'published',
        publishAt: ''
      }
    }
  },
  computed: {
    saveLabel () {
      if (this.form.status === 'scheduled') { return 'Schedule announcement' }
      if (this.form.status === 'draft') { return 'Save draft' }
      if (this.form.status === 'archived') { return 'Archive announcement' }
      return this.isEdit ? 'Save changes' : 'Publish announcement'
    },
    hasImage () {
      return !!this.form.image
    },
    imagePreview () {
      if (!this.form.image) {
        return require('~/assets/imgs/no_image.png')
      }
      // A freshly chosen file is already a data URI; a stored one is a key.
      if (String(this.form.image).indexOf('data:') === 0 || String(this.form.image).indexOf('http') === 0) {
        return this.form.image
      }
      return `${profileImageBaseUrl}/${this.form.image}`
    }
  },
  beforeMount () {
    if (this.isEdit) {
      this.getAnnouncement(this.$route.params.id)
    }
  },
  methods: {
    errorMessage (error, fallback) {
      return error && error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : fallback
    },
    imageUploaded (e) {
      const selectedImage = e.target.files[0]
      if (!selectedImage) { return }

      const allowed = /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i
      if (!allowed.exec(selectedImage.name)) {
        this.$toast.error('That file type is not supported. Choose a JPG, PNG, BMP or GIF.')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        this.form.image = event.target.result
        this.hasImageEdited = true
      }
      reader.readAsDataURL(selectedImage)
    },
    savedMessage () {
      if (this.form.status === 'scheduled') { return 'Announcement scheduled' }
      if (this.form.status === 'draft') { return 'Draft saved' }
      if (this.form.status === 'archived') { return 'Announcement archived' }
      return this.isEdit ? 'Announcement updated' : 'Announcement published'
    },
    getAnnouncement (id) {
      this.pageRefresh = true
      this.$axios.get(`admin/announcements/${id}`).then(response => {
        const data = response.data.data || {}
        this.form = {
          title: data.title || '',
          body: data.body || '',
          announcementSummaryMessage: data.announcementSummaryMessage || '',
          image: data.image || '',
          isPinned: !!data.isPinned,
          status: data.status || 'published',
          publishAt: toLocalInput(data.publishAt)
        }
        this.pageRefresh = false
      }).catch(() => {
        this.pageRefresh = false
      })
    },
    submit () {
      if (!this.form.title || !this.form.body ||
          (this.form.status === 'scheduled' && !this.form.publishAt)) {
        this.showErrors = true
        return
      }
      this.showErrors = false
      this.isLoading = true

      // On edit, the image is only sent when it was actually replaced —
      // unchanged from the original behaviour.
      const requestBody = {
        title: this.form.title,
        body: this.form.body,
        announcementSummaryMessage: this.form.announcementSummaryMessage,
        isPinned: this.form.isPinned,
        status: this.form.status,
        publishAt: this.form.status === 'scheduled' ? toUtcIso(this.form.publishAt) : null
      }

      if (!this.isEdit || this.hasImageEdited) {
        requestBody.image = this.form.image
      }

      const request = this.isEdit
        ? this.$axios.put(`announcements/${this.$route.params.id}`, requestBody)
        : this.$axios.post('announcements', requestBody)

      request.then(() => {
        this.$toast.success(this.savedMessage())
        this.isLoading = false
        this.$router.push('/admin/announcements')
      }).catch(error => {
        // Previously reported through $toast.success, so failures looked like successes.
        this.$toast.error(this.errorMessage(error, 'Could not save this announcement.'))
        this.isLoading = false
      })
    }
  }
}
</script>

<style scoped>
.announcement-image {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.announcement-image__preview {
  width: 200px;
  height: 130px;
  border-radius: 6px;
  object-fit: cover;
  background: var(--ds-surface-2);
  border: 1px solid var(--ds-border);
  flex-shrink: 0;
}

.sr-only-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
