<template>
  <!-- Only worth showing once there is an order to set. -->
  <section v-if="pinned.length > 1" class="ds-card po" aria-labelledby="po-title">
    <div class="ds-card__head">
      <div>
        <h2 id="po-title" class="ds-h3">Pinned order</h2>
        <p class="ds-help" style="margin:4px 0 0">Pinned shorts sit at the top of the feed in this order.</p>
      </div>
      <button class="ds-btn ds-btn--primary ds-btn--sm" type="button" :disabled="!changed || isSaving" @click="save">
        {{ isSaving ? 'Saving…' : 'Save order' }}
      </button>
    </div>

    <ol class="po__list">
      <li v-for="(item, index) in pinned" :key="item.id" class="po__row">
        <span class="po__num ds-num">{{ index + 1 }}</span>
        <span class="po__title">{{ item.title || 'Untitled short' }}</span>
        <span class="po__moves">
          <button class="ds-iconbtn" type="button" :disabled="index === 0" :aria-label="`Move ${item.title} up`" @click="move(index, -1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button class="ds-iconbtn" type="button" :disabled="index === pinned.length - 1" :aria-label="`Move ${item.title} down`" @click="move(index, 1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </span>
      </li>
    </ol>
  </section>
</template>

<script>
import { rowsOf, errorMessage } from '../network/MobileApp'

export default {
  name: 'PinnedShortsOrder',
  data () {
    return { pinned: [], saved: [], isSaving: false }
  },
  computed: {
    changed () {
      return this.pinned.map(p => p.id).join() !== this.saved.join()
    }
  },
  beforeMount () {
    this.load()
  },
  methods: {
    load () {
      // The admin list already sorts pinned shorts first, in their order.
      this.$axios.get('admin/shorts', { params: { Page: 1, PageSize: 50 } }).then(response => {
        this.pinned = rowsOf(response).filter(row => row.isPinned)
        this.saved = this.pinned.map(p => p.id)
      }).catch(() => {
        this.pinned = []
      })
    },
    move (index, step) {
      const list = [...this.pinned]
      const [item] = list.splice(index, 1)
      list.splice(index + step, 0, item)
      this.pinned = list
    },
    save () {
      this.isSaving = true
      const pinnedIds = this.pinned.map(p => p.id)
      this.$axios.put('admin/shorts/order', { pinnedIds }).then(() => {
        this.isSaving = false
        this.saved = pinnedIds
        this.$toast.success('Pinned order saved')
      }).catch(error => {
        this.isSaving = false
        this.$toast.error(errorMessage(error, 'Could not save the order.'))
      })
    }
  }
}
</script>

<style scoped>
.po { margin-top: 20px; }
.po__list { list-style: none; margin: 0; padding: 0; }
.po__row { display: flex; align-items: center; gap: 12px; padding: 10px 20px; border-top: 1px solid var(--ds-border); }
.po__num { width: 20px; color: var(--ds-text-3); }
.po__title { flex: 1; min-width: 0; overflow-wrap: anywhere; font-weight: 500; }
.po__moves { display: flex; gap: 4px; }
</style>
