<template>
  <div class="pr">
    <header class="pr__masthead">
      <a href="/" class="pr__brand">
        <img src="~assets/imgs/caci_logo.png" alt="" class="pr__logo">
        <span class="pr__brandtext">CACI Taifa</span>
      </a>
    </header>

    <main class="pr__main">
      <div v-if="loading" class="pr__card">
        <span class="ds-skeleton" style="height:220px;width:100%;border-radius:8px"></span>
        <span class="ds-skeleton" style="height:22px;width:70%;margin-top:20px"></span>
        <span class="ds-skeleton" style="height:14px;width:40%;margin-top:12px"></span>
      </div>

      <div v-else-if="error" class="pr__card pr__card--message">
        <h1 class="pr__missing">{{ error }}</h1>
        <p class="ds-help">
          It may have been removed, or the link may be incomplete.
        </p>
        <a href="/" class="ds-btn ds-btn--secondary ds-btn--sm pr__back">Go to the church home page</a>
      </div>

      <article v-else class="pr__card">
        <!--
          A platform link needs that platform's player; a file plays as a
          file. The API decides which, so this does not have to know what
          Cloudflare, YouTube and R2 each require.
        -->
        <div v-if="media && media.metadata && media.metadata.isEmbed === 'true'" class="pr__frame">
          <iframe
            :src="media.metadata.embedUrl"
            class="pr__iframe"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            :title="record.title"
          ></iframe>
        </div>

        <video
          v-else-if="playableUrl"
          class="pr__video"
          controls
          playsinline
          preload="metadata"
          :poster="record.thumbnailUrl || null"
          :src="playableUrl"
        ></video>

        <img
          v-else-if="posterUrl"
          :src="posterUrl"
          alt=""
          class="pr__poster"
        >

        <div class="pr__body">
          <p v-if="kicker" class="pr__kicker">{{ kicker }}</p>
          <h1 class="pr__title">{{ record.title }}</h1>

          <dl v-if="facts.length" class="pr__facts">
            <div v-for="fact in facts" :key="fact.label">
              <dt>{{ fact.label }}</dt>
              <dd>{{ fact.value }}</dd>
            </div>
          </dl>

          <p v-if="bodyText" class="pr__text">{{ bodyText }}</p>

          <!--
            Audio is offered separately: a sermon can carry both, and the one
            a member wants on a phone with little data is usually this one.
          -->
          <div v-if="audioUrl" class="pr__audio">
            <p class="pr__label">Listen</p>
            <audio class="pr__audioel" controls preload="none" :src="audioUrl"></audio>
          </div>

          <footer class="pr__foot">
            <p class="ds-help pr__note">
              More sermons, videos and church life are in the CACI Taifa app.
            </p>
          </footer>
        </div>
      </article>
    </main>
  </div>
</template>

<script>
import { payload } from '../network/MobileApp'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

/**
 * One public page for a sermon, a video, a short or an event.
 *
 * These addresses were already being handed out — the API puts a `shareUrl`
 * on every one of these records and the app's copy-link button gives it to
 * members — but nothing served them. The site is a static SPA, so every one
 * of those links resolved to the home page shell with a 200, which looks like
 * a working link right up until somebody follows one.
 *
 * Public on purpose: the point of a shared link is that it opens for a person
 * who has neither the app nor an account.
 */
export default {
  name: 'PublicRecord',
  props: {
    /** sermons | videos | shorts | events — also the API collection. */
    kind: { type: String, required: true }
  },
  data () {
    return {
      loading: true,
      error: '',
      record: {}
    }
  },
  head () {
    const title = this.record.title ? `${this.record.title} | CACI Taifa` : 'CACI Taifa'
    const description = this.bodyText || 'Christ Apostolic Church International — Taifa Central.'
    const image = this.posterUrl

    return {
      title,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:title', property: 'og:title', content: title },
        { hid: 'og:description', property: 'og:description', content: description },
        { hid: 'og:type', property: 'og:type', content: this.kind === 'events' ? 'article' : 'video.other' },
        ...(image ? [{ hid: 'og:image', property: 'og:image', content: image }] : []),
        { hid: 'twitter:card', name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' }
      ]
    }
  },
  computed: {
    media () {
      // A short keeps its payload under `content`, and that payload is a
      // media item only for the kinds that play — a picture short's is a
      // URL and a scripture short's is words. `sourceUrl` is what tells
      // the two apart without this having to know the kinds.
      const content = this.record.content
      if (content && content.sourceUrl) { return content }
      return this.record.video || this.record.media || null
    },
    playableUrl () {
      const source = this.media && this.media.sourceUrl
      return source || ''
    },
    audioUrl () {
      return (this.record.audio && this.record.audio.sourceUrl) || ''
    },
    posterUrl () {
      const content = this.record.content || {}
      return this.record.thumbnailUrl || this.record.imageUrl ||
        content.imageUrl || content.artworkUrl ||
        (this.media && this.media.thumbnailUrl) ||
        (content.slides && content.slides.length ? content.slides[0].imageUrl : '') ||
        ''
    },
    kicker () {
      if (this.kind === 'sermons') { return 'Sermon' }
      if (this.kind === 'videos') { return this.record.category || 'Video' }
      if (this.kind === 'shorts') { return 'From the church' }
      return this.record.category || 'Event'
    },
    bodyText () {
      // A scripture short is the one whose words are the whole point, and
      // they live in the content rather than in a caption.
      const content = this.record.content || {}
      return this.record.summary || this.record.description ||
        this.record.caption || content.text || ''
    },
    /** Only the facts this record actually has, so nothing renders as a dash. */
    facts () {
      const rows = []

      if (this.kind === 'sermons') {
        if (this.record.speaker) { rows.push({ label: 'Preached by', value: this.record.speaker }) }
        if (this.record.preachedOn) { rows.push({ label: 'Preached on', value: this.formatDate(this.record.preachedOn) }) }
        if (this.record.series) { rows.push({ label: 'Series', value: this.record.series }) }
        if (this.record.scripture) { rows.push({ label: 'Scripture', value: this.record.scripture }) }
      } else if (this.kind === 'videos') {
        if (this.record.publishedOn) { rows.push({ label: 'Published', value: this.formatDate(this.record.publishedOn) }) }
      } else if (this.kind === 'shorts') {
        const content = this.record.content || {}
        if (this.record.author && this.record.author.name) {
          rows.push({ label: 'Posted by', value: this.record.author.name })
        }
        if (this.record.publishedAt) { rows.push({ label: 'Posted', value: this.formatDate(this.record.publishedAt) }) }
        if (content.reference) { rows.push({ label: 'Scripture', value: content.reference }) }
        if (content.location) { rows.push({ label: 'Where', value: content.location }) }
        if (content.startsAt) { rows.push({ label: 'Starts', value: this.formatDateTime(content.startsAt, false) }) }
      } else {
        if (this.record.startsAt) { rows.push({ label: 'Starts', value: this.formatDateTime(this.record.startsAt, this.record.isAllDay) }) }
        if (this.record.endsAt) { rows.push({ label: 'Ends', value: this.formatDateTime(this.record.endsAt, this.record.isAllDay) }) }
        if (this.record.location) { rows.push({ label: 'Where', value: this.record.location }) }
      }

      return rows
    }
  },
  beforeMount () {
    this.load()
  },
  methods: {
    formatDate (value) {
      const date = new Date(value)
      if (isNaN(date.getTime())) { return '' }
      return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
    },
    formatDateTime (value, allDay) {
      const date = new Date(value)
      if (isNaN(date.getTime())) { return '' }
      const day = this.formatDate(value)
      if (allDay) { return day }
      const hours = date.getHours()
      const minutes = `${date.getMinutes()}`.padStart(2, '0')
      const suffix = hours >= 12 ? 'pm' : 'am'
      const hour12 = ((hours + 11) % 12) + 1
      return `${day}, ${hour12}:${minutes}${suffix}`
    },
    load () {
      const id = this.$route.params.id

      if (!id) {
        this.loading = false
        this.error = 'This link is missing a reference.'
        return
      }

      this.$axios.get(`${this.kind}/${id}`).then(response => {
        const data = payload(response)
        if (data && data.id) {
          this.record = data
        } else {
          this.error = this.missingMessage()
        }
        this.loading = false
      }).catch(error => {
        const status = error.response && error.response.status
        this.error = status === 404 || status === 400
          ? this.missingMessage()
          : 'This could not be loaded. Please check your connection and try again.'
        this.loading = false
      })
    },
    missingMessage () {
      return {
        sermons: 'That sermon is no longer available.',
        videos: 'That video is no longer available.',
        shorts: 'That post is no longer available.',
        events: 'That event is no longer available.'
      }[this.kind] || 'That is no longer available.'
    }
  }
}
</script>

<style scoped>
.pr {
  min-height: 100vh;
  background: var(--ds-bg);
  font-family: var(--ds-font-sans);
  color: var(--ds-text);
}

.pr__masthead {
  padding: 16px;
  border-bottom: 1px solid var(--ds-border);
  background: var(--ds-surface);
}

.pr__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(760px, 100%);
  margin: 0 auto;
  text-decoration: none;
  color: inherit;
}

.pr__logo { width: 32px; height: 32px; object-fit: contain; }
.pr__brandtext { font-weight: 600; font-size: var(--ds-text-base); }

.pr__main { padding: 24px 16px 64px; }

.pr__card {
  width: min(760px, 100%);
  margin: 0 auto;
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  overflow: hidden;
}

.pr__card--message { padding: 40px 24px; text-align: center; }
.pr__missing { font-size: var(--ds-text-lg); margin: 0 0 8px; }
.pr__back { margin-top: 16px; display: inline-flex; }

.pr__frame { position: relative; width: 100%; aspect-ratio: 16 / 9; background: #000; }
.pr__iframe { position: absolute; inset: 0; width: 100%; height: 100%; }

.pr__video {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  background: #000;
}

/*
  Shown whole, not cropped to 16:9. What arrives here as a picture is most
  often a flyer, and a flyer prints its dates and its venue along the
  bottom edge — exactly what a cover fit to a landscape box throws away.
  Capped by the viewport so a tall poster still leaves the title and the
  facts under it visible without scrolling.
*/
.pr__poster {
  display: block;
  width: 100%;
  max-height: 72vh;
  object-fit: contain;
  background: #000;
}

.pr__body { padding: 24px; }

.pr__kicker {
  margin: 0 0 6px;
  font-size: var(--ds-text-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ds-text-3);
}

.pr__title { margin: 0; font-size: var(--ds-text-xl); font-weight: 600; letter-spacing: -0.01em; }

.pr__facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin: 20px 0 0;
}

.pr__facts dt {
  font-size: var(--ds-text-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ds-text-3);
  margin-bottom: 4px;
}

.pr__facts dd { margin: 0; font-size: var(--ds-text-base); overflow-wrap: anywhere; }

.pr__text { margin: 20px 0 0; font-size: var(--ds-text-base); line-height: 1.6; white-space: pre-line; }

.pr__audio { margin-top: 24px; }
.pr__label {
  margin: 0 0 6px;
  font-size: var(--ds-text-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ds-text-3);
}
.pr__audioel { width: 100%; }

.pr__foot { margin-top: 28px; padding-top: 16px; border-top: 1px solid var(--ds-border); }
.pr__note { margin: 0; }

@media (max-width: 560px) {
  .pr__body { padding: 20px 16px; }
}
</style>
