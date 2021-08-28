<template>
  <div class="main-wrapper">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-10 col-lg-5 col-xl-4 col-md-6 col-sm-8 g-0">
          <div class="d-flex justify-content-center">
            <img src="~assets/imgs/user.svg" class="img-fluid w-25">
          </div>
          <div class="form-window card p-4 pt-0 border-0 rounded-0">
            <div class="card-body">
              <ul class="list-unstyled">
                <li class="mt-4">
                  <div class="mb-3">
                    <label for="exampleFormControlInput1" class="form-label">Full name</label>
                    <input type="text" class="form-control form-control-lg" id="exampleFormControlInput1"
                           placeholder="" v-model="update.name">
                  </div>
                </li>
                <li>
                  <div class="mb-3 mt-2">
                    <label for="exampleFormControlInput1" class="form-label">Phone number</label>
                    <input type="text" class="form-control form-control-lg" id="exampleFormControlInput1"
                           placeholder="" v-model="update.phoneNumber">
                  </div>
                </li>
                <li>
                  <div class="mb-3 mt-2">
                    <label for="exampleFormControlInput1" class="form-label">Email address</label>
                    <input type="text" class="form-control form-control-lg" id="exampleFormControlInput1"
                           placeholder="" v-model="update.emailAddress">
                  </div>
                </li>
                <li class="d-none">
                  <div class="mb-3 mt-2">
                    <label for="exampleFormControlInput1" class="form-label">Church Id</label>
                    <input type="text" class="form-control form-control-lg" id="exampleFormControlInput1"
                           placeholder="" v-model="update.churchId">
                  </div>
                </li>
                <li>
                  <div class="mb-3">
                    <div class="">
                      <input type="date" class="form-control w-100 form-control-lg" v-model="update.dataOfBirth">
                    </div>
                  </div>
                </li>
                <li class="my-3">
                  <label class="mb-2">Gender</label>
                  <select class="form-select form-control-lg" aria-label="Default select example"
                          v-model="update.gender">
                    <option :selected="update.gender.toLowerCase() === 'male'" value="Male">Male</option>
                    <option :selected="update.gender.toLowerCase() === 'female'" value="Female">Female</option>
                  </select>
                </li>
                <li class="my-3">
                  <label class="mb-2">Church Groups</label>
                  <select v-model="update.churchGroupId" class="form-select form-control-lg"
                          aria-label="Default select example">
                    <option :selected="update.churchGroupId === group.id" :value="group.id"
                            v-for="group in churchGroups" value="1">{{group.name}}
                    </option>
                  </select>
                </li>
                <li class="my-3">
                  <label class="mb-2">Church Family</label>
                  <select v-model="update.churchFamilyId" class="form-select form-control-lg"
                          aria-label="Default select example">
                    <option :selected="update.churchFamilyId === family.id" :value="family.id"
                            v-for="family in churchFamilies" value="1">{{family.name}}
                    </option>
                  </select>
                </li>
                <li class="mt-4">
                  <button v-if="!isLoading" type="button" :class="activateButton()"
                          @click="updateUser()">
                    <h6 class="p-0 m-0">UPDATE</h6>
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
      </div>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'

  export default {
    name: "account",
    mounted() {
      this.update = Object.assign(this.update, this.loggedInUser.data)
      this.update.dataOfBirth = this.update.dataOfBirth.split('T')[0]
      this.getChurchGroups()
      this.getChurchFamilies()
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'loggedInUser'])
    },
    data() {
      return {
        isLoading: false,
        churchGroups: [],
        churchFamilies: [],
        update: {
          name: "",
          emailAddress: "",
          phoneNumber: "",
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
      isInputFieldsValid() {
        const isValid = (currentValue) => currentValue.length !== 0;
        const inputArray = [this.update.name, this.update.phoneNumber,
          this.update.gender, this.update.churchGroupId,
          this.update.churchFamilyId];
        return inputArray.every(isValid)
      },
      activateButton() {
        if (this.isInputFieldsValid()) {
          return "btn btn-primary btn-lg px-4 py-2 w-100"
        } else {
          return "btn btn-primary btn-lg px-4 py-2 w-100 disabled"
        }
      },
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
      async updateUser() {
        if (this.isInputFieldsValid()) {
          try {
            this.isLoading = true
            this.update.dateOfBirth = this.update.dataOfBirth.split('T')[0]
            let user = await this.$axios.put('useraccounts/me', this.update, {
              headers: {
                Authorization: 'Bearer ' + window.localStorage.getItem('auth._token.local')
              }
            })
            this.$toast.success("Successfully updated")
            this.isLoading = false
          } catch (e) {
            this.$toast.error(e.response.data.message, {fitToScreen: true})
            this.isLoading = false
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>
