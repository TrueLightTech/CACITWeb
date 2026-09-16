<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Word for Today</h1>
        <p>One verse a day on the app's home screen. Schedule them ahead — a week at a time works well.</p>
      </div>
    </div>

    <div class="wd__layout">
      <form class="ds-card wd__form" @submit.prevent="submit">
        <div class="ds-card__head">
          <h2 class="ds-h3">{{ editingExisting ? 'Change this day' : 'Schedule a verse' }}</h2>
        </div>

        <div class="ds-card__body">
          <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.forDate }">
            <label class="ds-label" for="wordDate">For</label>
            <input id="wordDate" v-model="form.forDate" class="ds-input" type="date" :min="today">
            <span v-if="editingExisting" class="ds-help wd__replacing">
              A verse is already set for this day. Saving replaces it.
            </span>
            <span v-else class="ds-help">One verse per day.</span>
            <span v-if="showErrors && !form.forDate" class="ds-error">Choose the day.</span>
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
          <h2 class="ds-h3">Scheduled</h2>
        </div>

        <div v-if="isLoading" class="ds-card__body" style="display:grid;gap:12px">
          <span v-for="n in 5" :key="n" class="ds-skeleton" style="height:44px"></span>
        </div>

        <ul v-else-if="entries.length" class="wd__entries">
          <li v-for="entry in entries" :key="entry.forDate" class="wd__entry" :class="{ 'is-today': isToday(entry.forDate) }">
            <div class="wd__entrywhen">
              <span class="wd__day">{{ $moment(entry.forDate).format('D MMM') }}</span>
              <span class="wd__weekday">{{ isToday(entry.forDate) ? 'Today' : $moment(entry.forDate).format('ddd') }}</span>
            </div>
            <div class="wd__entrycopy">
              <span class="wd__ref">{{ entry.reference }}</span>
              <span class="wd__text">{{ entry.text }}</span>
            </div>
            <button class="ds-btn ds-btn--ghost ds-btn--sm" type="button" @click="edit(entry)">Edit</button>
          </li>
        </ul>

        <div v-else class="ds-empty">
          <h3 class="ds-h3">Nothing scheduled</h3>
          <p>Members see the most recent verse until a new one is set for the day.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { rowsOf, errorMessage } from '../../../network/MobileApp'

export default {
  name: 'AdminAppWordForToday',
  data () {
    return {
      entries: [],
      isLoading: false,
      isSaving: false,
      showErrors: false,
      form: {
        forDate: '',
        text: '',
        reference: '',
        translation: '',
        reflection: ''
      }
    }
  },
  computed: {
    today () {
      return new Date().toISOString().slice(0, 10)
    },
    editingExisting () {
      return this.entries.some(entry => this.dayOf(entry.forDate) === this.form.forDate)
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
        reflection: entry.reflection || ''
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    reset () {
      this.form = { forDate: this.today, text: '', reference: '', translation: '', reflection: '' }
      this.showErrors = false
    },
    load () {
      this.isLoading = true

      this.$axios.get('admin/word-for-today', { params: { Page: 1, PageSize: 30 } }).then(response => {
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
        reflection: this.form.reflection || null
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
.wd__ref { font-weight: 500; font-size: var(--ds-text-sm); }
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
