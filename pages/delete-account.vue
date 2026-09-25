<template>
  <div class="deletion">
    <PublicHeader />

    <main id="main" class="pub-main">
      <header class="pub-pagehead">
        <div class="pub-container pub-pagehead__inner">
          <p class="pub-eyebrow">Your account</p>
          <h1 class="pub-display">Delete your account</h1>
          <p class="pub-lead">
            You can delete your CACI Taifa account and the personal data that goes with it at any time —
            in the app, or by sending the church office a request.
          </p>
        </div>
      </header>

      <div class="pub-container routes">
        <section class="route" aria-labelledby="in-app-title">
          <p class="pub-eyebrow">Quickest</p>
          <h2 id="in-app-title" class="pub-h3">In the app</h2>
          <ol class="steps">
            <li>Open the <strong>CACI Taifa</strong> app on your iPhone or Android phone, and sign in if you need to.</li>
            <li>Tap <strong>Settings</strong> or <strong>Profile</strong> (the gear icon).</li>
            <li>Choose <strong>Account Settings</strong>, then <strong>Delete Account</strong>.</li>
            <li>Read the notice and tap <strong>Confirm Deletion</strong>. Your account is deactivated straight away and scheduled for permanent removal.</li>
          </ol>
        </section>

        <section class="route pub-card" aria-labelledby="request-title">
          <p class="pub-eyebrow">Without the app</p>
          <h2 id="request-title" class="pub-h3">Send a request</h2>
          <p class="pub-muted route__intro">
            If you have uninstalled the app or cannot reach your phone, tell us which account is yours.
            Your request goes straight to the church office.
          </p>

          <div v-if="state === 'sent'" class="pub-notice" role="status">
            <h3 class="pub-h3">Your request has been sent</h3>
            <p>
              The church office will check the account is yours before removing it, and may call you on
              {{ form.phone }} to confirm.
            </p>
          </div>

          <form v-else class="pub-form" @submit.prevent="submitDeletionRequest">
            <!-- Hidden from people; a bot fills in every field it finds. -->
            <div class="pub-trap" aria-hidden="true">
              <label for="website">Website</label>
              <input id="website" v-model="form.website" type="text" tabindex="-1" autocomplete="off">
            </div>

            <div class="pub-field">
              <label for="fullName" class="pub-label">Name on the account</label>
              <input
                id="fullName"
                v-model.trim="form.fullName"
                type="text"
                required
                autocomplete="name"
                class="pub-input"
              >
            </div>

            <div class="pub-field">
              <label for="phone" class="pub-label">Phone number you registered with</label>
              <input
                id="phone"
                v-model.trim="form.phone"
                type="tel"
                required
                autocomplete="tel"
                class="pub-input"
                placeholder="024 123 4567"
              >
            </div>

            <div class="pub-field">
              <label for="reason" class="pub-label">Reason <span class="pub-optional">(optional)</span></label>
              <select id="reason" v-model="form.reason" class="pub-input">
                <option value="">Choose a reason</option>
                <option v-for="reason in reasons" :key="reason" :value="reason">{{ reason }}</option>
              </select>
            </div>

            <label class="pub-check">
              <input v-model="form.confirmed" type="checkbox" required>
              <span>I am the account holder, and I understand that deleting my account is permanent.</span>
            </label>

            <div v-if="state === 'failed'" class="pub-alert" role="alert">
              <p>{{ problem }}</p>
              <a v-if="offerEmail" :href="emailFallback" class="pub-btn pub-btn--secondary pub-btn--sm">Email it instead</a>
            </div>

            <button type="submit" class="pub-btn pub-btn--primary route__submit" :disabled="!form.confirmed || state === 'sending'">
              {{ state === 'sending' ? 'Sending…' : 'Send deletion request' }}
            </button>
          </form>
        </section>
      </div>

      <section class="pub-section pub-section--soft" aria-labelledby="data-title">
        <div class="pub-container">
          <div class="pub-heading">
            <h2 id="data-title" class="pub-h2">What happens to your data</h2>
          </div>

          <div class="data">
            <div class="data__col">
              <h3 class="pub-h3">Permanently deleted</h3>
              <ul>
                <li>Your member login credentials (phone number, hashed password, security tokens).</li>
                <li>Your profile details (full name, email, residential address, date of birth, photo).</li>
                <li>Device notification tokens (you will no longer receive push notifications).</li>
                <li>Confidential prayer requests and personal counseling messages.</li>
              </ul>
            </div>

            <div class="data__col">
              <h3 class="pub-h3">Kept, and why</h3>
              <ul>
                <li>
                  <strong>Financial &amp; Contribution Records:</strong> Past records of tithes, offerings, and welfare payments are retained in an anonymized, audited format solely to comply with statutory accounting and financial audit regulations for non-profit and religious entities in Ghana.
                </li>
                <li>
                  These financial records are strictly protected, detached from your active login, and never used for marketing.
                </li>
              </ul>
            </div>
          </div>

          <p class="pub-muted data__contact">
            Questions about your data? Contact the church data administrator at
            <a :href="`mailto:${churchEmail}`">{{ churchEmail }}</a> or
            <a href="tel:+233242969760">+233 24 296 9760</a>.
          </p>
        </div>
      </section>
    </main>

    <PublicFooter />
  </div>
</template>

<script>
import { mailtoLink } from '../resources/mailto'
import { sendPublicMessage } from '../resources/publicMessages'

const CHURCH_EMAIL = 'cactaifacentral@gmail.com'

export default {
  // Public site, not the admin app: no AppShell, so a signed-in visitor
  // does not get the admin sidebar stacked above this page's own header.
  layout: 'public',
  auth: false,
  name: 'DeleteAccountPage',
  head() {
    return {
      title: 'Account & Data Deletion Request | Christ Apostolic Church Int. - Taifa Central',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Submit a request to delete your CACI Taifa member account and associated personal data in accordance with Google Play and Apple App Store privacy requirements.'
        }
      ]
    }
  },
  data() {
    return {
      churchEmail: CHURCH_EMAIL,
      reasons: [
        'Relocated to another branch or city',
        'No longer using the app',
        'Privacy or data concerns',
        'Duplicate account',
        'Another reason'
      ],
      form: {
        fullName: '',
        phone: '',
        reason: '',
        confirmed: false,
        website: ''
      },
      state: 'idle',
      problem: '',
      offerEmail: false
    }
  },
  computed: {
    // Only when the office could not be reached. A deletion request that
    // silently goes nowhere is the worst failure this page can have, so
    // there is always a second way to send it.
    emailFallback() {
      return mailtoLink(CHURCH_EMAIL, {
        subject: `Account deletion request — ${this.form.fullName}`,
        lines: [
          'Please delete my CACI Taifa account and the personal data linked to it.',
          '',
          `Name on the account: ${this.form.fullName}`,
          `Registered phone number: ${this.form.phone}`,
          ...(this.form.reason ? [`Reason: ${this.form.reason}`] : []),
          '',
          'I confirm I am the account holder and understand that deletion is permanent.'
        ]
      })
    }
  },
  methods: {
    async submitDeletionRequest() {
      if (!this.form.confirmed) { return }

      this.state = 'sending'
      const result = await sendPublicMessage(this.$axios, {
        kind: 'account_deletion',
        name: this.form.fullName,
        phone: this.form.phone,
        reason: this.form.reason || null,
        website: this.form.website
      })

      this.state = result.ok ? 'sent' : 'failed'
      this.problem = result.message
      this.offerEmail = result.unreachable
    }
  }
}
</script>

<style scoped>
.deletion { display: contents; }

.routes {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(32px, 5vw, 64px);
  align-items: start;
  padding-top: clamp(40px, 5vw, 64px);
  padding-bottom: var(--pub-section);
}

.route { display: grid; gap: 12px; align-content: start; }
.route__intro { margin-bottom: 12px; }
.route__submit { justify-self: start; }

.steps {
  list-style: none;
  padding: 0;
  margin-top: 12px;
  counter-reset: step;
  display: grid;
}

.steps li {
  counter-increment: step;
  position: relative;
  padding: 16px 0 16px 48px;
  line-height: 1.6;
  color: var(--pub-text-2);
  border-top: 1px solid var(--pub-line);
}
.steps li:last-child { border-bottom: 1px solid var(--pub-line); }
.steps strong { color: var(--pub-text); font-weight: 600; }

.steps li::before {
  content: counter(step);
  position: absolute;
  left: 0;
  top: 16px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--pub-navy-soft);
  color: var(--pub-navy);
  font-size: var(--pub-micro);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.data {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.data__col {
  display: grid;
  gap: 16px;
  align-content: start;
  padding: clamp(24px, 3vw, 32px);
  background: var(--pub-bg);
  border: 1px solid var(--pub-line);
  border-radius: var(--pub-radius);
}

.data__col ul { padding-left: 1.2em; display: grid; gap: 10px; color: var(--pub-text-2); font-size: var(--pub-small); line-height: 1.65; }
.data__col li::marker { color: var(--pub-text-3); }
.data__col strong { color: var(--pub-text); font-weight: 600; }

.data__contact { margin-top: 32px; max-width: 64ch; }

@media (max-width: 900px) {
  .routes,
  .data { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .route__submit { width: 100%; }
}
</style>
