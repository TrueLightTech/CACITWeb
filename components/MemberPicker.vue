<template>
  <div class="member-picker">
    <input
      :id="idPrefix"
      v-model="query"
      class="ds-input"
      type="text"
      autocomplete="off"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-controls="`${idPrefix}-list`"
      placeholder="Start typing a name"
      @input="onInput"
      @focus="onFocus"
      @keydown.down.prevent="move(1)"
      @keydown.up.prevent="move(-1)"
      @keydown.enter.prevent="choose(results[highlighted])"
      @keydown.esc="close"
    >

    <ul v-if="isOpen" :id="`${idPrefix}-list`" class="member-picker__list" role="listbox">
      <li v-if="isLoading" class="member-picker__status">Searching…</li>
      <li v-else-if="!results.length" class="member-picker__status">No members found</li>
      <li
        v-for="(member, index) in results"
        v-else
        :key="member.id"
        role="option"
        :aria-selected="index === highlighted ? 'true' : 'false'"
      >
        <button
          class="member-picker__option"
          :class="{ 'is-highlighted': index === highlighted }"
          type="button"
          @mousedown.prevent="choose(member)"
        >
          <span>{{ member.name }}</span>
          <small v-if="member.churchFamilyName">{{ member.churchFamilyName }}</small>
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import { MemberList } from '../network/Member'

const DEBOUNCE_MS = 300

/**
 * Member lookup.
 *
 * Replaces the hand-rolled control that toggled a Bootstrap dropdown by
 * mutating a class string, fired a request on every keystroke, and could not
 * be operated from the keyboard.
 */
export default {
  name: 'MemberPicker',
  props: {
    idPrefix: { type: String, required: true },
    value: { type: String, default: '' }
  },
  data () {
    return {
      query: this.value || '',
      results: [],
      isOpen: false,
      isLoading: false,
      highlighted: 0,
      timer: null
    }
  },
  watch: {
    value (next) {
      if (next !== this.query) {
        this.query = next || ''
      }
    }
  },
  beforeDestroy () {
    clearTimeout(this.timer)
    document.removeEventListener('click', this.onDocumentClick, true)
  },
  mounted () {
    document.addEventListener('click', this.onDocumentClick, true)
  },
  methods: {
    onDocumentClick (event) {
      if (this.isOpen && !this.$el.contains(event.target)) {
        this.close()
      }
    },
    onFocus () {
      if (this.query.trim().length > 1) {
        this.isOpen = true
      }
    },
    onInput () {
      clearTimeout(this.timer)
      const term = this.query.trim()

      if (term.length < 2) {
        this.isOpen = false
        this.results = []
        return
      }

      this.isOpen = true
      this.isLoading = true
      this.timer = setTimeout(() => this.search(term), DEBOUNCE_MS)
    },
    search (term) {
      this.$axios.get(`churchmembers?Name=${encodeURIComponent(term)}&Page=1&PageSize=8`)
        .then(response => {
          const data = Object.assign({}, MemberList, response.data.data)
          this.results = Array.isArray(data.results) ? data.results : []
          this.highlighted = 0
          this.isLoading = false
        })
        .catch(() => {
          this.results = []
          this.isLoading = false
        })
    },
    move (step) {
      if (!this.results.length) { return }
      const next = this.highlighted + step
      this.highlighted = Math.max(0, Math.min(this.results.length - 1, next))
    },
    choose (member) {
      if (!member) { return }
      this.query = member.name
      this.isOpen = false
      this.$emit('select', member)
    },
    close () {
      this.isOpen = false
    }
  }
}
</script>

<style scoped>
.member-picker { position: relative; }

.member-picker__list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 30;
  margin: 0;
  padding: 4px;
  list-style: none;
  max-height: 240px;
  overflow-y: auto;
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  box-shadow: var(--ds-shadow-md);
}

.member-picker__status {
  padding: 10px 12px;
  color: var(--ds-text-3);
  font-size: var(--ds-text-sm);
}

.member-picker__option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  border: 0;
  background: transparent;
  text-align: left;
  padding: 8px 12px;
  border-radius: var(--ds-radius-sm);
  cursor: pointer;
  font: inherit;
  color: var(--ds-text);
}

.member-picker__option small { color: var(--ds-text-3); font-size: var(--ds-text-xs); }
.member-picker__option:hover,
.member-picker__option.is-highlighted { background: var(--ds-surface-2); }
</style>
