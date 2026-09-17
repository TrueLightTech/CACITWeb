<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Push Messages</h1>
        <p>Manage and deliver notifications directly to congregants' phones via Firebase Cloud Messaging.</p>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="ph__tabs" role="tablist" aria-label="Push Message sections">
      <button
        class="ph__tab"
        :class="{ 'is-active': activeTab === 'compose' }"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'compose'"
        @click="activeTab = 'compose'"
      >
        Send Broadcast
      </button>
      <button
        class="ph__tab"
        :class="{ 'is-active': activeTab === 'history' }"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'history'"
        @click="activeTab = 'history'; loadHistory()"
      >
        Broadcast History ({{ historyTotal }})
      </button>
      <button
        class="ph__tab"
        :class="{ 'is-active': activeTab === 'test' }"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'test'"
        @click="activeTab = 'test'"
      >
        Test Device Delivery
      </button>
    </div>

    <!-- TAB 1: COMPOSE BROADCAST -->
    <div v-show="activeTab === 'compose'" class="ph__layout">
      <form class="ds-card ph__form" @submit.prevent="review">
        <div class="ds-card__head">
          <h2 class="ds-h3">Write the message</h2>
        </div>

        <div class="ds-card__body">
          <AiAssist
            resource="push"
            noun="message"
            :current="aiCurrent"
            :has-content="!!form.title"
            @apply="applyDraft"
          />

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.title }">
            <label class="ds-label" for="pushTitle">Title</label>
            <input id="pushTitle" v-model="form.title" class="ds-input" type="text" maxlength="60">
            <span class="ds-help"><b>{{ form.title.length }}/60</b> — this is the bold line on the lock screen.</span>
            <span v-if="showErrors && !form.title" class="ds-error">Give the message a title.</span>
          </div>

          <div class="ds-field" :class="{ 'is-invalid': showErrors && !form.body }">
            <label class="ds-label" for="pushBody">Message</label>
            <textarea id="pushBody" v-model="form.body" class="ds-textarea" rows="4" maxlength="180"></textarea>
            <span class="ds-help"><b>{{ form.body.length }}/180</b> — phones cut off longer messages.</span>
            <span v-if="showErrors && !form.body" class="ds-error">Write the message.</span>
          </div>

          <div class="ds-field">
            <label class="ds-label" for="pushAudience">Who gets it</label>
            <select id="pushAudience" v-model="form.audienceFamilyId" class="ds-select" @change="loadAudience">
              <option value="">Everyone</option>
              <option v-for="family in families" :key="family.id" :value="family.id">
                {{ family.name }} family group
              </option>
            </select>
            <span class="ds-help">Family groups are the only segment for now.</span>
          </div>

          <div class="ds-field" style="margin-bottom:0">
            <label class="ds-label" for="pushCategory">Category</label>
            <select id="pushCategory" v-model="form.category" class="ds-select">
              <option value="general">General</option>
              <option value="announcement">Announcement</option>
              <option value="event">Event</option>
              <option value="sermon">Sermon</option>
              <option value="live">Live service</option>
            </select>
            <span class="ds-help">Groups it in the member's notification list.</span>
          </div>
        </div>

        <div class="ds-card__foot" style="display:flex;justify-content:flex-end">
          <button class="ds-btn ds-btn--primary" type="submit" :disabled="isSending">
            Review and send
          </button>
        </div>
      </form>

      <aside class="ph__side">
        <!-- What it looks like on a phone -->
        <section class="ds-card">
          <div class="ds-card__head"><h2 class="ds-h3">On a phone</h2></div>
          <div class="ds-card__body">
            <div class="ph__preview">
              <div class="ph__app">
                <span class="ph__appmark">CT</span>
                <span class="ph__appname">CACI Taifa</span>
                <span class="ph__now">now</span>
              </div>
              <p class="ph__ptitle">{{ form.title || 'Your title' }}</p>
              <p class="ph__pbody">{{ form.body || 'Your message appears here.' }}</p>
            </div>
          </div>
        </section>

        <section class="ds-card">
          <div class="ds-card__head"><h2 class="ds-h3">Who this reaches</h2></div>
          <div class="ds-card__body">
            <div v-if="isLoadingAudience" class="ds-skeleton" style="height:44px"></div>
            <template v-else>
              <p class="ph__count ds-num">{{ audience.memberCount }}</p>
              <p class="ds-muted ph__countlabel">
                members in {{ audience.audienceLabel || 'the whole congregation' }}
              </p>
              <p class="ds-help ph__devices">
                {{ audience.deviceCount }} of them have the app installed with notifications on.
              </p>
            </template>
          </div>
        </section>
      </aside>
    </div>

    <!-- TAB 2: BROADCAST HISTORY -->
    <div v-show="activeTab === 'history'" class="ph__history-tab">
      <div class="ds-card">
        <div class="ds-card__head" style="display:flex;justify-content:space-between;align-items:center">
          <h2 class="ds-h3">Recent Broadcasts</h2>
          <button class="ds-btn ds-btn--ghost ds-btn--sm" type="button" :disabled="isLoadingHistory" @click="loadHistory">
            Refresh
          </button>
        </div>

        <div v-if="isLoadingHistory" class="ds-card__body" style="display:grid;gap:12px">
          <div v-for="n in 4" :key="n" class="ds-skeleton" style="height:56px;border-radius:6px"></div>
        </div>

        <div v-else-if="!historyItems.length" class="ds-card__body" style="text-align:center;padding:48px 16px">
          <p class="ds-muted" style="font-size:16px;margin:0 0 8px">No broadcasts sent yet.</p>
          <p class="ds-help" style="margin:0">Messages broadcasted to the church will appear here for auditing.</p>
        </div>

        <div v-else class="ds-table-wrap">
          <table class="ds-table">
            <thead>
              <tr>
                <th style="width:140px">Date & Time</th>
                <th style="width:110px">Category</th>
                <th>Title & Message</th>
                <th style="width:140px">Audience</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in historyItems" :key="item.id">
                <td class="ds-muted" style="font-size:12.5px;white-space:nowrap">
                  {{ formatDate(item.createdAt) }}
                </td>
                <td>
                  <span class="ph__badge" :class="'ph__badge--' + (item.category || 'general')">
                    {{ item.category || 'general' }}
                  </span>
                </td>
                <td>
                  <strong style="display:block;margin-bottom:2px">{{ item.title }}</strong>
                  <span class="ds-muted" style="font-size:13px;display:block;max-width:550px">
                    {{ item.body }}
                  </span>
                </td>
                <td>
                  <span class="ds-muted" style="font-size:12.5px">
                    {{ item.audienceFamilyId ? 'Family Group' : 'All Members' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 3: TEST DEVICE DELIVERY -->
    <div v-show="activeTab === 'test'" class="ph__test-tab">
      <div class="ds-card" style="max-width:680px">
        <div class="ds-card__head">
          <h2 class="ds-h3">Send a Test Push to a Device</h2>
          <p class="ds-help" style="margin-top:4px">
            Verifies live delivery from Firebase Cloud Messaging to an iOS or Android device token.
          </p>
        </div>

        <form class="ds-card__body" @submit.prevent="runTestPush">
          <div class="ds-field" :class="{ 'is-invalid': testErrors && !testForm.deviceToken }">
            <label class="ds-label" for="testToken">FCM Device Token</label>
            <textarea
              id="testToken"
              v-model="testForm.deviceToken"
              class="ds-textarea"
              rows="3"
              placeholder="Paste FCM registration token (from device or debug console)"
            ></textarea>
            <span class="ds-help">The unique token generated by the handset when the app starts.</span>
            <span v-if="testErrors && !testForm.deviceToken" class="ds-error">Please enter a device token.</span>
          </div>

          <div class="ds-field">
            <label class="ds-label" for="testTitle">Test Title</label>
            <input
              id="testTitle"
              v-model="testForm.title"
              class="ds-input"
              type="text"
              placeholder="Test Notification"
            >
          </div>

          <div class="ds-field" style="margin-bottom:0">
            <label class="ds-label" for="testBody">Test Message</label>
            <textarea
              id="testBody"
              v-model="testForm.body"
              class="ds-textarea"
              rows="2"
              placeholder="Hello from CACI Taifa Admin Portal!"
            ></textarea>
          </div>

          <!-- Result feedback -->
          <div v-if="testResult" class="ph__test-result" :class="{ 'is-success': testResult.success, 'is-failure': !testResult.success }">
            <div style="font-weight:600;display:flex;align-items:center;gap:6px">
              <span>{{ testResult.success ? '✓ Delivery Succeeded' : '✕ Delivery Failed' }}</span>
            </div>
            <div v-if="testResult.messageId" style="font-family:monospace;font-size:12px;margin-top:4px">
              FCM Message ID: {{ testResult.messageId }}
            </div>
            <div v-if="testResult.error" style="margin-top:4px;font-size:13px">
              Reason: {{ testResult.error }}
            </div>
          </div>

          <div style="margin-top:20px;display:flex;justify-content:flex-end">
            <button class="ds-btn ds-btn--primary" type="submit" :disabled="isTestingPush">
              <span v-if="isTestingPush" class="ds-btn__spinner"></span>
              {{ isTestingPush ? 'Transmitting...' : 'Send Test Notification' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirmation Dialog for Broadcast -->
    <ConfirmDialog
      :open="confirmOpen"
      :busy="isSending"
      title="Send this now?"
      :message="confirmMessage"
      confirm-label="Send the message"
      :destructive="false"
      @cancel="confirmOpen = false"
      @confirm="send"
    />
  </div>
</template>

<script>
import ConfirmDialog from '../../../components/ConfirmDialog'
import AiAssist from '../../../components/AiAssist'
import { payload, errorMessage } from '../../../network/MobileApp'

export default {
  name: 'AdminAppPush',
  components: { AiAssist, ConfirmDialog },
  data () {
    return {
      activeTab: 'compose',
      families: [],
      audience: { memberCount: 0, deviceCount: 0, audienceLabel: '' },
      isLoadingAudience: false,
      isSending: false,
      showErrors: false,
      confirmOpen: false,
      form: {
        title: '',
        body: '',
        category: 'general',
        audienceFamilyId: ''
      },
      // Broadcast history
      historyItems: [],
      historyTotal: 0,
      isLoadingHistory: false,
      // Test push
      testForm: {
        deviceToken: '',
        title: 'Test Notification',
        body: 'Hello from CACI Taifa Admin Portal!'
      },
      testErrors: false,
      isTestingPush: false,
      testResult: null
    }
  },
  computed: {
    aiCurrent () {
      return { title: this.form.title, body: this.form.body }
    },
    confirmMessage () {
      const count = this.audience.memberCount
      const where = this.audience.audienceLabel || 'the whole congregation'
      const people = count === 1 ? '1 member' : `${count} members`
      return `"${this.form.title}" goes to ${people} in ${where}. A push cannot be taken back once it is sent.`
    }
  },
  beforeMount () {
    this.loadFamilies()
    this.loadAudience()
    this.loadHistory()
  },
  methods: {
    applyDraft (fields) {
      const set = (key, value) => { if (value !== undefined && value !== null && value !== '') { this.$set(this.form, key, value) } }
      set('title', fields.title)
      set('body', fields.body)
      set('category', fields.category)
    },
    loadFamilies () {
      this.$axios.get('churchfamilies')
        .then(response => { this.families = payload(response) || [] })
        .catch(() => { this.families = [] })
    },
    loadAudience () {
      this.isLoadingAudience = true

      const params = {}
      if (this.form.audienceFamilyId) { params.familyId = this.form.audienceFamilyId }

      this.$axios.get('admin/push/audience', { params }).then(response => {
        this.audience = payload(response) || { memberCount: 0, deviceCount: 0 }
        this.isLoadingAudience = false
      }).catch(() => {
        this.audience = { memberCount: 0, deviceCount: 0, audienceLabel: '' }
        this.isLoadingAudience = false
      })
    },
    loadHistory () {
      this.isLoadingHistory = true
      this.$axios.get('admin/push', { params: { PageSize: 30 } })
        .then(response => {
          const data = payload(response) || {}
          this.historyItems = data.results || []
          this.historyTotal = data.totalCount || this.historyItems.length
          this.isLoadingHistory = false
        })
        .catch(() => {
          this.historyItems = []
          this.isLoadingHistory = false
        })
    },
    formatDate (val) {
      if (!val) { return '' }
      const d = new Date(val)
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    review () {
      if (!this.form.title || !this.form.body) {
        this.showErrors = true
        return
      }
      this.showErrors = false
      this.confirmOpen = true
    },
    send () {
      this.isSending = true

      this.$axios.post('admin/push', {
        title: this.form.title.trim(),
        body: this.form.body.trim(),
        category: this.form.category,
        audienceFamilyId: this.form.audienceFamilyId || null
      }).then(response => {
        const result = payload(response) || {}
        this.isSending = false
        this.confirmOpen = false
        this.$toast.success(`Sent to ${result.membersNotified || 0} members`)
        this.form.title = ''
        this.form.body = ''
        this.loadHistory()
      }).catch(error => {
        this.isSending = false
        this.confirmOpen = false
        this.$toast.error(errorMessage(error, 'Could not send that message.'))
      })
    },
    runTestPush () {
      if (!this.testForm.deviceToken) {
        this.testErrors = true
        return
      }
      this.testErrors = false
      this.isTestingPush = true
      this.testResult = null

      this.$axios.post('admin/push/test', {
        deviceToken: this.testForm.deviceToken.trim(),
        title: this.testForm.title.trim(),
        body: this.testForm.body.trim()
      }).then(response => {
        const data = payload(response) || {}
        this.testResult = data
        this.isTestingPush = false
        if (data.success) {
          this.$toast.success('Test notification delivered!')
        } else {
          this.$toast.error(data.error || 'Failed to deliver test notification.')
        }
      }).catch(err => {
        this.isTestingPush = false
        this.testResult = { success: false, error: errorMessage(err, 'Failed to call test endpoint') }
        this.$toast.error('Test delivery request failed.')
      })
    }
  }
}
</script>

<style scoped>
.ph__tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--ds-border);
  margin-bottom: 24px;
}

.ph__tab {
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 600;
  color: var(--ds-text-muted);
  cursor: pointer;
  transition: color .15s, border-color .15s;
}

.ph__tab:hover {
  color: var(--ds-text);
}

.ph__tab.is-active {
  color: var(--ds-primary);
  border-bottom-color: var(--ds-primary);
}

.ph__layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 320px); gap: 20px; align-items: start; }
@media (max-width: 900px) { .ph__layout { grid-template-columns: 1fr; } }

.ph__side { display: grid; gap: 20px; }

.ph__preview {
  border-radius: 14px;
  padding: 13px 15px;
  background: var(--ds-surface-2);
  border: 1px solid var(--ds-border);
}
.ph__app { display: flex; align-items: center; gap: 7px; margin-bottom: 7px; }
.ph__appmark {
  width: 18px; height: 18px; border-radius: 4px;
  background: var(--ds-primary); color: #fff;
  font-size: 9px; font-weight: 700; display: grid; place-items: center;
}
.ph__appname { font-size: 11.5px; font-weight: 600; color: var(--ds-text-muted); }
.ph__now { font-size: 11.5px; color: var(--ds-text-muted); margin-left: auto; }
.ph__ptitle { margin: 0 0 2px; font-weight: 600; font-size: 14px; overflow-wrap: anywhere; }
.ph__pbody { margin: 0; font-size: 13.5px; color: var(--ds-text-muted); overflow-wrap: anywhere; }

.ph__count { margin: 0; font-size: 34px; font-weight: 700; line-height: 1; }
.ph__countlabel { margin: 6px 0 0; font-size: var(--ds-text-sm); }
.ph__devices { margin: 10px 0 0; }

.ph__badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .04em;
  padding: 3px 7px;
  border-radius: 4px;
  background: var(--ds-surface-2);
  color: var(--ds-text-muted);
}
.ph__badge--announcement { background: #eef2ff; color: #4338ca; }
.ph__badge--giving { background: #ecfdf5; color: #047857; }
.ph__badge--event { background: #fef3c7; color: #b45309; }
.ph__badge--sermon { background: #fae8ff; color: #86198f; }
.ph__badge--live { background: #fee2e2; color: #b91c1c; }

.ph__test-result {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid var(--ds-border);
}
.ph__test-result.is-success {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #166534;
}
.ph__test-result.is-failure {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}
</style>
