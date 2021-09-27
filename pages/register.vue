<template>
  <div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-11 col-lg-4 col-xl-3 col-md-8 col-sm-10 g-0">
        <div class="form-window card p-4 border-0 rounded-0 pt-5 overflow-auto">
          <div class="card-body">
            <form>
              <ul class="list-unstyled">
                <li class="mb-4">
                  <h3>CACI Taifa</h3>
                </li>
                <li>
                  <h5>Register</h5>
                </li>
                <li class="my-4">
                  <div class="d-flex justify-content-center">
                    <img :src="register.profilePicture" class="img-fluid w-25 rounded-circle">
                  </div>
                </li>
                <li>
                  <input type="file" accept="image/*" class="custom-file-input"
                         aria-describedby="inputGroupFileAddon01" @change="imageUploaded($event)">
                </li>
                <li class="mt-4">
                  <div class="mb-3">
                    <label for="exampleFormControlInput1" class="form-label">Full name</label>
                    <input type="text" class="form-control form-control-lg" id="exampleFormControlInput1"
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
                    <label for="exampleFormControlInput1" class="form-label">Password</label>
                    <input type="password" class="form-control form-control-lg" id="exampleFormControlInput1"
                           placeholder="" v-model="register.passCode">
                  </div>
                </li>
                <li>
                  <div class="mb-3 mt-2">
                    <label for="exampleFormControlInput1" class="form-label">Confirm Password</label>
                    <input type="password" class="form-control form-control-lg" id="exampleFormControlInput1"
                           placeholder="" v-model="register.confirmPassCode">
                    <small class="text-danger" v-if="passwordsMatch()">Passwords do not match</small>
                  </div>
                </li>
                <li>
                  <div class="mb-3 mt-2">
                    <label for="exampleFormControlInput1" class="form-label">Email address (Optional)</label>
                    <input type="email" class="form-control form-control-lg" id="exampleFormControlInput1"
                           placeholder="" v-model="register.emailAddress">
                  </div>
                </li>
                <li>
                  <div class="mb-3 mt-2 d-none">
                    <label for="exampleFormControlInput1" class="form-label">Church Id</label>
                    <input type="text" class="form-control form-control-lg" id="exampleFormControlInput1"
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
                    <label for="dob">Date of Birth</label>
                    <div class="mt-2">
                      <input id="dob" type="date" class="form-control form-control-lg w-100"
                             v-model="register.dataOfBirth">
                    </div>
                  </div>
                </li>
                <li class="my-3">
                  <label for="gender">Gender</label>
                  <select id="gender" class="form-select mt-2 form-control-lg" aria-label="Default select example"
                          v-model="register.gender">
                    <option selected value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </li>
                <li class="my-3">
                  <label class="mb-2">Church Groups</label>
                  <select v-model="register.churchGroupId" class="form-select form-control-lg"
                          aria-label="Default select example">
                    <option :value="group.id" v-for="group in churchGroups" value="1">{{group.name}}</option>
                  </select>
                </li>
                <li class="my-3">
                  <label class="mb-2">Church Family</label>
                  <select v-model="register.churchFamilyId" class="form-select form-control-lg"
                          aria-label="Default select example">
                    <option :value="family.id" v-for="family in churchFamilies" value="1">{{family.name}}</option>
                  </select>
                </li>
                <li class="mt-4">
                  <button v-if="!isLoading" type="button" :class="activateButton()"
                          @click="signUp()">
                    <h6 class="p-0 m-0">REGISTER NOW</h6>
                  </button>
                  <button v-else class="btn btn-primary btn-lg px-4 py-2 w-100" type="button" disabled>
                    <h6 class="p-0 m-0"><span class="spinner-border spinner-border-sm" role="status"
                                              aria-hidden="true"></span> LOADING ...</h6>
                  </button>
                </li>
                <li class="mt-2">
                  <small>Already have an account?, login
                    <NuxtLink to="/login" class="bg-active active-bold">here</NuxtLink>
                  </small>
                </li>
              </ul>
            </form>
          </div>
        </div>
      </div>
      <div class="col-lg-8 col-xl-9 col-md-9 d-none d-lg-block d-xl-block g-0">
        <div class="form-right-window d-flex justify-content-center">
          <img src="~assets/imgs/caci_logo.png" class="img-fluid w-50 align-self-center"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import 'vue2-datepicker/index.css';

  export default {
    name: "register",
    auth: false,
    data() {
      return {
        isLoading: false,
        churchGroups: [],
        churchFamilies: [],
        register: {
          name: "",
          emailAddress: "",
          countryCode: "GH",
          phoneNumber: "",
          passCode: "",
          confirmPassCode: '',
          churchId: "",
          dataOfBirth: "1990-08-20",
          gender: "",
          profilePicture: "",
          churchFamilyId: "",
          churchGroupId: ""
        }
      }
    },
    mounted() {
      this.getChurchFamilies()
      this.getChurchGroups()

      this.register.profilePicture = require(`~/assets/imgs/user.svg`)
    },
    methods: {
      imageToBase64: function (img) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.image = e.target.result;
          this.register.profilePicture = e.target.result;
        }
        reader.readAsDataURL(img);
      },
      imageUploaded: function (e) {
        const selectedImage = e.target.files[0]

        var re = /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i;
        if (!re.exec(selectedImage.name)) {
          alert("File extension not supported!");
        } else {
          this.imageToBase64(selectedImage)
        }
      },
      isInputFieldsValid() {
        const isValid = (currentValue) => currentValue.length !== 0;
        const inputArray = [this.register.name, this.register.phoneNumber, this.register.passCode,
          this.register.gender, this.register.profilePicture];
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
      passwordsMatch() {
        return this.register.passCode !== this.register.confirmPassCode;
      },
      getChurchFamilies() {
        this.$axios.get('churchfamilies').then(response => {
          this.churchFamilies = response.data.data
        }).catch(error => {
        })
      },
      async signUp() {
        if (this.isInputFieldsValid()) {
          try {
            if (!this.passwordsMatch()) {
              this.isLoading = true
              await this.$axios.post('auth/register', this.register)

              await this.$auth.loginWith('local', {
                data: {
                  phoneNumber: this.register.phoneNumber,
                  countryCode: this.register.countryCode,
                  passCode: this.register.passCode
                },
              })
              this.$router.push('/admin/dashboard')
            } else {
              this.$toast.info("Passwords do not match, check again!")
            }
          } catch (e) {
            this.isLoading = false
            this.$toast.error(e.response.data.message, {duration: 3000})
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>
