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

<style src="~/assets/auth.css"></style>

