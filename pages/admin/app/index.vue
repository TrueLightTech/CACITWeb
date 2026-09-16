<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">App Overview</h1>
        <p>What the member app is showing right now, and what is waiting to go out.</p>
      </div>
      <div class="ds-page-head__actions">
        <button class="ds-btn ds-btn--secondary" type="button" :disabled="isLoading" @click="load">
          <span v-if="isLoading" class="ds-btn__spinner"></span>
          Refresh
        </button>
      </div>
    </div>

    <!-- Live right now — the most time-critical thing on the page -->
    <section class="ds-card ao__live" :class="{ 'is-live': live.isLive }">
      <div class="ds-card__body ao__liverow">
        <div class="ao__livecopy">
          <span class="ao__livelabel">
            <span class="ao__dot" :class="{ 'is-on': live.isLive }"></span>
            {{ live.isLive ? 'On air now' : 'Not broadcasting' }}
          </span>
          <h2 class="ds-h2 ao__livetitle">
            {{ live.isLive ? (live.title || 'Live service') : 'Nothing is streaming' }}
          </h2>
          <p class="ds-muted ao__livesub">
            <template v-if="live.isLive">
              {{ live.subtitle }}<template v-if="live.startedAt"> · started {{ $moment(live.startedAt).fromNow() }}</template>
            </template>
            <template v-else-if="live.nextServiceAt">
              Next service {{ $moment(live.nextServiceAt).format('dddd D MMMM, HH:mm') }}
            </template>
            <template v-else>No service scheduled.</template>
          </p>
        </div>
        <div v-if="isChurchManager" class="ao__liveactions">
          <NuxtLink
            class="ds-btn"
            :class="live.isLive ? 'ds-btn--danger' : 'ds-btn--primary'"
            to="/admin/app/live"
          >
            {{ live.isLive ? 'End the broadcast' : 'Go live' }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Publish something -->
    <section class="ao__section">
      <div class="ds-section__head">
        <div>
          <h2 class="ds-h2">Publish something</h2>
          <p class="ds-muted" style="margin:4px 0 0;font-size:var(--ds-text-sm)">
            The six things the office puts into the app.
          </p>
        </div>
      </div>
      <div class="ao__actions">
        <NuxtLink v-for="action in publishActions" :key="action.to" class="ao__action" :to="action.to">
          <span class="ao__actionicon"><NavIcon :name="action.icon" /></span>
          <span class="ao__actioncopy">
            <span class="ao__actionlabel">{{ action.label }}</span>
            <span class="ao__actionhint">{{ action.hint }}</span>
          </span>
        </NuxtLink>
      </div>
    </section>

    <div class="ao__grid">
      <!-- Needs attention -->
      <section class="ds-card">
        <div class="ds-card__head">
          <h2 class="ds-h3">Needs attention</h2>
        </div>
        <div class="ds-card__body">
          <div v-if="isLoading" style="display:grid;gap:10px">
            <span v-for="n in 3" :key="n" class="ds-skeleton" style="height:36px"></span>
          </div>
          <ul v-else-if="attention.length" class="ao__list">
            <li v-for="(item, index) in attention" :key="item.id || index" class="ao__item">
              <span class="ds-status" :class="severityClass(item.severity)">
                <span class="ds-status__dot"></span>
              </span>
              <span class="ao__itemcopy">
                <NuxtLink v-if="item.editPath" class="ao__itemtitle" :to="item.editPath">{{ item.title }}</NuxtLink>
                <span v-else class="ao__itemtitle">{{ item.title }}</span>
                <span class="ao__itemhint">{{ item.reason }}</span>
              </span>
            </li>
          </ul>
          <p v-else class="ds-muted ao__none">Nothing needs looking at.</p>
        </div>
      </section>

      <!-- Publishing queue -->
      <section class="ds-card">
        <div class="ds-card__head">
          <h2 class="ds-h3">Publishing queue</h2>
        </div>
        <div class="ds-card__body">
          <div v-if="isLoading" style="display:grid;gap:10px">
            <span v-for="n in 3" :key="n" class="ds-skeleton" style="height:36px"></span>
          </div>
          <template v-else>
            <h3 v-if="scheduled.length" class="ao__subhead">Scheduled</h3>
            <ul v-if="scheduled.length" class="ao__list">
              <li v-for="item in scheduled" :key="item.id" class="ao__item">
                <span class="ds-badge ds-badge--warning">{{ item.resourceType }}</span>
                <span class="ao__itemcopy">
                  <NuxtLink class="ao__itemtitle" :to="item.editPath">{{ item.title || 'Untitled' }}</NuxtLink>
                  <span class="ao__itemhint">
                    Goes live {{ $moment(item.publishAt).format('ddd D MMM, HH:mm') }}
                    ({{ $moment(item.publishAt).fromNow() }})
                  </span>
                </span>
              </li>
            </ul>

            <h3 v-if="drafts.length" class="ao__subhead">Drafts</h3>
            <ul v-if="drafts.length" class="ao__list">
              <li v-for="item in drafts" :key="item.id" class="ao__item">
                <span class="ds-badge ds-badge--neutral">{{ item.resourceType }}</span>
                <span class="ao__itemcopy">
                  <NuxtLink class="ao__itemtitle" :to="item.editPath">{{ item.title || 'Untitled' }}</NuxtLink>
                  <span class="ao__itemhint">Not published</span>
                </span>
              </li>
            </ul>

            <p v-if="!scheduled.length && !drafts.length" class="ds-muted ao__none">
              Nothing waiting. Everything written is live.
            </p>
          </template>
        </div>
      </section>
    </div>

    <!-- This week -->
    <section class="ao__section">
      <div class="ds-section__head">
        <div>
          <h2 class="ds-h2">This week in the app</h2>
          <p class="ds-muted" style="margin:4px 0 0;font-size:var(--ds-text-sm)">
            <template v-if="stats.from">
              {{ $moment(stats.from).format('D MMM') }} to {{ $moment(stats.to).format('D MMM') }}.
            </template>
            Counted from what members actually did — nothing here is estimated.
          </p>
        </div>
      </div>
      <div class="ds-metrics">
        <div v-for="metric in metrics" :key="metric.label" class="ds-metric">
          <span class="ds-metric__label">{{ metric.label }}</span>
          <span class="ds-metric__value ds-num">{{ metric.value }}</span>
          <span class="ds-metric__foot">{{ metric.foot }}</span>
        </div>
      </div>
    </section>

    <!-- Recent activity -->
    <section class="ao__section">
      <div class="ds-section__head">
        <div>
          <h2 class="ds-h2">Recent activity</h2>
          <p class="ds-muted" style="margin:4px 0 0;font-size:var(--ds-text-sm)">
            Who published or changed what.
          </p>
        </div>
      </div>
      <div class="ds-tablewrap">
        <div v-if="isLoading" class="ds-card__body" style="display:grid;gap:10px">
          <span v-for="n in 4" :key="n" class="ds-skeleton" style="height:22px"></span>
        </div>
        <ul v-else-if="activity.length" class="ao__feed">
          <li v-for="entry in activity" :key="entry.id" class="ao__feeditem">
            <span class="ao__feedwhen">{{ $moment(entry.createdAt).fromNow() }}</span>
            <span class="ao__feedwhat">{{ entry.summary }}</span>
            <span class="ao__feedwho">{{ entry.actorName }}</span>
          </li>
        </ul>
        <div v-else class="ds-empty">
          <h3 class="ds-h3">Nothing yet</h3>
          <p>Changes to app content show up here as they happen.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NavIcon from '../../../components/NavIcon'
import { payload, errorMessage } from '../../../network/MobileApp'
import { ROLE_CHURCH_MANAGER } from '../../../resources/navigation'

/**
 * The page the office lands on: what can I do to the app, and what state is it
 * in right now — without hunting through the sidebar for it.
 */
export default {
  name: 'AppOverview',
  components: { NavIcon },
  data () {
    return {
      isLoading: false,
      live: { isLive: false },
      scheduled: [],
      drafts: [],
      attention: [],
      stats: {},
      activity: []
    }
  },
  computed: {
    ...mapGetters(['loggedInUser']),
    isChurchManager () {
      return this.loggedInUser && this.loggedInUser.data &&
        this.loggedInUser.data.roleId === ROLE_CHURCH_MANAGER
    },
    publishActions () {
      return [
        { to: '/admin/app/sermons/new', icon: 'sermon', label: 'New sermon', hint: 'Video, audio or both' },
        { to: '/admin/app/shorts/new', icon: 'shorts', label: 'New short', hint: 'A clip, flyer or verse' },
        { to: '/admin/app/events/new', icon: 'calendar', label: 'New event', hint: 'Dates and attendance' },
        { to: '/admin/announcements/new', icon: 'announcement', label: 'New announcement', hint: 'Goes to every member' },
        { to: '/admin/app/videos/new', icon: 'video', label: 'New video', hint: 'Choir, testimonies, church life' },
        { to: '/admin/app/push', icon: 'push', label: 'Send a message', hint: 'Push to the congregation' }
      ]
    },
    metrics () {
      const stats = this.stats || {}
      return [
        { label: 'Sermons published', value: stats.sermonsPublished || 0, foot: 'in the last 7 days' },
        { label: 'Shorts published', value: stats.shortsPublished || 0, foot: 'in the last 7 days' },
        { label: 'Shorts watched', value: stats.shortViews || 0, foot: 'by members' },
        { label: 'Event sign-ups', value: stats.eventAttendances || 0, foot: 'members going' },
        { label: 'Requests sent', value: stats.requestsSubmitted || 0, foot: 'to the office' },
        { label: 'New members', value: stats.newMembers || 0, foot: 'joined the app' }
      ]
    }
  },
  beforeMount () {
    this.load()
  },
  methods: {
    severityClass (severity) {
      return {
        urgent: 'ds-status--danger',
        warning: 'ds-status--warning'
      }[severity] || 'ds-status--neutral'
    },
    load () {
      this.isLoading = true

      this.$axios.get('admin/app/overview').then(response => {
        const data = payload(response) || {}
        this.live = data.live || { isLive: false }
        this.scheduled = data.scheduled || []
        this.drafts = data.drafts || []
        this.attention = data.needsAttention || []
        this.stats = data.thisWeek || {}
        this.activity = data.recentActivity || []
        this.isLoading = false
      }).catch(error => {
        this.isLoading = false
        this.$toast.error(errorMessage(error, 'Could not load the overview.'))
      })
    }
  }
}
</script>

<style scoped>
.ao__section { margin-top: 28px; }

.ao__live { margin-bottom: 4px; border-left: 3px solid var(--ds-border); }
.ao__live.is-live { border-left-color: #b02b26; }

.ao__liverow { display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap; }
.ao__livecopy { min-width: 0; }
.ao__livelabel {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 11.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
  color: var(--ds-text-muted);
}
.ao__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--ds-border-strong, #bfc8d8); }
.ao__dot.is-on { background: #b02b26; box-shadow: 0 0 0 3px rgba(176, 43, 38, .18); }
.ao__livetitle { margin: 6px 0 2px; }
.ao__livesub { margin: 0; font-size: var(--ds-text-sm); }
.ao__liveactions { flex-shrink: 0; }

.ao__actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; }
.ao__action {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--ds-border); border-radius: 8px;
  background: var(--ds-surface); color: inherit; text-decoration: none;
}
.ao__action:hover { border-color: var(--ds-primary); }
.ao__actionicon {
  width: 34px; height: 34px; flex-shrink: 0;
  display: grid; place-items: center;
  border-radius: 7px; background: var(--ds-surface-2); color: var(--ds-primary);
}
.ao__actionicon >>> .ds-navlink__icon { width: 18px; height: 18px; }
.ao__actioncopy { display: grid; gap: 1px; min-width: 0; }
.ao__actionlabel { font-weight: 500; }
.ao__actionhint { font-size: var(--ds-text-sm); color: var(--ds-text-muted); }

.ao__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(330px, 1fr)); gap: 20px; margin-top: 28px; }

.ao__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
.ao__item { display: flex; align-items: flex-start; gap: 10px; }
.ao__itemcopy { display: grid; gap: 2px; min-width: 0; }
.ao__itemtitle { font-weight: 500; color: inherit; text-decoration: none; overflow-wrap: anywhere; }
a.ao__itemtitle:hover { text-decoration: underline; }
.ao__itemhint { font-size: var(--ds-text-sm); color: var(--ds-text-muted); }
.ao__subhead {
  font-size: 11.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
  color: var(--ds-text-muted); margin: 0 0 10px;
}
.ao__list + .ao__subhead { margin-top: 18px; }
.ao__none { margin: 0; font-size: var(--ds-text-sm); }

.ao__feed { list-style: none; margin: 0; padding: 0; }
.ao__feeditem {
  display: grid;
  grid-template-columns: 110px 1fr auto;
  gap: 14px;
  align-items: baseline;
  padding: 11px 16px;
  border-bottom: 1px solid var(--ds-border);
  font-size: var(--ds-text-base);
}
.ao__feeditem:last-child { border-bottom: 0; }
.ao__feedwhen { color: var(--ds-text-muted); font-size: var(--ds-text-sm); }
.ao__feedwhat { overflow-wrap: anywhere; }
.ao__feedwho { color: var(--ds-text-muted); font-size: var(--ds-text-sm); white-space: nowrap; }

@media (max-width: 720px) {
  .ao__feeditem { grid-template-columns: 1fr; gap: 3px; }
}
</style>
