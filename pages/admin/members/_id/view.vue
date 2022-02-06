<template>
  <div class="container">
    <div class="row justify-content-center mt-10">
      <div v-if="!pageRefresh" class="col-md-8">
        <div class="card py-4">
          <div class="row justify-content-center">
            <div class="col-md-4 d-flex text-center align-content-center justify-content-center">
              <img style="height: 150px; width: 150px;" :src="getProfileImage(this.member.profilePicture)"
                   class="img-fluid align-content-center justify-content-center align-self-center profileImage rounded-circle">
            </div>
            <div class="col-md-8">
              <ul class="list-unstyled">
                <li><h5 class="my-1">{{ member.name }}</h5></li>
                <li><p class="my-1">{{ member.phoneNumber }}</p></li>
                <li><p class="my-1">{{ member.gender }}</p></li>
                <li><p class="my-2">{{ $moment(member.dataOfBirth).format('Do MMMM YYYY') }}</p></li>
                <li><p class="my-2">{{ member.churchFamilyName }}</p></li>
                <li>
                  <ul class="list-item mx-0 px-0">
                    <li class="list-unstyled mx-0">
                      <div class="" role="group" aria-label="Basic example">
                        <NuxtLink :to="'/admin/members/'+member.id">
                          <button type="button" class="btn btn-primary">Update</button>
                        </NuxtLink>
                        <NuxtLink :to="'/admin/members/'+member.id+'/tithe'">
                          <button type="button" class="btn btn-outline-primary">Record Tithe</button>
                        </NuxtLink>
                        <NuxtLink :to="'/admin/members/'+member.id+'/role'"
                                  v-if="loggedInUser.data.roleId === '1'">
                          <button type="button" class="btn btn-secondary">Assign Role</button>
                        </NuxtLink>
                        <button v-if="loggedInUser.data.roleId === '1'" type="button" data-bs-target="#warningModal"
                                data-bs-toggle="modal"
                                class="btn btn-danger">Delete
                        </button>
                      </div>
                    </li>
                  </ul>
                </li>
              </ul>


            </div>
          </div>


        </div>
      </div>
      <page-loader v-else></page-loader>

      <div v-if="!isLoading" class="col-md-8">
        <div class="d-flex justify-content-between mt-4">
          <h4>Member Details</h4>

          <NuxtLink :to="'/admin/members/'+member.id+'/membership-form'" v-if="loggedInUser.data.roleId === '1'">
            <button type="button" class="btn btn-outline-primary">Membership Form <i class="fas fa-arrow-right"></i>
            </button>
          </NuxtLink>
        </div>

        <div class="card py-4 mt-3 px-4">

          <div class="row justify-content-center">
            <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home"
                        type="button" role="tab" aria-controls="pills-home" aria-selected="true"> Personal Info
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile"
                        type="button" role="tab" aria-controls="pills-profile" aria-selected="false"> Family Details
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="pills-contact-tab" data-bs-toggle="pill" data-bs-target="#pills-contact"
                        type="button" role="tab" aria-controls="pills-contact" aria-selected="false"> Parental Details
                </button>
              </li>
            </ul>
            <div class="tab-content mt-4" id="pills-tabContent">
              <div class="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
                <div class="row my-2">
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>First name</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.firstName }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Surname</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.surname }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Other name</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.otherNames }}</p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="row my-2">
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Date of Birth</label></li>
                      <li>
                        <p>{{ $moment(memberInfoSectionOne.dateOfBirth).format('Do MMMM YYYY') }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Gender</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.gender }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Nationality</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.nationality }}</p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="row my-2">
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Hometown</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.town }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Region</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.region }}</p>
                      </li>
                    </ul>
                  </div>

                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Marital Status</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.maritalStatus }}</p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="row my-2">
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Postal Address</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.contactAddress }}</p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="row my-2">
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Tel No. 1</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.firstTelephoneNumber }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Tel No. 2</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.secondTelephoneNumber }}</p>
                      </li>
                    </ul>
                  </div>

                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Email Address</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.emailAddress }}</p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="row my-2">
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Year of Baptism</label></li>
                      <li>
                        <p>{{ $moment(memberInfoSectionOne.dateOfBaptism).format('Do MMMM YYYY') }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Name of assembly where baptised </label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.churchOfBaptism }}</p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="row my-2">
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Education</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.educationLevel }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Profession</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.memberProfession }}</p>
                      </li>
                    </ul>
                  </div>

                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Occupation</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.memberOccupation }}</p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="row my-2">
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Spoken Languages</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.spokenLanguage.join() }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Written Languages</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.writtenLanguage.join() }}</p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="row my-2">
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Hobbies</label></li>
                      <li>
                        <p>{{ memberInfoSectionOne.hobbies }}</p>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>
              <div class="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
                <div class="row">
                  <h6>Spouse Details</h6>
                </div>
                <div class="row my-2">
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>First name</label></li>
                      <li>
                        <p>{{ memberInfoSectionTwo.spouseFirstName }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Surname</label></li>
                      <li>
                        <p>{{ memberInfoSectionTwo.spouseSurname }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Other name</label></li>
                      <li>
                        <p>{{ memberInfoSectionTwo.spouseOtherName }}</p>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="row my-2">
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Tel No. 1</label></li>
                      <li>
                        <p>{{ memberInfoSectionTwo.spouseFirstTelephoneNumber }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Tel No. 2</label></li>
                      <li>
                        <p>{{ memberInfoSectionTwo.spouseSecondTelephoneNumber }}</p>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="row">
                  <hr>
                </div>
                <div class="row">
                  <h6>Details of Children</h6>
                </div>
                <div>
                  <table class="table">
                    <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Name</th>
                      <th scope="col">Date of Birth</th>
                      <th scope="col">Tel No.</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(child,index) in memberInfoSectionTwo.childInformation">
                      <th scope="row">{{ index + 1 }}</th>
                      <td>{{ child.nameOfChild }}</td>
                      <td>{{ $moment(child.childDateOfBirth).format('Do MMMM YYYY') }}</td>
                      <td>{{ child.telephoneNumber }}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="tab-pane fade" id="pills-contact" role="tabpanel" aria-labelledby="pills-contact-tab">
                <div class="row">
                  <h6>Father's Details</h6>
                </div>
                <div class="row my-2">
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>First name</label></li>
                      <li>
                        <p>{{ memberInfoSectionThree.fatherFirstName }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Surname</label></li>
                      <li>
                        <p>{{ memberInfoSectionThree.fatherSurname }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Other name</label></li>
                      <li>
                        <p>{{ memberInfoSectionThree.fatherOtherName }}</p>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="row my-2">
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Biological Father</label></li>
                      <li>
                        <p>{{ memberInfoSectionThree.isBiologicalFather }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Is Father Alive?</label></li>
                      <li>
                        <p>{{ memberInfoSectionThree.isFatherAlive }}</p>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="row my-2">
                  <hr>
                </div>
                <div class="row">
                  <h6>Mother's Details</h6>
                </div>
                <div class="row my-2">
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>First name</label></li>
                      <li>
                        <p>{{ memberInfoSectionThree.motherFirstName }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Surname</label></li>
                      <li>
                        <p>{{ memberInfoSectionThree.motherSurname }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Other name</label></li>
                      <li>
                        <p>{{ memberInfoSectionThree.motherLastName }}</p>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="row my-2">
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Biological Mother</label></li>
                      <li>
                        <p>{{ memberInfoSectionThree.isBiologicalMother }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Is Mother Alive?</label></li>
                      <li>
                        <p>{{ memberInfoSectionThree.isMotherAlive }}</p>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="row my-2">
                  <hr>
                </div>
                <div class="row">
                  <h6>Details of Next of-Kin</h6>
                </div>
                <div class="row my-2">
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Full name</label></li>
                      <li>
                        <p>{{ memberInfoSectionThree.nextOfKinFullname }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Relationship of Member to Next-of-kin</label></li>
                      <li>
                        <p>{{ memberInfoSectionThree.memberNextOfKinRelationship }}</p>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="row my-2">
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Tel No. 1</label></li>
                      <li>
                        <p>{{ memberInfoSectionThree.nextOfKinFirstTelephoneNumber }}</p>
                      </li>
                    </ul>
                  </div>
                  <div class="col">
                    <ul class="list-unstyled">
                      <li><label>Tel No. 2</label></li>
                      <li>
                        <p>{{ memberInfoSectionThree.nextOfKinSecondTelephoneNumber }}</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <page-loader class="mt-10" v-else></page-loader>
    </div>


    <warning-modal v-bind:title="'Are you sure?'" :message="'You are about to delete this users details.'"
                   @onclick="modalState($event)"></warning-modal>
  </div>
</template>

<script>
import {profileImageBaseUrl} from "../../../../resources/constants";
import {ChurchMember, MembershipFormOne, MembershipFormThree, MembershipFormTwo} from "../../../../network/Member";
import {mapGetters} from 'vuex';


export default {
  name: "view",
  beforeMount() {
    this.getMember(this.$route.params.id)
    this.getMembershipDetails(this.$route.params.id)
  },
  data() {
    return {
      pageRefresh: false,
      toDeleteId: '',
      member: ChurchMember,
      memberInfoSectionOne: MembershipFormOne,
      memberInfoSectionTwo: MembershipFormTwo,
      memberInfoSectionThree: MembershipFormThree,
      isLoading: false
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser'])
  },
  methods: {
    getMember(id) {
      this.pageRefresh = true
      this.$axios.get(`churchmembers/user/${id}`).then(response => {
        this.member = Object.assign(this.member, response.data.data)
        this.member.dataOfBirth = this.member.dataOfBirth.split('T')[0]
        this.member.profilePicture = this.getProfileImage(this.member.profilePicture)

        this.pageRefresh = false
      }).catch(error => {
        this.member.profilePicture = this.getProfileImage('')
        this.pageRefresh = false
      })
    },
    getMembershipDetails(id) {
      this.isLoading = true

      this.$axios.get(`/churchmembers/userdetails/${id}`).then(response => {
        this.memberInfoSectionOne = Object.assign(this.memberInfoSectionOne, response.data.data)
        this.memberInfoSectionTwo = Object.assign(this.memberInfoSectionTwo, response.data.data)
        this.memberInfoSectionThree = Object.assign(this.memberInfoSectionThree, response.data.data)

        this.isLoading = false
      }).catch(error => {
        this.isLoading = false
      })
    },
    getProfileImage(image) {
      if (image) {
        if (image.includes('user.svg')) {
          return require(`~/assets/imgs/user.svg`)
        } else {
          return `${profileImageBaseUrl}/${image}`
        }
      }
      return require(`~/assets/imgs/user.svg`)
    },
    deleteMember(id) {
      this.$axios.delete(`churchmembers/${id}`).then(response => {
        this.$toast.info("User successfully deleted.")
        this.$router.push('/admin/manage')

      }).catch(error => {
      })
    },
    checkUserToDelete(id) {
      this.toDeleteId = id
    },
    modalState(data) {
      if (data.toString().toLowerCase() === 'positive') {
        this.deleteMember(this.$route.params.id)
      }
    }
  }
}
</script>

<style scoped>

</style>
