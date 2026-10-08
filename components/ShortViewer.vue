<template>
  <div class="sv">
    <header class="sv__header">
      <NuxtLink to="/" class="sv__brand" aria-label="CACI Taifa home">
        <img src="~assets/imgs/caci_mark.png" width="30" height="30" alt="">
        <span>CACI Taifa</span>
      </NuxtLink>
      <span class="sv__heading">Shorts</span>
      <a class="sv__app" :href="appUrl"><NavIcon name="update" /><span>{{ isAndroid ? 'Open app' : 'Get the app' }}</span></a>
    </header>

    <main v-if="loading || error" id="main" class="sv__state" aria-live="polite">
      <span v-if="loading" class="sv__spinner" aria-label="Loading short" role="status"></span>
      <template v-else>
        <h1>{{ error }}</h1>
        <button v-if="retryable" type="button" class="sv__retry" @click="load">Try again</button>
        <NuxtLink v-else to="/">Go to church home</NuxtLink>
      </template>
    </main>

    <template v-else>
      <main ref="feed" id="main" class="sv__feed" tabindex="0" aria-label="Shorts feed" @scroll.passive="onScroll" @keydown="onKeydown">
        <article v-for="(item, index) in records" :key="item.id" class="sv__item" :aria-label="item.title" :aria-hidden="index !== activeIndex ? 'true' : null" :inert="index !== activeIndex ? '' : null">
          <div class="sv__frame">
            <div class="sv__stage" data-short-stage @touchstart.passive="touchStart" @touchend.passive="touchEnd(item, $event)">
              <ShortMedia
                v-if="index === activeIndex && (item.kind === 'video' || item.kind === 'audio') && item.content && item.content.sourceUrl"
                ref="media"
                :key="item.id"
                :media="item.content"
                :title="item.title"
                :poster="posterFor(item)"
                :audio="item.kind === 'audio'"
                :muted="muted"
                @mute="muted = $event"
              />
              <template v-else-if="item.kind === 'scripture' || item.kind === 'text'">
                <img v-if="contentOf(item).backgroundImageUrl" :src="contentOf(item).backgroundImageUrl" class="sv__word-image" alt="">
                <div class="sv__words" :class="{ 'sv__words--serif': item.kind === 'scripture' || contentOf(item).font === 'serif', 'sv__words--photo': contentOf(item).backgroundImageUrl }" :style="wordStyle(item)">
                  <div class="sv__verse">
                    <p>{{ contentOf(item).text }}</p>
                    <span v-if="contentOf(item).reference">{{ contentOf(item).reference }}</span>
                  </div>
                </div>
              </template>
              <template v-else-if="item.kind === 'slides' && slidesOf(item).length">
                <img :src="currentSlide(item).imageUrl" :alt="currentSlide(item).altText || item.title" class="sv__picture">
                <span class="sv__slide-count">{{ slideIndex(item) + 1 }} / {{ slidesOf(item).length }}</span>
                <button v-if="slideIndex(item) > 0" type="button" class="sv__slide-arrow sv__slide-arrow--prev" aria-label="Previous picture" title="Previous picture" @click="moveSlide(item, -1)"><NavIcon name="left" /></button>
                <button v-if="slideIndex(item) < slidesOf(item).length - 1" type="button" class="sv__slide-arrow sv__slide-arrow--next" aria-label="Next picture" title="Next picture" @click="moveSlide(item, 1)"><NavIcon name="right" /></button>
                <div v-if="slidesOf(item).length > 1" class="sv__dots" aria-label="Pictures">
                  <button v-for="(slide, slideNumber) in slidesOf(item)" :key="slideNumber" type="button" :aria-label="`Picture ${slideNumber + 1}`" :aria-current="slideNumber === slideIndex(item) ? 'true' : null" @click="$set(slideIndexes, item.id, slideNumber)"><span></span></button>
                </div>
              </template>
              <template v-else-if="item.kind === 'event'">
                <img v-if="eventOf(item).imageUrl" :src="eventOf(item).imageUrl" :alt="eventOf(item).title || item.title" class="sv__picture">
                <div v-else class="sv__event">
                  <NavIcon name="calendar" />
                  <p>{{ eventOf(item).title || item.title }}</p>
                  <span v-if="eventOf(item).location">{{ eventOf(item).location }}</span>
                </div>
              </template>
              <img v-else-if="posterFor(item)" :src="posterFor(item)" :alt="contentOf(item).altText || item.title" class="sv__picture">
              <p v-else class="sv__unavailable">This post has no playable media.</p>

              <div class="sv__caption" :class="{ 'sv__caption--expanded': expandedId === item.id }">
                <div class="sv__author">
                  <img v-if="item.author && item.author.avatarUrl" :src="item.author.avatarUrl" alt="" width="34" height="34">
                  <img v-else src="~assets/imgs/caci_mark.png" alt="" width="34" height="34">
                  <div><strong>{{ authorOf(item) }}</strong><span v-if="item.publishedAt">{{ postedDate(item.publishedAt) }}</span></div>
                </div>
                <div class="sv__copy">
                  <component :is="index === activeIndex ? 'h1' : 'h2'" class="sv__title">{{ item.title }}</component>
                  <p v-if="item.caption && item.caption !== item.title" class="sv__description">{{ item.caption }}</p>
                  <p v-if="item.kind === 'slides' && currentSlide(item).caption" class="sv__description">{{ currentSlide(item).caption }}</p>
                </div>
                <button v-if="hasLongCaption(item)" type="button" class="sv__more" :aria-expanded="expandedId === item.id" @click="expandedId = expandedId === item.id ? '' : item.id">{{ expandedId === item.id ? 'Less' : 'More' }}</button>
                <NuxtLink v-if="actionFor(item)" class="sv__record-link" :to="actionFor(item)">{{ (item.action && item.action.label) || 'View event' }}<NavIcon name="right" /></NuxtLink>
              </div>
            </div>

            <div class="sv__actions">
              <button type="button" class="sv__action" :class="{ 'sv__action--liked': item.isLiked }" :aria-pressed="!!item.isLiked" :aria-label="item.isLiked ? 'Unlike short' : 'Like short'" :title="item.isLiked ? 'Unlike' : 'Like'" :disabled="likingId === item.id" @click="like(item)">
                <span class="sv__action-icon"><NavIcon name="welfare" /></span><span>{{ count(item.likes) }}</span>
              </button>
              <button type="button" class="sv__action" aria-label="Share short" title="Share short" @click="share(item)"><span class="sv__action-icon"><NavIcon name="share" /></span><span>Share</span></button>
              <span v-if="item.views" class="sv__views">{{ count(item.views) }}<span>views</span></span>
            </div>
          </div>
        </article>
      </main>

      <nav class="sv__navigation" aria-label="Browse shorts">
        <button type="button" :disabled="activeIndex === 0" aria-label="Previous short" title="Previous short" @click="step(-1)"><NavIcon name="up" /></button>
        <button type="button" :disabled="!canNext || loadingFeed" aria-label="Next short" title="Next short" @click="step(1)"><NavIcon name="down" /></button>
        <button v-if="feedError" type="button" class="sv__feed-retry" @click="loadFeed">Retry</button>
      </nav>
      <div v-if="notice" class="sv__notice" role="status">{{ notice }}<NuxtLink v-if="needsSignIn" to="/login">Sign in</NuxtLink><button type="button" aria-label="Dismiss message" @click="notice = ''">&times;</button></div>
    </template>
  </div>
</template>

<script>
import NavIcon from './NavIcon'
import ShortMedia from './ShortMedia'
import { payload } from '../network/MobileApp'
import { PLAY_STORE_URL, isStoreLive } from '../resources/appLinks'

const BACKGROUNDS = { navy: '#12306e', sunrise: '#b42e4a', palm: '#12664f', dusk: '#5b3a9b', clay: '#9c4221', harmattan: '#6a4a1c', deep: '#1f2937', rose: '#b03060' }

export default {
  name: 'ShortViewer',
  components: { NavIcon, ShortMedia },
  data () {
    return {
      loading: true, error: '', retryable: false, records: [], activeIndex: 0,
      muted: true, isAndroid: false, slideIndexes: {}, eventDetails: {}, expandedId: '',
      cursor: null, hasMore: true, loadingFeed: false, feedError: false,
      likingId: '', notice: '', needsSignIn: false
    }
  },
  head () {
    const title = this.current.title ? `${this.current.title} | CACI Taifa` : 'Shorts | CACI Taifa'
    const description = this.current.caption || this.current.title || 'Shorts from the CACI Taifa community.'
    const image = this.posterFor(this.current)
    const url = `https://cacitaifa.com/shorts/${this.current.id || this.$route.params.id}`
    return {
      title,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'theme-color', name: 'theme-color', content: '#111213' },
        { hid: 'og:title', property: 'og:title', content: title },
        { hid: 'og:description', property: 'og:description', content: description },
        { hid: 'og:type', property: 'og:type', content: 'video.other' },
        { hid: 'og:url', property: 'og:url', content: url },
        ...(image ? [{ hid: 'og:image', property: 'og:image', content: image }] : []),
        { hid: 'twitter:card', name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' }
      ],
      link: [{ hid: 'canonical', rel: 'canonical', href: url }]
    }
  },
  computed: {
    current () { return this.records[this.activeIndex] || {} },
    canNext () { return this.activeIndex < this.records.length - 1 || this.hasMore },
    appUrl () {
      const here = `https://cacitaifa.com/shorts/${this.current.id || this.$route.params.id}`
      if (!this.isAndroid) { return '/#app-download' }
      const fallback = isStoreLive('android') ? PLAY_STORE_URL : here
      return `intent://cacitaifa.com/shorts/${this.current.id || this.$route.params.id}#Intent;scheme=https;package=com.cacitaifa.caci_taifa;S.browser_fallback_url=${encodeURIComponent(fallback)};end`
    }
  },
  watch: {
    '$route.params.id' (id) {
      const index = this.records.findIndex(item => item.id === id)
      if (index === -1) { this.load() }
      else if (index !== this.activeIndex) { this.scrollTo(index) }
    }
  },
  mounted () {
    this.isAndroid = /Android/i.test(navigator.userAgent || '')
    window.addEventListener('resize', this.onResize)
    this.load()
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.onResize)
    cancelAnimationFrame(this.scrollFrame)
    clearTimeout(this.noticeTimer)
    this.loadVersion = (this.loadVersion || 0) + 1
  },
  methods: {
    contentOf (item) { return item.content || {} },
    authorOf (item) { return (item.author && item.author.name) || 'CACI Taifa' },
    slidesOf (item) { return this.contentOf(item).slides || [] },
    slideIndex (item) { return this.slideIndexes[item.id] || 0 },
    currentSlide (item) { return this.slidesOf(item)[this.slideIndex(item)] || {} },
    eventOf (item) { return this.eventDetails[item.id] || {} },
    posterFor (item) {
      const content = this.contentOf(item)
      return content.artworkUrl || content.imageUrl || content.thumbnailUrl || item.thumbnailUrl ||
        (content.slides && content.slides[0] && content.slides[0].imageUrl) || ''
    },
    postedDate (value) {
      const date = new Date(value)
      return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    },
    count (value) { return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value) || 0) },
    hasLongCaption (item) { return (item.title || '').length > 90 || (item.caption || '').length > 160 || (this.currentSlide(item).caption || '').length > 160 },
    wordStyle (item) {
      const content = this.contentOf(item)
      const size = (content.text || '').length > 220 ? '22px' : (content.text || '').length > 80 ? '30px' : '42px'
      return { backgroundColor: content.backgroundImageUrl ? 'transparent' : BACKGROUNDS[content.background] || BACKGROUNDS.navy, fontSize: size }
    },
    actionFor (item) {
      const route = item.action && item.action.route
      const match = route && route.match(/^\/(sermon|video|event)s?\/([^/?#]+)$/)
      if (match) { return `/${match[1]}s/${match[2]}` }
      return item.kind === 'event' && this.contentOf(item).eventId ? `/events/${this.contentOf(item).eventId}` : ''
    },
    async load () {
      const version = (this.loadVersion || 0) + 1
      this.loadVersion = version
      this.loading = true
      this.error = ''
      this.retryable = false
      this.records = []
      this.activeIndex = 0
      this.cursor = null
      this.hasMore = true
      this.loadingFeed = false
      this.feedError = false
      const id = this.$route.params.id
      if (!id) { this.error = 'This link is incomplete.'; this.loading = false; return }
      try {
        const response = await this.$axios.get(`shorts/${encodeURIComponent(id)}`)
        if (version !== this.loadVersion) { return }
        const record = payload(response)
        if (!record || !record.id) { this.error = 'This short is no longer available.' }
        else { this.records = [record]; this.loadEvent(record) }
      } catch (error) {
        if (version !== this.loadVersion) { return }
        const status = error.response && error.response.status
        this.retryable = status !== 404 && status !== 400
        this.error = this.retryable ? 'This short could not be loaded.' : 'This short is no longer available.'
      }
      this.loading = false
      if (!this.error) { this.loadFeed() }
    },
    async loadFeed () {
      if (this.loadingFeed || !this.hasMore) { return }
      const version = this.loadVersion
      this.loadingFeed = true
      this.feedError = false
      try {
        const response = await this.$axios.get('shorts', { params: { Limit: 5, ...(this.cursor ? { Cursor: this.cursor } : {}) } })
        if (version !== this.loadVersion) { return }
        const data = payload(response) || {}
        const known = new Set(this.records.map(item => item.id))
        const items = (data.items || []).filter(item => {
          if (!item.id || known.has(item.id)) { return false }
          known.add(item.id)
          return true
        })
        this.records.push(...items)
        this.hasMore = !!data.nextCursor && data.nextCursor !== this.cursor
        this.cursor = data.nextCursor || null
      } catch (error) { if (version === this.loadVersion) { this.feedError = true } }
      finally { if (version === this.loadVersion) { this.loadingFeed = false } }
    },
    async loadEvent (item) {
      const eventId = this.contentOf(item).eventId
      if (item.kind !== 'event' || !eventId || this.eventDetails[item.id]) { return }
      this.$set(this.eventDetails, item.id, {})
      try {
        const response = await this.$axios.get(`events/${encodeURIComponent(eventId)}`)
        if (!this._isDestroyed) { this.$set(this.eventDetails, item.id, payload(response) || {}) }
      } catch (error) { /* The event link remains available if its preview cannot load. */ }
    },
    onScroll () {
      cancelAnimationFrame(this.scrollFrame)
      this.scrollFrame = requestAnimationFrame(() => {
        const feed = this.$refs.feed
        if (!feed || !feed.clientHeight) { return }
        const index = Math.max(0, Math.min(this.records.length - 1, Math.round(feed.scrollTop / feed.clientHeight)))
        if (index !== this.activeIndex) {
          this.activeIndex = index
          this.expandedId = ''
          this.notice = ''
          this.loadEvent(this.current)
          const path = `/shorts/${this.current.id}`
          if (this.$route.path !== path) { this.$router.replace(path).catch(() => {}) }
        }
        if (index >= this.records.length - 2 && !this.feedError) { this.loadFeed() }
      })
    },
    scrollTo (index, smooth = true) {
      const feed = this.$refs.feed
      if (!feed) { return }
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      feed.scrollTo({ top: index * feed.clientHeight, behavior: smooth && !reduced ? 'smooth' : 'auto' })
    },
    async step (direction) {
      if (direction > 0 && this.activeIndex === this.records.length - 1) { await this.loadFeed() }
      const index = this.activeIndex + direction
      if (index >= 0 && index < this.records.length) { this.scrollTo(index) }
    },
    onResize () { this.scrollTo(this.activeIndex, false) },
    onKeydown (event) {
      if (event.target !== this.$refs.feed) { return }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); this.step(event.key === 'ArrowDown' ? 1 : -1) }
      if (event.key === ' ' && this.$refs.media && this.$refs.media[0]) { event.preventDefault(); this.$refs.media[0].togglePlay() }
    },
    touchStart (event) {
      const touch = event.changedTouches[0]
      this.touch = { x: touch.clientX, y: touch.clientY }
    },
    touchEnd (item, event) {
      if (!this.touch || item.kind !== 'slides') { return }
      const touch = event.changedTouches[0]
      const x = touch.clientX - this.touch.x
      const y = touch.clientY - this.touch.y
      if (Math.abs(x) > 50 && Math.abs(x) > Math.abs(y) * 1.5) { this.moveSlide(item, x < 0 ? 1 : -1) }
    },
    moveSlide (item, direction) {
      const index = this.slideIndex(item) + direction
      if (index >= 0 && index < this.slidesOf(item).length) { this.$set(this.slideIndexes, item.id, index) }
    },
    notify (message, needsSignIn = false) {
      clearTimeout(this.noticeTimer)
      this.notice = message
      this.needsSignIn = needsSignIn
      this.noticeTimer = setTimeout(() => { this.notice = '' }, 6000)
    },
    async like (item) {
      if (!this.$auth || !this.$auth.loggedIn) { this.notify('Sign in to like this short.', true); return }
      if (this.likingId) { return }
      this.likingId = item.id
      const liked = !item.isLiked
      try {
        await this.$axios.post(`shorts/${encodeURIComponent(item.id)}/like`, { liked })
        item.isLiked = liked
        item.likes = Math.max(0, (Number(item.likes) || 0) + (liked ? 1 : -1))
      } catch (error) { this.notify('Your like could not be saved. Please try again.') }
      finally { this.likingId = '' }
    },
    async share (item) {
      const url = `https://cacitaifa.com/shorts/${item.id}`
      try {
        if (navigator.share) { await navigator.share({ title: item.title, url }); return }
        if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(url) }
        else {
          const input = document.createElement('textarea')
          input.value = url
          input.style.position = 'fixed'
          input.style.opacity = '0'
          document.body.appendChild(input)
          input.select()
          const copied = document.execCommand('copy')
          input.remove()
          if (!copied) { throw new Error('Copy failed') }
        }
        this.notify('Link copied.')
      } catch (error) { if (error.name !== 'AbortError') { this.notify('The link could not be shared. Please try again.') } }
    }
  }
}
</script>

<style scoped>
.sv { --sv-height: min(780px, calc(100dvh - 104px)); position: relative; display: flex; flex-direction: column; height: 100vh; height: 100dvh; min-height: 0; overflow: hidden; background: #111213; color: #fff; font-family: var(--pub-sans); letter-spacing: 0; }
.sv__header { flex: 0 0 64px; display: flex; align-items: center; gap: 24px; padding: 0 32px; border-bottom: 1px solid #2b2c2e; }
.sv a { color: #fff; text-decoration: none; }
.sv__brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; font-size: 14px; font-weight: 500; }
.sv__brand img { flex-shrink: 0; }
.sv__heading { padding-left: 24px; border-left: 1px solid #444; font-size: 18px; font-weight: 500; }
.sv__app { display: inline-flex; justify-content: center; align-items: center; gap: 8px; min-height: 38px; margin-left: auto; padding: 0 14px; border: 1px solid #484a4d; border-radius: 6px; font-size: 13px; font-weight: 500; transition: background 200ms; white-space: nowrap; }
.sv__app:hover { background: #292b2e; }
.sv__app svg { width: 17px; height: 17px; }
.sv__feed { flex: 1; min-height: 0; overflow-x: hidden; overflow-y: auto; scroll-snap-type: y mandatory; overscroll-behavior-y: contain; scrollbar-width: none; }
.sv__feed::-webkit-scrollbar { display: none; }
.sv__item { display: flex; align-items: center; justify-content: center; height: 100%; min-height: 100%; padding: 20px 104px; scroll-snap-align: start; scroll-snap-stop: always; }
.sv__frame { position: relative; height: var(--sv-height); width: calc(var(--sv-height) * 0.5625); flex-shrink: 0; }
.sv__stage { position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: 8px; background: #000; }
.sv__picture { position: absolute; width: 100%; height: 100%; inset: 0; object-fit: contain; }
.sv__word-image { position: absolute; width: 100%; height: 100%; inset: 0; object-fit: cover; }
.sv__words { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 64px 28px 196px; font-weight: 600; line-height: 1.25; text-align: center; }
.sv__words--serif { font-family: var(--pub-serif); font-style: italic; }
.sv__words--photo { background: rgba(0,0,0,0.5) !important; }
.sv__verse { max-height: 100%; overflow-y: auto; overscroll-behavior: contain; overflow-wrap: anywhere; white-space: pre-line; }
.sv__verse span { display: block; margin-top: 24px; font: 500 15px/1.4 var(--pub-sans); }
.sv__event { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 20px; padding: 48px 28px 180px; background: #1b3d8f; text-align: center; font-size: 28px; }
.sv__event svg { width: 40px; height: 40px; }
.sv__event span { font-size: 15px; }
.sv__unavailable { position: absolute; inset: 0; display: grid; place-content: center; padding: 28px; text-align: center; color: #ddd; font-size: 14px; }
.sv__caption { position: absolute; bottom: 0; left: 0; width: 100%; z-index: 2; padding: 72px 20px 28px; background: linear-gradient(transparent, rgba(0,0,0,0.85)); pointer-events: none; }
.sv__author { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.sv__author img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; background: #fff; }
.sv__author div { min-width: 0; }
.sv__author strong { display: block; font-size: 14px; font-weight: 600; line-height: 1.35; overflow-wrap: anywhere; }
.sv__author span { display: block; margin-top: 2px; color: #ddd; font-size: 11px; line-height: 1.4; }
.sv__copy { max-height: 136px; overflow: hidden; }
.sv__title { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; font: 500 17px/1.4 var(--pub-sans); letter-spacing: 0; overflow-wrap: anywhere; }
.sv__description { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; margin-top: 6px !important; font-size: 14px; line-height: 1.5; white-space: pre-line; overflow-wrap: anywhere; }
.sv__caption--expanded .sv__copy { max-height: 30vh; overflow-y: auto; pointer-events: auto; overscroll-behavior: contain; }
.sv__caption--expanded .sv__title, .sv__caption--expanded .sv__description { display: block; }
.sv__more { pointer-events: auto; min-height: 36px; padding: 4px 0; border: 0; background: none; color: #ddd; font-size: 13px; }
.sv .sv__record-link { pointer-events: auto; display: inline-flex; align-items: center; gap: 6px; min-height: 40px; margin-top: 12px; padding: 4px 12px; border: 1px solid #777; border-radius: 6px; background: rgba(0,0,0,0.5); font-size: 13px; }
.sv__record-link svg { width: 18px; height: 18px; }
.sv__actions { position: absolute; left: calc(100% + 20px); bottom: 12px; display: flex; flex-direction: column; align-items: center; gap: 20px; width: 56px; }
.sv__action { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 56px; padding: 0; border: 0; background: none; color: #fff; font-size: 12px; font-weight: 500; font-variant-numeric: tabular-nums; transition: transform 200ms; }
.sv__action-icon { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 50%; background: #292b2d; transition: background 200ms; }
.sv__action:hover .sv__action-icon { background: #3e4043; }
.sv__action:active { transform: scale(0.94); }
.sv__action svg { width: 24px; height: 24px; }
.sv__action--liked svg { fill: #e84b64; stroke: #e84b64; }
.sv__views { display: flex; flex-direction: column; align-items: center; gap: 1px; font-size: 12px; color: #b9bbbf; font-variant-numeric: tabular-nums; }
.sv__views span { font-size: 11px; }
.sv__navigation { position: absolute; right: 28px; top: 50%; display: flex; flex-direction: column; gap: 14px; transform: translateY(-50%); }
.sv__navigation button { display: grid; place-items: center; width: 48px; height: 48px; border: 1px solid #414347; border-radius: 50%; background: #222426; color: #fff; transition: background 200ms; }
.sv__navigation button:hover:not(:disabled) { background: #35373b; }
.sv__navigation button:disabled { opacity: 0.3; cursor: default; }
.sv__navigation svg { width: 24px; height: 24px; }
.sv__navigation .sv__feed-retry { border-radius: 6px; font-size: 12px; }
.sv__notice { position: absolute; z-index: 10; bottom: 24px; left: 50%; display: flex; align-items: center; gap: 14px; width: max-content; max-width: calc(100% - 32px); padding: 12px 16px; border: 1px solid #555; border-radius: 6px; background: #fff; color: #18191b; font-size: 13px; transform: translateX(-50%); }
.sv__notice a { color: #1b3d8f; text-decoration: underline; white-space: nowrap; }
.sv__notice button { flex-shrink: 0; width: 32px; height: 32px; padding: 0; border: 0; background: none; color: #333; font-size: 24px; }
.sv__state { display: flex; flex: 1; align-items: center; justify-content: center; flex-direction: column; gap: 20px; padding: 28px; text-align: center; }
.sv__state h1 { font-size: 20px; font-weight: 500; line-height: 1.5; }
.sv__state a { font-size: 14px; text-decoration: underline; }
.sv__retry { min-height: 44px; padding: 8px 20px; border: 1px solid #555; border-radius: 6px; color: #fff; background: #292b2d; }
.sv__spinner { width: 32px; height: 32px; border: 2px solid #444; border-top-color: #fff; border-radius: 50%; animation: sv-spin 800ms linear infinite; }
.sv :focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
.sv__feed:focus-visible { outline: none; }
.sv__stage:fullscreen { border-radius: 0; }
@keyframes sv-spin { to { transform: rotate(360deg); } }
@media (max-width: 640px) {
  .sv__header { flex-basis: 56px; gap: 14px; padding: 0 16px; }
  .sv__brand { gap: 8px; font-size: 12px; }
  .sv__brand img { width: 26px; height: 26px; }
  .sv__heading { padding-left: 14px; font-size: 16px; }
  .sv__app { padding: 0 10px; font-size: 12px; min-height: 36px; }
  .sv__app svg { display: none; }
  .sv__item { padding: 0; }
  .sv__frame { width: 100%; height: 100%; }
  .sv__stage { border-radius: 0; }
  .sv__caption { padding-left: 16px; padding-right: 76px; padding-bottom: max(32px, calc(env(safe-area-inset-bottom) + 20px)); }
  .sv__title { font-size: 16px; }
  .sv__description { font-size: 13px; }
  .sv__actions { left: auto; right: 10px; bottom: max(36px, calc(env(safe-area-inset-bottom) + 24px)); z-index: 3; gap: 20px; }
  .sv__action-icon { background: rgba(0,0,0,0.6); }
  .sv__views { color: #eee; text-shadow: 0 1px 4px #000; }
  .sv__navigation { right: 12px; top: 132px; gap: 8px; transform: none; }
  .sv__navigation button { width: 36px; height: 36px; background: rgba(0,0,0,0.6); border-color: rgba(255,255,255,0.3); }
  .sv__navigation svg { width: 20px; height: 20px; }
  .sv__words { padding-left: 24px; padding-right: 24px; }
  .sv__notice { bottom: max(24px, calc(env(safe-area-inset-bottom) + 16px)); }
}
@media (max-height: 520px) and (min-width: 641px) {
  .sv__header { flex-basis: 48px; }
  .sv { --sv-height: calc(100dvh - 72px); }
  .sv__item { padding-top: 12px; padding-bottom: 12px; }
  .sv__caption { padding: 32px 12px 20px; }
  .sv__author { margin-bottom: 6px; }
  .sv__author img { width: 24px; height: 24px; }
  .sv__author strong { font-size: 12px; }
  .sv__author span { display: none; }
  .sv__title { font-size: 13px; }
  .sv__description { font-size: 12px; }
  .sv__words { padding: 32px 12px 128px; font-size: 24px !important; }
}
@media (prefers-reduced-motion: reduce) { .sv__spinner { animation: none; } .sv button { transition: none; } }
.sv__slide-count { position: absolute; top: 16px; right: 16px; padding: 4px 10px; border-radius: 4px; background: rgba(0,0,0,0.65); color: #fff; font-size: 12px; }
.sv__slide-arrow { position: absolute; top: calc(50% - 22px); display: grid; place-items: center; width: 44px; height: 44px; border: 0; border-radius: 50%; color: #fff; background: rgba(0,0,0,0.65); }
.sv__slide-arrow svg { width: 22px; height: 22px; }
.sv__slide-arrow--prev { left: 12px; }
.sv__slide-arrow--next { right: 12px; }
.sv__dots { position: absolute; top: 12px; left: 12px; display: flex; }
.sv__dots button { display: grid; place-items: center; width: 24px; height: 32px; padding: 0; border: 0; background: none; }
.sv__dots span { width: 6px; height: 6px; border-radius: 50%; background: #aaa; }
.sv__dots button[aria-current] span { background: #fff; }
</style>
