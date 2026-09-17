<template>
  <div class="ds-formsection">
    <div class="ds-formsection__head">
      <h2 class="ds-h3">Publishing</h2>
      <p>{{ description }}</p>
    </div>

    <div class="pc__options" role="radiogroup" :aria-label="'When to publish this ' + noun">
      <label v-for="option in options" :key="option.value" class="pc__option"
             :class="{ 'is-selected': status === option.value }">
        <input
          class="pc__radio"
          type="radio"
          :name="groupName"
          :value="option.value"
          :checked="status === option.value"
          @change="choose(option.value)"
        >
        <span class="pc__copy">
          <span class="pc__label">{{ option.label }}</span>
          <span class="pc__hint">{{ option.hint }}</span>
        </span>
      </label>
    </div>

    <div v-if="status === 'scheduled'" class="ds-field pc__when">
      <label class="ds-label" :for="whenId">Go live at</label>
      <input
        :id="whenId"
        class="ds-input"
        type="datetime-local"
        :value="publishAt"
        :min="earliest"
        @input="$emit('update:publishAt', $event.target.value)"
      >
      <!--
        The API stores UTC. The office thinks in Accra time, so the zone is
        named here rather than left to be discovered when something goes out an
        hour early.
      -->
      <span class="ds-help">
        {{ zoneNote }}
        <template v-if="scheduledPreview"> — this goes out {{ scheduledPreview }}.</template>
      </span>
      <span v-if="showErrors && !publishAt" class="ds-error">Choose when this should go live.</span>
      <span v-else-if="showErrors && isPast" class="ds-error">
        That time has already passed. Pick a time in the future, or publish it now.
      </span>
    </div>

    <label v-if="pinnable" class="ds-check pc__pin">
      <input type="checkbox" :checked="isPinned" @change="$emit('update:isPinned', $event.target.checked)">
      <span>Pin to the top{{ pinNote }}</span>
    </label>

    <label v-if="allowPush && (status === 'published' || status === 'scheduled')" class="ds-check pc__push">
      <input type="checkbox" :checked="sendPush" @change="$emit('update:sendPush', $event.target.checked)">
      <span>Send push notification to congregation</span>
    </label>
  </div>
</template>

<script>
let uid = 0

/**
 * The publishing lifecycle block, shared by every content form.
 *
 * Draft, scheduled, published and archived are one lifecycle across sermons,
 * shorts, events, videos and announcements, so the control for it is one
 * component rather than five slightly different date pickers.
 */
export default {
  name: 'PublishControls',
  props: {
    status: { type: String, default: 'draft' },
    publishAt: { type: String, default: '' },
    isPinned: { type: Boolean, default: false },
    pinnable: { type: Boolean, default: false },
    pinNote: { type: String, default: '' },
    noun: { type: String, default: 'item' },
    showErrors: { type: Boolean, default: false },
    allowArchive: { type: Boolean, default: false },
    sendPush: { type: Boolean, default: true },
    allowPush: { type: Boolean, default: true }
  },
  data () {
    uid += 1
    return {
      groupName: `publishStatus${uid}`,
      whenId: `publishAt${uid}`
    }
  },
  computed: {
    description () {
      return `Members only ever see published ${this.noun}s. Drafts stay here.`
    },
    options () {
      const list = [
        { value: 'draft', label: 'Save as draft', hint: 'Only the office can see it.' },
        { value: 'scheduled', label: 'Schedule', hint: 'Goes live on its own at the time you set.' },
        { value: 'published', label: 'Publish now', hint: 'Visible in the app straight away.' }
      ]

      if (this.allowArchive) {
        list.push({ value: 'archived', label: 'Archive', hint: 'Removed from the app, kept here.' })
      }

      return list
    },
    earliest () {
      const now = new Date(Date.now() + 60000)
      const pad = n => String(n).padStart(2, '0')
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
        `T${pad(now.getHours())}:${pad(now.getMinutes())}`
    },
    zoneNote () {
      try {
        const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
        return `Times are in ${zone || 'your local time'}`
      } catch (error) {
        return 'Times are in your local time'
      }
    },
    isPast () {
      if (!this.publishAt) { return false }
      const when = new Date(this.publishAt)
      return !isNaN(when.getTime()) && when.getTime() <= Date.now()
    },
    scheduledPreview () {
      if (!this.publishAt) { return '' }
      const when = new Date(this.publishAt)
      if (isNaN(when.getTime())) { return '' }

      return when.toLocaleString(undefined, {
        weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit'
      })
    }
  },
  methods: {
    choose (value) {
      this.$emit('update:status', value)
      if (value !== 'scheduled') {
        this.$emit('update:publishAt', '')
      }
    }
  }
}
</script>

<style scoped>
.pc__options { display: grid; gap: 8px; margin-bottom: 16px; }

.pc__option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 11px 14px;
  border: 1px solid var(--ds-border);
  border-radius: 6px;
  cursor: pointer;
  background: var(--ds-surface);
}
.pc__option.is-selected { border-color: var(--ds-primary); background: var(--ds-surface-2); }
.pc__option:focus-within { outline: 2px solid var(--ds-primary); outline-offset: 2px; }

.pc__radio { margin-top: 3px; flex-shrink: 0; }
.pc__copy { display: grid; gap: 2px; }
.pc__label { font-weight: 500; }
.pc__hint { font-size: var(--ds-text-sm); color: var(--ds-text-muted); }

.pc__when { margin-bottom: 0; max-width: 320px; }
.pc__pin { margin-top: 14px; }
.pc__push { margin-top: 12px; }
</style>
