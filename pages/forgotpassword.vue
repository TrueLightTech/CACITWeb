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
                <h5>Forgot Password</h5>
              </li>
              <li>
                <div class="mb-3">
                  <label for="exampleFormControlInput1" class="form-label">Phone number</label>
                  <input type="text" v-model="login.phoneNumber" class="form-control form-control-lg"
                         id="exampleFormControlInput1"
                         placeholder="">
                </div>
              </li>
              <li>
                <div class="mb-3 mt-2">
                  <label for="exampleFormControlInput1" class="form-label">Password</label>
                  <input type="password" class="form-control form-control-lg" id="exampleFormControlInput1"
                         placeholder="" v-model="login.password">
                </div>
              </li>
              <li>
                <div class="mb-3 mt-2">
                  <label for="exampleFormControlInput1" class="form-label">Confirm Password</label>
                  <input type="password" class="form-control form-control-lg" id="exampleFormControlInput1"
                         placeholder="" v-model="login.confirmPassCode">
                  <small class="text-danger" v-if="passwordsMatch()">Passwords do not match</small>
                </div>
              </li>

              <li class="my-4">
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
          <img src="~assets/imgs/login_form_image.svg" class="img-fluid w-50 align-self-center"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    auth: false,
    name: "forgotpassword",
    data() {
      return {
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
    mounted() {
    },
    methods: {
      isInputFieldsValid() {
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
      passwordsMatch() {
        return this.login.password !== this.login.confirmPassCode;
      },
      async resetPassword() {
        if (this.isInputFieldsValid()) {
          try {
            if (!this.passwordsMatch()) {
              this.isLoading = true
              await this.$axios.post('auth/passwordreset', this.login)
              this.$toast.success("Password Successfully Updated !!")

              this.$router.push('/login')
            } else {
              this.$toast.info("Passwords do not match, check again!")
            }
          } catch (e) {
            this.isLoading = false
            this.$toast.error(e.response.data.message, {duration: 3000})
          }
        }

      },
    }
  }
</script>

<style scoped>

</style>
