<template>
  <main class="auth-page">
    <section class="auth-shell auth-shell-wide" aria-labelledby="register-title">
      <div class="brand-lockup" aria-hidden="true">
        <img src="~assets/imgs/caci_logo.png" alt="CACI Taifa" />
      </div>

      <div class="auth-copy">
        <h1 id="register-title">Create account</h1>
        <p>Set up your CACI Taifa profile.</p>
      </div>

      <form class="auth-form" @submit.prevent="signUp">
        <div class="profile-upload">
          <img :src="register.profilePicture" alt="" />
          <label class="upload-control" for="profilePicture">
            Add profile photo
            <input
              id="profilePicture"
              class="sr-only"
              type="file"
              accept="image/*"
              aria-describedby="profilePictureHelp"
              @change="imageUploaded($event)"
            />
          </label>
        </div>

        <div class="auth-grid">
          <div class="field-group field-group-full">
            <label for="fullName">Full name</label>
            <b-form-input
              id="fullName"
              v-model.trim="register.name"
              class="premium-input"
              type="text"
              autocomplete="name"
              placeholder="Full name"
            />
          </div>

          <div class="field-group">
            <label for="phoneNumber">Phone number</label>
            <b-form-input
              id="phoneNumber"
              v-model.trim="register.phoneNumber"
              class="premium-input"
              type="text"
              inputmode="tel"
              autocomplete="tel"
              placeholder="Phone number"
            />
          </div>

          <div class="field-group">
            <label for="emailAddress">Email address</label>
            <b-form-input
              id="emailAddress"
              v-model.trim="register.emailAddress"
              class="premium-input"
              type="email"
              autocomplete="email"
              placeholder="Optional"
            />
          </div>

          <div class="field-group">
            <label for="password">Password</label>
            <b-form-input
              id="password"
              v-model="register.passCode"
              class="premium-input"
              type="password"
              autocomplete="new-password"
              placeholder="Password"
            />
          </div>

          <div class="field-group">
            <label for="confirmPassword">Confirm password</label>
            <b-form-input
              id="confirmPassword"
              v-model="register.confirmPassCode"
              class="premium-input"
              type="password"
              autocomplete="new-password"
              placeholder="Confirm password"
            />
            <small class="form-note" v-if="passwordsMatch()">Passwords do not match</small>
          </div>

          <div class="field-group">
            <label for="dob">Date of birth</label>
            <b-form-input
              id="dob"
              v-model="register.dataOfBirth"
              class="premium-input"
              type="date"
            />
          </div>

          <div class="field-group">
            <label for="gender">Gender</label>
            <select id="gender" v-model="register.gender" class="premium-select">
              <option disabled value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div class="field-group">
            <label for="churchGroup">Church group</label>
            <select id="churchGroup" v-model="register.churchGroupId" class="premium-select">
              <option disabled value="">Select group</option>
              <option :value="group.id" v-for="group in churchGroups" :key="group.id">{{ group.name }}</option>
            </select>
          </div>

          <div class="field-group">
            <label for="churchFamily">Church family</label>
            <select id="churchFamily" v-model="register.churchFamilyId" class="premium-select">
              <option disabled value="">Select family</option>
              <option :value="family.id" v-for="family in churchFamilies" :key="family.id">{{ family.name }}</option>
            </select>
          </div>

          <div class="field-group field-group-full d-none">
            <label for="churchId">Church Id</label>
            <b-form-input
              id="churchId"
              v-model="register.churchId"
              class="premium-input"
              type="text"
            />
          </div>
        </div>

        <b-button class="primary-action" type="submit" :disabled="!isInputFieldsValid() || isLoading">
          <span v-if="!isLoading">Create account</span>
          <span v-else>Creating account</span>
        </b-button>
      </form>

      <nav class="auth-links" aria-label="Account navigation">
        <NuxtLink to="/login">Sign in instead</NuxtLink>
      </nav>
    </section>
  </main>
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

        if (!selectedImage) {
          return
        }

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
            const message = e.response && e.response.data ? e.response.data.message : 'Unable to create account'
            this.$toast.error(message, {duration: 3000})
          }
        }
      }
    }
  }
</script>

<style src="~/assets/auth.css"></style>
