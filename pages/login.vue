<template>
  <main class="auth-page">
    <section class="auth-shell" aria-labelledby="login-title">
      <div class="brand-lockup" aria-hidden="true">
        <img src="~assets/imgs/caci_logo.png" alt="CACI Taifa" />
      </div>

      <div class="auth-copy">
        <h1 id="login-title">Welcome back</h1>
        <p>Sign in to continue to CACI Taifa.</p>
      </div>

      <b-form class="auth-form" aria-labelledby="login-title" @submit.prevent="loginUser">
        <label class="sr-only" for="email">Email</label>
        <b-form-input
          id="email"
          class="premium-input"
          v-model.trim="login.phoneNumber"
          type="text"
          inputmode="email"
          autocomplete="username"
          placeholder="Email or phone"
        />

        <label class="sr-only" for="password">Password</label>
        <div class="password-field">
          <b-form-input
            id="password"
            class="premium-input password-input"
            v-model="login.passCode"
            :type="isPasswordVisible ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Password"
          />
          <button
            class="password-toggle"
            type="button"
            :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
            @click="isPasswordVisible = !isPasswordVisible"
          >
            {{ isPasswordVisible ? 'Hide' : 'Show' }}
          </button>
        </div>

        <b-button class="primary-action" type="submit" :disabled="!isInputFieldsValid() || isLoading">
          <span v-if="!isLoading">Sign in</span>
          <span v-else>Signing in</span>
        </b-button>
      </b-form>

      <nav class="auth-links" aria-label="Account support">
        <NuxtLink to="/forgotPassword/start">Forgot password?</NuxtLink>
        <span aria-hidden="true"></span>
        <NuxtLink to="/register">Create account</NuxtLink>
      </nav>
    </section>
  </main>
</template>

<script>
  export default {
    name: "login",
    data() {
      return {
        isLoading: false,
        isPasswordVisible: false,
        login: {
          phoneNumber: '',
          passCode: '',
          countryCode: "GH",
        }
      }
    },
    methods: {
      isInputFieldsValid() {
        const isValid = (currentValue) => currentValue.length !== 0;
        const inputArray = [this.login.phoneNumber, this.login.passCode];
        return inputArray.every(isValid)
      },
      async loginUser() {
        if (this.isInputFieldsValid()) {
          this.isLoading = true
          try {
            await this.$auth.loginWith('local', {
              data: this.login
            })
            this.$toast.success('Successfully authenticated', {duration: 3000, fitToScreen: true})
            this.$router.push('/admin/dashboard')
          } catch (e) {
            this.isLoading = false
            const message = e.response && e.response.data ? e.response.data.message : 'Unable to sign in'
            this.$toast.error(message, {duration: 3000, fitToScreen: true})
            this.error = message
          }
        }
      },
    }
  }
</script>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

  html,
  body,
  #__nuxt,
  #__layout {
    min-height: 100%;
    min-width: 0;
    overflow-x: hidden;
  }
</style>

<style scoped>
  .auth-page {
    min-height: 100vh;
    min-height: 100svh;
    width: 100%;
    overflow-x: hidden;
    display: grid;
    place-items: center;
    padding: 32px 20px;
    background: #fafafa;
    color: #111827;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .auth-page,
  .auth-page * {
    box-sizing: border-box;
  }

  .auth-shell {
    width: 100%;
    max-width: 386px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 34px 28px 28px;
    border: 1px solid #eceff3;
    border-radius: 28px;
    background: #ffffff;
    box-shadow: 0 18px 60px rgba(17, 24, 39, 0.045);
  }

  .brand-lockup {
    width: 58px;
    height: 58px;
    display: grid;
    place-items: center;
    margin-bottom: 28px;
    border: 1px solid #eef1f5;
    border-radius: 18px;
    background: linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%);
  }

  .brand-lockup img {
    width: 42px;
    height: 42px;
    object-fit: contain;
  }

  .auth-copy {
    width: 100%;
    text-align: center;
  }

  h1 {
    margin: 0;
    color: #121826;
    font-size: 1.72rem;
    font-weight: 600;
    line-height: 1.18;
    letter-spacing: 0;
  }

  .auth-copy p {
    margin: 10px 0 30px;
    color: #6b7280;
    font-size: 0.95rem;
    font-weight: 400;
    line-height: 1.5;
  }

  .auth-form {
    width: 100%;
    display: grid;
    gap: 12px;
  }

  .auth-page .premium-input {
    appearance: none;
    width: 100%;
    height: 56px;
    min-height: 56px;
    border: 1px solid #e4e7ec;
    border-radius: 16px;
    background: #ffffff;
    padding: 0 18px;
    color: #121826;
    font: 400 1rem/1.2 Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    outline: none;
    box-shadow: none;
    transition: border-color 180ms ease, background-color 180ms ease;
  }

  .auth-page .premium-input::placeholder {
    color: #9aa3af;
  }

  .auth-page .premium-input:focus {
    border-color: #9aa4b2;
    background: #ffffff;
    box-shadow: none;
  }

  .password-field {
    position: relative;
    width: 100%;
  }

  .auth-page .password-input {
    padding-right: 70px;
  }

  .password-toggle {
    position: absolute;
    top: 50%;
    right: 8px;
    min-width: 54px;
    height: 40px;
    transform: translateY(-50%);
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: #657081;
    font: 600 0.82rem/1 Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    cursor: pointer;
    transition: color 180ms ease, background-color 180ms ease;
  }

  .password-toggle:hover,
  .password-toggle:focus {
    background: #f5f7fa;
    color: #146efd;
    outline: none;
  }

  .primary-action {
    appearance: none;
    width: 100%;
    min-height: 56px;
    margin-top: 10px;
    border: 0;
    border-radius: 16px;
    background: #146efd;
    color: #ffffff;
    font: 600 1rem/1 Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    cursor: pointer;
    box-shadow: 0 12px 24px rgba(20, 110, 253, 0.16);
    transition: background-color 180ms ease, transform 180ms ease, opacity 180ms ease;
  }

  .primary-action:not(:disabled):hover {
    background: #0f63e8;
  }

  .primary-action:not(:disabled):active {
    transform: translateY(1px);
  }

  .primary-action:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    box-shadow: none;
  }

  .auth-links {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 22px;
  }

  .auth-links a {
    color: #626b78;
    font-size: 0.92rem;
    font-weight: 600;
    text-decoration: none;
    transition: color 180ms ease;
  }

  .auth-links a:hover {
    color: #146efd;
  }

  .auth-links span {
    width: 4px;
    height: 4px;
    border-radius: 999px;
    background: #d6dbe2;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 420px) {
    .auth-page {
      padding: 24px 18px;
    }

    .auth-shell {
      max-width: 100%;
      padding: 30px 20px 24px;
      border-radius: 24px;
    }
  }

  @media (max-width: 1024px) {
    .auth-page {
      place-items: start start;
      padding-top: 48px;
      padding-bottom: 48px;
    }
  }
</style>
