<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">App updates</h1>
        <p>Tell members when a new version of the app is out, and stop very old versions once they no longer work.</p>
      </div>
    </div>

    <div class="ds-alert ds-alert--info" style="margin-bottom:20px">
      <div class="ds-alert__body">
        Members on a version older than <b>Latest</b> see an optional “update available” prompt.
        Members on a version older than <b>Minimum</b> cannot use the app until they update —
        raise it only once the new version is live in the store.
      </div>
    </div>

    <div class="rl__grid">
      <form v-for="platform in platforms" :key="platform.key" class="ds-card" @submit.prevent="askSave(platform.key)">
        <div class="ds-card__head">
          <h2 class="ds-h3">{{ platform.label }}</h2>
          <span v-if="saved[platform.key].latestVersion" class="ds-meta">Live now: {{ saved[platform.key].latestVersion }}</span>
        </div>

        <div class="ds-card__body">
          <div v-if="isLoading" style="display:grid;gap:12px">
            <span v-for="n in 3" :key="n" class="ds-skeleton" style="height:38px"></span>
          </div>

          <template v-else>
            <div class="ds-formgrid">
              <div class="ds-field">
                <label class="ds-label" :for="`${platform.key}-latest`">Latest version</label>
                <input :id="`${platform.key}-latest`" v-model.trim="forms[platform.key].latestVersion"
                       class="ds-input" placeholder="1.0.0" inputmode="decimal">
              </div>
              <div class="ds-field">
                <label class="ds-label" :for="`${platform.key}-minimum`">Minimum version</label>
                <input :id="`${platform.key}-minimum`" v-model.trim="forms[platform.key].minimumVersion"
                       class="ds-input" placeholder="Leave empty to block nobody" inputmode="decimal">
              </div>
            </div>

            <div class="ds-field">
              <label class="ds-label" :for="`${platform.key}-store`">Store link</label>
              <input :id="`${platform.key}-store`" v-model.trim="forms[platform.key].storeUrl" class="ds-input" type="url">
            </div>

            <div class="ds-field">
              <label class="ds-label" :for="`${platform.key}-notes`">What's new <span class="ds-meta">(optional, shown in the prompt)</span></label>
              <textarea :id="`${platform.key}-notes`" v-model="forms[platform.key].releaseNotes" class="ds-textarea" rows="3"></textarea>
            </div>

            <p v-if="problem(platform.key)" class="ds-error">{{ problem(platform.key) }}</p>

            <div class="ds-formactions">
              <button class="ds-btn ds-btn--primary" type="submit"
                      :disabled="!!problem(platform.key) || !changed(platform.key) || savingKey === platform.key">
                {{ savingKey === platform.key ? 'Saving…' : `Save ${platform.label}` }}
              </button>
            </div>
          </template>
        </div>
      </form>
    </div>

    <ConfirmDialog
      :open="!!confirmKey"
      :busy="!!savingKey"
      title="Block older versions?"
      :message="confirmMessage"
      confirm-label="Yes, require the update"
      @cancel="confirmKey = null"
      @confirm="save(confirmKey)"
    />
  </div>
</template>

<script>
import { errorMessage, payload } from '../../../network/MobileApp'
import { APP_STORE_URL, PLAY_STORE_URL } from '../../../resources/appLinks'
import ConfirmDialog from '../../../components/ConfirmDialog'

const VERSION = /^\d+(\.\d+){0,3}$/

/** Dotted numeric comparison, as the API does it: -1, 0 or 1. */
function compare (a, b) {
  const left = String(a).split('.').map(n => parseInt(n, 10) || 0)
  const right = String(b).split('.').map(n => parseInt(n, 10) || 0)
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const l = left[i] || 0
    const r = right[i] || 0
    if (l !== r) { return l < r ? -1 : 1 }
  }
  return 0
}

const blank = storeUrl => ({ latestVersion: '', minimumVersion: '', storeUrl, releaseNotes: '' })

export default {
  name: 'AdminAppRelease',
  components: { ConfirmDialog },
  data () {
    return {
      platforms: [
        { key: 'android', label: 'Android', store: PLAY_STORE_URL },
        { key: 'ios', label: 'iPhone', store: APP_STORE_URL }
      ],
      forms: { android: blank(PLAY_STORE_URL), ios: blank(APP_STORE_URL) },
      saved: { android: blank(PLAY_STORE_URL), ios: blank(APP_STORE_URL) },
      isLoading: true,
      savingKey: null,
      confirmKey: null
    }
  },
  computed: {
    confirmMessage () {
      if (!this.confirmKey) { return '' }
      const form = this.forms[this.confirmKey]
      const label = this.platforms.find(p => p.key === this.confirmKey).label
      return `Members on ${label} with a version older than ${form.minimumVersion} will not be able to use the app until they update. Only do this once ${form.latestVersion} is live in the store.`
    }
  },
  beforeMount () {
    this.load()
  },
  methods: {
    async load () {
      this.isLoading = true
      try {
        for (const platform of this.platforms) {
          // The public check, asked as a version older than anything, reads
          // back what is set without needing an admin read endpoint.
          const response = await this.$axios.get('app/release', { params: { platform: platform.key, version: '0.0.0' } })
          const data = payload(response) || {}
          const values = {
            latestVersion: data.latestVersion || '',
            minimumVersion: data.minimumVersion || '',
            storeUrl: data.storeUrl || platform.store,
            releaseNotes: data.releaseNotes || ''
          }
          this.forms[platform.key] = { ...values }
          this.saved[platform.key] = { ...values }
        }
      } catch (error) {
        this.$toast.error(errorMessage(error, 'Could not load the app versions.'))
      } finally {
        this.isLoading = false
      }
    },
    problem (key) {
      const form = this.forms[key]
      if (form.latestVersion && !VERSION.test(form.latestVersion)) { return 'The latest version should look like 1.2.0.' }
      if (form.minimumVersion && !VERSION.test(form.minimumVersion)) { return 'The minimum version should look like 1.2.0.' }
      if (form.minimumVersion && !form.latestVersion) { return 'Set the latest version too.' }
      if (form.minimumVersion && form.latestVersion && compare(form.minimumVersion, form.latestVersion) > 0) {
        return 'The minimum cannot be newer than the latest version — members would be sent for an update that does not exist.'
      }
      return ''
    },
    changed (key) {
      return JSON.stringify(this.forms[key]) !== JSON.stringify(this.saved[key])
    },
    askSave (key) {
      if (this.problem(key)) { return }
      const form = this.forms[key]
      const before = this.saved[key].minimumVersion
      const raisesMinimum = form.minimumVersion && (!before || compare(form.minimumVersion, before) > 0)
      if (raisesMinimum) {
        this.confirmKey = key
      } else {
        this.save(key)
      }
    },
    async save (key) {
      this.savingKey = key
      const form = this.forms[key]
      try {
        await this.$axios.put('admin/app/release', {
          platform: key,
          latestVersion: form.latestVersion || null,
          minimumVersion: form.minimumVersion || null,
          storeUrl: form.storeUrl || null,
          releaseNotes: form.releaseNotes || null
        })
        this.saved[key] = { ...form }
        this.$toast.success(`${this.platforms.find(p => p.key === key).label} saved`)
      } catch (error) {
        this.$toast.error(errorMessage(error, 'Could not save that.'))
      } finally {
        this.savingKey = null
        this.confirmKey = null
      }
    }
  }
}
</script>

<style scoped>
.rl__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; align-items: start; }
</style>
