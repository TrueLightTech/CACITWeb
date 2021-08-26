<template>
  <div class="main-wrapper">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-10 col-lg-5 col-xl-4 col-md-6 col-sm-8 g-0">
          <div class="d-flex justify-content-center">
            <img src="~assets/imgs/user.svg" class="img-fluid w-25">
          </div>
          <div class="form-window card p-4 border-0 rounded-0">
            <div class="card-body">
              <ul class="list-unstyled">
                <li class="mt-4">
                  <div class="mb-3">
                    <label for="exampleFormControlInput1" class="form-label">Full name</label>
                    <input type="email" class="form-control form-control-lg" id="exampleFormControlInput1"
                           placeholder="" v-model="register.name">
                  </div>
                </li>
                <li>
                  <div class="mb-3 mt-2">
                    <label for="exampleFormControlInput1" class="form-label">Phone number</label>
                    <input type="text" class="form-control form-control-lg" id="exampleFormControlInput1"
                           placeholder="" v-model="register.phoneNumber">
                  </div>
                </li>
                <li>
                  <div class="mb-3 mt-2">
                    <label for="exampleFormControlInput1" class="form-label">Email address</label>
                    <input type="text" class="form-control form-control-lg" id="exampleFormControlInput1"
                           placeholder="" v-model="register.emailAddress">
                  </div>
                </li>
                <li>
                  <div class="mb-3 mt-2">
                    <label for="exampleFormControlInput1" class="form-label">Church Id</label>
                    <input type="text" class="form-control form-control-lg" id="exampleFormControlInput1"
                           placeholder="" v-model="register.churchId">
                  </div>
                </li>
                <li>
                  <div class="mb-3">
                    <div class="">
                      <input type="date" class="form-control w-100 form-control-lg" v-model="register.dataOfBirth">
                    </div>
                  </div>
                </li>
                <li class="my-3">
                  <select class="form-select form-control-lg" aria-label="Default select example"
                          v-model="register.gender">
                    <option selected>Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </li>
                <li class="my-3">
                  <label class="mb-2">Church Groups</label>
                  <select v-model="register.churchGroupId" class="form-select form-control-lg"
                          aria-label="Default select example">
                    <option :selected="register.churchGroupId === group.id" :value="group.id"
                            v-for="group in churchGroups" value="1">{{group.name}}
                    </option>
                  </select>
                </li>
                <li class="my-3">
                  <label class="mb-2">Church Family</label>
                  <select v-model="register.churchFamilyId" class="form-select form-control-lg"
                          aria-label="Default select example">
                    <option :selected="register.churchFamilyId === family.id" :value="family.id"
                            v-for="family in churchFamilies" value="1">{{family.name}}
                    </option>
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
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'

  export default {
    name: "account",
    mounted() {

      console.log(this.$auth.$state)

      this.register = Object.assign(this.register, this.loggedInUser.data)
      this.getChurchGroups()
      this.getChurchFamilies()
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'loggedInUser'])
    },
    data() {
      return {
        churchGroups: [],
        churchFamilies: [],
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
      getChurchGroups() {
        this.$axios.get('churchgroups').then(response => {
          this.churchGroups = response.data.data
        }).catch(error => {

        })
      },
      getChurchFamilies() {
        this.$axios.get('churchfamilies').then(response => {
          this.churchFamilies = response.data.data
        }).catch(error => {
        })
      },
      updateUser() {
        this.$axios.put('useraccounts/me', this.register, {
          headers: {
            Authorization: 'Bearer ' + window.localStorage.getItem('auth._token.local')
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
