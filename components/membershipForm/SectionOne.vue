<template>
  <form @submit.prevent="update">
    <!-- Personal information -->
    <div class="ds-formsection">
      <div class="ds-formsection__head">
        <h3 class="ds-h3">Personal information</h3>
      </div>

      <div class="ds-formgrid">
        <div class="ds-field">
          <label class="ds-label" for="s1FirstName">First name</label>
          <input id="s1FirstName" v-model="memberInfo.firstName" class="ds-input" type="text">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s1Surname">Surname</label>
          <input id="s1Surname" v-model="memberInfo.surname" class="ds-input" type="text">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s1OtherNames">Other names</label>
          <input id="s1OtherNames" v-model="memberInfo.otherNames" class="ds-input" type="text">
        </div>

        <div class="ds-field">
          <label class="ds-label" for="s1Dob">Date of birth</label>
          <input id="s1Dob" v-model="memberInfo.dateOfBirth" class="ds-input" type="date">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s1Gender">Gender</label>
          <select id="s1Gender" v-model="memberInfo.gender" class="ds-select">
            <option value="" disabled>Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s1Nationality">Nationality</label>
          <input id="s1Nationality" v-model="memberInfo.nationality" class="ds-input" type="text">
        </div>

        <div class="ds-field">
          <label class="ds-label" for="s1Town">Hometown</label>
          <input id="s1Town" v-model="memberInfo.town" class="ds-input" type="text">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s1Region">Region</label>
          <input id="s1Region" v-model="memberInfo.region" class="ds-input" type="text">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s1Marital">Marital status</label>
          <select id="s1Marital" v-model="memberInfo.maritalStatus" class="ds-select">
            <option value="" disabled>Select status</option>
            <option value="Married">Married</option>
            <option value="Single">Single</option>
            <option value="Widowed">Widowed</option>
            <option value="Separated">Separated</option>
            <option value="Divorced">Divorced</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Contact -->
    <div class="ds-formsection">
      <div class="ds-formsection__head">
        <h3 class="ds-h3">Contact</h3>
      </div>

      <div class="ds-field">
        <label class="ds-label" for="s1Postal">Postal / contact address</label>
        <input id="s1Postal" v-model="memberInfo.contactAddress" class="ds-input" type="text">
      </div>

      <div class="ds-field">
        <label class="ds-label" for="s1Residential">Permanent residential address</label>
        <input id="s1Residential" v-model="memberInfo.permanentResidentialAddress" class="ds-input" type="text">
      </div>

      <div class="ds-formgrid">
        <div class="ds-field">
          <label class="ds-label" for="s1Tel1">Telephone number 1</label>
          <input id="s1Tel1" v-model="memberInfo.firstTelephoneNumber" class="ds-input" type="tel" inputmode="tel">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s1Tel2">Telephone number 2</label>
          <input id="s1Tel2" v-model="memberInfo.secondTelephoneNumber" class="ds-input" type="tel" inputmode="tel">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s1Email">Email address</label>
          <input id="s1Email" v-model="memberInfo.emailAddress" class="ds-input" type="email">
          <span class="ds-help">Optional.</span>
        </div>
      </div>
    </div>

    <!-- Baptism -->
    <div class="ds-formsection">
      <div class="ds-formsection__head">
        <h3 class="ds-h3">Baptism</h3>
      </div>

      <div class="ds-formgrid">
        <div class="ds-field">
          <label class="ds-label" for="s1Baptism">Date of baptism</label>
          <input id="s1Baptism" v-model="memberInfo.dateOfBaptism" class="ds-input" type="date">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s1Assembly">Assembly where baptised</label>
          <input id="s1Assembly" v-model="memberInfo.churchOfBaptism" class="ds-input" type="text">
        </div>
      </div>
    </div>

    <!-- Education and work -->
    <div class="ds-formsection">
      <div class="ds-formsection__head">
        <h3 class="ds-h3">Education and work</h3>
      </div>

      <div class="ds-formgrid">
        <div class="ds-field">
          <label class="ds-label" for="s1Education">Highest education</label>
          <select id="s1Education" v-model="memberInfo.educationLevel" class="ds-select">
            <option value="" disabled>Select level</option>
            <option value="University">University</option>
            <option value="Polytechnic">Polytechnic</option>
            <option value="Secondary / Training College">Secondary / Training College</option>
            <option value="Technical / Commercial">Technical / Commercial</option>
            <option value="Middle/ JSS">Middle / JSS</option>
            <option value="Primary">Primary</option>
            <option value="None">None</option>
          </select>
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s1Profession">Profession</label>
          <input id="s1Profession" v-model="memberInfo.memberProfession" class="ds-input" type="text">
          <span class="ds-help">The skill the member has.</span>
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s1Occupation">Occupation</label>
          <input id="s1Occupation" v-model="memberInfo.memberOccupation" class="ds-input" type="text">
          <span class="ds-help">What the member currently does.</span>
        </div>
      </div>
    </div>

    <!-- Languages -->
    <div class="ds-formsection">
      <div class="ds-formsection__head">
        <h3 class="ds-h3">Languages</h3>
        <p>Select every language the member speaks and writes.</p>
      </div>

      <div class="ds-formgrid">
        <fieldset class="ds-checkgroup ds-field">
          <legend class="ds-checkgroup__legend">Spoken</legend>
          <div class="ds-checkgroup__items">
            <label
              v-for="language in languages"
              :key="'spoken-' + language"
              class="ds-check"
              :class="{ 'is-checked': isChecked('spokenLanguage', language) }"
            >
              <input
                v-model="memberInfo.spokenLanguage"
                type="checkbox"
                :value="language"
              >
              {{ language }}
            </label>
          </div>
        </fieldset>

        <fieldset class="ds-checkgroup ds-field">
          <legend class="ds-checkgroup__legend">Written</legend>
          <div class="ds-checkgroup__items">
            <label
              v-for="language in languages"
              :key="'written-' + language"
              class="ds-check"
              :class="{ 'is-checked': isChecked('writtenLanguage', language) }"
            >
              <input
                v-model="memberInfo.writtenLanguage"
                type="checkbox"
                :value="language"
              >
              {{ language }}
            </label>
          </div>
        </fieldset>
      </div>

      <div class="ds-field" style="margin-bottom:0">
        <label class="ds-label" for="s1Hobbies">Hobbies</label>
        <input id="s1Hobbies" v-model="memberInfo.hobbies" class="ds-input" type="text">
      </div>
    </div>

    <div class="ds-formactions">
      <button class="ds-btn ds-btn--primary" type="submit" :disabled="isLoading">
        <span v-if="isLoading" class="ds-btn__spinner"></span>
        {{ isLoading ? 'Saving' : 'Save personal information' }}
      </button>
    </div>
  </form>
</template>

<script>
import { MembershipFormOne } from '../../network/Member'

const LANGUAGES = ['English', 'Twi', 'Ga', 'Ewe', 'Hausa', 'Other']

export default {
  name: 'SectionOne',
  props: ['member'],
  data () {
    return {
      id: '',
      isLoading: false,
      languages: LANGUAGES,
      memberInfo: Object.assign({}, MembershipFormOne)
    }
  },
  mounted () {
    this.id = this.$route.params.id
    this.memberInfo = Object.assign({}, MembershipFormOne, this.member)

    this.memberInfo.dateOfBirth = this.formatDate(this.memberInfo.dateOfBirth)
    this.memberInfo.dateOfBaptism = this.formatDate(this.memberInfo.dateOfBaptism)

    // The API may return null for either list; v-model on a checkbox needs an array.
    this.memberInfo.spokenLanguage = this.toArray(this.memberInfo.spokenLanguage)
    this.memberInfo.writtenLanguage = this.toArray(this.memberInfo.writtenLanguage)
  },
  methods: {
    toArray (value) {
      if (Array.isArray(value)) { return value }
      if (typeof value === 'string' && value.length) { return value.split(',').map(item => item.trim()) }
      return []
    },
    isChecked (field, value) {
      const list = this.memberInfo[field]
      return Array.isArray(list) && list.indexOf(value) !== -1
    },
    formatDate (rowDate) {
      if (rowDate == null) {
        return ''
      }
      return String(rowDate).split('T')[0]
    },
    update () {
      this.isLoading = true
      this.memberInfo.userId = this.id

      this.$axios.put(`churchmembers/userdetails/${this.id}`, this.memberInfo).then(() => {
        this.$toast.success('Personal information saved')
        this.isLoading = false
      }).catch(error => {
        // Previously reported through $toast.success, so failures looked like successes.
        const message = error && error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Could not save this section.'
        this.$toast.error(message)
        this.isLoading = false
      })
    }
  }
}
</script>
