<template>
  <div class="tf">
    <div class="tf__head">
      <span class="tf__label">Cover image</span>
      <span v-if="state === 'working'" class="tf__state">Taking a frame…</span>
    </div>

    <div class="tf__body">
      <div class="tf__preview" :class="{ 'is-empty': !value }">
        <img v-if="value" :src="value" alt="" class="tf__img">
        <svg v-else class="tf__placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
        </svg>
      </div>

      <div class="tf__actions">
        <label class="ds-btn ds-btn--secondary ds-btn--sm tf__pick" :for="inputId">
          {{ value ? 'Replace' : 'Upload an image' }}
          <input :id="inputId" ref="file" class="tf__input" type="file" accept="image/*" @change="onPick">
        </label>

        <button v-if="value" type="button" class="ds-btn ds-btn--ghost ds-btn--sm" @click="clear">
          Remove
        </button>

        <p class="ds-help tf__hint">{{ hint }}</p>
        <p v-if="error" class="ds-error tf__error">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { grabPoster, uploadImage } from '../network/Poster'

let uid = 0

/**
 * The cover a sermon or video shows in the app.
 *
 * Cloudflare Stream produces one for every video it transcodes and YouTube
 * exposes one per id, but an R2 upload has nothing behind it that could make a
 * picture. So for an uploaded video this takes a frame in the browser, and for
 * a recording -- where there is no frame to take -- it asks.
 *
 * An automatic frame is a starting point, never the last word: the tenth
 * percentile of a service is sometimes an empty stage. A cover the office
 * chooses is kept, and a later video swap does not overwrite it.
 */
export default {
  name: 'ThumbnailField',
  props: {
    /** The cover's address. Sermons and videos store a URL, not a media id. */
    value: { type: String, default: '' },

    /**
     * The video file just chosen, if any. A frame is taken from it when the
     * office has not already chosen a cover of their own.
     */
    suggestFrom: { type: File, default: null },

    /** What this cover belongs to, used to name the uploaded file. */
    label: { type: String, default: '' }
  },
  data () {
    uid += 1
    return {
      inputId: `thumbnailField${uid}`,
      state: 'idle',
      error: '',
      // Set once the office picks or removes a cover themselves. From then on
      // changing the video leaves their choice alone.
      chosenByHand: false
    }
  },
  computed: {
    hint () {
      if (this.chosenByHand) {
        return 'Your own cover. Changing the video will not replace it.'
      }
      if (this.value) {
        return 'Taken from the video. Replace it if this frame is a poor one.'
      }
      return 'Shown beside the title in the app. A wide image works best.'
    }
  },
  watch: {
    suggestFrom (file) {
      if (file) { this.suggest(file) }
    }
  },
  methods: {
    /**
     * Never overrides a cover the office chose, and never reports its own
     * failure as an error: a missing frame is a prompt to upload one, not a
     * problem with the sermon.
     */
    async suggest (file) {
      if (this.chosenByHand || this.value) { return }

      this.state = 'working'
      this.error = ''

      try {
        const blob = await grabPoster(file)
        const url = await uploadImage(this.$axios, blob, this.label)

        // The office may have chosen one while the frame was being taken.
        if (!this.chosenByHand) {
          this.$emit('input', url)
        }
        this.state = 'idle'
      } catch (e) {
        this.state = 'idle'
      }
    },
    async onPick (event) {
      const file = event.target.files && event.target.files[0]
      if (!file) { return }

      this.state = 'working'
      this.error = ''

      try {
        const url = await uploadImage(this.$axios, file, this.label)
        this.chosenByHand = true
        this.$emit('input', url)
      } catch (e) {
        this.error = 'That image did not upload. Try again, or use a smaller file.'
      } finally {
        this.state = 'idle'
        if (this.$refs.file) { this.$refs.file.value = '' }
      }
    },
    clear () {
      // Counts as a choice: an empty cover is a decision the video should not
      // undo on the next upload.
      this.chosenByHand = true
      this.error = ''
      this.$emit('input', '')
    }
  }
}
</script>

<style scoped>
.tf { margin-top: 16px; }

.tf__head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.tf__label {
  font-size: var(--ds-text-sm);
  font-weight: 600;
}

.tf__state { font-size: var(--ds-text-xs); color: var(--ds-text-3); }

.tf__body { display: flex; gap: 16px; align-items: flex-start; }

.tf__preview {
  width: 160px;
  aspect-ratio: 16 / 9;
  flex: none;
  border-radius: var(--ds-radius-sm);
  overflow: hidden;
  background: var(--ds-surface-2);
  border: 1px solid var(--ds-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tf__preview.is-empty { border-style: dashed; }
.tf__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.tf__placeholder { width: 28px; height: 28px; color: var(--ds-text-3); }

.tf__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.tf__pick { position: relative; overflow: hidden; cursor: pointer; }
.tf__input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.tf__hint { flex-basis: 100%; margin: 0; }
.tf__error { flex-basis: 100%; margin: 0; }

@media (max-width: 560px) {
  .tf__body { flex-direction: column; }
  .tf__preview { width: 100%; }
}
</style>
