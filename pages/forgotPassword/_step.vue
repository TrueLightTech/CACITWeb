<script>
export default {
  name: "forfortPasswordStep",
  auth: false,
  data() {
    return {
      otp: ["", "", "", ""],
      requestId: '',
      isLoading: false,
      phoneNumber: "",
      passCode: '',
      login: {
        phoneNumber: '',
        password: '',
        confirmPassCode: '',
        countryCode: "GH",
      }
    }
  },
  computed: {
    currentStep() {
      const step = this.$route.query.step || this.$route.params.step || 'start';
      return String(step).toLocaleLowerCase();
    },
    isStart() {
      return this.currentStep === 'start';
    },
    isVerify() {
      return this.currentStep === 'verify';
    },
    isResetScreen() {
      return this.currentStep === 'reset';
    },
    stepTitle() {
      if (this.isVerify) {
        return 'Enter verification code';
      }

      if (this.isResetScreen) {
        return 'Reset password';
      }

      return 'Reset password';
    },
    stepSubtitle() {
      if (this.isVerify) {
        return 'Use the 4-digit code sent to your phone.';
      }

      if (this.isResetScreen) {
        return 'Choose a new password for your account.';
      }

      return 'Enter your phone number to receive a code.';
    }
  },
  methods: {
    isInputFieldsValid() {
      this.login.phoneNumber = this.$route.query.phone
      const isValid = (currentValue) => currentValue.length !== 0;
      const inputArray = [this.login.phoneNumber, this.login.password];
      return inputArray.every(isValid)
    },
    passwordsMatch() {
      return this.login.password !== this.login.confirmPassCode;
    },
    async resetPassword() {
      this.login.phoneNumber = this.$route.query.phone

      if (this.isInputFieldsValid()) {
        // The API will not set a password without the token the verify step
        // was given for this number. Without one -- a reload after it
        // expired, or a link opened straight onto this step -- start again.
        const resetToken = sessionStorage.getItem(`resetToken:${this.login.phoneNumber}`)
        if (!resetToken) {
          this.$toast.info("That reset has expired. Ask for a new code.", {duration: 3000})
          await this.$router.push('/forgotPassword/start')
          return
        }

        if (this.login.password.trim().length < 6) {
          this.$toast.info("Choose a password of at least 6 characters.", {duration: 3000})
          return
        }

        try {
          if (!this.passwordsMatch()) {
            this.isLoading = true
            await this.$axios.post('auth/passwordreset', {...this.login, resetToken})
            sessionStorage.removeItem(`resetToken:${this.login.phoneNumber}`)
            this.$toast.success("Your password has been changed. Sign in with it now.")

            await this.$router.push('/login')
          } else {
            this.$toast.info("Passwords do not match, check again!")
          }
        } catch (e) {
          this.isLoading = false
          const message = e.response && e.response.data ? e.response.data.message : 'Unable to reset password'
          this.$toast.error(message, {duration: 3000})
        }
      }

    },
    async sendOtp() {
      if (this.login.phoneNumber) {
        try {
          this.isLoading = true
          const {data} = await this.$axios.post('auth/passwordreset/initiate', {
            phoneNumber: this.login.phoneNumber,
            countryCode: this.login.countryCode
          })


          if (data.code !== '200') {
            this.isLoading = false
            this.$toast.error(data.message, {duration: 3000})
            return

          }
          this.$toast.success("OTP Sent !!")
          localStorage.setItem(`requestId:${this.login.phoneNumber}`, data.data.requestId);
          this.otp = ["", "", "", ""]
          this.isLoading = false
          await this.$router.push({
            path: '/forgotPassword/verify',
            query: {
              phone: this.login.phoneNumber
            }
          })
        } catch (e) {
          this.isLoading = false
          const message = e.response && e.response.data ? e.response.data.message : 'Unable to send OTP'
          this.$toast.error(message, {duration: 3000})
        }
      }

    },
    async verifyOtp() {
      const otpValue = this.otp.join("");
      if (otpValue && otpValue.length === this.otp.length) {
        try {
          this.isLoading = true

          this.login.phoneNumber = this.$route.query.phone

          const requestId = localStorage.getItem(`requestId:${this.login.phoneNumber}`)

          const payload = {
            number: this.login.phoneNumber,
            code: otpValue,
            requestId: requestId
          }
          let {data} = await this.$axios.post('auth/passwordreset/verify-otp', payload)

          if (data.code !== '200') {
            this.isLoading = false
            this.$toast.error(data.message, {duration: 3000})
            await this.$router.push({
              path: '/forgotPassword/verify',
              query: {
                phone: this.login.phoneNumber
              }
            })
            return
          }
          this.$toast.success("OTP Verified !!")
          localStorage.removeItem(`requestId:${this.login.phoneNumber}`)
          // Session storage, not local: it is a ten-minute credential and
          // should not outlive the tab it was issued to.
          sessionStorage.setItem(`resetToken:${this.login.phoneNumber}`, data.data.resetToken)
          this.isLoading = false
          await this.$router.push({
            path: '/forgotPassword/reset',
            query: {
              phone: this.login.phoneNumber
            }
          })
        } catch (e) {
          this.isLoading = false
          const message = e.response && e.response.data ? e.response.data.message : 'Unable to verify OTP'
          this.$toast.error(message, {duration: 3000})
        }
      }

    },
    handleInput(event, index) {
      const value = event.target.value;

      if (!/^\d$/.test(value)) {
        this.otp[index] = "";
        return;
      }

      if (index < this.otp.length - 1) {
        this.$nextTick(() => {
          this.$refs.otpInput[index + 1].focus();
        });
      }
    },
    handleBackspace(event, index) {
      if (!this.otp[index] && index > 0) {
        this.$refs.otpInput[index - 1].focus();
      }
    },
    handlePaste(event) {
      const pasteContent = event.clipboardData.getData('text').trim();

      if (/^\d{4}$/.test(pasteContent)) {
        this.otp = pasteContent.split('');
      }

      this.$nextTick(() => {
        this.$refs.otpInput[this.otp.length - 1].focus();
      });
      event.preventDefault();
    }
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-shell" aria-labelledby="password-title">
      <div class="brand-lockup" aria-hidden="true">
        <img src="~assets/imgs/caci_logo.png" alt="CACI Taifa" />
      </div>

      <div class="auth-copy">
        <h1 id="password-title">{{ stepTitle }}</h1>
        <p>{{ stepSubtitle }}</p>
      </div>

      <b-form v-if="isStart" class="auth-form" @submit.prevent="sendOtp">
        <div class="field-group">
          <label for="phoneNumber">Phone number</label>
          <b-form-input
            id="phoneNumber"
            v-model.trim="login.phoneNumber"
            class="premium-input"
            type="text"
            inputmode="tel"
            autocomplete="tel"
            placeholder="Phone number"
          />
        </div>

        <b-button class="primary-action" type="submit" :disabled="!login.phoneNumber || isLoading">
          <span v-if="!isLoading">Send code</span>
          <span v-else>Sending code</span>
        </b-button>
      </b-form>

      <div v-if="isVerify" class="auth-form">
        <div class="otp-container" aria-label="Verification code">
          <input
            :autocomplete="'off'"
            v-for="(digit, index) in otp"
            :key="index"
            type="text"
            maxlength="1"
            class="otp-input"
            v-model="otp[index]"
            :aria-label="`Digit ${index + 1}`"
            :disabled="index > 0 && !otp[index - 1]"
            @input="handleInput($event, index)"
            @paste="handlePaste($event)"
            @keydown.backspace="handleBackspace($event, index)"
            ref="otpInput"
          />
        </div>

        <b-button
          class="primary-action"
          type="button"
          :disabled="otp.join('').length !== otp.length || isLoading"
          @click="verifyOtp()"
        >
          <span v-if="!isLoading">Verify code</span>
          <span v-else>Verifying code</span>
        </b-button>
      </div>

      <b-form v-if="isResetScreen" class="auth-form" @submit.prevent="resetPassword">
        <div class="field-group">
          <label for="password">New password</label>
          <b-form-input
            id="password"
            v-model="login.password"
            class="premium-input"
            type="password"
            autocomplete="new-password"
            placeholder="New password"
          />
        </div>

        <div class="field-group">
          <label for="confirmPassword">Confirm password</label>
          <b-form-input
            id="confirmPassword"
            v-model="login.confirmPassCode"
            class="premium-input"
            type="password"
            autocomplete="new-password"
            placeholder="Confirm password"
          />
          <small class="form-note" v-if="passwordsMatch()">Passwords do not match</small>
        </div>

        <b-button class="primary-action" type="submit" :disabled="!isInputFieldsValid() || isLoading">
          <span v-if="!isLoading">Reset password</span>
          <span v-else>Resetting password</span>
        </b-button>
      </b-form>

      <nav class="auth-links" aria-label="Password reset navigation">
        <NuxtLink v-if="isVerify" to="/forgotPassword/start">Send another code</NuxtLink>
        <span v-if="isVerify" aria-hidden="true"></span>
        <NuxtLink to="/login">Back to sign in</NuxtLink>
      </nav>
    </section>
  </main>
</template>

<style src="~/assets/auth.css"></style>
