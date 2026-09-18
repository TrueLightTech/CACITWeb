<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">{{ isEdit ? 'Edit video' : 'New video' }}</h1>
        <p>The full-length library — choir, testimonies, church life. Sermons have their own section.</p>
      </div>
      <div class="ds-page-head__actions">
        <NuxtLink class="ds-btn ds-btn--secondary" to="/admin/app/videos">All videos</NuxtLink>
      </div>
    </div>

    <div v-if="isLoadingRecord" class="ds-card" style="max-width:720px">
      <div class="ds-card__body" style="display:grid;gap:16px">
        <span class="ds-skeleton" style="height:38px"></span>
        <span class="ds-skeleton" style="height:120px"></span>
      </div>
    </div>

    <form v-else class="ds-card" style="max-width:720px" @submit.prevent="submit">
      <div class="ds-card__body">
        <AiAssist
          resource="video"
          noun="video"
          :current="aiCurrent"
          :has-content="!!form.title"
          @apply="applyDraft"
          @use-video="useVideo"
        />

        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">The video</h2>
          </div>

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.title }">
            <label class="ds-label" for="videoTitle">Title</label>
            <input id="videoTitle" v-model="form.title" class="ds-input" type="text" maxlength="140">
            <span v-if="showErrors && !form.title" class="ds-error">Give the video a title.</span>
          </div>

          <div class="ds-formgrid">
            <div class="ds-field">
              <label class="ds-label" for="videoCategory">Category</label>
              <input id="videoCategory" v-model="form.category" class="ds-input" type="text" list="videoCategories">
              <datalist id="videoCategories">
                <option v-for="name in knownCategories" :key="name" :value="name"></option>
              </datalist>
            </div>

            <div class="ds-field">
              <label class="ds-label" for="videoPublishedOn">Recorded on</label>
              <input id="videoPublishedOn" v-model="form.publishedOn" class="ds-input" type="datetime-local">
            </div>
          </div>

          <div class="ds-field" style="margin-bottom:0">
            <label class="ds-label" for="videoDescription">Description</label>
            <textarea id="videoDescription" v-model="form.description" class="ds-textarea" rows="4"></textarea>
          </div>
        </div>

        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">Recording</h2>
          </div>
          <MediaUpload ref="media" v-model="form.mediaId" kind="video" :label="form.title"
                       @state="mediaState = $event" @file="videoFile = $event" />
          <p v-if="mediaState === 'processing'" class="ds-help" style="margin-top:12px">
            Still being prepared. You can save now — it appears once Cloudflare finishes.
          </p>

          <!-- Taken from the recording, and replaceable when the frame is poor. -->
          <ThumbnailField v-model="form.thumbnailUrl" :suggest-from="videoFile" :label="form.title" />
        </div>

        <PublishControls
          :status.sync="form.status"
          :publish-at.sync="form.publishAt"
          noun="video"
          :show-errors="showErrors"
          :allow-archive="isEdit"
        />
      </div>

      <div class="ds-card__foot" style="display:flex;gap:8px;justify-content:flex-end">
        <button class="ds-btn ds-btn--ghost" type="button" @click="$router.push('/admin/app/videos')">Cancel</button>
        <button class="ds-btn ds-btn--primary" type="submit" :disabled="isSaving">
          <span v-if="isSaving" class="ds-btn__spinner"></span>
          {{ isSaving ? 'Saving' : (form.status === 'published' ? 'Publish video' : 'Save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import MediaUpload from './MediaUpload'
import ThumbnailField from './ThumbnailField'
import AiAssist from './AiAssist'
import PublishControls from './PublishControls'
import { payload, errorMessage, toUtcIso, toLocalInput } from '../network/MobileApp'

export default {
  name: 'VideoForm',
  components: { AiAssist, MediaUpload, PublishControls, ThumbnailField },
  props: {
    isEdit: { type: Boolean, default: false }
  },
  data () {
    return {
      isLoadingRecord: false,
      isSaving: false,
      showErrors: false,
      mediaState: 'idle',
      /** The chosen video file, so a cover frame can be taken from it. */
      videoFile: null,
      knownCategories: [],
      form: {
        title: '',
        category: '',
        description: '',
        publishedOn: '',
        mediaId: '',
        thumbnailUrl: '',
        status: 'draft',
        publishAt: ''
      }
    }
  },
  beforeMount () {
    this.loadCategories()
    if (this.isEdit) {
      this.loadVideo()
    } else {
      this.form.publishedOn = toLocalInput(new Date().toISOString())
    }
  },
  computed: {
    /** What the draft should improve rather than replace. */
    aiCurrent () {
      return { title: this.form.title, category: this.form.category, description: this.form.description }
    }
  },

  methods: {

    /**
     * Fold a draft into the form. Only fields the draft actually returned are
     * touched, so a redraft that says nothing about the date leaves the date
     * alone, and everything stays editable afterwards.
     */
    applyDraft (fields) {
      const set = (key, value) => { if (value !== undefined && value !== null && value !== '') { this.$set(this.form, key, value) } }
      set('title', fields.title)
      set('category', fields.category)
      set('description', fields.description)
      set('publishedOn', fields.publishedOn)
    },

    /** Attach a confirmed YouTube link to the media box. */
    useVideo (video) {
      const box = this.$refs.media
      if (box) { box.attachUrl(video.url) }
    },
    loadCategories () {
      this.$axios.get('videos/categories')
        .then(response => { this.knownCategories = payload(response) || [] })
        .catch(() => { this.knownCategories = [] })
    },
    loadVideo () {
      this.isLoadingRecord = true

      this.$axios.get(`admin/videos/${this.$route.params.id}`).then(response => {
        const data = payload(response) || {}

        this.form = {
          title: data.title || '',
          category: data.category || '',
          description: data.description || '',
          publishedOn: toLocalInput(data.publishedOn),
          mediaId: (data.media && data.media.id) || '',
          thumbnailUrl: data.thumbnailUrl || '',
          status: data.status || 'draft',
          publishAt: toLocalInput(data.publishAt)
        }

        this.isLoadingRecord = false
      }).catch(error => {
        this.isLoadingRecord = false
        this.$toast.error(errorMessage(error, 'Could not load that video.'))
        this.$router.push('/admin/app/videos')
      })
    },
    submit () {
      if (!this.form.title || (this.form.status === 'scheduled' && !this.form.publishAt)) {
        this.showErrors = true
        return
      }

      this.showErrors = false
      this.isSaving = true

      const body = {
        title: this.form.title.trim(),
        category: this.form.category || null,
        description: this.form.description || null,
        publishedOn: toUtcIso(this.form.publishedOn),
        mediaId: this.form.mediaId || null,
        thumbnailUrl: this.form.thumbnailUrl || null,
        status: this.form.status,
        publishAt: this.form.status === 'scheduled' ? toUtcIso(this.form.publishAt) : null
      }

      const request = this.isEdit
        ? this.$axios.put(`admin/videos/${this.$route.params.id}`, body)
        : this.$axios.post('admin/videos', body)

      request.then(() => {
        this.$toast.success(this.form.status === 'published' ? 'Video published' : 'Video saved')
        this.isSaving = false
        this.$router.push('/admin/app/videos')
      }).catch(error => {
        this.isSaving = false
        this.$toast.error(errorMessage(error, 'Could not save this video.'))
      })
    }
  }
}
</script>
