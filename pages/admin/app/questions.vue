<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Event questions</h1>
        <p>What members ask on events in the app. A question only appears to other members once it is published here.</p>
      </div>
    </div>

    <div class="ds-card" style="margin-bottom:20px">
      <div class="ds-toolbar" style="border-bottom:0">
        <div class="ds-segment">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="ds-tab"
            :class="{ 'is-active': state === tab.value }"
            type="button"
            @click="setState(tab.value)"
          >{{ tab.label }}</button>
        </div>
        <div class="ds-toolbar__right">
          <span class="ds-toolbar__count">{{ countLabel }}</span>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="ds-card">
      <div class="ds-card__body" style="display:grid;gap:14px">
        <span v-for="n in 3" :key="n" class="ds-skeleton" style="height:84px"></span>
      </div>
    </div>

    <div v-else-if="rows.length" class="eq__list">
      <article v-for="question in rows" :key="question.id" class="ds-card">
        <div class="ds-card__body eq__body">
          <div class="eq__top">
            <span class="ds-badge" :class="badge(question).cls">{{ badge(question).label }}</span>
            <span class="eq__event">{{ question.eventTitle || 'An event no longer listed' }}</span>
            <time class="ds-meta" :datetime="question.createdAt">{{ $moment(question.createdAt).fromNow() }}</time>
          </div>

          <p class="eq__question"><b>{{ question.userName || 'A member' }}</b> asked: {{ question.question }}</p>

          <p v-if="question.answer && editingId !== question.id" class="eq__answer">
            <span class="ds-meta">Answered by {{ question.answeredBy }}:</span> {{ question.answer }}
          </p>

          <div v-if="editingId === question.id" class="eq__form">
            <label class="ds-label" :for="`answer-${question.id}`">Your answer</label>
            <textarea :id="`answer-${question.id}`" v-model="draft" class="ds-textarea" rows="3"
                      placeholder="Members see this under the question. The member who asked is notified."></textarea>
            <div class="eq__actions">
              <button class="ds-btn ds-btn--primary ds-btn--sm" type="button" :disabled="!draft.trim() || busyId === question.id"
                      @click="save(question, draft.trim(), true)">Answer and publish</button>
              <button class="ds-btn ds-btn--ghost ds-btn--sm" type="button" @click="editingId = null">Cancel</button>
            </div>
          </div>

          <div v-else class="eq__actions">
            <button class="ds-btn ds-btn--primary ds-btn--sm" type="button" :disabled="busyId === question.id"
                    @click="edit(question)">{{ question.answer ? 'Edit answer' : 'Answer' }}</button>
            <button v-if="!question.isApproved" class="ds-btn ds-btn--secondary ds-btn--sm" type="button"
                    :disabled="busyId === question.id" @click="save(question, question.answer || null, true)">
              Publish without an answer
            </button>
            <button v-if="question.isApproved || !question.answeredAt" class="ds-btn ds-btn--ghost ds-btn--sm" type="button"
                    :disabled="busyId === question.id" @click="save(question, question.answer || null, false)">
              Hide
            </button>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="ds-tablewrap">
      <div class="ds-empty">
        <h3 class="ds-h3">{{ state === 'pending' ? 'No questions waiting' : 'No questions here' }}</h3>
        <p>Questions members ask on an event in the app arrive here.</p>
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
  </div>
</template>

<script>
import { rowsOf, pagingOf, errorMessage } from '../../../network/MobileApp'

export default {
  name: 'AdminAppQuestions',
  data () {
    return {
      rows: [],
      paging: { page: 1, totalPages: 0, totalCount: 0 },
      isLoading: false,
      state: 'pending',
      editingId: null,
      draft: '',
      busyId: null,
      tabs: [
        { value: 'pending', label: 'Waiting' },
        { value: 'answered', label: 'Dealt with' },
        { value: 'all', label: 'All' }
      ]
    }
  },
  computed: {
    countLabel () {
      if (this.isLoading) { return 'Loading…' }
      const count = this.paging.totalCount
      return count === 1 ? '1 question' : `${count} questions`
    }
  },
  beforeMount () {
    this.load(1)
  },
  methods: {
    badge (question) {
      if (!question.answeredAt) { return { label: 'Waiting', cls: 'ds-badge--warning' } }
      if (!question.isApproved) { return { label: 'Hidden', cls: 'ds-badge--neutral' } }
      return question.answer
        ? { label: 'Answered', cls: 'ds-badge--success' }
        : { label: 'Published', cls: 'ds-badge--info' }
    },
    setState (value) {
      this.state = value
      this.load(1)
    },
    load (page = 1) {
      this.isLoading = true
      this.$axios.get('admin/events/questions', { params: { State: this.state, Page: page, PageSize: 20 } }).then(response => {
        this.rows = rowsOf(response)
        this.paging = pagingOf(response, page)
        this.isLoading = false
      }).catch(error => {
        this.rows = []
        this.isLoading = false
        this.$toast.error(errorMessage(error, 'Could not load the questions.'))
      })
    },
    edit (question) {
      this.editingId = question.id
      this.draft = question.answer || ''
    },
    save (question, answer, publish) {
      this.busyId = question.id
      this.$axios.put(`admin/events/questions/${question.id}`, { answer, isApproved: publish }).then(() => {
        this.busyId = null
        this.editingId = null
        this.$toast.success(!publish ? 'Question hidden' : answer ? 'Answered — the member has been notified' : 'Question published')
        this.load(this.paging.page)
      }).catch(error => {
        this.busyId = null
        this.$toast.error(errorMessage(error, 'Could not save that.'))
      })
    }
  }
}
</script>

<style scoped>
.eq__list { display: grid; gap: 14px; }
.eq__body { display: grid; gap: 10px; }
.eq__top { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.eq__event { font-weight: 600; }
.eq__question, .eq__answer { margin: 0; overflow-wrap: anywhere; }
.eq__answer { padding: 10px 12px; border-radius: var(--ds-radius-md); background: var(--ds-surface-2); }
.eq__form { display: grid; gap: 8px; }
.eq__actions { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
