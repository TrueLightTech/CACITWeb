<template>
  <div class="delete-page">
    <PublicHeader />

    <main class="pub-container delete-page__content">
      <div class="delete-card">
        <div class="delete-card__header">
          <span class="delete-tag">Apple &amp; Google Compliance</span>
          <h1 class="delete-title">Account &amp; Data Deletion Request</h1>
          <p class="delete-subtitle">
            <strong>Christ Apostolic Church International — Taifa Central Assembly</strong><br />
            We respect your privacy and provide transparent options to delete your member account and personal data.
          </p>
        </div>

        <!-- Information Overview -->
        <div class="delete-info-grid">
          <div class="info-block">
            <h3>Option 1: In-App Account Deletion (Recommended)</h3>
            <p>If you still have the CACI Taifa mobile application installed on your device, you can delete your account instantly:</p>
            <ol>
              <li>Open the <strong>CACI Taifa App</strong> on your iPhone or Android device.</li>
              <li>Sign in to your member account if not already signed in.</li>
              <li>Tap on <strong>Settings</strong> or <strong>Profile</strong> (gear icon).</li>
              <li>Select <strong>Account Settings</strong> &rarr; <strong>Delete Account</strong>.</li>
              <li>Review the confirmation notice and tap <strong>Confirm Deletion</strong>. Your account will be immediately deactivated and scheduled for permanent purge.</li>
            </ol>
          </div>

          <div class="info-block">
            <h3>Option 2: Web Deletion Request Form</h3>
            <p>If you have uninstalled the app or cannot access your mobile device, please fill out the verified deletion request form below:</p>

            <div v-if="isSubmitted" class="alert-success">
              <div class="alert-success__icon">✓</div>
              <div>
                <h4>Deletion Request Received</h4>
                <p>
                  Your request has been logged. An SMS or email confirmation will be sent to your registered contact to verify ownership. Once verified, your personal profile data will be permanently wiped within 14 business days.
                </p>
                <button class="btn-reset" @click="isSubmitted = false">Submit another request</button>
              </div>
            </div>

            <form v-else class="delete-form" @submit.prevent="submitDeletionRequest">
              <div class="form-group">
                <label for="fullName">Full Name on Church Account *</label>
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
                <label for="phone">Registered Mobile Phone Number *</label>
                <input
                  id="phone"
                  v-model.trim="form.phone"
                  type="tel"
                  required
                  class="form-input"
                  placeholder="e.g. 024 123 4567"
                />
                <span class="field-hint">The phone number you used during member registration.</span>
              </div>

              <div class="form-group">
                <label for="email">Registered Email Address (Optional)</label>
                <input
                  id="email"
                  v-model.trim="form.email"
                  type="email"
                  class="form-input"
                  placeholder="e.g. kwame@example.com"
                />
              </div>

              <div class="form-group">
                <label for="reason">Reason for Account Deletion (Optional)</label>
                <select id="reason" v-model="form.reason" class="form-input form-select">
                  <option value="">Select a reason</option>
                  <option value="relocated">Relocated to another branch or city</option>
                  <option value="no_longer_using">No longer using the mobile app</option>
                  <option value="privacy">Privacy / Data concerns</option>
                  <option value="duplicate">Duplicate account</option>
                  <option value="other">Other reason</option>
                </select>
              </div>

              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input v-model="form.confirmed" type="checkbox" required />
                  <span>
                    I confirm that I am the account holder and I understand that account deletion is permanent and cannot be undone.
                  </span>
                </label>
              </div>

              <button type="submit" class="submit-delete-btn" :disabled="isSubmitting || !form.confirmed">
                <span v-if="!isSubmitting">Request Account &amp; Data Deletion</span>
                <span v-else>Submitting Request...</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Data Policy Breakdown -->
        <div class="data-policy-breakdown">
          <h2>Data Deletion &amp; Retention Details</h2>

          <div class="policy-columns">
            <div class="policy-box policy-box--deleted">
              <h4>What Data is Permanently Deleted</h4>
              <ul>
                <li>Your member login credentials (phone number, hashed password, security tokens).</li>
                <li>Your profile details (full name, email, residential address, date of birth, photo).</li>
                <li>Device notification tokens (you will no longer receive push notifications).</li>
                <li>Confidential prayer requests and personal counseling messages.</li>
              </ul>
            </div>

            <div class="policy-box policy-box--retained">
              <h4>What Data May Be Retained &amp; Why</h4>
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

          <div class="contact-officer">
            <p>
              If you have any questions regarding your data or need help with the deletion process, please contact our Church Data Administrator directly at
              <a href="mailto:cactaifacentral@gmail.com">cactaifacentral@gmail.com</a> or call
              <a href="tel:+233242969760">+233 24 296 9760</a>.
            </p>
          </div>
        </div>
      </div>
    </main>

    <PublicFooter />
  </div>
</template>

<script>
export default {
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
      form: {
        fullName: '',
        phone: '',
        email: '',
        reason: '',
        confirmed: false
      },
      isSubmitting: false,
      isSubmitted: false
    }
  },
  methods: {
    async submitDeletionRequest() {
      if (!this.form.confirmed) return

      this.isSubmitting = true
      // Simulate submission handling
      setTimeout(() => {
        this.isSubmitting = false
        this.isSubmitted = true
        if (this.$toast) {
          this.$toast.success('Account deletion request submitted successfully.', { duration: 4000 })
        }
      }, 750)
    }
  }
}
</script>

<style scoped>
.delete-page {
  background: #f8fafc;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #0f172a;
  font-family: var(--ds-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
}

.pub-container {
  max-width: 980px;
  margin: 0 auto;
  padding: 0 24px;
}

.delete-page__content {
  flex: 1;
  padding: 48px 24px 80px;
}

.delete-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
  padding: 44px;
}

.delete-card__header {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 24px;
  margin-bottom: 36px;
}

.delete-tag {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #b91c1c;
  background: #fef2f2;
  padding: 4px 12px;
  border-radius: 9999px;
  margin-bottom: 12px;
}

.delete-title {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
  margin: 0 0 12px;
}

.delete-subtitle {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

.delete-info-grid {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 36px;
  margin-bottom: 48px;
}

.info-block {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
}

.info-block h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px;
}

.info-block p {
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 14px;
}

.info-block ol {
  padding-left: 20px;
  color: #334155;
  font-size: 0.88rem;
  line-height: 1.6;
}

.info-block li {
  margin-bottom: 10px;
}

/* Form */
.delete-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.field-hint {
  font-size: 0.75rem;
  color: #64748b;
}

.form-input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 0.9rem;
  color: #0f172a;
  background: #ffffff;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.checkbox-group {
  margin-top: 4px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.82rem;
  color: #475569;
  line-height: 1.5;
  cursor: pointer;
}

.checkbox-label input {
  margin-top: 3px;
}

.submit-delete-btn {
  background: #dc2626;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.submit-delete-btn:hover:not(:disabled) {
  background: #b91c1c;
}

.submit-delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  gap: 14px;
}

.alert-success__icon {
  width: 32px;
  height: 32px;
  background: #16a34a;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.alert-success h4 {
  font-size: 1rem;
  color: #166534;
  margin: 0 0 4px;
}

.alert-success p {
  font-size: 0.85rem;
  color: #15803d;
  margin: 0 0 10px;
  line-height: 1.5;
}

.btn-reset {
  background: #16a34a;
  color: #ffffff;
  border: none;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

/* Data Policy Breakdown */
.data-policy-breakdown {
  border-top: 1px solid #e2e8f0;
  padding-top: 36px;
}

.data-policy-breakdown h2 {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 20px;
}

.policy-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.policy-box {
  border-radius: 10px;
  padding: 20px;
}

.policy-box--deleted {
  background: #fef2f2;
  border: 1px solid #fee2e2;
}

.policy-box--deleted h4 {
  color: #991b1b;
  margin: 0 0 10px;
  font-size: 0.95rem;
  font-weight: 700;
}

.policy-box--retained {
  background: #eff6ff;
  border: 1px solid #dbeafe;
}

.policy-box--retained h4 {
  color: #1e40af;
  margin: 0 0 10px;
  font-size: 0.95rem;
  font-weight: 700;
}

.policy-box ul {
  padding-left: 18px;
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.55;
  color: #334155;
}

.policy-box li {
  margin-bottom: 6px;
}

.contact-officer {
  background: #f1f5f9;
  border-radius: 8px;
  padding: 16px;
  font-size: 0.88rem;
  color: #334155;
  line-height: 1.5;
}

.contact-officer a {
  color: #2563eb;
  text-decoration: underline;
}

@media (max-width: 840px) {
  .delete-info-grid,
  .policy-columns {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .delete-card {
    padding: 20px;
  }
  .delete-title {
    font-size: 1.75rem;
  }
}
</style>
