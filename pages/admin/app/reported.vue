<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Reported posts</h1>
        <p>Member shorts other members have flagged. Posts go live without review, so this is where the office decides.</p>
      </div>
    </div>

    <div class="ds-card" style="margin-bottom:20px">
      <div class="ds-toolbar" style="border-bottom:0">
        <span class="ds-toolbar__count">{{ countLabel }}</span>
      </div>
    </div>

    <div v-if="isLoading" class="ds-card">
      <div class="ds-card__body" style="display:grid;gap:14px">
        <span v-for="n in 3" :key="n" class="ds-skeleton" style="height:96px"></span>
      </div>
    </div>

    <div v-else-if="rows.length" class="rp__list">
      <article v-for="row in rows" :key="row.short.id" class="ds-card rp__item">
        <div class="ds-card__body rp__body">
          <div v-if="preview(row.short).image" class="rp__thumb">
            <img :src="preview(row.short).image" alt="" loading="lazy">
          </div>

          <div class="rp__main">
            <div class="rp__top">
              <span class="ds-badge ds-badge--danger">Flagged by {{ row.reportCount }}</span>
              <span class="ds-badge ds-badge--neutral">{{ kindLabel(row.short.kind) }}</span>
              <time v-if="row.lastReportedAt" class="ds-meta" :datetime="row.lastReportedAt">
                last reported {{ $moment(row.lastReportedAt).fromNow() }}
              </time>
            </div>

            <p class="rp__who">
              <b>{{ row.short.author && row.short.author.name ? row.short.author.name : 'A member' }}</b>
              <span class="ds-meta"> posted {{ $moment(row.short.publishedAt).fromNow() }}</span>
            </p>

            <p v-if="preview(row.short).text" class="rp__text">{{ preview(row.short).text }}</p>

            <!-- Why members flagged it. Never who. -->
            <ul v-if="row.reasons.length" class="rp__reasons">
              <li v-for="(reason, index) in row.reasons" :key="index" class="ds-meta">“{{ reason }}”</li>
            </ul>
            <p v-else class="ds-help">No reason was given.</p>

            <div class="rp__actions">
              <button
                class="ds-btn ds-btn--danger ds-btn--sm"
                type="button"
                :disabled="busyId === row.short.id"
                @click="askTakeDown(row)"
              >Take down</button>
              <button
                class="ds-btn ds-btn--secondary ds-btn--sm"
                type="button"
                :disabled="busyId === row.short.id"
                @click="keepUp(row)"
              >Keep it up</button>
              <a :href="row.short.shareUrl" target="_blank" rel="noopener" class="ds-btn ds-btn--ghost ds-btn--sm">Open</a>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="ds-tablewrap">
      <div class="ds-empty">
        <h3 class="ds-h3">Nothing reported</h3>
        <p>When a member flags a post in the app, it appears here.</p>
      </div>
    </div>

    <div v-if="!isLoading && paging.totalPages > 1" class="ds-card" style="margin-top:20px">
      <div class="ds-pagination" style="border-top:0">
        <span class="ds-pagination__summary">Page <b>{{ paging.page }}</b> of <b>{{ paging.totalPages }}</b></span>
        <div class="ds-pagination__controls">
          <button class="ds-page" type="button" :disabled="paging.page <= 1" @click="load(paging.page - 1)">Previous</button>
          <button class="ds-page" type="button" :disabled="paging.page >= paging.totalPages" @click="load(paging.page + 1)">Next</button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="!!pending"
      :busy="!!busyId"
      title="Take this post down?"
      message="It disappears from the app for everyone, including the member who posted it. You can restore it later from Shorts."
      confirm-label="Take down"
      @cancel="pending = null"
      @confirm="takeDown"
    />
  </div>
</template>

<script>
import { rowsOf, pagingOf, errorMessage } from '../../../network/MobileApp'
import ConfirmDialog from '../../../components/ConfirmDialog'

const KINDS = {
  video: 'Clip', audio: 'Voice note', image: 'Picture', slides: 'Slides',
  event: 'Event', scripture: 'Scripture', text: 'Text'
}

export default {
  name: 'AdminAppReported',
  components: { ConfirmDialog },
  data () {
    return {
      rows: [],
      paging: { page: 1, totalPages: 0, totalCount: 0 },
      isLoading: false,
      busyId: null,
      pending: null
    }
  },
  computed: {
    countLabel () {
      if (this.isLoading) { return 'Loading…' }
      const count = this.paging.totalCount
      return count === 1 ? '1 post waiting on a decision' : `${count} posts waiting on a decision`
    }
  },
  beforeMount () {
    this.load(1)
  },
  methods: {
    kindLabel (kind) {
      return KINDS[kind] || kind
    },
    /** A picture and a line of text, whatever kind of post it is. */
    preview (item) {
      const content = item.content || {}
      const firstSlide = (content.slides || [])[0] || {}
      return {
        image: content.thumbnailUrl || content.artworkUrl || firstSlide.thumbnailUrl || firstSlide.imageUrl ||
          content.imageUrl || content.backgroundImageUrl || '',
        text: content.text || item.caption || firstSlide.caption || content.altText || item.title || ''
      }
    },
    load (page = 1) {
      this.isLoading = true
      this.$axios.get('admin/shorts/reported', { params: { Page: page, PageSize: 20 } }).then(response => {
        this.rows = rowsOf(response)
        this.paging = pagingOf(response, page)
        this.isLoading = false
      }).catch(error => {
        this.rows = []
        this.isLoading = false
        this.$toast.error(errorMessage(error, 'Could not load the reported posts.'))
      })
    },
    askTakeDown (row) {
      this.pending = row
    },
    takeDown () {
      const row = this.pending
      if (!row) { return }
      this.busyId = row.short.id
      this.$axios.delete(`admin/shorts/${row.short.id}`).then(() => {
        this.busyId = null
        this.pending = null
        this.$toast.success('Post taken down')
        this.load(this.paging.page)
      }).catch(error => {
        this.busyId = null
        this.pending = null
        this.$toast.error(errorMessage(error, 'Could not take that post down.'))
      })
    },
    keepUp (row) {
      this.busyId = row.short.id
      this.$axios.post(`admin/shorts/${row.short.id}/reports/dismiss`).then(() => {
        this.busyId = null
        this.$toast.success('Kept up, and its reports cleared')
        this.load(this.paging.page)
      }).catch(error => {
        this.busyId = null
        this.$toast.error(errorMessage(error, 'Could not clear the reports.'))
      })
    }
  }
}
</script>

<style scoped>
.rp__list { display: grid; gap: 14px; }
.rp__body { display: flex; gap: 16px; align-items: flex-start; }
.rp__thumb { flex-shrink: 0; width: 88px; height: 88px; border-radius: var(--ds-radius-md); overflow: hidden; background: var(--ds-surface-2); }
.rp__thumb img { width: 100%; height: 100%; object-fit: cover; }
.rp__main { min-width: 0; flex: 1; display: grid; gap: 8px; }
.rp__top { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.rp__who { margin: 0; }
.rp__text { margin: 0; color: var(--ds-text); white-space: pre-line; overflow-wrap: anywhere; }
.rp__reasons { margin: 0; padding-left: 18px; display: grid; gap: 2px; }
.rp__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }

@media (max-width: 560px) {
  .rp__body { flex-direction: column; }
  .rp__thumb { width: 100%; height: 160px; }
}
</style>
