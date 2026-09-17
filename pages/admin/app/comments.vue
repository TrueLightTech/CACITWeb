<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Comments</h1>
        <p>What members have written on sermons, videos, events and announcements.</p>
      </div>
    </div>

    <div class="cm__stats">
      <button
        v-for="tile in tiles"
        :key="tile.key"
        class="ds-card cm__stat"
        :class="{ 'is-active': view === tile.key }"
        type="button"
        @click="setView(tile.key)"
      >
        <span class="ds-meta">{{ tile.label }}</span>
        <span class="cm__statnum" :class="tile.urgent && tile.value ? 'is-urgent' : ''">
          {{ isLoadingSummary ? '—' : tile.value }}
        </span>
      </button>
    </div>

    <div class="ds-card" style="margin-bottom:20px">
      <div class="ds-toolbar" style="border-bottom:0">
        <div class="ds-toolbar__right" style="gap:8px;flex-wrap:wrap">
          <select v-model="contentType" class="ds-input cm__filter" aria-label="Filter by what it is on" @change="load(1)">
            <option value="">Everything</option>
            <option value="sermon">Sermons</option>
            <option value="video">Videos</option>
            <option value="event">Events</option>
            <option value="announcement">Announcements</option>
          </select>
          <span class="ds-toolbar__count">{{ countLabel }}</span>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="ds-card">
      <div class="ds-card__body" style="display:grid;gap:14px">
        <span v-for="n in 4" :key="n" class="ds-skeleton" style="height:56px"></span>
      </div>
    </div>

    <div v-else-if="rows.length" class="cm__list">
      <article v-for="comment in rows" :key="comment.id" class="ds-card cm__item">
        <div class="ds-card__body">
          <div class="cm__top">
            <span class="ds-badge" :class="statusBadge(comment.status)">{{ statusLabel(comment.status) }}</span>
            <span v-if="comment.reportCount" class="ds-badge ds-badge--danger">
              Flagged by {{ comment.reportCount }}
            </span>
            <span v-if="comment.parentId" class="ds-badge ds-badge--neutral">Reply</span>
            <time class="ds-meta" :datetime="comment.createdAt">{{ $moment(comment.createdAt).fromNow() }}</time>
          </div>

          <p class="cm__on ds-meta">
            On {{ comment.contentType }} — <b>{{ comment.contentTitle || 'no longer available' }}</b>
          </p>

          <p v-if="comment.isRemoved" class="cm__body is-gone">The author withdrew this comment.</p>
          <p v-else class="cm__body"><b>{{ comment.authorName }}</b>: {{ comment.body }}</p>

          <!--
            Why members flagged it. Shown to the office only, and never sent
            back to the member who wrote the comment.
          -->
          <ul v-if="comment.reasons && comment.reasons.length" class="cm__reasons">
            <li v-for="(reason, index) in comment.reasons" :key="index" class="ds-meta">“{{ reason }}”</li>
          </ul>

          <p v-if="comment.moderatedByName" class="ds-help">
            {{ comment.status === 'hidden' ? 'Hidden' : 'Restored' }} by {{ comment.moderatedByName }}
            {{ $moment(comment.moderatedAt).fromNow() }}<span v-if="comment.moderationNote"> — {{ comment.moderationNote }}</span>
          </p>

          <div v-if="!comment.isRemoved" class="cm__actions">
            <button
              v-if="comment.status === 'visible'"
              class="ds-btn ds-btn--secondary ds-btn--sm"
              type="button"
              :disabled="busyId === comment.id"
              @click="hide(comment)"
            >Hide from members</button>
            <button
              v-else-if="comment.status === 'hidden'"
              class="ds-btn ds-btn--secondary ds-btn--sm"
              type="button"
              :disabled="busyId === comment.id"
              @click="show(comment)"
            >Restore</button>
            <button
              v-if="isChurchManager"
              class="ds-btn ds-btn--ghost ds-btn--sm cm__delete"
              type="button"
              :disabled="busyId === comment.id"
              @click="confirmDelete(comment)"
            >Delete permanently</button>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="ds-tablewrap">
      <div class="ds-empty">
        <h3 class="ds-h3">{{ emptyTitle }}</h3>
        <p>{{ emptyNote }}</p>
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
      :open="confirmOpen"
      title="Delete this comment?"
      :message="deleteMessage"
      confirm-label="Delete permanently"
      @confirm="doDelete"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ConfirmDialog from '../../../components/ConfirmDialog'
import { rowsOf, pagingOf, payload, errorMessage, COMMENT_STATUS_LABELS, COMMENT_STATUS_BADGE } from '../../../network/MobileApp'
import { ROLE_CHURCH_MANAGER } from '../../../resources/navigation'

/**
 * Comment moderation.
 *
 * Opens on what members have flagged, because that is the only part that is
 * time-sensitive — everything else can wait. Hiding is the ordinary action and
 * is reversible; deleting is permanent, takes the replies with it, and is
 * therefore Church Manager only and behind a confirmation.
 */
export default {
  name: 'comments',
  components: { ConfirmDialog },
  data () {
    return {
      rows: [],
      paging: { page: 1, totalPages: 0, totalCount: 0 },
      summary: { visible: 0, hidden: 0, awaitingReview: 0 },
      view: 'reported',
      contentType: '',
      isLoading: false,
      isLoadingSummary: false,
      busyId: '',
      confirmOpen: false,
      pendingDelete: null
    }
  },
  computed: {
    ...mapGetters(['loggedInUser']),
    isChurchManager () {
      return this.loggedInUser && this.loggedInUser.data &&
        this.loggedInUser.data.roleId === ROLE_CHURCH_MANAGER
    },
    tiles () {
      return [
        { key: 'reported', label: 'Needs review', value: this.summary.awaitingReview, urgent: true },
        { key: 'visible', label: 'Visible', value: this.summary.visible },
        { key: 'hidden', label: 'Hidden', value: this.summary.hidden }
      ]
    },
    countLabel () {
      if (this.isLoading) { return 'Loading…' }
      return this.paging.totalCount === 1 ? '1 comment' : `${this.paging.totalCount} comments`
    },
    emptyTitle () {
      if (this.view === 'reported') { return 'Nothing to review' }
      return this.view === 'hidden' ? 'Nothing is hidden' : 'No comments yet'
    },
    emptyNote () {
      if (this.view === 'reported') { return 'Comments members flag appear here first.' }
      return this.view === 'hidden'
        ? 'Comments you hide stay here, and can be restored.'
        : 'Comments members leave on sermons, videos, events and announcements appear here.'
    },
    deleteMessage () {
      const replies = this.pendingDelete && this.pendingDelete.replyCount
      return 'This cannot be undone' +
        (replies ? ', and it will take its replies with it.' : '.') +
        ' Hiding it instead keeps it, and can be reversed.'
    }
  },
  beforeMount () {
    this.loadSummary()
    this.load(1)
  },
  methods: {
    statusLabel (status) { return COMMENT_STATUS_LABELS[status] || status },
    statusBadge (status) { return COMMENT_STATUS_BADGE[status] || 'ds-badge--neutral' },
    setView (view) {
      this.view = view
      this.load(1)
    },
    loadSummary () {
      this.isLoadingSummary = true
      this.$axios.get('admin/comments/summary')
        .then(response => {
          this.summary = payload(response) || this.summary
          this.isLoadingSummary = false
        })
        .catch(() => { this.isLoadingSummary = false })
    },
    load (page = 1) {
      this.isLoading = true

      const params = { Page: page, PageSize: 25 }
      if (this.contentType) { params.ContentType = this.contentType }
      if (this.view === 'reported') { params.Reported = true }
      if (this.view === 'visible') { params.Status = 'visible' }
      if (this.view === 'hidden') { params.Status = 'hidden' }

      this.$axios.get('admin/comments', { params })
        .then(response => {
          this.rows = rowsOf(response)
          this.paging = pagingOf(response, page)
          this.isLoading = false
        })
        .catch(error => {
          this.rows = []
          this.isLoading = false
          this.$toast.error(errorMessage(error, 'Could not load comments.'))
        })
    },
    hide (comment) {
      const note = window.prompt('Why is this being hidden? (kept for the office, never shown to members)')
      // Cancelling the prompt should cancel the action, not hide it with no reason.
      if (note === null) { return }

      this.act(comment, this.$axios.post(`admin/comments/${comment.id}/hide`, { note }), 'Comment hidden')
    },
    show (comment) {
      this.act(comment, this.$axios.post(`admin/comments/${comment.id}/show`), 'Comment restored')
    },
    confirmDelete (comment) {
      this.pendingDelete = comment
      this.confirmOpen = true
    },
    doDelete () {
      const comment = this.pendingDelete
      this.confirmOpen = false
      if (!comment) { return }

      this.act(comment, this.$axios.delete(`admin/comments/${comment.id}`), 'Comment deleted')
    },
    act (comment, request, message) {
      this.busyId = comment.id

      request
        .then(() => {
          this.$toast.success(message)
          this.busyId = ''
          this.loadSummary()
          this.load(this.paging.page)
        })
        .catch(error => {
          this.busyId = ''
          this.$toast.error(errorMessage(error, 'Could not do that.'))
        })
    }
  }
}
</script>

<style scoped>
.cm__stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px; }

.cm__stat {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  text-align: left;
  cursor: pointer;
  border: 1px solid var(--ds-border);
}
.cm__stat.is-active { border-color: var(--ds-text); }
.cm__statnum { font-size: 26px; font-weight: 600; font-variant-numeric: tabular-nums; }
.cm__statnum.is-urgent { color: var(--ds-danger, #b42318); }

.cm__filter { max-width: 190px; }

.cm__list { display: grid; gap: 12px; }
.cm__top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
.cm__on { margin: 0 0 8px; }
.cm__body { margin: 0 0 10px; overflow-wrap: anywhere; }
.cm__body.is-gone { color: var(--ds-text-muted); font-style: italic; }
.cm__reasons { margin: 0 0 10px; padding-left: 18px; display: grid; gap: 2px; }
.cm__actions { display: flex; gap: 8px; flex-wrap: wrap; }
.cm__delete { color: var(--ds-danger, #b42318); }
</style>
