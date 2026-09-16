<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">{{ isEdit ? `Hymn ${form.number}` : 'Add hymn' }}</h1>
        <p>Corrections reach members straight away — the app re-syncs the hymnal rather than waiting for a release.</p>
      </div>
      <div class="ds-page-head__actions">
        <NuxtLink class="ds-btn ds-btn--secondary" to="/admin/app/hymns">All hymns</NuxtLink>
      </div>
    </div>

    <div v-if="isLoadingRecord" class="ds-card" style="max-width:720px">
      <div class="ds-card__body" style="display:grid;gap:16px">
        <span class="ds-skeleton" style="height:38px"></span>
        <span class="ds-skeleton" style="height:160px"></span>
      </div>
    </div>

    <form v-else class="ds-card" style="max-width:720px" @submit.prevent="submit">
      <div class="ds-card__body">
        <div class="ds-formsection">
          <div class="ds-formgrid">
            <div class="ds-field ds-field--sm" :class="{ 'is-invalid': showErrors && !form.number }">
              <label class="ds-label" for="hymnNumber">Number</label>
              <input id="hymnNumber" v-model.number="form.number" class="ds-input" type="number" min="1">
              <span v-if="showErrors && !form.number" class="ds-error">Give it a number.</span>
            </div>

            <div class="ds-field">
              <label class="ds-label" for="hymnLanguage">Language</label>
              <select id="hymnLanguage" v-model="form.language" class="ds-select">
                <option value="Twi">Twi</option>
                <option value="English">English</option>
                <option value="Bilingual">Bilingual</option>
              </select>
            </div>
          </div>

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.title }">
            <label class="ds-label" for="hymnTitle">Title</label>
            <input id="hymnTitle" v-model="form.title" class="ds-input" type="text" lang="tw">
            <!--
              Twi orthography (ɛ, ɔ and the apostrophes) has to survive as UTF-8
              from here to the phone, so nothing here transliterates it.
            -->
            <span class="ds-help">Type Twi exactly as it is written, including ɛ and ɔ.</span>
            <span v-if="showErrors && !form.title" class="ds-error">Give the hymn its title.</span>
          </div>

          <div class="ds-formgrid">
            <div class="ds-field">
              <label class="ds-label" for="hymnTitleEn">English title</label>
              <input id="hymnTitleEn" v-model="form.titleEn" class="ds-input" type="text">
              <span class="ds-help">Optional.</span>
            </div>

            <div class="ds-field">
              <label class="ds-label" for="hymnCategory">Category</label>
              <input id="hymnCategory" v-model="form.category" class="ds-input" type="text"
                     placeholder="Gyidi &amp; Ahotoso">
            </div>
          </div>
        </div>

        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">Verses</h2>
            <p>One box per verse, in order. The app numbers them.</p>
          </div>

          <div v-for="(verse, index) in form.verses" :key="index" class="hf__verse">
            <div class="hf__versehead">
              <span class="hf__versenum">Verse {{ index + 1 }}</span>
              <button
                v-if="form.verses.length > 1"
                class="ds-btn ds-btn--ghost ds-btn--sm"
                type="button"
                @click="removeVerse(index)"
              >
                Remove
              </button>
            </div>
            <textarea
              v-model="form.verses[index]"
              class="ds-textarea"
              rows="4"
              lang="tw"
              :aria-label="`Verse ${index + 1}`"
            ></textarea>
          </div>

          <span v-if="showErrors && !hasVerse" class="ds-error">A hymn needs at least one verse.</span>

          <button class="ds-btn ds-btn--secondary ds-btn--sm" type="button" @click="addVerse">
            Add another verse
          </button>
        </div>

        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">Chorus (Nnyesoɔ)</h2>
            <p>Optional. Kept separate so the app can repeat it between verses.</p>
          </div>
          <div class="ds-field" style="margin-bottom:0">
            <textarea v-model="form.chorus" class="ds-textarea" rows="3" lang="tw" aria-label="Chorus"></textarea>
          </div>
        </div>

        <div class="ds-formsection">
          <div class="ds-formgrid">
            <div class="ds-field">
              <label class="ds-label" for="hymnAuthor">Author</label>
              <input id="hymnAuthor" v-model="form.author" class="ds-input" type="text">
            </div>
            <div class="ds-field">
              <label class="ds-label" for="hymnKey">Key</label>
              <input id="hymnKey" v-model="form.keySignature" class="ds-input" type="text" placeholder="F major">
            </div>
          </div>
        </div>
      </div>

      <div class="ds-card__foot" style="display:flex;gap:8px;justify-content:flex-end">
        <button class="ds-btn ds-btn--ghost" type="button" @click="$router.push('/admin/app/hymns')">Cancel</button>
        <button class="ds-btn ds-btn--primary" type="submit" :disabled="isSaving">
          <span v-if="isSaving" class="ds-btn__spinner"></span>
          {{ isSaving ? 'Saving' : (isEdit ? 'Save correction' : 'Add hymn') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { payload, errorMessage } from '../network/MobileApp'

export default {
  name: 'HymnForm',
  props: {
    isEdit: { type: Boolean, default: false }
  },
  data () {
    return {
      isLoadingRecord: false,
      isSaving: false,
      showErrors: false,
      form: {
        number: null,
        title: '',
        titleEn: '',
        category: '',
        language: 'Twi',
        verses: [''],
        chorus: '',
        author: '',
        keySignature: '',
        meter: ''
      }
    }
  },
  computed: {
    hasVerse () {
      return this.form.verses.some(v => v && v.trim())
    }
  },
  beforeMount () {
    if (this.isEdit) { this.loadHymn() }
  },
  methods: {
    addVerse () {
      this.form.verses.push('')
    },
    removeVerse (index) {
      this.form.verses.splice(index, 1)
    },
    loadHymn () {
      this.isLoadingRecord = true

      this.$axios.get(`hymns/${this.$route.params.id}`).then(response => {
        const data = payload(response) || {}

        this.form = {
          number: data.number || null,
          title: data.title || '',
          titleEn: data.titleEn || '',
          category: data.category || '',
          language: data.language || 'Twi',
          verses: Array.isArray(data.verses) && data.verses.length ? data.verses.slice() : [''],
          chorus: data.chorus || '',
          author: data.author || '',
          keySignature: data.keySignature || '',
          meter: data.meter || ''
        }

        this.isLoadingRecord = false
      }).catch(error => {
        this.isLoadingRecord = false
        this.$toast.error(errorMessage(error, 'Could not load that hymn.'))
        this.$router.push('/admin/app/hymns')
      })
    },
    submit () {
      if (!this.form.number || !this.form.title || !this.hasVerse) {
        this.showErrors = true
        return
      }

      this.showErrors = false
      this.isSaving = true

      const body = Object.assign({}, this.form, {
        verses: this.form.verses.map(v => v.trim()).filter(Boolean),
        chorus: this.form.chorus.trim() || null
      })

      const request = this.isEdit
        ? this.$axios.put(`admin/hymns/${this.$route.params.id}`, body)
        : this.$axios.post('admin/hymns', body)

      request.then(() => {
        this.$toast.success(this.isEdit ? 'Hymn corrected' : 'Hymn added')
        this.isSaving = false
        this.$router.push('/admin/app/hymns')
      }).catch(error => {
        this.isSaving = false
        this.$toast.error(errorMessage(error, 'Could not save this hymn.'))
      })
    }
  }
}
</script>

<style scoped>
.hf__verse { margin-bottom: 14px; }
.hf__versehead { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.hf__versenum {
  font-size: 11.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
  color: var(--ds-text-muted);
}
</style>
