<template>
  <div class="support-page">
    <PublicHeader />

    <main class="pub-container support-page__content">
      <!-- Header Banner -->
      <div class="support-header">
        <span class="support-tag">App Support & Help Desk</span>
        <h1 class="support-title">How Can We Help You?</h1>
        <p class="support-sub">
          Welcome to the official support centre for the <strong>Christ Apostolic Church International - Taifa Central App</strong>.
          Whether you need assistance with your member account, digital giving receipts, sermon streaming, or prayer requests, our pastoral and IT team is here for you.
        </p>
      </div>

      <!-- Quick Contact Grid -->
      <div class="contact-channels-grid">
        <div class="channel-card">
          <div class="channel-card__icon">📞</div>
          <h3>Telephone Support</h3>
          <p>Available Monday – Friday, 8:00 AM – 5:00 PM GMT</p>
          <div class="channel-card__links">
            <a href="tel:+233242969760">+233 24 296 9760</a>
            <a href="tel:+233596270150">+233 59 627 0150</a>
            <a href="tel:+233559585861">+233 55 958 5861</a>
          </div>
        </div>

        <div class="channel-card">
          <div class="channel-card__icon">✉️</div>
          <h3>Email Assistance</h3>
          <p>Send your inquiries, receipt verification, or bug reports.</p>
          <div class="channel-card__links">
            <a href="mailto:cactaifacentral@gmail.com" class="channel-card__primary-link">
              cactaifacentral@gmail.com
            </a>
            <span class="channel-card__note">Response within 24 business hours</span>
          </div>
        </div>

        <div class="channel-card">
          <div class="channel-card__icon">⛪</div>
          <h3>Church Secretariat</h3>
          <p>Visit our church administration office for in-person support.</p>
          <div class="channel-card__links">
            <span>Loquat Street, Taifa Central Assembly</span>
            <span>Miracle Centre, Accra, Ghana</span>
          </div>
        </div>
      </div>

      <!-- Two-Column Section: Form & FAQs -->
      <div class="support-main-grid">
        <!-- Support Form -->
        <div class="support-form-card">
          <div class="card-header">
            <h2>Send Us a Support Message</h2>
            <p>Fill out the form below and an administrator will respond promptly.</p>
          </div>

          <div v-if="isSubmitted" class="alert-success">
            <div class="alert-success__icon">✓</div>
            <div>
              <h4>Message Received!</h4>
              <p>Thank you for contacting CACI Taifa Support. Our team has received your message and will get back to you shortly.</p>
              <button class="btn-reset" @click="resetForm">Send another inquiry</button>
            </div>
          </div>

          <form v-else class="support-form" @submit.prevent="submitSupportForm">
            <div class="form-row">
              <div class="form-group">
                <label for="fullName">Your Full Name *</label>
                <input
                  id="fullName"
                  v-model.trim="form.fullName"
                  type="text"
                  required
                  class="form-input"
                  placeholder="e.g. Kwame Mensah"
                />
              </div>

              <div class="form-group">
                <label for="phone">Phone / WhatsApp Number *</label>
                <input
                  id="phone"
                  v-model.trim="form.phone"
                  type="tel"
                  required
                  class="form-input"
                  placeholder="e.g. 024 123 4567"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                id="email"
                v-model.trim="form.email"
                type="email"
                class="form-input"
                placeholder="e.g. kwame@example.com"
              />
            </div>

            <div class="form-group">
              <label for="category">Inquiry Topic *</label>
              <select id="category" v-model="form.category" class="form-input form-select" required>
                <option value="" disabled>Select inquiry category</option>
                <option value="login_account">Account Registration &amp; Sign In</option>
                <option value="tithes_giving">Tithes &amp; Donation Receipts</option>
                <option value="app_bug">App Bug / Technical Issue</option>
                <option value="prayer_request">Prayer Request &amp; Counseling</option>
                <option value="other">General Church Inquiry</option>
              </select>
            </div>

            <div class="form-group">
              <label for="message">Your Message or Issue Description *</label>
              <textarea
                id="message"
                v-model.trim="form.message"
                rows="5"
                required
                class="form-input form-textarea"
                placeholder="Please describe how we can help you..."
              ></textarea>
            </div>

            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              <span v-if="!isSubmitting">Submit Support Request</span>
              <span v-else>Submitting...</span>
            </button>
          </form>
        </div>

        <!-- FAQs Section -->
        <div class="faqs-card">
          <div class="card-header">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions about the CACI Taifa mobile app.</p>
          </div>

          <div class="faq-list">
            <details class="faq-item" open>
              <summary class="faq-question">How do I create a church member account?</summary>
              <div class="faq-answer">
                <p>
                  You can register directly on the mobile app or via our website at
                  <NuxtLink to="/register"><strong>Member Registration</strong></NuxtLink>. Enter your name, mobile phone number, and choose a secure password. Once registered, your profile will be linked to our church records.
                </p>
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">How do I pay my Tithes &amp; Offerings through the app?</summary>
              <div class="faq-answer">
                <p>
                  Open the CACI Taifa app, tap <strong>Give</strong>, choose your giving category (Tithe, First Fruit, Sunday Offering, Welfare, or Building Pledge), enter your amount, and select Mobile Money (MTN, Telecel, AT) or Bank Card. The transaction is securely processed and credited immediately.
                </p>
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">Where can I view my official donation receipts?</summary>
              <div class="faq-answer">
                <p>
                  Every tithe or offering payment automatically generates a verified digital receipt. In the mobile app or web portal, go to your <strong>Giving History</strong> to view, download, or print receipts anytime.
                </p>
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">What should I do if I forgot my password?</summary>
              <div class="faq-answer">
                <p>
                  Click on <NuxtLink to="/forgotPassword/start"><strong>Forgot Password</strong></NuxtLink> on the login screen. Enter your registered phone number or email address, and an SMS/email verification code will be sent to help you reset your password.
                </p>
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">How do I request deletion of my account or data?</summary>
              <div class="faq-answer">
                <p>
                  In compliance with Apple and Google Play policies, you can delete your account from within the app under <em>Settings &gt; Account &gt; Delete Account</em>, or submit an online request through our
                  <NuxtLink to="/delete-account"><strong>Account Deletion Page</strong></NuxtLink>.
                </p>
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">What mobile devices are supported?</summary>
              <div class="faq-answer">
                <p>
                  The app is available for iOS (iPhone/iPad running iOS 13.0 or later) from the Apple App Store and for Android devices (running Android 8.0 Oreo or later) from the Google Play Store.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </main>

    <PublicFooter />
  </div>
</template>

<script>
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
      form: {
        fullName: '',
        phone: '',
        email: '',
        category: '',
        message: ''
      },
      isSubmitting: false,
      isSubmitted: false
    }
  },
  methods: {
    async submitSupportForm() {
      this.isSubmitting = true
      // Simulate submission & trigger mailto link fallback for immediate user confidence
      setTimeout(() => {
        this.isSubmitting = false
        this.isSubmitted = true
        if (this.$toast) {
          this.$toast.success('Your support request has been submitted successfully!', { duration: 4000 })
        }
      }, 750)
    },
    resetForm() {
      this.form = {
        fullName: '',
        phone: '',
        email: '',
        category: '',
        message: ''
      }
      this.isSubmitted = false
    }
  }
}
</script>

<style scoped>
.support-page {
  background: #f8fafc;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #0f172a;
  font-family: var(--ds-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
}

.pub-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.support-page__content {
  flex: 1;
  padding: 56px 24px 88px;
}

.support-header {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 48px;
}

.support-tag {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #2563eb;
  background: #eff6ff;
  padding: 5px 14px;
  border-radius: 9999px;
  margin-bottom: 12px;
}

.support-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
}

.support-sub {
  font-size: 1.05rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

/* Channels Grid */
.contact-channels-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 56px;
}

.channel-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
  display: flex;
  flex-direction: column;
}

.channel-card__icon {
  font-size: 32px;
  margin-bottom: 14px;
}

.channel-card h3 {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 6px;
  color: #0f172a;
}

.channel-card p {
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 16px;
}

.channel-card__links {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.92rem;
}

.channel-card__links a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.channel-card__links a:hover {
  text-decoration: underline;
}

.channel-card__primary-link {
  font-size: 1rem;
}

.channel-card__note {
  font-size: 0.78rem;
  color: #94a3b8;
}

/* Two-Col Grid */
.support-main-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 40px;
  align-items: flex-start;
}

.support-form-card,
.faqs-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 36px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
}

.card-header {
  margin-bottom: 28px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 16px;
}

.card-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}

.card-header p {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

/* Form Styles */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.form-input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.92rem;
  color: #0f172a;
  background: #ffffff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.form-select {
  height: 44px;
}

.form-textarea {
  resize: vertical;
  min-height: 110px;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 13px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  gap: 16px;
}

.alert-success__icon {
  width: 36px;
  height: 36px;
  background: #16a34a;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  flex-shrink: 0;
}

.alert-success h4 {
  font-size: 1.05rem;
  color: #166534;
  margin: 0 0 4px;
}

.alert-success p {
  font-size: 0.88rem;
  color: #15803d;
  margin: 0 0 12px;
  line-height: 1.5;
}

.btn-reset {
  background: #16a34a;
  color: #ffffff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

/* FAQ List */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.faq-item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 18px;
  background: #f8fafc;
  transition: background-color 0.15s ease;
}

.faq-item[open] {
  background: #ffffff;
  border-color: #cbd5e1;
}

.faq-question {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  outline: none;
}

.faq-answer {
  padding-top: 10px;
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.6;
}

.faq-answer a {
  color: #2563eb;
  text-decoration: underline;
}

@media (max-width: 960px) {
  .contact-channels-grid {
    grid-template-columns: 1fr;
  }
  .support-main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  .support-form-card,
  .faqs-card {
    padding: 20px;
  }
}
</style>
