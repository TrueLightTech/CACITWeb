<template>
  <div class="mu">
    <!-- Nothing chosen -->
    <div v-if="state === 'idle'">
      <!--
        Where the media lives is a per-item choice, not a one-off decision for
        the whole system. A full sermon can point at the channel the church
        already streams to while a one-minute short is uploaded — the app gets
        a URL and a type either way.
      -->
      <div v-if="allowsLink" class="mu__modes" role="tablist" :aria-label="'How to add ' + kindNoun">
        <button
          class="mu__mode"
          :class="{ 'is-active': mode === 'upload', 'is-off': !canUploadThisKind }"
          type="button"
          role="tab"
          :aria-selected="mode === 'upload'"
          :disabled="!canUploadThisKind"
          :title="canUploadThisKind ? null : unavailableNote"
          @click="mode = 'upload'"
        >
          Upload a file
        </button>
        <button
          class="mu__mode"
          :class="{ 'is-active': mode === 'link' }"
          type="button"
          role="tab"
          :aria-selected="mode === 'link'"
          @click="mode = 'link'"
        >
          Paste a link
        </button>
      </div>

      <div v-if="mode === 'link'" class="mu__link">
        <label class="ds-label" :for="linkId">Link to the {{ kindWord }}</label>
        <div class="mu__linkrow">
          <input
            :id="linkId"
            v-model="linkUrl"
            class="ds-input"
            type="url"
            placeholder="https://youtube.com/watch?v=…"
            @keydown.enter.prevent="attachLink"
          >
          <button
            class="ds-btn ds-btn--secondary"
            type="button"
            :disabled="!linkUrl || isAttaching"
            @click="attachLink"
          >
            <span v-if="isAttaching" class="ds-btn__spinner"></span>
            {{ isAttaching ? 'Checking' : 'Attach' }}
          </button>
        </div>
        <p class="ds-help mu__hint">
          YouTube, Facebook, Vimeo, or a direct link to a file. Nothing is uploaded and
          nothing is stored here — the app plays it from there.
        </p>
        <p v-if="linkError" class="ds-error">{{ linkError }}</p>
      </div>

      <!--
        Said once, where the choice is made. Before this, picking a file was the
        only obvious path and it failed with a message about server keys.
      -->
      <p v-if="allowsLink && !canUploadThisKind" class="ds-help mu__offnote">
        {{ unavailableNote }}
      </p>

      <div v-else class="mu__drop" :class="{ 'is-over': isDragging }"
           @dragover.prevent="isDragging = true"
           @dragleave.prevent="isDragging = false"
           @drop.prevent="onDrop">
        <svg class="mu__dropicon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p class="mu__droptext">
          <label class="mu__pick" :for="inputId">
            Choose {{ kindNoun }}
            <input :id="inputId" ref="file" class="mu__input" type="file"
                   :accept="accept" @change="onPick">
          </label>
          or drag one here
        </p>
        <p class="ds-help mu__hint">{{ hint }}</p>
      </div>
    </div>

    <!-- Uploading, processing, ready or failed -->
    <div v-else class="mu__card" :class="`is-${state}`">
      <div class="mu__row">
        <span class="mu__badge" :class="badgeClass">{{ stateLabel }}</span>
        <span class="mu__name" :title="fileName">{{ fileName || 'Untitled' }}</span>
        <span v-if="fileSize" class="mu__size">{{ fileSize }}</span>
      </div>

      <!-- Upload progress: the one number that is genuinely known -->
      <div v-if="state === 'uploading'" class="mu__bar" role="progressbar"
           :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
        <span class="mu__barfill" :style="{ width: percent + '%' }"></span>
      </div>
      <p v-if="state === 'uploading'" class="mu__status">
        Uploading — {{ percent }}%. Keep this tab open.
      </p>

      <!--
        Transcoding. On a full sermon this is minutes, not seconds, so the
        message says so and the save is allowed to proceed without waiting.
      -->
      <div v-if="state === 'processing'" class="mu__bar is-indeterminate">
        <span class="mu__barfill"></span>
      </div>
      <p v-if="state === 'processing'" class="mu__status">
        Uploaded. Cloudflare is preparing it — a full service takes a few minutes.
        You can save now and it will appear in the app once it is ready.
      </p>

      <div v-if="state === 'ready'" class="mu__ready">
        <p class="mu__status">
          <template v-if="isLinked">
            <!--
              Worth saying out loud: a link does not send the member off to
              YouTube. The app plays it inline, so the office is not choosing
              between cost and keeping people in the app.
            -->
            Plays in the app from <b>{{ providerLabel }}</b><span v-if="durationLabel"> · {{ durationLabel }}</span>
          </template>
          <template v-else>
            Ready<span v-if="durationLabel"> · {{ durationLabel }}</span>
          </template>
        </p>
        <img v-if="thumbnail" :src="thumbnail" alt="" class="mu__thumb">
      </div>

      <p v-if="state === 'failed'" class="mu__status mu__status--error">
        {{ failureReason || 'That upload did not finish.' }}
      </p>

      <div class="mu__actions">
        <button v-if="state === 'failed' && lastFile" class="ds-btn ds-btn--secondary ds-btn--sm"
                type="button" @click="retry">
          Try again
        </button>
        <button v-if="state === 'processing'" class="ds-btn ds-btn--ghost ds-btn--sm"
                type="button" @click="poll">
          Check now
        </button>
        <button class="ds-btn ds-btn--ghost ds-btn--sm" type="button" @click="clear">
          {{ state === 'ready' ? 'Replace' : 'Remove' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { payload, errorMessage, duration as formatDuration, bytes as formatBytes } from '../network/MobileApp'

/** Providers that mean "hosted elsewhere", as opposed to uploaded here. */
const LINKED_PROVIDERS = ['youtube', 'vimeo', 'facebook', 'external']

let uid = 0

/**
 * What the server can actually do, asked once for the whole page rather than
 * once per upload box — a form can hold several.
 */
let capabilities = null
let capabilitiesRequest = null

function loadCapabilities (axios) {
  if (capabilities) { return Promise.resolve(capabilities) }
  if (!capabilitiesRequest) {
    capabilitiesRequest = axios.get('media/capabilities')
      .then(response => {
        capabilities = (response.data && response.data.data) || {}
        return capabilities
      })
      .catch(() => {
        // An older server has no such endpoint. Assume everything works and
        // let the upload itself report the truth, as it did before.
        capabilities = { canUploadVideo: true, canUploadFiles: true }
        return capabilities
      })
  }
  return capabilitiesRequest
}

/**
 * Uploads one file straight to Cloudflare and hands back the media id.
 *
 * The bytes never pass through CACITapi: it issues an upload ticket, the
 * browser PUTs or POSTs to Cloudflare, and the asset id comes back here. Every
 * content form uses this, so it exists once.
 *
 * The states matter more than they look:
 *
 *   idle → uploading → processing → ready
 *                   ↘ failed
 *
 * `processing` is the one people forget. Cloudflare Stream transcodes after the
 * bytes land, which on a sermon is minutes; the office will not sit and watch.
 * So the component keeps polling, says plainly how long it takes, and emits the
 * media id as soon as the upload completes rather than when transcoding
 * finishes — a sermon can be saved with its recording still processing, and the
 * app shows a disabled play control until the API reports a source URL.
 */
export default {
  name: 'MediaUpload',
  props: {
    /** video | audio | image | document */
    kind: { type: String, default: 'video' },
    /** An already-attached asset id, when editing. */
    value: { type: String, default: '' },
    label: { type: String, default: '' },
    /**
     * Allow pointing at media hosted elsewhere instead of uploading. Only
     * meaningful for video and audio — an image has nothing to gain from it.
     */
    allowLink: { type: Boolean, default: true }
  },
  data () {
    uid += 1
    return {
      canUploadVideo: true,
      canUploadFiles: true,
      unavailableNote: '',
      inputId: `mediaUpload${uid}`,
      linkId: `mediaLink${uid}`,
      mode: 'upload',
      linkUrl: '',
      linkError: '',
      isAttaching: false,
      provider: '',
      state: 'idle',
      percent: 0,
      mediaId: '',
      fileName: '',
      fileSize: '',
      durationLabel: '',
      thumbnail: '',
      failureReason: '',
      isDragging: false,
      lastFile: null,
      pollTimer: null,
      pollAttempts: 0
    }
  },
  computed: {
    canUploadThisKind () {
      return this.kind === 'video' ? this.canUploadVideo : this.canUploadFiles
    },
    allowsLink () {
      return this.allowLink && (this.kind === 'video' || this.kind === 'audio')
    },
    kindWord () {
      return this.kind === 'audio' ? 'recording' : 'video'
    },
    /** Named so the office knows the member never leaves the app. */
    providerLabel () {
      return {
        youtube: 'YouTube',
        vimeo: 'Vimeo',
        facebook: 'Facebook',
        external: 'External link'
      }[this.provider] || ''
    },
    isLinked () {
      return !!this.providerLabel
    },
    kindNoun () {
      return { video: 'a video', audio: 'an audio file', image: 'an image', document: 'a file' }[this.kind] || 'a file'
    },
    accept () {
      return {
        video: 'video/*',
        audio: 'audio/*',
        image: 'image/*',
        document: '.pdf,.doc,.docx'
      }[this.kind] || '*/*'
    },
    hint () {
      if (this.kind === 'video') {
        return 'MP4 or MOV. Large files are fine — the upload goes straight to Cloudflare.'
      }
      if (this.kind === 'image') {
        return 'JPG or PNG. A wide image works best on a phone.'
      }
      if (this.kind === 'audio') {
        return 'MP3 or M4A.'
      }
      return 'PDF or Word document.'
    },
    stateLabel () {
      return {
        uploading: 'Uploading',
        processing: 'Preparing',
        ready: 'Ready',
        failed: 'Failed'
      }[this.state] || ''
    },
    badgeClass () {
      return {
        uploading: 'is-busy',
        processing: 'is-busy',
        ready: 'is-ready',
        failed: 'is-failed'
      }[this.state] || ''
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (id) {
        if (id && id !== this.mediaId) {
          this.mediaId = id
          this.loadExisting(id)
        }
      }
    }
  },
  mounted () {
    loadCapabilities(this.$axios).then(available => {
      this.canUploadVideo = available.canUploadVideo !== false
      this.canUploadFiles = available.canUploadFiles !== false
      this.unavailableNote = available.videoUploadNote ||
        'Uploading is off on this server. Paste a link instead.'

      // Land on the tab that works, so nobody picks a file that cannot go
      // anywhere. Only when a link is an option at all.
      if (!this.canUploadThisKind && this.allowsLink) {
        this.mode = 'link'
      }
    })
  },
  beforeDestroy () {
    this.stopPolling()
  },
  methods: {
    onPick (event) {
      const file = event.target.files && event.target.files[0]
      if (file) { this.upload(file) }
    },
    onDrop (event) {
      this.isDragging = false
      const file = event.dataTransfer.files && event.dataTransfer.files[0]
      if (file) { this.upload(file) }
    },
    retry () {
      if (this.lastFile) { this.upload(this.lastFile) }
    },
    /**
     * Hand the server a link rather than bytes. The server works out which
     * platform it is and builds the address the app plays inline, so the
     * member watches inside the app exactly as they would an upload.
     */
    async attachLink () {
      const url = this.linkUrl.trim()
      if (!url) { return }

      this.linkError = ''
      this.isAttaching = true

      try {
        const response = await this.$axios.post('media/external', {
          url,
          type: this.kind,
          title: this.label || ''
        })

        const asset = payload(response)
        this.isAttaching = false

        if (!asset) {
          this.linkError = 'The server could not read that link.'
          return
        }

        this.fileName = asset.title || url
        this.fileSize = ''
        this.$emit('input', asset.id)
        this.applyAsset(asset)
        this.linkUrl = ''
      } catch (error) {
        this.isAttaching = false
        this.linkError = errorMessage(error, 'Could not attach that link.')
      }
    },
    clear () {
      this.stopPolling()
      this.state = 'idle'
      this.percent = 0
      this.mediaId = ''
      this.fileName = ''
      this.fileSize = ''
      this.durationLabel = ''
      this.thumbnail = ''
      this.failureReason = ''
      this.lastFile = null
      this.linkUrl = ''
      this.linkError = ''
      this.provider = ''
      this.$emit('input', '')
      this.$emit('state', 'idle')
    },
    async upload (file) {
      this.stopPolling()
      this.lastFile = file
      this.fileName = file.name
      this.fileSize = formatBytes(file.size)
      this.failureReason = ''
      this.percent = 0
      this.state = 'uploading'
      this.$emit('state', 'uploading')

      try {
        const endpoint = this.kind === 'video' ? 'media/stream/upload-url' : 'media/r2/upload-url'

        const ticketResponse = await this.$axios.post(endpoint, {
          type: this.kind,
          fileName: file.name,
          contentType: file.type,
          sizeInBytes: file.size,
          title: this.label || file.name
        })

        const ticket = payload(ticketResponse)

        if (!ticket || !ticket.uploadUrl) {
          this.fail('Uploads are not set up yet. Ask whoever runs the server to add the Cloudflare keys.')
          return
        }

        this.mediaId = ticket.mediaId

        await this.sendBytes(ticket, file)

        // The id is emitted as soon as the bytes land, not when transcoding
        // finishes, so the form can be saved while Cloudflare is still working.
        this.$emit('input', this.mediaId)

        const markResponse = await this.$axios.post(`media/${this.mediaId}/uploaded`)
        this.applyAsset(payload(markResponse))
      } catch (error) {
        this.fail(errorMessage(error, 'That upload did not finish. Check your connection and try again.'))
      }
    },
    /**
     * R2 takes a presigned PUT of the raw file; Stream takes a multipart POST.
     * XHR rather than fetch because it is the only one that reports progress,
     * and a large sermon upload with no progress bar looks like a hung page.
     */
    sendBytes (ticket, file) {
      return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()
        const method = (ticket.uploadMethod || 'put').toUpperCase()

        request.open(method, ticket.uploadUrl, true)

        request.upload.onprogress = event => {
          if (event.lengthComputable) {
            this.percent = Math.round((event.loaded / event.total) * 100)
          }
        }

        request.onload = () => {
          if (request.status >= 200 && request.status < 300) {
            resolve()
          } else {
            reject(new Error(`Cloudflare rejected the upload (${request.status})`))
          }
        }

        request.onerror = () => reject(new Error('The upload connection dropped'))
        request.onabort = () => reject(new Error('The upload was cancelled'))

        if (method === 'POST') {
          const form = new FormData()
          form.append('file', file)
          request.send(form)
        } else {
          if (file.type) { request.setRequestHeader('Content-Type', file.type) }
          request.send(file)
        }
      })
    },
    async loadExisting (id) {
      try {
        const response = await this.$axios.get(`media/${id}`)
        this.applyAsset(payload(response))
      } catch (error) {
        // An asset that no longer resolves is shown as failed rather than
        // silently appearing to be attached.
        this.fail('That file is no longer available.')
      }
    },
    applyAsset (asset) {
      if (!asset) {
        this.fail('The server did not recognise that upload.')
        return
      }

      this.mediaId = asset.id
      this.fileName = asset.title || this.fileName
      this.durationLabel = formatDuration(asset.durationSeconds)
      this.thumbnail = asset.thumbnailUrl || ''
      this.provider = LINKED_PROVIDERS.indexOf(asset.provider) !== -1 ? asset.provider : ''

      if (asset.sizeInBytes) { this.fileSize = formatBytes(asset.sizeInBytes) }

      if (asset.status === 'ready') {
        this.state = 'ready'
        this.stopPolling()
        this.$emit('input', this.mediaId)
        this.$emit('state', 'ready')
        return
      }

      if (asset.status === 'failed') {
        this.fail(asset.failureReason || 'Cloudflare could not process that file.')
        return
      }

      this.state = 'processing'
      this.$emit('state', 'processing')
      this.startPolling()
    },
    startPolling () {
      this.stopPolling()
      this.pollAttempts = 0
      // Every five seconds for ten minutes. Long enough for a full service,
      // short enough that the tab is not polling all afternoon.
      this.pollTimer = setInterval(() => {
        this.pollAttempts += 1
        if (this.pollAttempts > 120) {
          this.stopPolling()
          return
        }
        this.poll()
      }, 5000)
    },
    stopPolling () {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },
    async poll () {
      if (!this.mediaId) { return }
      try {
        const response = await this.$axios.get(`media/${this.mediaId}`)
        this.applyAsset(payload(response))
      } catch (error) {
        // A failed poll is not a failed upload — try again on the next tick.
      }
    },
    fail (reason) {
      this.stopPolling()
      this.state = 'failed'
      this.failureReason = reason
      this.$emit('state', 'failed')
    }
  }
}
</script>

<style scoped>
.mu__drop {
  border: 1px dashed var(--ds-border-strong, var(--ds-border));
  border-radius: 8px;
  padding: 26px 20px;
  text-align: center;
  background: var(--ds-surface-2);
  transition: border-color .15s ease, background .15s ease;
}
.mu__drop.is-over { border-color: var(--ds-primary); background: var(--ds-surface); }
.mu__dropicon { width: 26px; height: 26px; color: var(--ds-text-muted); }
.mu__droptext { margin: 10px 0 4px; font-size: var(--ds-text-base); }
.mu__hint { margin: 0; }

.mu__pick {
  color: var(--ds-primary);
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.mu__input {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}

.mu__mode.is-off { opacity: .45; cursor: not-allowed; }
.mu__offnote { margin-top: 10px; }

.mu__modes { display: inline-flex; gap: 2px; margin-bottom: 12px; padding: 3px;
  background: var(--ds-surface-2); border-radius: 7px; }
.mu__mode {
  border: 0; background: none; cursor: pointer;
  padding: 6px 13px; border-radius: 5px;
  font-size: var(--ds-text-sm); font-weight: 500; color: var(--ds-text-muted);
  font-family: inherit;
}
.mu__mode.is-active { background: var(--ds-surface); color: var(--ds-text); box-shadow: 0 1px 2px rgba(0,0,0,.06); }
.mu__mode:focus-visible { outline: 2px solid var(--ds-primary); outline-offset: 1px; }

.mu__link { display: grid; gap: 6px; }
.mu__linkrow { display: flex; gap: 8px; align-items: flex-start; }
.mu__linkrow .ds-input { flex: 1; min-width: 0; }

.mu__card {
  border: 1px solid var(--ds-border);
  border-radius: 8px;
  padding: 14px 16px;
  background: var(--ds-surface);
  display: grid;
  gap: 10px;
}
.mu__card.is-failed { border-color: var(--ds-danger, #b02b26); }

.mu__row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mu__name { font-weight: 500; overflow-wrap: anywhere; flex: 1; min-width: 0; }
.mu__size { color: var(--ds-text-muted); font-size: var(--ds-text-sm); }

.mu__badge {
  font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
  padding: 3px 8px; border-radius: 999px; white-space: nowrap;
  background: var(--ds-surface-2); color: var(--ds-text-muted);
}
.mu__badge.is-ready { background: #e4f2ed; color: #13624c; }
.mu__badge.is-failed { background: #fbeae9; color: #b02b26; }
.mu__badge.is-busy { background: #fbf0dc; color: #7a4f00; }

.mu__bar {
  height: 6px; border-radius: 999px; background: var(--ds-surface-2); overflow: hidden;
}
.mu__barfill { display: block; height: 100%; background: var(--ds-primary); transition: width .2s ease; }
.mu__bar.is-indeterminate .mu__barfill { width: 35%; animation: mu-slide 1.3s ease-in-out infinite; }

@keyframes mu-slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}

.mu__status { margin: 0; font-size: var(--ds-text-sm); color: var(--ds-text-muted); }
.mu__status--error { color: var(--ds-danger, #b02b26); }

.mu__ready { display: flex; align-items: center; gap: 12px; justify-content: space-between; }
.mu__thumb { width: 96px; height: 54px; object-fit: cover; border-radius: 4px; border: 1px solid var(--ds-border); }

.mu__actions { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }

@media (prefers-reduced-motion: reduce) {
  .mu__bar.is-indeterminate .mu__barfill { animation: none; width: 100%; opacity: .5; }
}
</style>
