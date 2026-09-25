<template>
  <div class="support">
    <PublicHeader />

    <main id="main" class="pub-main">
      <header class="pub-pagehead">
        <div class="pub-container pub-pagehead__inner">
          <p class="pub-eyebrow">Support</p>
          <h1 class="pub-display">How can we help?</h1>
          <p class="pub-lead">
            Help with your member account, giving receipts, sermons in the app or a prayer request.
            The church office and our pastoral team are here for you.
          </p>
        </div>
      </header>

      <section class="pub-container channels" aria-label="Ways to reach us">
        <div class="channel">
          <h2 class="pub-h3">Call</h2>
          <p class="pub-meta">The church office, by phone or WhatsApp.</p>
          <ul class="channel__links">
            <li><a href="tel:+233242969760">+233 24 296 9760</a></li>
            <li><a href="tel:+233596270150">+233 59 627 0150</a></li>
          </ul>
        </div>

        <div class="channel">
          <h2 class="pub-h3">Email</h2>
          <p class="pub-meta">Enquiries, receipt checks and problems with the app.</p>
          <ul class="channel__links">
            <li><a :href="`mailto:${churchEmail}`">{{ churchEmail }}</a></li>
          </ul>
        </div>

        <div class="channel">
          <h2 class="pub-h3">Visit the office</h2>
          <p class="pub-meta">The church secretariat, for help in person.</p>
          <address class="channel__address">
            Miracle Centre, Loquat Street<br>
            Taifa, Accra · GE-331-4852
          </address>
        </div>
      </section>

      <div class="pub-container help">
        <section class="pub-card help__form" aria-labelledby="form-title">
          <div class="help__head">
            <h2 id="form-title" class="pub-h3">Write to us</h2>
            <p class="pub-muted">Your message goes straight to the church office, and they will call or message you back.</p>
          </div>

          <div v-if="state === 'sent'" class="pub-notice" role="status">
            <h3 class="pub-h3">Thank you — your message has been sent</h3>
            <p>The church office will get back to you on {{ form.phone }}.</p>
            <button type="button" class="pub-btn pub-btn--secondary pub-btn--sm help__again" @click="resetForm">
              Write another message
            </button>
          </div>

          <form v-else class="pub-form" @submit.prevent="submitSupportForm">
            <!-- Hidden from people; a bot fills in every field it finds. -->
            <div class="pub-trap" aria-hidden="true">
              <label for="website">Website</label>
              <input id="website" v-model="form.website" type="text" tabindex="-1" autocomplete="off">
            </div>

            <div class="pub-form__row">
              <div class="pub-field">
                <label for="fullName" class="pub-label">Full name</label>
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
                <label for="phone" class="pub-label">Phone or WhatsApp</label>
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
            </div>

            <div class="pub-field">
              <label for="category" class="pub-label">What is it about?</label>
              <select id="category" v-model="form.category" class="pub-input" required>
                <option value="" disabled>Choose a topic</option>
                <option v-for="topic in topics" :key="topic.value" :value="topic.value">{{ topic.label }}</option>
              </select>
            </div>

            <div class="pub-field">
              <label for="message" class="pub-label">Your message</label>
              <textarea
                id="message"
                v-model.trim="form.message"
                rows="5"
                required
                maxlength="1500"
                class="pub-input"
              ></textarea>
            </div>

            <div v-if="state === 'failed'" class="pub-alert" role="alert">
              <p>{{ problem }}</p>
              <a v-if="offerEmail" :href="emailFallback" class="pub-btn pub-btn--secondary pub-btn--sm">Email it instead</a>
            </div>

            <button type="submit" class="pub-btn pub-btn--primary help__submit" :disabled="state === 'sending'">
              {{ state === 'sending' ? 'Sending…' : 'Send message' }}
            </button>
          </form>
        </section>

        <section class="help__faqs" aria-labelledby="faq-title">
          <h2 id="faq-title" class="pub-h3 help__faqtitle">Common questions</h2>

          <div class="faqs">
            <details class="faq" open>
              <summary>How do I create a church member account?</summary>
              <p>
                You can register directly on the mobile app or via our website at
                <NuxtLink to="/register">Member Registration</NuxtLink>. Enter your name, mobile phone number, and choose a secure password. Once registered, your profile will be linked to our church records.
              </p>
            </details>

            <details class="faq">
              <summary>How do I pay my tithes and offerings through the app?</summary>
              <p>
                Open the CACI Taifa app, tap <strong>Give</strong>, choose your giving category (Tithe, First Fruit, Sunday Offering, Welfare, or Building Pledge), enter your amount, and select Mobile Money (MTN, Telecel, AT) or Bank Card. The transaction is securely processed and credited immediately.
              </p>
            </details>

            <details class="faq">
              <summary>Where can I view my official donation receipts?</summary>
              <p>
                Every tithe or offering payment automatically generates a verified digital receipt. In the mobile app or web portal, go to your <strong>Giving History</strong> to view, download, or print receipts anytime.
              </p>
            </details>

            <details class="faq">
              <summary>What should I do if I forgot my password?</summary>
              <p>
                Click on <NuxtLink to="/forgotPassword/start">Forgot Password</NuxtLink> on the login screen. Enter your registered phone number or email address, and an SMS/email verification code will be sent to help you reset your password.
              </p>
            </details>

            <details class="faq">
              <summary>How do I request deletion of my account or data?</summary>
              <p>
                You can delete your account from within the app under <em>Settings &gt; Account &gt; Delete Account</em>, or send a request through our
                <NuxtLink to="/delete-account">account deletion page</NuxtLink>.
              </p>
            </details>

            <details class="faq">
              <summary>Which phones is the app available on?</summary>
              <p>
                The app is available for iOS (iPhone/iPad running iOS 13.0 or later) from the Apple App Store and for Android devices (running Android 8.0 Oreo or later) from the Google Play Store.
              </p>
            </details>
          </div>
        </section>
      </div>
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
  name: 'SupportPage',
  head() {
    return {
      title: 'App Support & Help Center | Christ Apostolic Church Int. - Taifa Central',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Support and Help Center for Christ Apostolic Church International Taifa Central mobile application. Contact support, read FAQs, and get assistance with member portal accounts.'
        }
      ]
    }
  },
  data() {
    return {
      churchEmail: CHURCH_EMAIL,
      topics: [
        { value: 'account', label: 'Registration and signing in' },
        { value: 'giving', label: 'Tithes and receipts' },
        { value: 'app', label: 'A problem with the app' },
        { value: 'prayer', label: 'Prayer request or counselling' },
        { value: 'other', label: 'Something else' }
      ],
      form: this.emptyForm(),
      state: 'idle',
      problem: '',
      offerEmail: false
    }
  },
  computed: {
    // Only offered when the office could not be reached; a message the API
    // refused for a reason the visitor can fix is better fixed.
    emailFallback() {
      const topic = this.topics.find(t => t.value === this.form.category)
      return mailtoLink(CHURCH_EMAIL, {
        subject: `Support: ${topic ? topic.label : 'Enquiry'} — ${this.form.fullName}`,
        lines: [this.form.message, '', `Name: ${this.form.fullName}`, `Phone: ${this.form.phone}`]
      })
    }
  },
  methods: {
    emptyForm() {
      return { fullName: '', phone: '', category: '', message: '', website: '' }
    },
    async submitSupportForm() {
      if (!this.form.fullName || !this.form.phone || !this.form.category || !this.form.message) {
        this.state = 'failed'
        this.problem = 'Fill in your name, phone number, topic and message.'
        this.offerEmail = false
        return
      }

      this.state = 'sending'
      const result = await sendPublicMessage(this.$axios, {
        kind: 'support',
        name: this.form.fullName,
        phone: this.form.phone,
        topic: this.form.category,
        message: this.form.message,
        website: this.form.website
      })

      this.state = result.ok ? 'sent' : 'failed'
      this.problem = result.message
      this.offerEmail = result.unreachable
    },
    resetForm() {
      this.form = this.emptyForm()
      this.state = 'idle'
    }
  }
}
</script>

<style scoped>
.support { display: contents; }

/* Ways to reach us ------------------------------------------------------ */

.channels {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding-top: clamp(40px, 5vw, 56px);
  padding-bottom: clamp(40px, 5vw, 56px);
}

.channel {
  display: grid;
  gap: 8px;
  align-content: start;
  padding: 0 32px;
}
.channel:first-child { padding-left: 0; }
.channel:last-child { padding-right: 0; }
.channel + .channel { border-left: 1px solid var(--pub-line); }

.channel__links { list-style: none; padding: 0; display: grid; gap: 4px; margin-top: 8px; }
.channel__links a { font-weight: 500; text-decoration: none; overflow-wrap: anywhere; }
.channel__links a:hover { text-decoration: underline; }

.channel__address { font-style: normal; line-height: 1.6; margin-top: 8px; color: var(--pub-text); }

/* Form and questions ---------------------------------------------------- */

.help {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(32px, 5vw, 64px);
  align-items: start;
  padding-bottom: var(--pub-section);
}

.help__form { display: grid; gap: 24px; }
.help__head { display: grid; gap: 6px; }
.help__submit { justify-self: start; }
.help__again { justify-self: start; margin-top: 4px; }

.help__faqtitle { margin-bottom: 8px; }

.faq { border-bottom: 1px solid var(--pub-line); }

.faq summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 60px;
  padding: 16px 0;
  font-weight: 500;
  color: var(--pub-text);
  cursor: pointer;
  list-style: none;
}
.faq summary::-webkit-details-marker { display: none; }

.faq summary::after {
  content: '';
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  margin-right: 4px;
  border-right: 1.5px solid var(--pub-text-3);
  border-bottom: 1.5px solid var(--pub-text-3);
  transform: translateY(-3px) rotate(45deg);
  transition: transform var(--pub-fast) var(--pub-ease);
}
.faq[open] summary::after { transform: translateY(2px) rotate(-135deg); }

.faq summary:hover { color: var(--pub-navy); }

.faq p {
  padding: 0 32px 20px 0;
  font-size: var(--pub-small);
  line-height: 1.65;
  color: var(--pub-text-2);
}

/* Responsive ------------------------------------------------------------ */

@media (max-width: 900px) {
  .help { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .channels { grid-template-columns: 1fr; }
  .channel,
  .channel:first-child,
  .channel:last-child { padding: 24px 0; }
  .channel:first-child { padding-top: 0; }
  .channel + .channel { border-left: 0; border-top: 1px solid var(--pub-line); }
}

@media (max-width: 480px) {
  .help__submit { width: 100%; }
}
</style>
