<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">{{ pageTitle }}</h1>
        <p>{{ pageSubtitle }}</p>
      </div>
    </div>

    <!-- Loading keeps the page header in place rather than blanking the screen -->
    <div v-if="pageRefresh" class="ds-card">
      <div class="ds-card__body">
        <div style="display:grid;gap:16px;max-width:560px">
          <span class="ds-skeleton" style="height:64px;width:64px;border-radius:999px"></span>
          <span class="ds-skeleton" style="height:14px;width:40%"></span>
          <span class="ds-skeleton" style="height:38px"></span>
          <span class="ds-skeleton" style="height:14px;width:30%"></span>
          <span class="ds-skeleton" style="height:38px"></span>
          <span class="ds-skeleton" style="height:14px;width:35%"></span>
          <span class="ds-skeleton" style="height:38px"></span>
        </div>
      </div>
    </div>

    <form v-else class="ds-card" @submit.prevent="updateUser">
      <div class="ds-card__body">

        <!-- Photo -->
        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">Photo</h2>
            <p>Shown in the member list and on the member's profile.</p>
          </div>
          <div class="member-photo">
            <img :src="update.profilePicture" alt="" class="member-photo__preview">
            <div>
              <label class="ds-btn ds-btn--secondary ds-btn--sm" for="memberPhoto">
                {{ update.profilePicture && !isPlaceholderPhoto ? 'Change photo' : 'Choose photo' }}
                <input
                  id="memberPhoto"
                  class="sr-only-input"
                  type="file"
                  accept="image/*"
                  @change="imageUploaded($event)"
                >
              </label>
              <p class="ds-help" style="margin-top:8px">JPG, PNG or GIF.</p>
            </div>
          </div>
        </div>

        <!-- Personal details -->
        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">Personal details</h2>
          </div>

          <div class="ds-formgrid">
            <div class="ds-field ds-formgrid--full" :class="{ 'is-invalid': showErrors && !update.name }">
              <label class="ds-label" for="memberName">Full name</label>
              <input id="memberName" v-model="update.name" class="ds-input" type="text" autocomplete="name">
              <span v-if="showErrors && !update.name" class="ds-error">Enter the member's full name.</span>
            </div>

            <div class="ds-field">
              <label class="ds-label" for="memberPhone">Phone number</label>
              <input id="memberPhone" v-model="update.phoneNumber" class="ds-input" type="tel" inputmode="tel" autocomplete="tel">
              <span class="ds-help">Used for tithe receipts sent by SMS.</span>
            </div>

            <div class="ds-field">
              <label class="ds-label" for="memberEmail">Email address</label>
              <input id="memberEmail" v-model="update.emailAddress" class="ds-input" type="email" autocomplete="email">
            </div>

            <div class="ds-field">
              <label class="ds-label" for="memberDob">Date of birth</label>
              <input id="memberDob" v-model="update.dataOfBirth" class="ds-input" type="date">
            </div>

            <div class="ds-field" :class="{ 'is-invalid': showErrors && !update.gender }">
              <label class="ds-label" for="memberGender">Gender</label>
              <select id="memberGender" v-model="update.gender" class="ds-select">
                <option value="" disabled>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <span v-if="showErrors && !update.gender" class="ds-error">Select a gender.</span>
            </div>
          </div>
        </div>

        <!-- Church assignment -->
        <div class="ds-formsection">
          <div class="ds-formsection__head">
            <h2 class="ds-h3">Church assignment</h2>
            <p>Determines which family totals this member's giving appears in.</p>
          </div>

          <div class="ds-formgrid">
            <div class="ds-field">
              <label class="ds-label" for="memberGroup">Church group</label>
              <select id="memberGroup" v-model="update.churchGroupId" class="ds-select">
                <option value="">Not assigned</option>
                <option v-for="group in churchGroups" :key="group.id" :value="group.id">{{ group.name }}</option>
              </select>
            </div>

            <div class="ds-field">
              <label class="ds-label" for="memberFamily">Church family</label>
              <select id="memberFamily" v-model="update.churchFamilyId" class="ds-select">
                <option value="">Not assigned</option>
                <option v-for="family in churchFamilies" :key="family.id" :value="family.id">{{ family.name }}</option>
              </select>
            </div>

            <div class="ds-field">
              <span class="ds-label">Role</span>
              <p style="margin:0">
                <span class="ds-badge ds-badge--info">{{ getCurrentRole(update.roleId) }}</span>
              </p>
              <span class="ds-help">
                <template v-if="isAccount === true">Your role is set by a church manager.</template>
                <template v-else>Changed from the member's Assign role screen.</template>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="ds-card__foot" style="display:flex;gap:8px;justify-content:flex-end">
        <button class="ds-btn ds-btn--ghost" type="button" @click="goBack">Cancel</button>
        <button class="ds-btn ds-btn--primary" type="submit" :disabled="isLoading">
          <span v-if="isLoading" class="ds-btn__spinner"></span>
          {{ isLoading ? 'Saving' : submitLabel }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { profileImageBaseUrl } from '../resources/constants'
import { ChurchMember } from '../network/Member'

export default {
  name: 'MemberView',
  props: ['isAccount', 'id'],
  data () {
    return {
      isLoading: false,
      pageRefresh: false,
      showErrors: false,
      churchGroups: [],
      roleId: '',
      image: '',
      churchFamilies: [],
      roles: [],
      update: {
        id: '',
        name: '',
        emailAddress: '',
        phoneNumber: '',
        churchId: '',
        passCode: '1234',
        countryCode: 'GH',
        dataOfBirth: '1990-08-20',
        gender: '',
        profilePicture: '',
        churchFamilyId: '',
        churchFamilyName: '',
        churchGroupId: ''
      }
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
    isNewMember () {
      return this.isAccount === null
    },
    pageTitle () {
      if (this.isAccount === true) { return 'My profile' }
      if (this.isNewMember) { return 'Add member' }
      return 'Edit member'
    },
    pageSubtitle () {
      if (this.isAccount === true) { return 'Your details as they appear on the church register.' }
      if (this.isNewMember) { return 'Add someone to the church register.' }
      return 'Update this member\'s details on the church register.'
    },
    submitLabel () {
      return this.isNewMember ? 'Add member' : 'Save changes'
    },
    isPlaceholderPhoto () {
      return typeof this.update.profilePicture === 'string' &&
        this.update.profilePicture.indexOf('user.svg') !== -1
    }
  },
  mounted () {
    if (this.isAccount === true) {
      this.update = Object.assign(this.update, this.loggedInUser.data)
      this.update.dataOfBirth = this.toDateInput(this.update.dataOfBirth)
      this.update.profilePicture = this.getProfileImage(this.update.profilePicture)
    } else if (this.isAccount === false) {
      this.getMember(this.id)
    } else if (this.isAccount === null) {
      this.update.profilePicture = this.getProfileImage('')
    }

    this.getRoles()
    this.getChurchGroups()
    this.getChurchFamilies()
  },
  methods: {
    /** Dates arrive as ISO strings; the date input needs YYYY-MM-DD. */
    toDateInput (value) {
      if (!value || typeof value !== 'string') { return '' }
      return value.split('T')[0]
    },
    goBack () {
      this.$router.back()
    },
    imageToBase64 (img) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.image = e.target.result
        this.update.profilePicture = e.target.result
      }
      reader.readAsDataURL(img)
    },
    imageUploaded (e) {
      const selectedImage = e.target.files[0]
      if (!selectedImage) { return }

      const allowed = /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i
      if (!allowed.exec(selectedImage.name)) {
        this.$toast.error('That file type is not supported. Choose a JPG, PNG, BMP or GIF.')
        return
      }
      this.imageToBase64(selectedImage)
    },
    isInputFieldsValid () {
      const isValid = currentValue => !!currentValue && currentValue.length !== 0
      return [this.update.name, this.update.gender].every(isValid)
    },
    getChurchGroups () {
      this.$axios.get('churchgroups').then(response => {
        this.churchGroups = response.data.data
      }).catch(() => {})
    },
    getProfileImage (image) {
      if (image) {
        return `${profileImageBaseUrl}/${image}`
      }
      return require('~/assets/imgs/user.svg')
    },
    getMember (id) {
      this.pageRefresh = true
      this.$axios.get(`churchmembers/user/${id}`).then(response => {
        this.update = Object.assign(this.update, response.data.data)
        this.update.dataOfBirth = this.toDateInput(this.update.dataOfBirth)
        this.update.profilePicture = this.getProfileImage(this.update.profilePicture)
        this.pageRefresh = false
      }).catch(() => {
        this.update.profilePicture = this.getProfileImage('')
        this.pageRefresh = false
      })
    },
    getChurchFamilies () {
      this.$axios.get('churchfamilies').then(response => {
        this.churchFamilies = response.data.data
      }).catch(() => {})
    },
    getRoles () {
      this.$axios.get('roles').then(response => {
        this.roles = response.data.data
      }).catch(() => {})
    },
    getCurrentRole (currentRoleId) {
      const role = this.roles.filter(item => item.id === currentRoleId)
      if (role.length === 0) {
        return 'Not assigned'
      }
      return role[0].name
    },
    createMember () {
      this.isLoading = true
      this.update.passCode = '1234'

      this.$axios.post('churchmembers', this.update).then(() => {
        this.$toast.success('Member added')
        this.isLoading = false
        this.$router.push('/admin/members')
      }).catch(error => {
        // Previously reported through $toast.success, so failures looked like successes.
        this.$toast.error(this.errorMessage(error, 'Could not add this member.'))
        this.isLoading = false
      })
    },
    errorMessage (error, fallback) {
      return error && error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : fallback
    },
    async updateUser () {
      if (!this.isInputFieldsValid()) {
        this.showErrors = true
        return
      }
      this.showErrors = false

      if (this.isNewMember) {
        this.createMember()
        return
      }

      const url = this.isAccount ? 'useraccounts/me' : `churchmembers/update-user/${this.id}`

      try {
        this.isLoading = true
        delete this.update.passCode
        this.update.dateOfBirth = this.toDateInput(this.update.dataOfBirth)

        const family = this.churchFamilies.filter(item => item.id === this.update.churchFamilyId)
        if (family.length > 0) {
          this.update.churchFamilyName = family[0].name
        }

        // See role.vue: the manual Authorization header read a localStorage key
        // that is never written, sending "Bearer null" and overriding the real
        // token that token.global already applies.
        await this.$axios.put(url, this.update)

        this.$toast.success('Changes saved')
        this.isLoading = false
      } catch (e) {
        this.$toast.error(this.errorMessage(e, 'Could not save these changes.'), { fitToScreen: true })
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.member-photo {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.member-photo__preview {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  object-fit: cover;
  background: var(--ds-surface-3);
  flex-shrink: 0;
}

/* The native file input is hidden but still focusable and clickable through
   its label, so keyboard users keep the control. */
.sr-only-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
