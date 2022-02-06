<template>
  <div class="row">
    <div>
      <ul class="list-unstyled">
        <li>
          <h5>PART III</h5>
        </li>
        <li>
          <div class="row">
            <label class="text-black my-2">PARENTAL DETAILS</label>

            <label class="text-black">Father</label>
            <div class="col">
              <label>First name</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.fatherFirstName" class="form-control" placeholder=""
                       aria-label="First name">
              </div>
            </div>
            <div class="col">
              <label>Surname</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.fatherLastName" class="form-control" placeholder=""
                       aria-label="Last name">
              </div>
            </div>
            <div class="col">
              <label>Other names</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.fatherOtherName" class="form-control" placeholder=""
                       aria-label="Other name">
              </div>
            </div>
          </div>
          <div class="row mt-2">
            <div class="col">
              <select v-model="memberInfo.isBiologicalFather" class="form-select form-control-lg w-100 mt-2"
                      aria-label=".form-select-sm example">
                <option :value="true">Biological Father</option>
                <option :value="false">Foster Father</option>
              </select>
            </div>
            <div class="col">
              <select v-model="memberInfo.isFatherAlive" class="form-select form-control-lg w-100 mt-2"
                      aria-label=".form-select-sm example">
                <option :value="true">Alive</option>
                <option :value="false">Dead</option>
              </select>
            </div>
          </div>
        </li>
        <li>
          <hr>
        </li>
        <li>
          <div class="row mt-3">
            <label class="text-black">Mother</label>
            <div class="col">
              <label>First name</label>
              <div class="mt-2">
                <input v-model="memberInfo.motherFirstName" type="text" class="form-control" placeholder=""
                       aria-label="First name">
              </div>
            </div>
            <div class="col">
              <label>Surname</label>
              <div class="mt-2">
                <input v-model="memberInfo.motherSurname" type="text" class="form-control" placeholder=""
                       aria-label="Last name">
              </div>
            </div>
            <div class="col">
              <label>Other names</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.motherOtherName" class="form-control" placeholder=""
                       aria-label="Other name">
              </div>
            </div>
          </div>
          <div class="row mt-2">
            <div class="col">
              <select v-model="memberInfo.isBiologicalMother" class="form-select form-control-lg w-100 mt-2"
                      aria-label=".form-select-sm example">
                <option :value="true">Biological Mother</option>
                <option :value="false">Foster Mother</option>
              </select>
            </div>
            <div class="col">
              <select v-model="memberInfo.isMotherAlive" class="form-select form-control-lg w-100 mt-2"
                      aria-label=".form-select-sm example">
                <option :value="true">Alive</option>
                <option :value="false">Dead</option>
              </select>
            </div>
          </div>
        </li>
        <li>
          <hr>
        </li>
        <li>
          <div class="row mt-3">
            <label class="text-black">DETAILS OF NEXT OF KIN</label>
            <div class="col">
              <label>Full name</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.nextOfKinFullname" class="form-control" placeholder=""
                       aria-label="First name">
              </div>
            </div>
            <div class="col">
              <label>Relationship of member to next-of-kin</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.memberNextOfKinRelationship" class="form-control" placeholder=""
                       aria-label="First name">
              </div>
            </div>
          </div>
        </li>
        <li>
          <div class="row mt-3">
            <div class="col">
              <label>Telephone Number 1</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.nextOfKinFirstTelephoneNumber" class="form-control"
                       placeholder="" aria-label="First name">
              </div>
            </div>
            <div class="col">
              <label>Telephone Number 2</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.nextOfKinSecondTelephoneNumber" class="form-control"
                       placeholder="" aria-label="First name">
              </div>
            </div>
          </div>
        </li>
        <li class="mt-4">
          <button v-if="!isLoading" @click="updateRecord()" class="btn btn-primary btn-lg px-4 py-2 w-50">
            <h6 class="p-0 m-0">SAVE DETAILS</h6>
          </button>
          <button v-else class="btn btn-primary btn-lg px-4 py-2 w-50" type="button" disabled>
            <h6 class="p-0 m-0"><span class="spinner-border spinner-border-sm" role="status"
                                      aria-hidden="true"></span> LOADING ...</h6>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {MembershipFormThree} from "../../network/Member";

export default {
  name: "SectionThree",
  props: ['member'],
  data() {
    return {
      id: '',
      isLoading: false,
      memberInfo: MembershipFormThree
    }
  },
  mounted() {
    this.memberInfo = Object.assign({}, this.member)
    this.id = this.$route.params.id;
  },
  methods: {
    updateRecord() {

      this.memberInfo.userId = this.id
      this.isLoading = true
      this.$axios.put(`churchmembers/userdetails/${this.id}`, this.memberInfo).then(response => {
        this.$toast.success("Successfully updated")
        this.isLoading = false
      }).catch(error => {
        this.$toast.success(error.response.data.message)
        this.isLoading = false
      })

    }
  }
}
</script>

<style scoped>

</style>
