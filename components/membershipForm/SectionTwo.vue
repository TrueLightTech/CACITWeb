<template>
  <div class="row">
    <div>
      <!--      <form>-->
      <ul class="list-unstyled">
        <li>
          <h5>PART II</h5>
        </li>
        <li>
          <div class="row">
            <label class="text-black my-2">NAME OF SPOUSE</label>
            <div class="col">
              <label>First name</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.spouseFirstName" class="form-control" placeholder=""
                       aria-label="First name">
              </div>
            </div>
            <div class="col">
              <label>Surname</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.spouseSurname" class="form-control" placeholder=""
                       aria-label="Last name">
              </div>
            </div>
            <div class="col">
              <label>Other names</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.spouseOtherName" class="form-control" placeholder=""
                       aria-label="Other name">
              </div>
            </div>
          </div>
        </li>
        <li>
          <div class="row mt-3">
            <div class="col">
              <label>Telephone Number 1</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.spouseFirstTelephoneNumber" class="form-control" placeholder=""
                       aria-label="First name">
              </div>
            </div>
            <div class="col">
              <label>Telephone Number 2</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.spouseSecondTelephoneNumber" class="form-control"
                       placeholder="" aria-label="First name">
              </div>
            </div>
          </div>
        </li>
        <li>
          <hr>
          <label class="text-black my-1">DETAILS OF CHILDREN (<small>To be completed by members who have
            children</small> )</label>
        </li>
        <li class="p-2">
          <div class="d-flex w-100 justify-content-end">
            <button @click="increaseChildrenCount()" type="button" class="btn btn-primary text-end"><i
              class="fas fa-plus-circle"></i> Add Child
            </button>
          </div>
          <div class="row my-2">
            <table class="table">
              <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Name of child</th>
                <th scope="col">Date of Birth</th>
                <th scope="col">Tel No.</th>
                <th scope="col"></th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(info,index) in memberInfo.childInformation" :key="index">
                <th scope="row">{{ index + 1 }}</th>
                <td>
                  <div class="mt-2">
                    <input type="text" v-model="memberInfo.childInformation[index].nameOfChild" class="form-control"
                           placeholder=""
                           @keyup="activate(index)"
                           aria-label="First name">
                  </div>
                </td>
                <td>
                  <div class="mt-2">
                    <input type="date" v-model="memberInfo.childInformation[index].childDateOfBirth"
                           @keyup="activate(index)"
                           class="form-control" placeholder=""
                           aria-label="Last name">
                  </div>
                </td>
                <td>
                  <div class="mt-2">
                    <input type="text" v-model="memberInfo.childInformation[index].telephoneNumber" class="form-control"
                           placeholder=""
                           @keyup="activate(index)"
                           aria-label="Last name">
                  </div>
                </td>
                <td>
                  <div class="mt-2">
                    <button v-if="!(isClicked === index)" @click="saveChildRecord(index)" type="button"
                            class="btn btn-success"
                            :disabled="!activeChildrenRow.includes(index)">
                      Save
                    </button>
                    <button v-else class="btn btn-success" type="button" disabled>
                      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span class="visually-hidden">Loading...</span>
                    </button>
                    <button @click="deleteChildRecord(index)" type="button" class="btn btn-outline-danger"><i
                      class="far fa-trash-alt"></i></button>

                  </div>
                </td>
              </tr>
              </tbody>
            </table>
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
      <!--      </form>-->

    </div>
  </div>
</template>

<script>
import {MembershipFormTwo} from "../../network/Member";

export default {
  name: "SectionTwo",
  props: ['member'],
  data() {
    return {
      id: '',
      children: 1,
      memberInfo: MembershipFormTwo,
      childrenDetails: [],
      activeChildrenRow: [],
      isClicked: -1,
      isLoading: false,
    }
  },
  mounted() {
    this.id = this.$route.params.id;
    this.memberInfo = Object.assign({}, this.member)

    this.memberInfo.childInformation.map((child) => {
      child.childDateOfBirth = this.formatDate(child.childDateOfBirth)
    })

  },
  methods: {
    activate(index) {
      if (this.activeChildrenRow.includes(index)) {
      } else {
        this.activeChildrenRow.push(index)
      }
    },
    deactivate(index) {
      if (this.activeChildrenRow.includes(index)) {
        let theIndex = this.activeChildrenRow.indexOf(index)
        this.activeChildrenRow.splice(theIndex, 1)
      }
      this.isClicked = -1
    },
    formatDate(rowDate) {
      if (rowDate == null) {
        return ""
      } else {
        return rowDate.split("T")[0]
      }
    },
    increaseChildrenCount() {
      this.memberInfo.childInformation.push({
        nameOfChild: "",
        childDateOfBirth: null,
        telephoneNumber: ""
      })
    },
    saveChildRecord(index) {
      this.isClicked = index
      this.memberInfo.childInformation[index] = {
        nameOfChild: this.memberInfo.childInformation[index].nameOfChild,
        childDateOfBirth: this.memberInfo.childInformation[index].childDateOfBirth,
        telephoneNumber: this.memberInfo.childInformation[index].telephoneNumber
      }
      this.deactivate(index)
    },
    deleteChildRecord(index) {
      let theIndex = this.memberInfo.childInformation.indexOf(this.memberInfo.childInformation[index])
      this.memberInfo.childInformation.splice(theIndex, 1)
      this.deactivate(index)
    },
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
