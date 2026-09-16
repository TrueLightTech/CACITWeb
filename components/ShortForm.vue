<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">{{ isEdit ? 'Edit short' : 'New short' }}</h1>
        <p>A short is any short thing — a clip, a voice note, a flyer, slides, an event or a verse.</p>
      </div>
      <div class="ds-page-head__actions">
        <NuxtLink class="ds-btn ds-btn--secondary" to="/admin/app/shorts">All shorts</NuxtLink>
      </div>
    </div>

    <div v-if="isLoadingRecord" class="ds-card" style="max-width:720px">
      <div class="ds-card__body" style="display:grid;gap:16px">
        <span class="ds-skeleton" style="height:14px;width:28%"></span>
        <span class="ds-skeleton" style="height:38px"></span>
        <span class="ds-skeleton" style="height:140px"></span>
      </div>
    </div>

    <form v-else class="ds-card" style="max-width:720px" @submit.prevent="submit">
      <div class="ds-card__body">
        <AiAssist
          resource="short"
          noun="short"
          :current="aiCurrent"
          :has-content="!!form.title"
          @apply="applyDraft"
        />

        <!-- Kind decides everything below it, so it comes first -->
        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">What kind of short?</h2>
            <p>This decides what the member sees and what you fill in below.</p>
          </div>

          <div class="sh__kinds" role="radiogroup" aria-label="Kind of short">
            <label
              v-for="option in kinds"
              :key="option.value"
              class="sh__kind"
              :class="{ 'is-selected': form.kind === option.value }"
            >
              <input
                class="sh__kindradio"
                type="radio"
                name="shortKind"
                :value="option.value"
                :checked="form.kind === option.value"
                :disabled="isEdit"
                @change="changeKind(option.value)"
              >
              <span>{{ option.label }}</span>
            </label>
          </div>
          <span v-if="isEdit" class="ds-help">
            The kind cannot be changed after a short is created — create a new one instead.
          </span>
        </div>

        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">Wording</h2>
          </div>

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.title }">
            <label class="ds-label" for="shortTitle">Title</label>
            <input id="shortTitle" v-model="form.title" class="ds-input" type="text" maxlength="90">
            <span class="ds-help"><b>{{ form.title.length }}/90</b> — shorts are read on a phone, in a hurry.</span>
            <span v-if="showErrors && !form.title" class="ds-error">Give the short a title.</span>
          </div>

          <div class="ds-field" style="margin-bottom:0">
            <label class="ds-label" for="shortCaption">Caption</label>
            <textarea id="shortCaption" v-model="form.caption" class="ds-textarea" rows="3"></textarea>
            <span class="ds-help">Optional.</span>
          </div>
        </div>

        <!-- Kind-specific content -->
        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">{{ contentHeading }}</h2>
          </div>

          <!-- video / audio -->
          <template v-if="form.kind === 'video' || form.kind === 'audio'">
            <div class="ds-field" :class="{ 'is-invalid': showErrors && !content.mediaId }">
              <MediaUpload
                v-model="content.mediaId"
                :kind="form.kind"
                :label="form.title"
                @state="mediaState = $event"
              />
              <span v-if="showErrors && !content.mediaId" class="ds-error">
                Upload the {{ form.kind === 'video' ? 'clip' : 'recording' }} first.
              </span>
            </div>

            <div v-if="form.kind === 'audio'" class="ds-field" style="margin-bottom:0">
              <label class="ds-label" for="shortArtwork">Artwork URL</label>
              <input id="shortArtwork" v-model="content.artworkUrl" class="ds-input" type="url">
              <span class="ds-help">Optional. Shown behind the player.</span>
            </div>
          </template>

          <!-- image -->
          <template v-else-if="form.kind === 'image'">
            <div class="ds-field" :class="{ 'is-invalid': showErrors && !content.imageUrl }">
              <label class="ds-label">Picture</label>
              <MediaUpload v-model="imageMediaId" kind="image" :label="form.title" @state="onImageState" />
              <span v-if="showErrors && !content.imageUrl" class="ds-error">Upload the picture first.</span>
            </div>

            <!--
              Required, not optional: without it a picture short is completely
              silent to a member using a screen reader.
            -->
            <div class="ds-field" :class="{ 'is-invalid': showErrors && !content.altText }" style="margin-bottom:0">
              <label class="ds-label" for="shortAlt">Describe the picture</label>
              <input id="shortAlt" v-model="content.altText" class="ds-input" type="text"
                     placeholder="A flyer showing the Week of Prayer times">
              <span class="ds-help">
                Required. This is what a member using a screen reader hears instead of the picture.
              </span>
              <span v-if="showErrors && !content.altText" class="ds-error">
                Describe the picture for members using a screen reader.
              </span>
            </div>
          </template>

          <!-- slides -->
          <template v-else-if="form.kind === 'slides'">
            <div v-for="(slide, index) in content.slides" :key="index" class="sh__slide">
              <div class="sh__slidehead">
                <span class="sh__slidenum">Slide {{ index + 1 }}</span>
                <button
                  v-if="content.slides.length > 1"
                  class="ds-btn ds-btn--ghost ds-btn--sm"
                  type="button"
                  @click="removeSlide(index)"
                >
                  Remove
                </button>
              </div>

              <div class="ds-field">
                <label class="ds-label">Image</label>
                <MediaUpload :value="slide.mediaId" kind="image" @input="setSlideImage(index, $event)" />
                <span v-if="showErrors && !slide.imageUrl" class="ds-error">Every slide needs an image.</span>
              </div>

              <div class="ds-field">
                <label class="ds-label" :for="`slideAlt${index}`">Describe this slide</label>
                <input :id="`slideAlt${index}`" v-model="slide.altText" class="ds-input" type="text">
                <span v-if="showErrors && !slide.altText" class="ds-error">
                  Describe every slide for members using a screen reader.
                </span>
              </div>

              <div class="ds-field" style="margin-bottom:0">
                <label class="ds-label" :for="`slideCaption${index}`">Caption</label>
                <input :id="`slideCaption${index}`" v-model="slide.caption" class="ds-input" type="text">
              </div>
            </div>

            <button class="ds-btn ds-btn--secondary ds-btn--sm" type="button" @click="addSlide">
              Add another slide
            </button>
          </template>

          <!-- event -->
          <template v-else-if="form.kind === 'event'">
            <div class="ds-field" :class="{ 'is-invalid': showErrors && !content.eventId }" style="margin-bottom:0">
              <label class="ds-label" for="shortEvent">Which event?</label>
              <select id="shortEvent" v-model="content.eventId" class="ds-select">
                <option value="">Choose an event</option>
                <option v-for="item in events" :key="item.id" :value="item.id">
                  {{ item.title }} — {{ $moment(item.startsAt).format('D MMM') }}
                </option>
              </select>
              <span v-if="showErrors && !content.eventId" class="ds-error">Choose the event this promotes.</span>
              <span v-else class="ds-help">
                Only published events appear here.
                <NuxtLink to="/admin/app/events/new">Create one</NuxtLink> if it is missing.
              </span>
            </div>
          </template>

          <!-- scripture -->
          <template v-else-if="form.kind === 'scripture'">
            <div class="ds-field" :class="{ 'is-invalid': showErrors && !content.text }">
              <label class="ds-label" for="shortVerse">The verse</label>
              <textarea id="shortVerse" v-model="content.text" class="ds-textarea" rows="3"></textarea>
              <span v-if="showErrors && !content.text" class="ds-error">Write the verse.</span>
            </div>

            <div class="ds-field" :class="{ 'is-invalid': showErrors && !content.reference }">
              <label class="ds-label" for="shortRef">Reference</label>
              <input id="shortRef" v-model="content.reference" class="ds-input" type="text" placeholder="Psalm 46:10">
              <span v-if="showErrors && !content.reference" class="ds-error">Add the reference.</span>
            </div>

            <div class="ds-field" style="margin-bottom:0">
              <label class="ds-label">Background image</label>
              <MediaUpload :value="backgroundMediaId" kind="image" @input="setBackground" />
              <span class="ds-help">Optional.</span>
            </div>
          </template>
        </div>

        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">Who it is from</h2>
            <p>Optional. Shown beside the short.</p>
          </div>

          <div class="ds-formgrid">
            <div class="ds-field">
              <label class="ds-label" for="shortAuthorName">Name</label>
              <input id="shortAuthorName" v-model="form.author.name" class="ds-input" type="text">
            </div>
            <div class="ds-field">
              <label class="ds-label" for="shortAuthorRole">Role</label>
              <input id="shortAuthorRole" v-model="form.author.role" class="ds-input" type="text"
                     placeholder="Associate Pastor">
            </div>
          </div>
        </div>

        <!--
          An in-app destination picker rather than a free-text field: a typo in
          a route is a dead end the member cannot recover from.
        -->
        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">Where it leads</h2>
            <p>Optional. One button on the short, taking the member somewhere in the app.</p>
          </div>

          <div class="ds-formgrid">
            <div class="ds-field">
              <label class="ds-label" for="shortActionTarget">Takes them to</label>
              <select id="shortActionTarget" v-model="actionTarget" class="ds-select" @change="onTargetChange">
                <option value="">Nowhere — no button</option>
                <option v-for="target in actionTargets" :key="target.value" :value="target.value">
                  {{ target.label }}
                </option>
              </select>
            </div>

            <div v-if="actionTarget" class="ds-field">
              <label class="ds-label" for="shortActionId">Which one?</label>
              <select
                v-if="actionTarget === 'sermon' || actionTarget === 'event'"
                id="shortActionId"
                v-model="actionId"
                class="ds-select"
              >
                <option value="">Choose</option>
                <option v-for="item in targetOptions" :key="item.id" :value="item.id">{{ item.title }}</option>
              </select>
              <input v-else id="shortActionId" v-model="actionId" class="ds-input" type="text" placeholder="Its id">
            </div>
          </div>

          <div v-if="actionTarget" class="ds-field" style="margin-bottom:0;max-width:340px">
            <label class="ds-label" for="shortActionLabel">Button says</label>
            <input id="shortActionLabel" v-model="form.action.label" class="ds-input" type="text"
                   placeholder="Watch the full sermon">
            <span class="ds-help">Links to <code>{{ resolvedRoute || '—' }}</code></span>
          </div>
        </div>

        <PublishControls
          :status.sync="form.status"
          :publish-at.sync="form.publishAt"
          :is-pinned.sync="form.isPinned"
          pinnable
          pin-note=" of the shorts feed"
          noun="short"
          :show-errors="showErrors"
          :allow-archive="isEdit"
        />
      </div>

      <div class="ds-card__foot" style="display:flex;gap:8px;justify-content:flex-end">
        <button class="ds-btn ds-btn--ghost" type="button" @click="$router.push('/admin/app/shorts')">Cancel</button>
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
import {
  payload, rowsOf, errorMessage, toUtcIso, toLocalInput,
  SHORT_KINDS, SHORT_ACTION_TARGETS
} from '../network/MobileApp'

/**
 * Shorts are the least conventional resource here: one envelope, six kinds,
 * and a different content shape per kind. The form mirrors that — pick the
 * kind first, then only the fields that kind actually needs.
 */
export default {
  name: 'ShortForm',
  components: { AiAssist, MediaUpload, PublishControls },
  props: {
    isEdit: { type: Boolean, default: false }
  },
  data () {
    return {
      isLoadingRecord: false,
      isSaving: false,
      showErrors: false,
      mediaState: 'idle',
      imageMediaId: '',
      backgroundMediaId: '',
      actionTarget: '',
      actionId: '',
      events: [],
      sermons: [],
      form: {
        kind: 'video',
        title: '',
        caption: '',
        author: { name: '', role: '', avatarUrl: '' },
        action: { label: '', route: '', icon: '' },
        tags: [],
        isPinned: false,
        status: 'draft',
        publishAt: ''
      },
      content: {
        mediaId: '',
        artworkUrl: '',
        imageUrl: '',
        altText: '',
        slides: [{ imageUrl: '', altText: '', caption: '', mediaId: '' }],
        eventId: '',
        text: '',
        reference: '',
        backgroundImageUrl: ''
      }
    }
  },
  computed: {
    /** What a redraft should improve rather than replace. */
    aiCurrent () {
      return { title: this.form.title, caption: this.form.caption }
    },
    kinds () {
      return SHORT_KINDS
    },
    actionTargets () {
      return SHORT_ACTION_TARGETS
    },
    contentHeading () {
      return {
        video: 'The clip',
        audio: 'The recording',
        image: 'The picture',
        slides: 'The slides',
        event: 'The event',
        scripture: 'The verse'
      }[this.form.kind] || 'Content'
    },
    targetOptions () {
      if (this.actionTarget === 'sermon') { return this.sermons }
      if (this.actionTarget === 'event') { return this.events }
      return []
    },
    resolvedRoute () {
      const target = SHORT_ACTION_TARGETS.find(t => t.value === this.actionTarget)
      if (!target || !this.actionId) { return '' }
      return `${target.path}${this.actionId}`
    },
    saveLabel () {
      if (this.form.status === 'published') { return this.isEdit ? 'Save changes' : 'Publish short' }
      if (this.form.status === 'scheduled') { return 'Schedule short' }
      if (this.form.status === 'archived') { return 'Archive short' }
      return 'Save draft'
    }
  },
  beforeMount () {
    this.loadPickers()
    if (this.isEdit) { this.loadShort() }
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
      set('caption', fields.caption)
      if (Array.isArray(fields.tags) && fields.tags.length) { this.form.tags = fields.tags }
      if (fields.authorName) { this.form.author.name = fields.authorName }
      if (fields.authorRole) { this.form.author.role = fields.authorRole }
      if (fields.actionLabel) { this.form.action.label = fields.actionLabel }
    },
    changeKind (kind) {
      this.form.kind = kind
    },
    addSlide () {
      this.content.slides.push({ imageUrl: '', altText: '', caption: '', mediaId: '' })
    },
    removeSlide (index) {
      this.content.slides.splice(index, 1)
    },
    onImageState () {
      // MediaUpload hands back an asset id; the short stores a URL, so the
      // asset is resolved once it is ready.
      this.resolveImageUrl(this.imageMediaId, url => { this.content.imageUrl = url })
    },
    setSlideImage (index, mediaId) {
      this.content.slides[index].mediaId = mediaId
      this.resolveImageUrl(mediaId, url => { this.content.slides[index].imageUrl = url })
    },
    setBackground (mediaId) {
      this.backgroundMediaId = mediaId
      this.resolveImageUrl(mediaId, url => { this.content.backgroundImageUrl = url })
    },
    resolveImageUrl (mediaId, assign) {
      if (!mediaId) {
        assign('')
        return
      }
      this.$axios.get(`media/${mediaId}`).then(response => {
        const asset = payload(response)
        assign(asset && asset.sourceUrl ? asset.sourceUrl : '')
      }).catch(() => assign(''))
    },
    onTargetChange () {
      this.actionId = ''
    },
    loadPickers () {
      this.$axios.get('admin/events', { params: { PageSize: 100, Status: 'published' } })
        .then(response => { this.events = rowsOf(response) })
        .catch(() => { this.events = [] })

      this.$axios.get('admin/sermons', { params: { PageSize: 100, Status: 'published' } })
        .then(response => { this.sermons = rowsOf(response) })
        .catch(() => { this.sermons = [] })
    },
    loadShort () {
      this.isLoadingRecord = true

      this.$axios.get(`admin/shorts/${this.$route.params.id}`).then(response => {
        const data = payload(response) || {}
        const content = data.content || {}

        this.form = {
          kind: data.kind || 'video',
          title: data.title || '',
          caption: data.caption || '',
          author: {
            name: (data.author && data.author.name) || '',
            role: (data.author && data.author.role) || '',
            avatarUrl: (data.author && data.author.avatarUrl) || ''
          },
          action: {
            label: (data.action && data.action.label) || '',
            route: (data.action && data.action.route) || '',
            icon: (data.action && data.action.icon) || ''
          },
          tags: Array.isArray(data.tags) ? data.tags.slice() : [],
          isPinned: !!data.isPinned,
          status: data.status || 'draft',
          publishAt: toLocalInput(data.publishAt)
        }

        this.content = Object.assign({}, this.content, {
          mediaId: content.id || content.mediaId || '',
          artworkUrl: content.artworkUrl || '',
          imageUrl: content.imageUrl || '',
          altText: content.altText || '',
          slides: Array.isArray(content.slides) && content.slides.length
            ? content.slides.map(s => Object.assign({ mediaId: '' }, s))
            : [{ imageUrl: '', altText: '', caption: '', mediaId: '' }],
          eventId: content.eventId || '',
          text: content.text || '',
          reference: content.reference || '',
          backgroundImageUrl: content.backgroundImageUrl || ''
        })

        this.unpackRoute(this.form.action.route)
        this.isLoadingRecord = false
      }).catch(error => {
        this.isLoadingRecord = false
        this.$toast.error(errorMessage(error, 'Could not load that short.'))
        this.$router.push('/admin/app/shorts')
      })
    },
    unpackRoute (route) {
      if (!route) { return }
      const target = SHORT_ACTION_TARGETS.find(t => route.indexOf(t.path) === 0)
      if (target) {
        this.actionTarget = target.value
        this.actionId = route.slice(target.path.length)
      }
    },
    validate () {
      if (!this.form.title) { return false }

      switch (this.form.kind) {
        case 'video':
        case 'audio':
          return !!this.content.mediaId
        case 'image':
          return !!this.content.imageUrl && !!this.content.altText
        case 'slides':
          return this.content.slides.length > 0 &&
            this.content.slides.every(s => s.imageUrl && s.altText)
        case 'event':
          return !!this.content.eventId
        case 'scripture':
          return !!this.content.text && !!this.content.reference
        default:
          return false
      }
    },
    buildContent () {
      switch (this.form.kind) {
        case 'video':
          return { mediaId: this.content.mediaId }
        case 'audio':
          return { mediaId: this.content.mediaId, artworkUrl: this.content.artworkUrl || null }
        case 'image':
          return { imageUrl: this.content.imageUrl, altText: this.content.altText }
        case 'slides':
          return {
            slides: this.content.slides.map(s => ({
              imageUrl: s.imageUrl,
              altText: s.altText,
              caption: s.caption || null
            }))
          }
        case 'event':
          return { eventId: this.content.eventId }
        case 'scripture':
          return {
            text: this.content.text,
            reference: this.content.reference,
            backgroundImageUrl: this.content.backgroundImageUrl || null
          }
        default:
          return {}
      }
    },
    submit () {
      if (!this.validate() || (this.form.status === 'scheduled' && !this.form.publishAt)) {
        this.showErrors = true
        return
      }

      this.showErrors = false
      this.isSaving = true

      const hasAction = !!this.resolvedRoute && !!this.form.action.label

      const body = {
        kind: this.form.kind,
        title: this.form.title.trim(),
        caption: this.form.caption || null,
        author: this.form.author.name ? this.form.author : null,
        action: hasAction
          ? { label: this.form.action.label, route: this.resolvedRoute, icon: this.form.action.icon || null }
          : null,
        tags: this.form.tags,
        isPinned: this.form.isPinned,
        content: this.buildContent(),
        status: this.form.status,
        publishAt: this.form.status === 'scheduled' ? toUtcIso(this.form.publishAt) : null
      }

      const request = this.isEdit
        ? this.$axios.put(`admin/shorts/${this.$route.params.id}`, body)
        : this.$axios.post('admin/shorts', body)

      request.then(() => {
        this.$toast.success(this.form.status === 'published' ? 'Short published' : 'Short saved')
        this.isSaving = false
        this.$router.push('/admin/app/shorts')
      }).catch(error => {
        this.isSaving = false
        this.$toast.error(errorMessage(error, 'Could not save this short.'))
      })
    }
  }
}
</script>

<style scoped>
.sh__kinds { display: flex; flex-wrap: wrap; gap: 8px; }
.sh__kind {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 13px;
  border: 1px solid var(--ds-border); border-radius: 999px;
  cursor: pointer; font-size: var(--ds-text-base);
  background: var(--ds-surface);
}
.sh__kind.is-selected { border-color: var(--ds-primary); background: var(--ds-surface-2); font-weight: 500; }
.sh__kind:focus-within { outline: 2px solid var(--ds-primary); outline-offset: 2px; }
.sh__kindradio { margin: 0; }

.sh__slide {
  border: 1px solid var(--ds-border);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 14px;
  background: var(--ds-surface-2);
}
.sh__slidehead { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.sh__slidenum {
  font-size: 11.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
  color: var(--ds-text-muted);
}
</style>
