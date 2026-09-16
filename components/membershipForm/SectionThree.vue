<template>
  <form @submit.prevent="updateRecord">
    <!-- Father -->
    <div class="ds-formsection">
      <div class="ds-formsection__head">
        <h3 class="ds-h3">Father</h3>
      </div>

      <div class="ds-formgrid">
        <div class="ds-field">
          <label class="ds-label" for="s3FatherFirst">First name</label>
          <input id="s3FatherFirst" v-model="memberInfo.fatherFirstName" class="ds-input" type="text">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s3FatherSurname">Surname</label>
          <input id="s3FatherSurname" v-model="memberInfo.fatherLastName" class="ds-input" type="text">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s3FatherOther">Other names</label>
          <input id="s3FatherOther" v-model="memberInfo.fatherOtherName" class="ds-input" type="text">
        </div>

        <div class="ds-field">
          <label class="ds-label" for="s3FatherBiological">Relationship</label>
          <select id="s3FatherBiological" v-model="memberInfo.isBiologicalFather" class="ds-select">
            <option :value="true">Biological father</option>
            <option :value="false">Foster father</option>
          </select>
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s3FatherAlive">Living</label>
          <select id="s3FatherAlive" v-model="memberInfo.isFatherAlive" class="ds-select">
            <option :value="true">Alive</option>
            <option :value="false">Deceased</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Mother -->
    <div class="ds-formsection">
      <div class="ds-formsection__head">
        <h3 class="ds-h3">Mother</h3>
      </div>

      <div class="ds-formgrid">
        <div class="ds-field">
          <label class="ds-label" for="s3MotherFirst">First name</label>
          <input id="s3MotherFirst" v-model="memberInfo.motherFirstName" class="ds-input" type="text">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s3MotherSurname">Surname</label>
          <input id="s3MotherSurname" v-model="memberInfo.motherSurname" class="ds-input" type="text">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s3MotherOther">Other names</label>
          <input id="s3MotherOther" v-model="memberInfo.motherOtherName" class="ds-input" type="text">
        </div>

        <div class="ds-field">
          <label class="ds-label" for="s3MotherBiological">Relationship</label>
          <select id="s3MotherBiological" v-model="memberInfo.isBiologicalMother" class="ds-select">
            <option :value="true">Biological mother</option>
            <option :value="false">Foster mother</option>
          </select>
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s3MotherAlive">Living</label>
          <select id="s3MotherAlive" v-model="memberInfo.isMotherAlive" class="ds-select">
            <option :value="true">Alive</option>
            <option :value="false">Deceased</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Next of kin -->
    <div class="ds-formsection">
      <div class="ds-formsection__head">
        <h3 class="ds-h3">Next of kin</h3>
        <p>Who the church should contact in an emergency.</p>
      </div>

      <div class="ds-formgrid">
        <div class="ds-field">
          <label class="ds-label" for="s3KinName">Full name</label>
          <input id="s3KinName" v-model="memberInfo.nextOfKinFullname" class="ds-input" type="text">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s3KinRelationship">Relationship to member</label>
          <input id="s3KinRelationship" v-model="memberInfo.memberNextOfKinRelationship" class="ds-input" type="text">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s3KinTel1">Telephone number 1</label>
          <input id="s3KinTel1" v-model="memberInfo.nextOfKinFirstTelephoneNumber" class="ds-input" type="tel" inputmode="tel">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s3KinTel2">Telephone number 2</label>
          <input id="s3KinTel2" v-model="memberInfo.nextOfKinSecondTelephoneNumber" class="ds-input" type="tel" inputmode="tel">
        </div>
      </div>
    </div>

    <div class="ds-formactions">
      <button class="ds-btn ds-btn--primary" type="submit" :disabled="isLoading">
        <span v-if="isLoading" class="ds-btn__spinner"></span>
        {{ isLoading ? 'Saving' : 'Save parents and next of kin' }}
      </button>
    </div>
  </form>
</template>

<script>
import { MembershipFormThree } from '../../network/Member'

export default {
  name: 'SectionThree',
  props: ['member'],
  data () {
    return {
      id: '',
      isLoading: false,
      memberInfo: Object.assign({}, MembershipFormThree)
    }
  },
  mounted () {
    this.memberInfo = Object.assign({}, MembershipFormThree, this.member)
    this.id = this.$route.params.id
  },
  methods: {
    updateRecord () {
      this.memberInfo.userId = this.id
      this.isLoading = true

      this.$axios.put(`churchmembers/userdetails/${this.id}`, this.memberInfo).then(() => {
        this.$toast.success('Parents and next of kin saved')
        this.isLoading = false
      }).catch(error => {
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
