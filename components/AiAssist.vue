<template>
  <div v-if="isAvailable" class="ai">
    <div class="ai__head">
      <span class="ai__badge">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>
        </svg>
        Draft with AI
      </span>
      <p class="ds-help ai__lead">
        Describe it in your own words. You get a filled form to check and edit —
        nothing is published.
      </p>
    </div>

    <div class="ai__row">
      <textarea
        :id="promptId"
        v-model="prompt"
        class="ds-textarea ai__prompt"
        rows="2"
        :placeholder="placeholder"
        :disabled="isDrafting"
        :aria-label="'Describe the ' + noun"
        @keydown.meta.enter.prevent="draft"
        @keydown.ctrl.enter.prevent="draft"
      ></textarea>
      <button
        class="ds-btn ds-btn--secondary ai__go"
        type="button"
        :disabled="!prompt.trim() || isDrafting"
        @click="draft"
      >
        <span v-if="isDrafting" class="ds-btn__spinner"></span>
        {{ isDrafting ? 'Drafting' : (hasContent ? 'Redraft' : 'Draft') }}
      </button>
    </div>

    <p v-if="error" class="ds-error ai__error">{{ error }}</p>

    <div v-if="note" class="ai__note">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16.5" x2="12" y2="16.5"/>
      </svg>
      <span>{{ note }}</span>
    </div>

    <!--
      Only videos YouTube confirmed exist reach this list; the title and channel
      are YouTube's own. A model-recalled id that turned out to be nothing, or
      somebody else's video, was dropped by the server.
    -->
    <div v-if="videos.length" class="ai__videos">
      <p class="ds-label ai__videoslabel">Found on YouTube — check it is the right one</p>
      <button
        v-for="video in videos"
        :key="video.videoId"
        class="ai__video"
        type="button"
        @click="$emit('use-video', video)"
      >
        <img :src="video.thumbnailUrl" alt="" class="ai__thumb">
        <span class="ai__videometa">
          <span class="ai__videotitle">{{ video.title }}</span>
          <span class="ds-meta">{{ video.channel }}</span>
        </span>
        <span class="ds-btn ds-btn--secondary ds-btn--sm ai__use">Use this</span>
      </button>
    </div>

    <p v-if="searchQuery && !videos.length" class="ds-help ai__search">
      Nothing could be confirmed.
      <a :href="youtubeSearchUrl" target="_blank" rel="noopener noreferrer">
        Search YouTube for “{{ searchQuery }}”
      </a>
      and paste the link below.
    </p>
  </div>
</template>

<script>
import { payload, errorMessage } from '../network/MobileApp'

let uid = 0

/**
 * Asked once for the whole page. Several forms on one screen should not each
 * ask whether drafting is switched on.
 */
let status = null
let statusRequest = null

function loadStatus (axios) {
  if (status) { return Promise.resolve(status) }
  if (!statusRequest) {
    statusRequest = axios.get('admin/ai/status')
      .then(response => {
        status = payload(response) || {}
        return status
      })
      .catch(() => {
        // An older server, or a role that cannot draft. Either way the button
        // is simply not offered.
        status = { isAvailable: false }
        return status
      })
  }
  return statusRequest
}

/**
 * Drafting help, shared by every create form in the Mobile App section.
 *
 * The component knows nothing about any particular form: it sends the resource
 * name and what the form currently holds, and emits back whatever fields came
 * out. Each form maps those onto its own shape, so adding drafting to a new
 * form is one tag and one mapping function.
 */
export default {
  name: 'AiAssist',
  props: {
    /** sermon | short | event | video | hymn | word | push */
    resource: { type: String, required: true },

    /** What the form holds now, so "make it shorter" works on the real draft. */
    current: { type: Object, default: () => ({}) },

    /** Used in the placeholder only. */
    noun: { type: String, default: 'item' },

    /** True once the form has something in it, so the button can say "Redraft". */
    hasContent: { type: Boolean, default: false }
  },
  data () {
    uid += 1
    return {
      promptId: `aiPrompt${uid}`,
      isAvailable: false,
      isDrafting: false,
      prompt: '',
      error: '',
      note: '',
      searchQuery: '',
      videos: []
    }
  },
  computed: {
    placeholder () {
      return `Describe the ${this.noun} — a sentence is enough`
    },
    youtubeSearchUrl () {
      return `https://www.youtube.com/results?search_query=${encodeURIComponent(this.searchQuery)}`
    }
  },
  mounted () {
    loadStatus(this.$axios).then(available => {
      this.isAvailable = !!available.isAvailable
    })
  },
  methods: {
    /** Returns the request, so a caller — or a test — can wait for it. */
    draft () {
      const prompt = this.prompt.trim()
      if (!prompt || this.isDrafting) { return Promise.resolve() }

      this.isDrafting = true
      this.error = ''
      this.note = ''
      this.videos = []
      this.searchQuery = ''

      // Only fields with something in them — an empty form should not be
      // described to the model as a form full of blanks.
      const current = {}
      Object.keys(this.current || {}).forEach(key => {
        const value = this.current[key]
        if (typeof value === 'string' && value.trim()) { current[key] = value.trim() }
      })

      return this.$axios.post('admin/ai/draft', { resource: this.resource, prompt, current })
        .then(response => {
          const data = payload(response) || {}
          this.note = data.note || ''
          this.videos = Array.isArray(data.videos) ? data.videos : []
          this.searchQuery = data.searchQuery || ''
          this.isDrafting = false

          if (data.fields && Object.keys(data.fields).length) {
            this.$emit('apply', data.fields)
            this.$toast.success('Draft ready — check it before publishing')
          } else {
            this.error = 'Nothing usable came back. Try describing it differently.'
          }
        })
        .catch(error => {
          this.isDrafting = false
          this.error = errorMessage(error, 'Could not draft this. Try again in a moment.')
        })
    }
  }
}
</script>

<style scoped>
.ai {
  border: 1px solid var(--ds-border);
  border-radius: 8px;
  background: var(--ds-surface-2);
  padding: 14px 16px;
  margin-bottom: 20px;
}

.ai__head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }

.ai__badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--ds-text-sm);
  font-weight: 600;
}

.ai__lead { margin: 0; flex: 1 1 260px; }

.ai__row { display: flex; gap: 8px; align-items: flex-start; }
.ai__prompt { flex: 1; resize: vertical; }
.ai__go { flex-shrink: 0; }
.ai__error { margin-top: 8px; }

.ai__note {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-top: 10px;
  font-size: var(--ds-text-sm);
  color: var(--ds-text-muted);
}
.ai__note svg { flex-shrink: 0; margin-top: 2px; }

.ai__videos { margin-top: 14px; display: grid; gap: 8px; }
.ai__videoslabel { margin: 0; }

.ai__video {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px;
  text-align: left;
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: 6px;
  cursor: pointer;
}
.ai__video:hover { border-color: var(--ds-text-muted); }

.ai__thumb { width: 84px; height: 48px; object-fit: cover; border-radius: 4px; flex-shrink: 0; }
.ai__videometa { display: grid; gap: 2px; flex: 1; min-width: 0; }
.ai__videotitle { font-size: var(--ds-text-sm); font-weight: 500; overflow-wrap: anywhere; }
.ai__use { flex-shrink: 0; pointer-events: none; }

.ai__search { margin-top: 10px; }
</style>
