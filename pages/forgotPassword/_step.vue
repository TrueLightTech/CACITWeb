<script>
import is from "vue2-datepicker/locale/es/is";

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
    is() {
      return is
    },
    // Computed property to check the query parameter
    isStart() {
      const step = this.$route.query.step;
      return !step || step?.toLocaleLowerCase() === 'start';
    },
    isVerify() {
      const step = this.$route.query.step;
      return !step || step?.toLocaleLowerCase() === 'verify';
    },
    isResetScreen() {
      const step = this.$route.query.step;
      return !step || step?.toLocaleLowerCase() === 'reset';
    }
  },
  mounted() {
  },
  methods: {
    isInputFieldsValid() {
      this.login.phoneNumber = this.$route.query.phone
      const isValid = (currentValue) => currentValue.length !== 0;
      const inputArray = [this.login.phoneNumber, this.login.password];
      return inputArray.every(isValid)
    },
    activateButton() {
      if (this.isInputFieldsValid()) {
        return "btn btn-primary btn-lg px-4 py-2 w-100"
      } else {
        return "btn btn-primary btn-lg px-4 py-2 w-100 disabled"
      }
    },
    activateSendOtpButton() {
      if (this.login.phoneNumber) {
        return "btn btn-primary btn-lg px-4 py-2 w-100"
      } else {
        return "btn btn-primary btn-lg px-4 py-2 w-100 disabled"
      }
    },
    activateVerifyButton() {
      const otpValue = this.otp.join("");
      if (otpValue.length === this.otp.length) {
        return "btn btn-primary btn-lg px-4 py-2 w-100"
      } else {
        return "btn btn-primary btn-lg px-4 py-2 w-100 disabled"
      }
    },
    passwordsMatch() {
      return this.login.password !== this.login.confirmPassCode;
    },
    async resetPassword() {
      console.log(this.$route.query.phone, 'phone')
      this.login.phoneNumber = this.$route.query.phone

      console.log(this.$route.query.phone, 'phone')
      console.log(this.login.phoneNumber, 'phone')
      if (this.isInputFieldsValid()) {
        try {
          if (!this.passwordsMatch()) {
            this.isLoading = true
            await this.$axios.post('auth/passwordreset', this.login)
            this.$toast.success("Password Successfully Updated !!")

            await this.$router.push('/login')
          } else {
            this.$toast.info("Passwords do not match, check again!")
          }
        } catch (e) {
          this.isLoading = false
          this.$toast.error(e.response.data.message, {duration: 3000})
        }
      }

    },
    async sendOtp() {
      if (this.login.phoneNumber) {
        try {
          this.isLoading = true
          const {data} = await this.$axios.post('auth/passwordreset/initiate', {'phoneNumber': this.login.phoneNumber})


          if (data.code !== '200') {
            this.isLoading = false
            this.$toast.error(data.message, {duration: 3000})
            return

          }
          this.$toast.success("OTP Sent !!")
          localStorage.setItem(`requestId:${this.login.phoneNumber}`, data.data.requestId);
          this.isLoading = false
          await this.$router.push({
            path: '/forgotpassword',
            query: {
              step: 'verify',
              phone: this.login.phoneNumber
            }
          })
        } catch (e) {
          this.isLoading = false
          this.$toast.error(e.response.data.message, {duration: 3000})
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
            phoneNumber: this.login.phoneNumber,
            code: otpValue,
            requestId: requestId
          }
          let {data} = await this.$axios.post('auth/passwordreset/verify-otp', payload)

          if (data.code !== '200') {
            this.isLoading = false
            this.$toast.error(data.message, {duration: 3000})
            await this.$router.push({
              path: '/forgotpassword',
              query: {
                step: 'verify',
                phone: this.login.phoneNumber
              }
            })
            return
          }
          this.$toast.success("OTP Verified !!")
          localStorage.clear(`requestId:${this.login.phoneNumber}`)
          this.isLoading = false
          await this.$router.push({
            path: '/forgotpassword',
            query: {
              step: 'reset',
              phone: this.login.phoneNumber
            }
          })
        } catch (e) {
          this.isLoading = false
          this.$toast.error(e.response.data.message, {duration: 3000})
        }
      }

    },
    handleInput(event, index) {
      const value = event.target.value;

      // Only allow numeric input
      if (!/^\d$/.test(value)) {
        this.otp[index] = ""; // Clear invalid input
        return;
      }

      if (index < this.otp.length - 1) {
        this.$nextTick(() => {
          this.$refs.otpInput[index + 1].focus(); // Focus the next input
        });
      }
    },
    handleBackspace(event, index) {
      // Move focus to the previous input if it exists
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
  <div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-11 col-lg-4 col-xl-3 col-md-8 col-sm-10 g-0">
        <div class="form-window card p-4 border-0 rounded-0 pt-5">
          <div class="card-body">
            <ul class="list-unstyled">
              <li class="mb-4">
                <h3>CACI Taifa</h3>
              </li>
              <li>
                <h5 class="mb-5" v-if="isStart">Forgot Password?</h5>
                <h5 class="mb-5" v-if="isVerify">Enter OTP sent to your phone</h5>
              </li>
              <li>
                <div class="mb-3" v-if="isStart">
                  <label for="phoneNumber" class="form-label">Enter Phone number</label>
                  <input type="text" v-model="login.phoneNumber" class="form-control form-control-lg"
                         id="phoneNumber"
                         placeholder="">

                  <small class="my-2 d-block">
                    <NuxtLink to="/login" class="bg-active active-bold">Back to Login</NuxtLink>
                  </small>
                </div>
              </li>
              <li>
                <div v-if="isVerify">
                  <div class="otp-container">
                    <input
                      :autocomplete="'off'"
                      v-for="(digit, index) in otp"
                      :key="index"
                      type="text"
                      maxlength="1"
                      class="otp-input"
                      v-model="otp[index]"
                      :disabled="index > 0 && !otp[index - 1]"
                      @input="handleInput($event, index)"
                      @paste="handlePaste($event)"
                      @keydown.backspace="handleBackspace($event, index)"
                      ref="otpInput"
                    />
                  </div>
                  <small class="my-2 d-block">
                    <NuxtLink to="/forgotpassword?step=start" class="bg-active active-bold">Did not receive OTP?</NuxtLink>
                  </small>
                </div>
              </li>
              <li>
                <div class="mb-3 mt-2" v-if="isResetScreen">
                  <label for="password" class="form-label">Enter New Password</label>
                  <input type="password" class="form-control form-control-lg" id="password"
                         placeholder="" v-model="login.password">
                </div>
              </li>
              <li>
                <div class="mb-3 mt-2" v-if="isResetScreen">
                  <label for="confirmPassword" class="form-label">Confirm Password</label>
                  <input type="password" class="form-control form-control-lg" id="confirmPassword"
                         placeholder="" v-model="login.confirmPassCode">
                  <small class="text-danger" v-if="passwordsMatch()">Passwords do not match</small>

                  <small class="my-2 d-block">
                    <NuxtLink to="/login" class="bg-active active-bold">Back to Login</NuxtLink>
                  </small>
                </div>
              </li>

              <li class="my-4" v-if="isStart">
                <button v-if="!isLoading" type="button"
                        @click="sendOtp()"
                        :class="activateSendOtpButton()">
                  <h6 class="p-0 m-0">Send OTP</h6>
                </button>
                <button v-else class="btn btn-primary btn-lg px-4 py-2 w-100" type="button" disabled>
                  <h6 class="p-0 m-0"><span class="spinner-border spinner-border-sm" role="status"
                                            aria-hidden="true"></span> LOADING ...</h6>
                </button>
              </li>

              <li class="my-4" v-if="isVerify">
                <button v-if="!isLoading" type="button"
                        @click="verifyOtp()"
                        :class="activateVerifyButton()">
                  <h6 class="p-0 m-0">Verify OTP</h6>
                </button>
                <button v-else class="btn btn-primary btn-lg px-4 py-2 w-100" type="button" disabled>
                  <h6 class="p-0 m-0"><span class="spinner-border spinner-border-sm" role="status"
                                            aria-hidden="true"></span> LOADING ...</h6>
                </button>
              </li>

              <li class="my-4" v-if="isResetScreen">
                <button v-if="!isLoading" type="button"
                        @click="resetPassword()"
                        :class="activateButton()">
                  <h6 class="p-0 m-0">Reset Password</h6>
                </button>
                <button v-else class="btn btn-primary btn-lg px-4 py-2 w-100" type="button" disabled>
                  <h6 class="p-0 m-0"><span class="spinner-border spinner-border-sm" role="status"
                                            aria-hidden="true"></span> LOADING ...</h6>
                </button>
              </li>

            </ul>
          </div>
        </div>
      </div>
      <div class="col-lg-8 col-xl-9 col-md-9 d-none d-lg-block d-xl-block g-0">
        <div class="form-right-window d-flex justify-content-center">
          <img alt="CACI_LOGO" src="~assets/imgs/login_form_image.svg" class="img-fluid w-50 align-self-center"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.otp-container {
  display: flex;
  gap: 10px;
  width: 100%;
}

.otp-input {
  width: 50px;
  flex: 1;
  height: 50px;
  text-align: center;
  font-size: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.otp-input:focus {
  border-color: #007bff;
  outline: none;
}
</style>
