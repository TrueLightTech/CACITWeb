<template>
  <div class="main-wrapper">
    <div class="row justify-content-center">
      <div class="col-10 col-lg-4 col-xl-3 col-md-6 col-sm-8 g-0">
        <div class="d-flex justify-content-center">
          <img src="~assets/imgs/user.svg" class="img-fluid w-25">
        </div>
        <div class="form-window card p-4 border-0 rounded-0">
          <div class="card-body">
            <ul class="list-unstyled">
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
                <button type="button" class="btn btn-primary btn-lg px-4 py-2 w-100" @click="updateUser()">
                  <h6 class="p-0 m-0">UPDATE</h6>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "account",
    mounted() {
      this.register = Object.assign(this.register, JSON.parse(localStorage.getItem('auth.user')))
    },
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
      updateUser() {

        this.$axios.put('api/useraccounts/me', this.register, {
          headers: {
            Authorization: 'Bearer ' + window.localStorage.getItem('auth.token')
          }
        }).then(response => {
          console.log(response)
        }).catch(error => {
          console.log(error)
        })
      }
    }
  }
</script>

<style scoped>

</style>
