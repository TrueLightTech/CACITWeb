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
                <h5>LOG IN</h5>
              </li>
              <li>
                <div class="mb-3">
                  <label for="exampleFormControlInput1" class="form-label">Phone number</label>
                  <input type="text" v-model="login.phoneNumber" class="form-control" id="exampleFormControlInput1"
                         placeholder="">
                </div>
              </li>

              <li>
                <div class="mb-3">
                  <label for="exampleFormControlInput1" class="form-label">Password</label>
                  <input v-model="login.passCode" type="password" class="form-control" id="exampleFormControlInput1"
                         placeholder="">
                </div>
              </li>
              <li class="my-4">
                <button v-if="!isLoading" @click="signInUser()" type="button"
                        class="btn btn-primary btn-lg px-4 py-2 w-100">
                  <h6 class="p-0 m-0">LOG IN</h6>
                </button>
                <button v-else class="btn btn-primary btn-lg px-4 py-2 w-100" type="button" disabled>
                  <h6 class="p-0 m-0"><span class="spinner-border spinner-border-sm" role="status"
                                            aria-hidden="true"></span> LOADING ...</h6>
                </button>
              </li>
              <li class="mt-2">
                <small>You dont have an account, create one
                  <NuxtLink to="/register" class="bg-active active-bold">here</NuxtLink>
                </small>
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
    name: "login",
    data() {
      return {
        isLoading: false,
        phoneNumber: "",
        passCode: '',
        login: {
          phoneNumber: '',
          passCode: '',
          countryCode: "GH",
        }
      }
    },
    mounted() {
    },
    methods: {
      signInUser() {
        this.isLoading = true
        this.$auth.loginWith('customStrategy', {data: this.login}).then(resp => {

          this.$axios.$get('/useraccounts/me', {
            headers: {
              Authorization: 'Bearer ' + resp.data.data.token
            }
          }).then(response => {
            const customUser = {
              ...response.data,
              fullName: response.data.name,
              roles: ['user']
            }

            this.isLoading = false

            this.$auth.$storage.setUniversal("user", customUser)
            this.$auth.$storage.setUniversal("token", resp.data.data.token)
            this.$auth.setUser(customUser)
            this.$router.push({path: `/admin/dashboard`})
            this.$toast.success('Successfully authenticated', {duration: 3000})

          }).catch(e => {
            this.isLoading = false
          })

        }).catch(error => {
          this.$toast.error(error.response.data.message, {duration: 3000})
          this.isLoading = false
        })
      }
    }
  }
</script>

<style scoped>
  body {
    background-color: #7F828B;
  }
</style>
