<template>
  <div class="sm">
    <iframe
      v-if="embedUrl"
      :src="embedUrl"
      :title="title"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowfullscreen
      class="sm__media"
    ></iframe>
    <template v-else>
      <img v-if="audio && poster" :src="poster" alt="" class="sm__media sm__artwork">
      <component
        :is="audio ? 'audio' : 'video'"
        ref="player"
        class="sm__media"
        :poster="audio ? null : poster"
        :aria-label="title"
        :muted="muted"
        autoplay
        loop
        playsinline
        preload="metadata"
        @play="paused = false"
        @pause="paused = true"
        @waiting="buffering = true"
        @playing="buffering = false"
        @canplay="buffering = false"
        @timeupdate="updateTime"
        @loadedmetadata="updateTime"
        @error="onMediaError"
      />
      <button
        v-if="!error"
        type="button"
        class="sm__tap"
        :aria-label="paused ? 'Play short' : 'Pause short'"
        @click="togglePlay"
      >
        <span v-if="paused && !buffering" class="sm__play"><NavIcon name="play" /></span>
      </button>
      <span v-if="buffering && !error" class="sm__loading" role="status" aria-label="Loading video"></span>
      <div v-if="error" class="sm__error" role="status">
        <p>This recording could not be played.</p>
        <button type="button" @click="start">Try again</button>
      </div>
      <div v-else class="sm__controls">
        <button type="button" :title="paused ? 'Play' : 'Pause'" :aria-label="paused ? 'Play' : 'Pause'" @click="togglePlay">
          <NavIcon :name="paused ? 'play' : 'pause'" />
        </button>
        <button type="button" :title="muted ? 'Turn sound on' : 'Mute'" :aria-label="muted ? 'Turn sound on' : 'Mute'" :aria-pressed="!muted" @click="$emit('mute', !muted)">
          <NavIcon :name="muted ? 'muted' : 'volume'" />
        </button>
        <span class="sm__time">{{ clock(currentTime) }} / {{ clock(duration) }}</span>
        <button v-if="canFullscreen" type="button" class="sm__fullscreen" title="Full screen" aria-label="Full screen" @click="fullscreen">
          <NavIcon name="fullscreen" />
        </button>
      </div>
      <input
        v-if="duration > 0 && !error"
        class="sm__progress"
        type="range"
        min="0"
        :max="duration"
        step="0.1"
        :value="currentTime"
        :aria-valuetext="`${clock(currentTime)} of ${clock(duration)}`"
        aria-label="Playback position"
        :style="{ '--progress': `${currentTime / duration * 100}%` }"
        @input="seek"
      >
    </template>
  </div>
</template>

<script>
import NavIcon from './NavIcon'

export default {
  name: 'ShortMedia',
  components: { NavIcon },
  props: {
    media: { type: Object, required: true },
    poster: { type: String, default: '' },
    title: { type: String, default: '' },
    muted: { type: Boolean, default: true },
    audio: { type: Boolean, default: false }
  },
  data () {
    return { paused: true, buffering: true, error: false, currentTime: 0, duration: 0, canFullscreen: false }
  },
  computed: {
    embedUrl () {
      const metadata = this.media.metadata || {}
      if (metadata.isEmbed !== 'true' && metadata.isEmbed !== true) { return '' }
      return metadata.embedUrl || ''
    }
  },
  watch: {
    muted (value) { if (this.$refs.player) { this.$refs.player.muted = value } }
  },
  mounted () {
    this.canFullscreen = !!(document.fullscreenEnabled || (this.$refs.player && this.$refs.player.webkitEnterFullscreen))
    document.addEventListener('visibilitychange', this.onVisibility)
    this.start()
  },
  beforeDestroy () {
    document.removeEventListener('visibilitychange', this.onVisibility)
    if (this.hls) { this.hls.destroy() }
    if (this.$refs.player) { this.$refs.player.pause() }
  },
  methods: {
    async start () {
      const player = this.$refs.player
      if (!player) { return }
      if (this.hls) { this.hls.destroy(); this.hls = null }
      this.error = false
      this.buffering = true
      player.muted = this.muted
      const source = this.media.sourceUrl || ''
      if (!source) { this.error = true; return }

      // Safari plays HLS natively; hls.js handles the same stream on other browsers.
      if (/\.m3u8(?:[?#]|$)/i.test(source) && !player.canPlayType('application/vnd.apple.mpegurl')) {
        try {
          const { default: Hls } = await import('hls.js')
          if (this._isDestroyed) { return }
          if (!Hls.isSupported()) { this.error = true; return }
          this.hls = new Hls({ maxBufferLength: 15, maxMaxBufferLength: 30 })
          this.hls.on(Hls.Events.MANIFEST_PARSED, this.play)
          this.hls.on(Hls.Events.ERROR, (event, data) => { if (data.fatal) { this.error = true; this.buffering = false } })
          this.hls.loadSource(source)
          this.hls.attachMedia(player)
        } catch (error) { this.error = true; this.buffering = false }
      } else {
        player.src = source
        this.play()
      }
    },
    play () {
      const player = this.$refs.player
      if (!player || document.hidden) { return }
      const promise = player.play()
      if (promise) { promise.catch(() => { this.paused = true; this.buffering = false }) }
    },
    togglePlay () {
      const player = this.$refs.player
      if (!player) { return }
      if (player.paused) { this.play() } else { player.pause() }
    },
    updateTime () {
      const player = this.$refs.player
      this.currentTime = player.currentTime || 0
      this.duration = Number.isFinite(player.duration) ? player.duration : (this.media.durationSeconds || 0)
    },
    seek (event) { if (this.$refs.player) { this.$refs.player.currentTime = Number(event.target.value) } },
    clock (value) {
      const seconds = Math.floor(value || 0)
      return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
    },
    onMediaError () { if (!this.hls) { this.error = true; this.buffering = false } },
    onVisibility () {
      if (document.hidden && this.$refs.player) { this.$refs.player.pause() }
    },
    fullscreen () {
      const stage = this.$el.closest('[data-short-stage]')
      if (stage && stage.requestFullscreen) { stage.requestFullscreen().catch(() => {}) }
      else if (this.$refs.player && this.$refs.player.webkitEnterFullscreen) { this.$refs.player.webkitEnterFullscreen() }
    }
  }
}
</script>

<style scoped>
.sm { position: absolute; inset: 0; color: #fff; }
.sm__media { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; border: 0; }
.sm__artwork { opacity: 0.85; }
.sm__tap { position: absolute; inset: 0; display: grid; place-items: center; width: 100%; border: 0; background: none; color: #fff; }
.sm__play { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: rgba(0,0,0,0.55); }
.sm__play svg { width: 30px; height: 30px; margin-left: 3px; }
.sm__controls { position: absolute; top: 12px; left: 12px; right: 12px; display: flex; align-items: center; gap: 8px; pointer-events: none; }
.sm__controls button { display: grid; place-items: center; flex-shrink: 0; width: 44px; height: 44px; border: 0; border-radius: 50%; background: rgba(0,0,0,0.55); color: #fff; pointer-events: auto; transition: background 200ms; }
.sm__controls button:hover { background: rgba(0,0,0,0.85); }
.sm__controls svg { width: 22px; height: 22px; }
.sm__fullscreen { margin-left: auto; }
.sm__time { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-variant-numeric: tabular-nums; background: rgba(0,0,0,0.55); }
.sm__progress { position: absolute; z-index: 4; bottom: 0; left: 0; width: 100%; height: 16px; margin: 0; padding: 0; border: 0; border-radius: 0; cursor: pointer; appearance: none; background: transparent; }
.sm__progress::-webkit-slider-runnable-track { height: 3px; background: linear-gradient(to right, #fff var(--progress), rgba(255,255,255,0.3) var(--progress)); }
.sm__progress::-moz-range-track { height: 3px; background: rgba(255,255,255,0.3); }
.sm__progress::-moz-range-progress { height: 3px; background: #fff; }
.sm__progress::-webkit-slider-thumb { width: 12px; height: 12px; margin-top: -4.5px; border-radius: 50%; background: #fff; appearance: none; }
.sm__progress::-moz-range-thumb { width: 12px; height: 12px; border: 0; border-radius: 50%; background: #fff; }
.sm__loading { position: absolute; top: calc(50% - 16px); left: calc(50% - 16px); width: 32px; height: 32px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: sm-spin 800ms linear infinite; pointer-events: none; }
.sm__error { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 24px; background: rgba(0,0,0,0.75); text-align: center; font-size: 14px; }
.sm__error button { min-height: 44px; padding: 8px 16px; border: 1px solid #777; border-radius: 6px; background: #242424; color: #fff; }
.sm :focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
@keyframes sm-spin { to { transform: rotate(360deg); } }
@media (max-height: 520px) and (min-width: 641px) { .sm__time { display: none; } .sm__controls { gap: 4px; left: 8px; right: 8px; } .sm__controls button { width: 40px; height: 40px; } }
@media (prefers-reduced-motion: reduce) { .sm__loading { animation: none; } }
</style>
