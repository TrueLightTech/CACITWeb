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
                <h5>Register</h5>
              </li>
              <li class="mt-4">
                <div class="mb-3">
                  <label for="exampleFormControlInput1" class="form-label">Full name</label>
                  <input type="email" class="form-control" id="exampleFormControlInput1"
                         placeholder="" v-model="register.name">
                </div>
              </li>
              <li>
                <div class="mb-3 mt-2">
                  <label for="exampleFormControlInput1" class="form-label">Phone number</label>
                  <input type="text" class="form-control" id="exampleFormControlInput1"
                         placeholder="" v-model="register.phoneNumber">
                </div>
              </li>
              <li>
                <div class="mb-3 mt-2">
                  <label for="exampleFormControlInput1" class="form-label">Pass Code</label>
                  <input type="password" class="form-control" id="exampleFormControlInput1"
                         placeholder="" v-model="register.passCode">
                </div>
              </li>
              <li>
                <div class="mb-3 mt-2">
                  <label for="exampleFormControlInput1" class="form-label">Email address</label>
                  <input type="text" class="form-control" id="exampleFormControlInput1"
                         placeholder="" v-model="register.emailAddress">
                </div>
              </li>
              <li>
                <div class="mb-3 mt-2">
                  <label for="exampleFormControlInput1" class="form-label">Church Id</label>
                  <input type="text" class="form-control" id="exampleFormControlInput1"
                         placeholder="" v-model="register.churchId">
                </div>
              </li>
              <li class="d-none">
                <div class="mb-3">
                  <label for="exampleFormControlInput1" class="form-label">Profile Image</label>
                  <input type="file" class="form-control form-control-sm w-75" id="exampleFormControlInput1"
                         placeholder="">
                </div>
              </li>
              <li>
                <div class="mb-3">
                  <div class="">
                    <input type="date" class="form-control w-100" v-model="register.dataOfBirth">
                  </div>
                </div>
              </li>
              <li class="my-3">
                <select class="form-select" aria-label="Default select example" v-model="register.gender">
                  <option selected>Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </li>
              <li class="my-3">
                <select class="form-select" aria-label="Default select example">
                  <option selected>Church Group</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </select>
              </li>
              <li class="my-3">
                <select class="form-select" aria-label="Default select example">
                  <option selected>Church Family</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </select>
              </li>
              <li class="mt-4">
                <button type="button" class="btn btn-primary btn-lg px-4 py-2 w-100" @click="signUp()">
                  <h6 class="p-0 m-0">REGISTER NOW</h6>
                </button>
              </li>
              <li class="mt-2">
                <small>You have an account, login here
                  <NuxtLink to="/login" class="bg-active">here</NuxtLink>
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
  import 'vue2-datepicker/index.css';

  export default {
    auth: false,
    name: "register",
    data() {
      return {
        register: {
          name: "",
          emailAddress: "",
          countryCode: "GH",
          phoneNumber: "",
          passCode: "",
          churchId: "",
          dataOfBirth: "1990-08-20",
          gender: "",
          profilePicture: "",
          churchFamilyId: "",
          churchGroupId: ""
        }
      }
    },
    methods: {
      signUp() {
        this.$auth.loginWith('customRegisterStrategy', {data: this.register}).then(response => {

          this.$axios.$get('/useraccounts/me', {
            headers: {
              Authorization: 'Bearer ' + response.data.data.token
            }
          }).then(response => {
            const customUser = {
              ...response.data,
              fullName: response.data.name,
              roles: ['user']
            }

            this.$auth.setUser(customUser)
            this.$auth.$storage.setUniversal("user", customUser)
            this.$router.push({path: `/admin/dashboard`})
            this.$toast.success('Successfully authenticated')

          }).catch(e => {
          })

        }).catch(error => {
          this.$toast.error(error.response.data.message)
        })
      }
    }
  }
</script>

<style scoped>

</style>
