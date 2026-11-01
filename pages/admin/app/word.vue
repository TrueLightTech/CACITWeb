<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Word for Today</h1>
        <p>One verse a day on the app's home screen. Each goes live at its time and notifies every phone. Days nobody fills are drafted by AI a week ahead — read them, edit, move or cancel any you don't want.</p>
      </div>
      <div class="ds-page-head__actions">
        <button class="ds-btn ds-btn--secondary" type="button" :disabled="isFilling" @click="fill">
          <span v-if="isFilling" class="ds-btn__spinner"></span>
          {{ isFilling ? 'Drafting' : 'Fill the week with AI' }}
        </button>
      </div>
    </div>

    <div class="wd__layout">
      <form class="ds-card wd__form" @submit.prevent="submit">
        <div class="ds-card__head">
          <h2 class="ds-h3">{{ editingExisting ? 'Change this day' : 'Schedule a verse' }}</h2>
        </div>

        <div class="ds-card__body">
          <AiAssist
            resource="word"
            noun="verse and reflection"
            :current="aiCurrent"
            :has-content="!!form.text"
            @apply="applyDraft"
          />

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.forDate }">
            <label class="ds-label" for="wordDate">For</label>
            <input id="wordDate" v-model="form.forDate" class="ds-input" type="date" :min="today">
            <span v-if="editingExisting" class="ds-help wd__replacing">
              A verse is already set for this day. Saving replaces it.
            </span>
            <span v-else class="ds-help">One verse per day.</span>
            <span v-if="showErrors && !form.forDate" class="ds-error">Choose the day.</span>
          </div>

          <div class="ds-field">
            <label class="ds-label" for="wordTime">Goes live at</label>
            <input id="wordTime" v-model="form.publishTime" class="ds-input" type="time" :disabled="alreadyLive">
            <span v-if="alreadyLive" class="ds-help">Already live. Saving corrects the words without notifying again.</span>
            <span v-else class="ds-help">Accra time. A time already passed today goes live within a minute.</span>
          </div>

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.text }">
            <label class="ds-label" for="wordText">The verse</label>
            <textarea id="wordText" v-model="form.text" class="ds-textarea" rows="3"></textarea>
            <span v-if="showErrors && !form.text" class="ds-error">Write the verse.</span>
          </div>

          <div class="ds-formgrid">
            <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.reference }">
              <label class="ds-label" for="wordRef">Reference</label>
              <input id="wordRef" v-model="form.reference" class="ds-input" type="text" placeholder="Psalm 46:10">
              <span v-if="showErrors && !form.reference" class="ds-error">Add the reference.</span>
            </div>

            <div class="ds-field">
              <label class="ds-label" for="wordTranslation">Translation</label>
              <input id="wordTranslation" v-model="form.translation" class="ds-input" type="text" placeholder="NIV">
            </div>
          </div>

          <div class="ds-field" style="margin-bottom:0">
            <label class="ds-label" for="wordReflection">Reflection</label>
            <textarea id="wordReflection" v-model="form.reflection" class="ds-textarea" rows="4"></textarea>
            <span class="ds-help">Optional. A line or two under the verse.</span>
          </div>

          <label v-if="!alreadyLive" class="ds-check" style="margin-top:16px">
            <input v-model="form.sendPush" type="checkbox">
            <span>Send a push notification when it goes live</span>
          </label>
        </div>

        <div class="ds-card__foot" style="display:flex;gap:8px;justify-content:flex-end">
          <button v-if="isDirty" class="ds-btn ds-btn--ghost" type="button" @click="reset">Clear</button>
          <button class="ds-btn ds-btn--primary" type="submit" :disabled="isSaving">
            <span v-if="isSaving" class="ds-btn__spinner"></span>
            {{ isSaving ? 'Saving' : (editingExisting ? 'Replace verse' : 'Schedule verse') }}
          </button>
        </div>
      </form>

      <section class="ds-card wd__list">
        <div class="ds-card__head">
          <h2 class="ds-h3">Coming up</h2>
        </div>

        <div v-if="isLoading" class="ds-card__body" style="display:grid;gap:12px">
          <span v-for="n in 5" :key="n" class="ds-skeleton" style="height:44px"></span>
        </div>

        <ul v-else-if="entries.length" class="wd__entries">
          <li
            v-for="entry in entries"
            :key="entry.id"
            class="wd__entry"
            :class="{ 'is-today': isToday(entry.forDate), 'is-cancelled': entry.status === 'cancelled' }"
          >
            <div class="wd__entrywhen">
              <span class="wd__day">{{ $moment.utc(entry.forDate).format('D MMM') }}</span>
              <span class="wd__weekday">{{ isToday(entry.forDate) ? 'Today' : $moment.utc(entry.forDate).format('ddd') }}</span>
            </div>
            <div class="wd__entrycopy">
              <span class="wd__ref">
                {{ entry.reference }}
                <span v-if="entry.status === 'published'" class="ds-badge ds-badge--success">Live</span>
                <span v-else-if="entry.status === 'cancelled'" class="ds-badge ds-badge--neutral">Cancelled</span>
                <template v-else>
                  <span class="ds-badge ds-badge--info">{{ $moment.utc(entry.publishAt).format('HH:mm') }}{{ entry.sendPush ? ' · push' : '' }}</span>
                  <span v-if="entry.source === 'ai'" class="ds-badge ds-badge--warning" title="Drafted by AI. Saving it marks it as checked.">AI draft</span>
                </template>
              </span>
              <span class="wd__text">{{ entry.text }}</span>
            </div>
            <RowMenu :label="`Actions for ${entry.reference}`">
              <template #default="{ close }">
                <button v-if="entry.status !== 'cancelled'" class="ds-menu__item" type="button" @click="edit(entry); close()">
                  {{ entry.source === 'ai' && entry.status === 'scheduled' ? 'Review and edit' : 'Edit' }}
                </button>
                <template v-if="entry.status === 'scheduled'">
                  <button class="ds-menu__item" type="button" @click="openMove(entry); close()">Reschedule</button>
                  <button class="ds-menu__item" type="button" @click="redraft(entry); close()">Draft a different verse with AI</button>
                  <button class="ds-menu__item ds-menu__item--danger" type="button" @click="cancelling = entry; close()">Cancel this day</button>
                </template>
                <button v-if="entry.status === 'cancelled'" class="ds-menu__item" type="button" @click="restore(entry); close()">Restore verse</button>
              </template>
            </RowMenu>
          </li>
        </ul>

        <div v-else class="ds-empty">
          <h3 class="ds-h3">Nothing coming up</h3>
          <p>Members see the most recent verse until a new one goes live. Use “Fill the week with AI”, or schedule one yourself.</p>
        </div>
      </section>
    </div>

    <ConfirmDialog
      :open="!!cancelling"
      :busy="isCancelling"
      title="Cancel this day?"
      :message="cancelling ? `No verse will go out on ${$moment.utc(cancelling.forDate).format('D MMMM')}, and the AI will not fill it. Members keep seeing the previous verse. You can restore it until the day.` : ''"
      confirm-label="Cancel day"
      cancel-label="Keep it"
      destructive
      @cancel="cancelling = null"
      @confirm="cancelDay"
    />

    <div v-if="moving" class="ds-overlay" @click.self="moving = null">
      <form class="ds-modal" role="dialog" aria-modal="true" aria-labelledby="wdMoveTitle" @submit.prevent="move">
        <div class="ds-modal__head">
          <div>
            <h2 id="wdMoveTitle" class="ds-h3">Reschedule {{ moving.reference }}</h2>
            <p>The day it moves to must be free or cancelled. The day it leaves will be drafted again by AI unless you cancel it.</p>
          </div>
        </div>
        <div class="ds-modal__body">
          <div class="ds-formgrid">
            <div class="ds-field" style="margin-bottom:0">
              <label class="ds-label" for="wdMoveDate">Day</label>
              <input id="wdMoveDate" v-model="moveForm.forDate" class="ds-input" type="date" :min="today" required>
            </div>
            <div class="ds-field" style="margin-bottom:0">
              <label class="ds-label" for="wdMoveTime">Goes live at</label>
              <input id="wdMoveTime" v-model="moveForm.publishTime" class="ds-input" type="time" required>
            </div>
          </div>
        </div>
        <div class="ds-modal__foot">
          <button class="ds-btn ds-btn--ghost" type="button" @click="moving = null">Cancel</button>
          <button class="ds-btn ds-btn--primary" type="submit" :disabled="isMoving">
            <span v-if="isMoving" class="ds-btn__spinner"></span>
            Reschedule
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { rowsOf, errorMessage } from '../../../network/MobileApp'
import AiAssist from '../../../components/AiAssist'
import ConfirmDialog from '../../../components/ConfirmDialog'
import RowMenu from '../../../components/RowMenu'

/** Matches the API's MobileAppConfig.WordForTodayPublishTime. Accra is on UTC. */
const DEFAULT_TIME = '06:00'

export default {
  components: { AiAssist, ConfirmDialog, RowMenu },
  name: 'AdminAppWordForToday',
  data () {
    return {
      entries: [],
      isLoading: false,
      isSaving: false,
      showErrors: false,
      cancelling: null,
      isCancelling: false,
      moving: null,
      isMoving: false,
      moveForm: { forDate: '', publishTime: DEFAULT_TIME },
      isFilling: false,
      form: {
        forDate: '',
        text: '',
        reference: '',
        translation: '',
        reflection: '',
        publishTime: DEFAULT_TIME,
        sendPush: true
      }
    }
  },
  computed: {
    /** What a redraft should improve rather than replace. */
    aiCurrent () {
      return {
        forDate: this.form.forDate,
        text: this.form.text,
        reference: this.form.reference,
        reflection: this.form.reflection
      }
    },
    today () {
      return new Date().toISOString().slice(0, 10)
    },
    existing () {
      return this.entries.find(entry => this.dayOf(entry.forDate) === this.form.forDate)
    },
    editingExisting () {
      return !!this.existing && this.existing.status !== 'cancelled'
    },
    alreadyLive () {
      return !!this.existing && this.existing.status === 'published'
    },
    isDirty () {
      return !!(this.form.text || this.form.reference || this.form.reflection)
    }
  },
  beforeMount () {
    this.form.forDate = this.today
    this.load()
  },
  methods: {

    /**
     * Fold a draft into the form. Only fields the draft returned are touched,
     * and everything stays editable afterwards.
     */
    applyDraft (fields) {
      const set = (key, value) => { if (value !== undefined && value !== null && value !== '') { this.$set(this.form, key, value) } }
      if (!this.form.forDate && fields.forDate) {
        set('forDate', fields.forDate)
      }
      set('text', fields.text)
      set('reference', fields.reference)
      set('translation', fields.translation || 'NIV')
      set('reflection', fields.reflection)
    },
    dayOf (value) {
      return value ? String(value).slice(0, 10) : ''
    },
    isToday (value) {
      return this.dayOf(value) === this.today
    },
    edit (entry) {
      this.form = {
        forDate: this.dayOf(entry.forDate),
        text: entry.text || '',
        reference: entry.reference || '',
        translation: entry.translation || '',
        reflection: entry.reflection || '',
        publishTime: entry.publishAt ? this.$moment.utc(entry.publishAt).format('HH:mm') : DEFAULT_TIME,
        sendPush: entry.sendPush !== false
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    reset () {
      this.form = { forDate: this.today, text: '', reference: '', translation: '', reflection: '', publishTime: DEFAULT_TIME, sendPush: true }
      this.showErrors = false
    },
    /** Every row action answers with the updated verse or an error; reload either way. */
    act (request, success, failure) {
      return request.then(() => {
        this.$toast.success(success)
        this.load()
      }).catch(error => {
        this.$toast.error(errorMessage(error, failure))
        this.load()
      })
    },
    cancelDay () {
      const entry = this.cancelling
      if (!entry) { return }
      this.isCancelling = true
      this.act(this.$axios.post(`admin/word-for-today/${entry.id}/cancel`), 'Day cancelled', 'Could not cancel that day.')
        .then(() => { this.isCancelling = false; this.cancelling = null })
    },
    restore (entry) {
      this.act(this.$axios.post(`admin/word-for-today/${entry.id}/restore`), 'Verse restored', 'Could not restore that verse.')
    },
    redraft (entry) {
      this.$toast.info('Drafting a different verse…')
      this.act(this.$axios.post(`admin/word-for-today/${entry.id}/redraft`), 'New verse drafted', 'Could not draft a new verse.')
    },
    openMove (entry) {
      this.moving = entry
      this.moveForm = {
        forDate: this.dayOf(entry.forDate),
        publishTime: this.$moment.utc(entry.publishAt).format('HH:mm')
      }
    },
    move () {
      const entry = this.moving
      if (!entry) { return }
      this.isMoving = true
      this.$axios.post(`admin/word-for-today/${entry.id}/reschedule`, {
        forDate: new Date(`${this.moveForm.forDate}T00:00:00Z`).toISOString(),
        publishTime: this.moveForm.publishTime
      }).then(() => {
        this.isMoving = false
        this.moving = null
        this.$toast.success('Verse rescheduled')
        this.load()
      }).catch(error => {
        // Left open, so a clash with a taken day can be fixed in place.
        this.isMoving = false
        this.$toast.error(errorMessage(error, 'Could not reschedule that verse.'))
      })
    },
    fill () {
      this.isFilling = true
      this.$axios.post('admin/word-for-today/fill').then(response => {
        const data = (response.data && response.data.data) || {}
        this.isFilling = false
        if (data.drafted) {
          this.$toast.success(`Drafted ${data.drafted} verse${data.drafted === 1 ? '' : 's'}. Read them before they go out.`)
        } else if (data.note) {
          this.$toast.error(data.note)
        } else {
          this.$toast.success('Every day this week is already decided.')
        }
        this.load()
      }).catch(error => {
        this.isFilling = false
        this.$toast.error(errorMessage(error, 'Could not draft the week.'))
      })
    },
    load () {
      this.isLoading = true

      this.$axios.get('admin/word-for-today', { params: { Upcoming: true, Page: 1, PageSize: 60 } }).then(response => {
        this.entries = rowsOf(response)
        this.isLoading = false
      }).catch(error => {
        this.entries = []
        this.isLoading = false
        this.$toast.error(errorMessage(error, 'Could not load the schedule.'))
      })
    },
    submit () {
      if (!this.form.forDate || !this.form.text || !this.form.reference) {
        this.showErrors = true
        return
      }

      this.showErrors = false
      this.isSaving = true

      this.$axios.put('admin/word-for-today', {
        forDate: new Date(`${this.form.forDate}T00:00:00Z`).toISOString(),
        text: this.form.text.trim(),
        reference: this.form.reference.trim(),
        translation: this.form.translation || null,
        reflection: this.form.reflection || null,
        publishTime: this.form.publishTime || null,
        sendPush: this.form.sendPush
      }).then(() => {
        this.$toast.success('Verse scheduled')
        this.isSaving = false
        this.reset()
        this.load()
      }).catch(error => {
        this.isSaving = false
        this.$toast.error(errorMessage(error, 'Could not save that verse.'))
      })
    }
  }
}
</script>

<style scoped>
.wd__entry.is-cancelled .wd__text { text-decoration: line-through; }
.wd__entry.is-cancelled .wd__entrycopy { opacity: .6; }
.wd__layout { display: grid; grid-template-columns: minmax(0, 420px) minmax(0, 1fr); gap: 20px; align-items: start; }
@media (max-width: 900px) { .wd__layout { grid-template-columns: 1fr; } }

.wd__replacing { color: var(--ds-warning, #7a4f00); }

.wd__entries { list-style: none; margin: 0; padding: 0; }
.wd__entry {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--ds-border);
}
.wd__entry:last-child { border-bottom: 0; }
.wd__entry.is-today { background: var(--ds-surface-2); }

.wd__entrywhen { display: grid; gap: 1px; }
.wd__day { font-weight: 600; font-variant-numeric: tabular-nums; }
.wd__weekday { font-size: var(--ds-text-sm); color: var(--ds-text-muted); }

.wd__entrycopy { display: grid; gap: 2px; min-width: 0; }
.wd__ref { font-weight: 500; font-size: var(--ds-text-sm); display: flex; gap: 8px; align-items: center; }
.wd__text {
  color: var(--ds-text-muted);
  font-size: var(--ds-text-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
