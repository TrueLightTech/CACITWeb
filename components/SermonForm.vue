<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">{{ isEdit ? 'Edit sermon' : 'New sermon' }}</h1>
        <p>Sermons are the backbone of the app. A sermon can carry video, audio, both or neither.</p>
      </div>
      <div class="ds-page-head__actions">
        <NuxtLink class="ds-btn ds-btn--secondary" to="/admin/app/sermons">All sermons</NuxtLink>
      </div>
    </div>

    <div v-if="isLoadingRecord" class="ds-card" style="max-width:720px">
      <div class="ds-card__body" style="display:grid;gap:16px">
        <span class="ds-skeleton" style="height:14px;width:28%"></span>
        <span class="ds-skeleton" style="height:38px"></span>
        <span class="ds-skeleton" style="height:14px;width:28%"></span>
        <span class="ds-skeleton" style="height:38px"></span>
        <span class="ds-skeleton" style="height:120px"></span>
      </div>
    </div>

    <form v-else class="ds-card" style="max-width:720px" @submit.prevent="submit">
      <div class="ds-card__body">
        <AiAssist
          resource="sermon"
          noun="sermon"
          :current="aiCurrent"
          :has-content="!!form.title"
          @apply="applyDraft"
          @use-video="useVideo"
        />

        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">The sermon</h2>
          </div>

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.title }">
            <label class="ds-label" for="sermonTitle">Title</label>
            <input id="sermonTitle" v-model="form.title" class="ds-input" type="text" maxlength="160">
            <span class="ds-help">
              Keep it short — a long title looks fine here and truncates on a phone.
              <b>{{ form.title.length }}/160</b>
            </span>
            <span v-if="showErrors && !form.title" class="ds-error">Give the sermon a title.</span>
          </div>

          <div class="ds-formgrid">
            <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.speaker }">
              <label class="ds-label" for="sermonSpeaker">Preached by</label>
              <input id="sermonSpeaker" v-model="form.speaker" class="ds-input" type="text" list="sermonSpeakers">
              <datalist id="sermonSpeakers">
                <option v-for="name in knownSpeakers" :key="name" :value="name"></option>
              </datalist>
              <span v-if="showErrors && !form.speaker" class="ds-error">Say who preached it.</span>
            </div>

            <div class="ds-field">
              <label class="ds-label" for="sermonPreachedOn">Preached on</label>
              <input id="sermonPreachedOn" v-model="form.preachedOn" class="ds-input" type="datetime-local">
            </div>
          </div>

          <div class="ds-formgrid">
            <div class="ds-field">
              <label class="ds-label" for="sermonSeries">Series</label>
              <input id="sermonSeries" v-model="form.series" class="ds-input" type="text" list="sermonSeriesList">
              <datalist id="sermonSeriesList">
                <option v-for="name in knownSeries" :key="name" :value="name"></option>
              </datalist>
              <span class="ds-help">Optional. Series become the filter chips in the app.</span>
            </div>

            <div class="ds-field">
              <label class="ds-label" for="sermonScripture">Scripture</label>
              <input id="sermonScripture" v-model="form.scripture" class="ds-input" type="text"
                     placeholder="Hebrews 12:26-29">
              <span class="ds-help">Optional. Searchable by members.</span>
            </div>
          </div>

          <div class="ds-field" style="margin-bottom:0">
            <label class="ds-label" for="sermonSummary">Summary</label>
            <textarea id="sermonSummary" v-model="form.summary" class="ds-textarea" rows="4"></textarea>
            <span class="ds-help">A line or two, shown under the title.</span>
          </div>
        </div>

        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">Recording</h2>
            <p>Both are optional — a sermon can be announced before its recording is uploaded.</p>
          </div>

          <div class="ds-field">
            <label class="ds-label">Video</label>
            <MediaUpload ref="video" v-model="form.videoMediaId" kind="video" :label="form.title" @state="videoState = $event" />
          </div>

          <div class="ds-field" style="margin-bottom:0">
            <label class="ds-label">Audio</label>
            <MediaUpload v-model="form.audioMediaId" kind="audio" :label="form.title" @state="audioState = $event" />
          </div>

          <p v-if="isProcessing" class="ds-help sf__processing">
            A recording is still being prepared. You can save now — it appears in the app
            once Cloudflare finishes.
          </p>
        </div>

        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">Tags</h2>
            <p>Optional. Helps members find related sermons.</p>
          </div>
          <div class="ds-chips">
            <span v-for="(tag, index) in form.tags" :key="tag + index" class="ds-chip">
              {{ tag }}
              <button class="ds-chip__x" type="button" :aria-label="`Remove ${tag}`" @click="removeTag(index)">×</button>
            </span>
          </div>
          <div class="ds-field" style="margin-bottom:0;max-width:280px">
            <input
              v-model="tagDraft"
              class="ds-input"
              type="text"
              placeholder="Add a tag and press Enter"
              @keydown.enter.prevent="addTag"
            >
          </div>
        </div>

        <PublishControls
          :status.sync="form.status"
          :publish-at.sync="form.publishAt"
          :send-push.sync="form.sendPush"
          noun="sermon"
          :show-errors="showErrors"
          :allow-archive="isEdit"
        />
      </div>

      <div class="ds-card__foot" style="display:flex;gap:8px;justify-content:flex-end">
        <button class="ds-btn ds-btn--ghost" type="button" @click="$router.push('/admin/app/sermons')">
          Cancel
        </button>
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
import AiAssist from './AiAssist'
import PublishControls from './PublishControls'
import { payload, errorMessage, toUtcIso, toLocalInput } from '../network/MobileApp'

export default {
  name: 'SermonForm',
  components: { AiAssist, MediaUpload, PublishControls },
  props: {
    isEdit: { type: Boolean, default: false }
  },
  data () {
    return {
      isLoadingRecord: false,
      isSaving: false,
      showErrors: false,
      tagDraft: '',
      videoState: 'idle',
      audioState: 'idle',
      knownSeries: [],
      knownSpeakers: [],
      form: {
        title: '',
        speaker: '',
        preachedOn: '',
        series: '',
        scripture: '',
        summary: '',
        videoMediaId: '',
        audioMediaId: '',
        tags: [],
        status: 'draft',
        publishAt: '',
        sendPush: true
      }
    }
  },
  computed: {
    /** What a redraft should improve rather than replace. */
    aiCurrent () {
      return { title: this.form.title, speaker: this.form.speaker, scripture: this.form.scripture, summary: this.form.summary }
    },
    isProcessing () {
      return this.videoState === 'processing' || this.audioState === 'processing'
    },
    saveLabel () {
      if (this.form.status === 'published') { return this.isEdit ? 'Save changes' : 'Publish sermon' }
      if (this.form.status === 'scheduled') { return 'Schedule sermon' }
      if (this.form.status === 'archived') { return 'Archive sermon' }
      return 'Save draft'
    }
  },
  beforeMount () {
    this.loadSeries()
    if (this.isEdit) {
      this.loadSermon()
    } else {
      this.form.preachedOn = toLocalInput(new Date().toISOString())
    }
  },
  methods: {

    /**
     * Fold a draft into the form. Only fields the draft returned are touched,
     * so a redraft that says nothing about the date leaves the date alone.
     * Everything stays editable afterwards.
     */
    applyDraft (fields) {
      const set = (key, value) => { if (value !== undefined && value !== null && value !== '') { this.$set(this.form, key, value) } }
      set('title', fields.title)
      set('speaker', fields.speaker)
      set('preachedOn', fields.preachedOn)
      set('series', fields.series)
      set('scripture', fields.scripture)
      set('summary', fields.summary)
      if (Array.isArray(fields.tags) && fields.tags.length) { this.form.tags = fields.tags }
    },

    /** Attach a confirmed YouTube link to the video box. */
    useVideo (video) {
      const box = this.$refs.video
      if (box) { box.attachUrl(video.url) }
    },
    addTag () {
      const tag = this.tagDraft.trim()
      if (tag && this.form.tags.indexOf(tag) === -1) {
        this.form.tags.push(tag)
      }
      this.tagDraft = ''
    },
    removeTag (index) {
      this.form.tags.splice(index, 1)
    },
    loadSeries () {
      this.$axios.get('sermons/series').then(response => {
        this.knownSeries = payload(response) || []
      }).catch(() => {
        // A missing suggestion list is not worth a toast.
        this.knownSeries = []
      })
    },
    loadSermon () {
      this.isLoadingRecord = true

      this.$axios.get(`admin/sermons/${this.$route.params.id}`).then(response => {
        const data = payload(response) || {}

        this.form = {
          title: data.title || '',
          speaker: data.speaker || '',
          preachedOn: toLocalInput(data.preachedOn),
          series: data.series || '',
          scripture: data.scripture || '',
          summary: data.summary || '',
          videoMediaId: (data.video && data.video.id) || '',
          audioMediaId: (data.audio && data.audio.id) || '',
          tags: Array.isArray(data.tags) ? data.tags.slice() : [],
          status: data.status || 'draft',
          publishAt: toLocalInput(data.publishAt)
        }

        this.isLoadingRecord = false
      }).catch(error => {
        this.isLoadingRecord = false
        this.$toast.error(errorMessage(error, 'Could not load that sermon.'))
        this.$router.push('/admin/app/sermons')
      })
    },
    submit () {
      if (!this.form.title || !this.form.speaker) {
        this.showErrors = true
        return
      }

      if (this.form.status === 'scheduled' && !this.form.publishAt) {
        this.showErrors = true
        return
      }

      this.showErrors = false
      this.isSaving = true

      const body = {
        title: this.form.title.trim(),
        speaker: this.form.speaker.trim(),
        preachedOn: toUtcIso(this.form.preachedOn),
        series: this.form.series.trim() || null,
        scripture: this.form.scripture.trim() || null,
        summary: this.form.summary,
        videoMediaId: this.form.videoMediaId || null,
        audioMediaId: this.form.audioMediaId || null,
        tags: this.form.tags,
        status: this.form.status,
        publishAt: this.form.status === 'scheduled' ? toUtcIso(this.form.publishAt) : null,
        sendPush: this.form.sendPush
      }

      const request = this.isEdit
        ? this.$axios.put(`admin/sermons/${this.$route.params.id}`, body)
        : this.$axios.post('admin/sermons', body)

      request.then(() => {
        this.$toast.success(this.savedMessage())
        this.isSaving = false
        this.$router.push('/admin/app/sermons')
      }).catch(error => {
        this.isSaving = false
        this.$toast.error(errorMessage(error, 'Could not save this sermon.'))
      })
    },
    savedMessage () {
      if (this.form.status === 'published') { return 'Sermon published' }
      if (this.form.status === 'scheduled') { return 'Sermon scheduled' }
      if (this.form.status === 'archived') { return 'Sermon archived' }
      return 'Draft saved'
    }
  }
}
</script>

<style scoped>
.sf__processing { margin: 12px 0 0; }
</style>
