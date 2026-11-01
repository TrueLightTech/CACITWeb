<template>
  <section class="ds-card wp">
    <div class="ds-card__head">
      <div>
        <h2 class="ds-h3">Pictures</h2>
        <p class="ds-help" style="margin:4px 0 0">
          A verse with no picture of its own gets one of these. The AI matches pictures to verses by their description;
          ones without a description are given out in turn, by date. Calm landscapes, no people or text, work best.
        </p>
      </div>
    </div>

    <div class="ds-card__body wp__add">
      <div class="ds-field">
        <label class="ds-label" for="wpLinks">Paste links</label>
        <textarea
          id="wpLinks"
          v-model="links"
          class="ds-textarea"
          rows="3"
          placeholder="https://images.unsplash.com/photo-…  (one per line)"
        ></textarea>
        <span class="ds-help">The picture's own address — on Unsplash, right-click the photo and Copy image address. Each is downloaded and kept as our own copy.</span>
      </div>

      <div class="ds-field">
        <label class="ds-label" for="wpDescription">What they show</label>
        <input id="wpDescription" v-model="description" class="ds-input" type="text" placeholder="Sunrise over green hills">
        <span class="ds-help">Optional. Used for every picture you add now; edit each one below.</span>
      </div>

      <div class="wp__addactions">
        <label class="ds-btn ds-btn--secondary" for="wpFiles" :class="{ 'is-disabled': isAdding }">
          Upload pictures
          <input id="wpFiles" ref="files" class="wp__file" type="file" accept="image/*" multiple :disabled="isAdding" @change="upload">
        </label>
        <button class="ds-btn ds-btn--primary" type="button" :disabled="isAdding || !linkList.length" @click="addLinks">
          <span v-if="isAdding" class="ds-btn__spinner"></span>
          {{ isAdding ? 'Adding' : `Add ${linkList.length || ''} link${linkList.length === 1 ? '' : 's'}` }}
        </button>
      </div>

      <ul v-if="failures.length" class="wp__failures">
        <li v-for="failure in failures" :key="failure.link"><span class="wp__link">{{ failure.link }}</span> — {{ failure.reason }}</li>
      </ul>
    </div>

    <div v-if="isLoading" class="ds-card__body wp__grid">
      <span v-for="n in 6" :key="n" class="ds-skeleton" style="aspect-ratio:3/2"></span>
    </div>

    <ul v-else-if="pictures.length" class="wp__grid">
      <li v-for="picture in pictures" :key="picture.id" class="wp__item">
        <img :src="picture.imageUrl" alt="" class="wp__img" loading="lazy">
        <input
          v-model="picture.description"
          class="ds-input ds-input--sm"
          type="text"
          placeholder="Describe it for the AI"
          :aria-label="`Description for picture ${picture.id}`"
          @change="describe(picture)"
        >
        <button class="ds-btn ds-btn--danger-quiet ds-btn--sm" type="button" @click="remove(picture)">Remove</button>
      </li>
    </ul>

    <div v-else class="ds-empty">
      <h3 class="ds-h3">No pictures yet</h3>
      <p>Until you add some, verses show the app's coloured background. 20 to 30 is a good start.</p>
    </div>
  </section>
</template>

<script>
import { errorMessage } from '../network/MobileApp'
import { uploadImage } from '../network/Poster'

/**
 * The pool the Word for Today picks a picture from when a verse has none of
 * its own. Removing a picture only takes it out of the pool: verses that
 * already went out with it keep it.
 */
export default {
  name: 'WordPicturePool',
  data () {
    return {
      pictures: [],
      isLoading: false,
      isAdding: false,
      links: '',
      description: '',
      failures: []
    }
  },
  computed: {
    linkList () {
      return this.links.split(/\s+/).map(link => link.trim()).filter(Boolean)
    }
  },
  beforeMount () {
    this.load()
  },
  methods: {
    load () {
      this.isLoading = true
      this.$axios.get('admin/word-pictures').then(response => {
        this.pictures = (response.data && response.data.data) || []
        this.isLoading = false
      }).catch(error => {
        this.isLoading = false
        this.$toast.error(errorMessage(error, 'Could not load the pictures.'))
      })
    },
    /** Shared by both ways in: the API answers with what it added and what it could not. */
    add (body) {
      this.isAdding = true
      return this.$axios.post('admin/word-pictures', { ...body, description: this.description || null })
        .then(response => this.report(response.data && response.data.data))
        .catch(error => {
          const data = error.response && error.response.data && error.response.data.data
          if (data && data.failed) {
            this.report(data)
          } else {
            this.$toast.error(errorMessage(error, 'Could not add those pictures.'))
          }
        })
        .finally(() => { this.isAdding = false })
    },
    report (data) {
      const added = (data && data.added) || []
      const failed = (data && data.failed) || {}
      this.failures = Object.keys(failed).map(link => ({ link, reason: failed[link] }))
      if (added.length) {
        this.$toast.success(`Added ${added.length} picture${added.length === 1 ? '' : 's'}`)
        this.load()
      }
      // Keep only the links that need another look.
      this.links = this.failures.map(failure => failure.link).join('\n')
      if (!this.failures.length) { this.description = '' }
    },
    addLinks () {
      this.add({ urls: this.linkList })
    },
    async upload (event) {
      const files = Array.from((event.target && event.target.files) || [])
      if (!files.length) { return }
      this.isAdding = true
      let added = 0
      for (const file of files) {
        try {
          const imageUrl = await uploadImage(this.$axios, file, 'Word for Today picture')
          await this.$axios.post('admin/word-pictures', { imageUrl, description: this.description || null })
          added += 1
        } catch (e) {
          this.$toast.error(`${file.name} did not upload.`)
        }
      }
      this.isAdding = false
      if (this.$refs.files) { this.$refs.files.value = '' }
      if (added) {
        this.$toast.success(`Added ${added} picture${added === 1 ? '' : 's'}`)
        this.description = ''
        this.load()
      }
    },
    describe (picture) {
      this.$axios.patch(`admin/word-pictures/${picture.id}`, { description: picture.description || null })
        .catch(error => this.$toast.error(errorMessage(error, 'Could not save that description.')))
    },
    remove (picture) {
      this.$axios.delete(`admin/word-pictures/${picture.id}`).then(() => {
        this.pictures = this.pictures.filter(p => p.id !== picture.id)
        this.$toast.success('Picture removed. Verses that used it keep it.')
      }).catch(error => this.$toast.error(errorMessage(error, 'Could not remove that picture.')))
    }
  }
}
</script>

<style scoped>
.wp { margin-top: 20px; }
.wp__add { border-bottom: 1px solid var(--ds-border); }
.wp__addactions { display: flex; gap: 8px; flex-wrap: wrap; }
.wp__file { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.wp__failures { margin: 12px 0 0; padding-left: 18px; color: var(--ds-danger, #b42318); font-size: var(--ds-text-sm); }
.wp__link { word-break: break-all; }
.wp__grid {
  list-style: none;
  margin: 0;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}
.wp__item { display: grid; gap: 6px; align-content: start; }
.wp__img { width: 100%; aspect-ratio: 3 / 2; object-fit: cover; border-radius: 8px; background: var(--ds-surface-2); }
</style>
