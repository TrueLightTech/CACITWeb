<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Home screen</h1>
        <p>The one thing members see first when they open the app.</p>
      </div>
    </div>

    <div class="hero__cols">
      <form class="ds-card" @submit.prevent="submit">
        <div class="ds-card__body">
          <AiAssist
            resource="short"
            noun="home screen message"
            :current="aiCurrent"
            :has-content="!!form.headline"
            @apply="applyDraft"
          />

          <div class="ds-formsection">
            <div class="ds-formsection__head">
              <h2 class="ds-h3">What it is about</h2>
              <p>This changes how the app draws the card, not what it holds.</p>
            </div>

            <div class="ds-field">
              <label class="ds-label" for="heroKind">Kind</label>
              <select id="heroKind" v-model="form.kind" class="ds-input">
                <option v-for="kind in kinds" :key="kind.value" :value="kind.value">{{ kind.label }}</option>
              </select>
              <span class="ds-help">{{ kindNote }}</span>
            </div>
          </div>

          <div class="ds-formsection">
            <div class="ds-formsection__head">
              <h2 class="ds-h3">The words</h2>
            </div>

            <div class="ds-field">
              <label class="ds-label" for="heroEyebrow">Small line above</label>
              <input id="heroEyebrow" v-model="form.eyebrow" class="ds-input" type="text" maxlength="40">
              <span class="ds-help">Optional. Left blank, the app writes it from the kind.</span>
            </div>

            <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.headline }">
              <label class="ds-label" for="heroHeadline">Headline</label>
              <textarea id="heroHeadline" v-model="form.headline" class="ds-textarea" rows="2" maxlength="140"></textarea>
              <span v-if="showErrors && !form.headline" class="ds-error">Write the headline.</span>
              <span v-else class="ds-help">Read across a room. Short is better.</span>
            </div>

            <div class="ds-field" style="margin-bottom:0">
              <label class="ds-label" for="heroSubline">Line beneath</label>
              <input id="heroSubline" v-model="form.subline" class="ds-input" type="text" maxlength="120">
              <span class="ds-help">Optional. A reference, a date, or a few words of context.</span>
            </div>
          </div>

          <div class="ds-formsection">
            <div class="ds-formsection__head">
              <h2 class="ds-h3">Photograph</h2>
              <p>Optional. Shown behind or beside the words.</p>
            </div>
            <MediaUpload v-model="form.imageMediaId" kind="image" :label="form.headline" />
          </div>

          <div class="ds-formsection">
            <div class="ds-formsection__head">
              <h2 class="ds-h3">Button</h2>
              <p>One, or none. Both parts are needed, or neither.</p>
            </div>

            <div class="ds-field">
              <label class="ds-label" for="heroActionLabel">Label</label>
              <input id="heroActionLabel" v-model="form.actionLabel" class="ds-input" type="text" maxlength="30"
                     placeholder="Read the whole word">
            </div>

            <div class="ds-field" :class="{ 'is-invalid': showErrors && buttonIsHalfDone }">
              <label class="ds-label" for="heroActionTarget">Goes to</label>
              <select id="heroActionTarget" v-model="actionTarget" class="ds-input" @change="onTargetChange">
                <option value="">Nowhere — no button</option>
                <option v-for="target in targets" :key="target.value" :value="target.value">{{ target.label }}</option>
              </select>
            </div>

            <div v-if="needsId" class="ds-field" style="margin-bottom:0">
              <label class="ds-label" for="heroActionId">Which one?</label>
              <input id="heroActionId" v-model="actionId" class="ds-input" type="text"
                     placeholder="Paste the id from its page" @input="rebuildRoute">
              <span class="ds-help">The route becomes <code>{{ form.actionRoute || '—' }}</code></span>
            </div>

            <p v-if="showErrors && buttonIsHalfDone" class="ds-error">
              A button needs both a label and somewhere to go.
            </p>
          </div>

          <PublishControls
            :status.sync="form.status"
            :publish-at.sync="form.publishAt"
            noun="home screen message"
            :show-errors="showErrors"
            allow-archive
            :allow-push="false"
          />
        </div>

        <div class="ds-card__foot" style="display:flex;gap:8px;justify-content:flex-end">
          <button v-if="editingId" class="ds-btn ds-btn--ghost" type="button" @click="reset">New instead</button>
          <button class="ds-btn ds-btn--primary" type="submit" :disabled="isSaving">
            <span v-if="isSaving" class="ds-btn__spinner"></span>
            {{ isSaving ? 'Saving' : saveLabel }}
          </button>
        </div>
      </form>

      <div>
        <!--
          Roughly what a member sees. Not pixel-exact with the app, and says so,
          because a preview that claims more than it can deliver is worse than
          none — but the office should not have to publish to see the shape.
        -->
        <div class="ds-card" style="margin-bottom:20px">
          <div class="ds-card__body">
            <h2 class="ds-h3" style="margin-top:0">Roughly what members see</h2>
            <div class="preview" :class="`is-${form.kind}`">
              <img v-if="previewImage" :src="previewImage" alt="" class="preview__img">
              <span class="preview__eyebrow">{{ form.eyebrow || defaultEyebrow }}</span>
              <p class="preview__headline">{{ form.headline || 'Your headline' }}</p>
              <p v-if="form.subline" class="preview__subline">{{ form.subline }}</p>
              <span v-if="form.actionLabel && form.actionRoute" class="preview__btn">{{ form.actionLabel }}</span>
            </div>
            <p class="ds-help" style="margin-top:10px">
              The app sets scripture in a serif and picks the button's icon from the kind.
            </p>
          </div>
        </div>

        <div class="ds-card">
          <div class="ds-card__body" style="padding-bottom:8px">
            <h2 class="ds-h3" style="margin-top:0">Earlier messages</h2>
            <p class="ds-help">The published one nearest the top is what members see now.</p>
          </div>
          <div v-if="isLoading" class="ds-card__body" style="display:grid;gap:10px">
            <span v-for="n in 3" :key="n" class="ds-skeleton" style="height:40px"></span>
          </div>
          <ul v-else-if="rows.length" class="hero__list">
            <li v-for="hero in rows" :key="hero.id" class="hero__row">
              <button class="hero__pick" type="button" @click="edit(hero)">
                <span class="ds-badge" :class="statusBadge(hero.status)">{{ statusLabel(hero.status) }}</span>
                <span class="hero__rowtext">
                  <b>{{ hero.headline }}</b>
                  <span class="ds-meta">{{ hero.kind }} · {{ $moment(hero.createdAt).format('D MMM') }}</span>
                </span>
              </button>
              <button class="ds-btn ds-btn--ghost ds-btn--sm" type="button" @click="confirmRemove(hero)">Delete</button>
            </li>
          </ul>
          <div v-else class="ds-card__body">
            <p class="ds-muted">Nothing yet. Members see the word of the day.</p>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      title="Delete this message?"
      message="This cannot be undone."
      confirm-label="Delete"
      @confirm="doRemove"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<script>
import AiAssist from '../../../components/AiAssist'
import MediaUpload from '../../../components/MediaUpload'
import PublishControls from '../../../components/PublishControls'
import ConfirmDialog from '../../../components/ConfirmDialog'
import {
  rowsOf, payload, errorMessage, toUtcIso, toLocalInput,
  STATUS_LABELS, STATUS_BADGE, HERO_KINDS, HERO_ACTION_TARGETS
} from '../../../network/MobileApp'

const EMPTY = () => ({
  kind: 'promo',
  eyebrow: '',
  headline: '',
  subline: '',
  imageMediaId: '',
  actionLabel: '',
  actionRoute: '',
  actionIcon: '',
  status: 'published',
  publishAt: ''
})

/**
 * The home screen's hero card.
 *
 * One screen rather than a list and a form: there is only ever one on screen in
 * the app, so the common task is "change what members see now", and the earlier
 * ones are a short list beside it rather than a page of their own.
 */
export default {
  name: 'hero',
  components: { AiAssist, MediaUpload, PublishControls, ConfirmDialog },
  data () {
    return {
      form: EMPTY(),
      rows: [],
      editingId: '',
      existingImageUrl: '',
      actionTarget: '',
      actionId: '',
      isLoading: false,
      isSaving: false,
      showErrors: false,
      confirmOpen: false,
      pendingRemove: null
    }
  },
  computed: {
    kinds () { return HERO_KINDS },
    targets () { return HERO_ACTION_TARGETS },
    kindNote () {
      const kind = HERO_KINDS.find(k => k.value === this.form.kind)
      return kind ? kind.note : ''
    },
    defaultEyebrow () {
      return { sermon: 'Sermon', event: 'Event', scripture: 'Word for today' }[this.form.kind] || 'From the church'
    },
    needsId () {
      const target = HERO_ACTION_TARGETS.find(t => t.value === this.actionTarget)
      return !!target && target.path.endsWith('/')
    },
    buttonIsHalfDone () {
      return !!this.form.actionLabel !== !!this.form.actionRoute
    },
    previewImage () {
      // Only a hero already saved has a URL to show. A freshly chosen file is
      // known to MediaUpload, not here, so the preview simply omits it rather
      // than showing a broken frame.
      return this.existingImageUrl
    },
    saveLabel () {
      if (this.editingId) { return 'Save changes' }
      if (this.form.status === 'scheduled') { return 'Schedule' }
      if (this.form.status === 'draft') { return 'Save draft' }
      return 'Show on the home screen'
    },
    aiCurrent () {
      return { title: this.form.headline, caption: this.form.subline }
    }
  },
  beforeMount () { this.load() },
  methods: {
    statusLabel (status) { return STATUS_LABELS[status] || status },
    statusBadge (status) { return STATUS_BADGE[status] || 'ds-badge--neutral' },
    applyDraft (fields) {
      if (fields.title) { this.form.headline = fields.title }
      if (fields.caption) { this.form.subline = fields.caption }
    },
    onTargetChange () {
      const target = HERO_ACTION_TARGETS.find(t => t.value === this.actionTarget)
      if (!target) {
        this.form.actionRoute = ''
        this.actionId = ''
        return
      }
      this.form.actionIcon = target.value
      this.rebuildRoute()
    },
    rebuildRoute () {
      const target = HERO_ACTION_TARGETS.find(t => t.value === this.actionTarget)
      if (!target) { this.form.actionRoute = ''; return }
      this.form.actionRoute = target.path.endsWith('/')
        ? (this.actionId ? target.path + this.actionId.trim() : '')
        : target.path
    },
    load () {
      this.isLoading = true
      this.$axios.get('admin/app/hero', { params: { Page: 1, PageSize: 10 } })
        .then(response => {
          this.rows = rowsOf(response)
          this.isLoading = false
        })
        .catch(error => {
          this.isLoading = false
          this.$toast.error(errorMessage(error, 'Could not load the home screen messages.'))
        })
    },
    edit (hero) {
      this.editingId = hero.id
      this.existingImageUrl = hero.imageUrl || ''
      this.form = {
        kind: hero.kind || 'promo',
        eyebrow: hero.eyebrow || '',
        headline: hero.headline || '',
        subline: hero.subline || '',
        imageMediaId: hero.imageMediaId || '',
        actionLabel: hero.actionLabel || '',
        actionRoute: hero.actionRoute || '',
        actionIcon: hero.actionIcon || '',
        status: hero.status || 'published',
        publishAt: toLocalInput(hero.publishAt)
      }
      const target = HERO_ACTION_TARGETS.find(t => hero.actionRoute && hero.actionRoute.indexOf(t.path) === 0)
      this.actionTarget = target ? target.value : ''
      this.actionId = target && target.path.endsWith('/')
        ? hero.actionRoute.slice(target.path.length)
        : ''
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    reset () {
      this.editingId = ''
      this.existingImageUrl = ''
      this.form = EMPTY()
      this.actionTarget = ''
      this.actionId = ''
      this.showErrors = false
    },
    submit () {
      if (!this.form.headline || this.buttonIsHalfDone ||
          (this.form.status === 'scheduled' && !this.form.publishAt)) {
        this.showErrors = true
        return
      }
      this.showErrors = false
      this.isSaving = true

      const body = Object.assign({}, this.form, {
        publishAt: this.form.status === 'scheduled' ? toUtcIso(this.form.publishAt) : null
      })

      const request = this.editingId
        ? this.$axios.put(`admin/app/hero/${this.editingId}`, body)
        : this.$axios.post('admin/app/hero', body)

      request
        .then(response => {
          this.$toast.success(this.editingId ? 'Home screen updated' : 'Home screen message saved')
          this.editingId = payload(response) ? payload(response).id : ''
          this.isSaving = false
          this.load()
        })
        .catch(error => {
          this.isSaving = false
          this.$toast.error(errorMessage(error, 'Could not save that.'))
        })
    },
    confirmRemove (hero) {
      this.pendingRemove = hero
      this.confirmOpen = true
    },
    doRemove () {
      const hero = this.pendingRemove
      this.confirmOpen = false
      if (!hero) { return }

      this.$axios.delete(`admin/app/hero/${hero.id}`)
        .then(() => {
          this.$toast.success('Deleted')
          if (this.editingId === hero.id) { this.reset() }
          this.load()
        })
        .catch(error => this.$toast.error(errorMessage(error, 'Could not delete that.')))
    }
  }
}
</script>

<style scoped>
.hero__cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 380px); gap: 20px; align-items: start; }
@media (max-width: 900px) { .hero__cols { grid-template-columns: minmax(0, 1fr); } }

.preview {
  border: 1px solid var(--ds-border);
  border-radius: 10px;
  padding: 18px;
  background: var(--ds-surface-2);
  display: grid;
  gap: 6px;
}
.preview__img { width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 6px; }
.preview__eyebrow { font-size: var(--ds-text-sm); text-transform: uppercase; letter-spacing: .06em; color: var(--ds-text-muted); }
.preview__headline { margin: 0; font-size: 20px; font-weight: 600; line-height: 1.25; overflow-wrap: anywhere; }
.preview.is-scripture .preview__headline { font-family: Georgia, 'Times New Roman', serif; font-weight: 400; }
.preview__subline { margin: 0; color: var(--ds-text-muted); font-size: var(--ds-text-sm); }
.preview__btn {
  justify-self: start;
  margin-top: 8px;
  padding: 7px 14px;
  border-radius: 999px;
  font-size: var(--ds-text-sm);
  background: var(--ds-text);
  color: var(--ds-surface);
}

.hero__list { list-style: none; margin: 0; padding: 0; }
.hero__row { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-top: 1px solid var(--ds-border); }
.hero__pick { flex: 1; display: flex; align-items: center; gap: 10px; text-align: left; background: none; border: 0; cursor: pointer; min-width: 0; }
.hero__rowtext { display: grid; gap: 2px; min-width: 0; }
.hero__rowtext b { overflow-wrap: anywhere; }
</style>
