<template>
  <div class="row">
    <div>
      <ul class="list-unstyled">
        <li>
          <h5>PART I</h5>
        </li>
        <li>
          <div class="row">
            <label class="text-black my-2">PERSONAL INFORMATION</label>
            <div class="col">
              <label for="dob">First name</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.firstName" class="form-control" placeholder=""
                       aria-label="First name">
              </div>
            </div>
            <div class="col">
              <label for="dob">Surname</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.surname" class="form-control" placeholder=""
                       aria-label="Last name">
              </div>
            </div>
            <div class="col">
              <label for="dob">Other names</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.otherNames" class="form-control" placeholder=""
                       aria-label="Other name">
              </div>
            </div>
          </div>
        </li>
        <li class="mt-4">
          <div class="row">
            <div class="col">
              <div class="mb-3">
                <label for="dob">Date of Birth</label>
                <div class="mt-2">
                  <input id="dob" type="date" v-model="memberInfo.dateOfBirth"
                         class="form-control form-control-lg w-100">
                </div>
              </div>
            </div>
            <div class="col">
              <label for="dob">Gender</label>
              <select v-model="memberInfo.gender" class="form-select form-control-lg w-100 mt-2"
                      aria-label=".form-select-sm example">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div class="col">
              <label for="dob">Nationality</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.nationality" class="form-control" placeholder=""
                       aria-label="First name">
              </div>
            </div>
          </div>
        </li>
        <li>
          <div>
            <div class="row">
              <div class="col">
                <label for="dob">Hometown</label>
                <div class="mt-2">
                  <input type="text" v-model="memberInfo.town" class="form-control" placeholder=""
                         aria-label="First name">
                </div>
              </div>
              <div class="col">
                <label>Region</label>
                <div class="mt-2">
                  <input type="text" v-model="memberInfo.region" class="form-control" placeholder=""
                         aria-label="First name">
                </div>
              </div>
            </div>
          </div>
        </li>
        <li>
          <div class="mb-3 mt-2">
            <label>Marital Status</label>
            <select class="form-select form-control-lg w-100 mt-2" v-model="memberInfo.maritalStatus"
                    aria-label=".form-select-sm example">
              <option v-bind:value="'Married'">Married</option>
              <option v-bind:value="'Single'">Single</option>
              <option v-bind:value="'Widowed'">Widowed</option>
              <option v-bind:value="'Separated'">Separated</option>
              <option v-bind:value="'Divorced'">Divorced</option>
            </select>
          </div>
        </li>
        <li>
          <hr>
        </li>
        <li>
          <div class="mb-3 mt-2">
            <label for="exampleFormControlInput1" class="form-label">Postal / Contact Address</label>
            <input type="text" v-model="memberInfo.contactAddress" class="form-control form-control-lg"
                   id="exampleFormControlInput1"
                   placeholder="">
          </div>
        </li>
        <li>
          <div class="row">
            <div class="col">
              <label>Telephone Number 1</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.firstTelephoneNumber" class="form-control" placeholder=""
                       aria-label="First name">
              </div>
            </div>
            <div class="col">
              <label>Telephone Number 2</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.secondTelephoneNumber" class="form-control" placeholder=""
                       aria-label="First name">
              </div>
            </div>
          </div>
        </li>
        <li>
          <div class="mb-3 mt-2">
            <label for="exampleFormControlInput1" class="form-label">Email address (Optional)</label>
            <input type="email" v-model="memberInfo.emailAddress" class="form-control form-control-lg"
                   id="exampleFormControlInput1"
                   placeholder="">
          </div>
        </li>
        <li>
          <div class="mb-3 mt-2">
            <label for="exampleFormControlInput1" class="form-label">Permanent Residential Address</label>
            <input type="email" v-model="memberInfo.permanentResidentialAddress" class="form-control form-control-lg"
                   id="exampleFormControlInput1"
                   placeholder="">
          </div>
        </li>
        <li>
          <hr>
        </li>
        <li>
          <div class="mb-3 mt-2">
            <label for="exampleFormControlInput1" class="form-label">Year of Baptism</label>
            <div class="mt-2">
              <input type="date" v-model="memberInfo.dateOfBaptism" class="form-control form-control-lg w-100">
            </div>
          </div>
        </li>
        <li>
          <div class="mb-3 mt-2">
            <label for="exampleFormControlInput1" class="form-label">Name of church Assembly where baptised</label>
            <input type="text" v-model="memberInfo.churchOfBaptism" class="form-control form-control-lg"
                   id="exampleFormControlInput1"
                   placeholder="">
          </div>
        </li>
        <li>
          <hr>
        </li>
        <li>
          <div class="mb-3 mt-2">
            <label>Education (Check only Highest)</label>
            <select v-model="memberInfo.educationLevel" class="form-select form-control-lg w-100 mt-2"
                    aria-label=".form-select-sm example">
              <option v-bind:value="'University'">University</option>
              <option v-bind:value="'Polytechnic'">Polytechnic</option>
              <option v-bind:value="'Secondary / Training College'">Secondary / Training College</option>
              <option v-bind:value="'Technical / Commercial'">Technical / Commercial</option>
              <option v-bind:value="'Middle/ JSS'">Middle/ JSS</option>
              <option v-bind:value="'Primary'">Primary</option>
              <option v-bind:value="'None'">None</option>
            </select>
          </div>
        </li>
        <li>
          <div class="row">
            <div class="col">
              <label>Profession of Member (Type of skill member has)</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.memberProfession" class="form-control" placeholder=""
                       aria-label="First name">
              </div>
            </div>
            <div class="col">
              <label>Occupation (What member is doing)</label>
              <div class="mt-2">
                <input type="text" v-model="memberInfo.memberOccupation" class="form-control" placeholder=""
                       aria-label="First name">
              </div>
            </div>
          </div>
        </li>
        <li>
          <hr>
        </li>
        <li>
          <div class="mb-3 mt-2">
            <label>Language and Proficiency </label>
            <div class="row">
              <div class="col">
                <label class="form-check-label">
                  Spoken
                </label>
                <ul class="list-unstyled">
                  <li>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="memberInfo.spokenLanguage"
                             value="English" id="flexCheckDefault">
                      <label class="form-check-label" for="flexCheckDefault">
                        English
                      </label>
                    </div>
                  </li>
                  <li>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="memberInfo.spokenLanguage" value="Twi"
                             id="flexCheckDefault">
                      <label class="form-check-label" for="flexCheckDefault">
                        Twi
                      </label>
                    </div>
                  </li>
                  <li>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="memberInfo.spokenLanguage" value="Ga"
                             id="flexCheckDefault">
                      <label class="form-check-label" for="flexCheckDefault">
                        Ga
                      </label>
                    </div>
                  </li>
                  <li>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="memberInfo.spokenLanguage" value="Ewe"
                             id="flexCheckDefault">
                      <label class="form-check-label" for="flexCheckDefault">
                        Ewe
                      </label>
                    </div>
                  </li>
                  <li>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="memberInfo.spokenLanguage"
                             value="Hausa" id="flexCheckDefault">
                      <label class="form-check-label" for="flexCheckDefault">
                        Hausa
                      </label>
                    </div>
                  </li>
                  <li>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" value="Other"
                             v-model="memberInfo.spokenLanguage" id="flexCheckDefault">
                      <label class="form-check-label" for="flexCheckDefault">
                        Other
                      </label>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="col">
                <label class="form-check-label">
                  Written
                </label>
                <ul class="list-unstyled">
                  <li>
                    <div class="form-check">
                      <input v-model="memberInfo.writtenLanguage" class="form-check-input" type="checkbox"
                             value="English" id="flexCheckDefault">
                      <label class="form-check-label" for="flexCheckDefault">
                        English
                      </label>
                    </div>
                  </li>
                  <li>
                    <div class="form-check">
                      <input class="form-check-input" v-model="memberInfo.writtenLanguage" type="checkbox" value="Twi"
                             id="flexCheckDefault">
                      <label class="form-check-label" for="flexCheckDefault">
                        Twi
                      </label>
                    </div>
                  </li>
                  <li>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="memberInfo.writtenLanguage" value="Ga"
                             id="flexCheckDefault">
                      <label class="form-check-label" for="flexCheckDefault">
                        Ga
                      </label>
                    </div>
                  </li>
                  <li>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="memberInfo.writtenLanguage" value="Ewe"
                             id="flexCheckDefault">
                      <label class="form-check-label" for="flexCheckDefault">
                        Ewe
                      </label>
                    </div>
                  </li>
                  <li>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="memberInfo.writtenLanguage"
                             value="Hausa" id="flexCheckDefault">
                      <label class="form-check-label" for="flexCheckDefault">
                        Hausa
                      </label>
                    </div>
                  </li>
                  <li>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="memberInfo.writtenLanguage"
                             value="Other" id="flexCheckDefault">
                      <label class="form-check-label" for="flexCheckDefault">
                        Other
                      </label>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </li>
        <li>
          <div class="mb-3 mt-2">
            <label for="exampleFormControlInput1" class="form-label">What are your hobbies?</label>
            <input type="email" v-model="memberInfo.hobbies" class="form-control form-control-lg"
                   id="exampleFormControlInput1"
                   placeholder="">
          </div>
        </li>
        <li class="mt-4">
          <button v-if="!isLoading" @click="update()" class="btn btn-primary btn-lg px-4 py-2 w-50">
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
import {MembershipFormOne} from "../../network/Member";

export default {
  name: "SectionOne",
  props: ['member'],
  data() {
    return {
      id: '',
      isLoading: false,
      memberInfo: MembershipFormOne
    }
  },
  mounted() {
    this.id = this.$route.params.id;
    this.memberInfo = Object.assign({}, this.member)

    this.memberInfo.dateOfBirth = this.formatDate(this.memberInfo.dateOfBirth)
    this.memberInfo.dateOfBaptism = this.formatDate(this.memberInfo.dateOfBaptism)
  },
  methods: {
    formatDate(rowDate) {
      if (rowDate == null) {
        return ""
      } else {
        return rowDate.split("T")[0]
      }
    },
    update() {
      this.isLoading = true
      this.memberInfo.userId = this.id
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
