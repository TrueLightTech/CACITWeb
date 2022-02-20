<template>
  <div class="container mt-10">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div>
          <div class="row justify-content-center">
            <div class="col-md-12 text-left d-flex justify-content-between mb-3">


              <ul class="list-unstyled">
                <li>
                  <h3>Offerings</h3>
                </li>
              </ul>

              <div>
                <button @click="clearFields()" type="button" data-bs-toggle="modal" data-bs-target="#staticBackdrop4"
                        class="btn btn-primary"><i
                  class="fas fa-plus-circle"></i> Add Offering
                </button>
              </div>
            </div>
          </div>

          <div class="row justify-content-center">
            <div class="col-md-12">
              <div v-if="!isLoading">
                <div class="input-group text-end float-end w-50 mb-3">
            <span class="input-group-text" id="basic-addon1" style="background-color: #f8f8f8;">
              <i class="fa fa-search" style="color:#cdcdcd;"></i>
            </span>
                  <input type="text" v-model="searchQuery" @keyup="searchByName()" class="form-control"
                         placeholder="Search offering by name"
                         aria-label="Username"
                         aria-describedby="basic-addon1">

                </div>
                <table class="table table-hover table-responsive">
                  <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Amount (GHS)</th>
                    <th scope="col">Service Name</th>
                    <th scope="col">Offering Type</th>
                    <th scope="col">Assigned to:</th>
                    <th scope="col">Date</th>
                    <th class="text-end" scope="col">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(offering,index) in offerings.results" :key="index">
                    <th scope="row">{{ index + 1 }}</th>
                    <td>{{ offering.name }}</td>
                    <td>{{ formatMoney(offering.amount) }}</td>
                    <td>{{ offering.serviceName }}</td>
                    <td>{{ offering.offeringTypeName }}</td>
                    <td> {{ cleanString(offering.assignFamilyName, offering.userName) }}</td>
                    <td>{{ $moment(offering.createdAt).format('Do MMM YY') }}</td>
                    <td class="text-end">
                      <div class="btn-group">
                        <button type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown"
                                aria-expanded="false">
                          Action
                        </button>
                        <ul class="dropdown-menu">
                          <li v-if="loggedInUser.data.roleId === '1'"
                              @click="edit(offering)"
                              data-bs-toggle="modal" data-bs-target="#staticBackdrop4">
                            <NuxtLink class="dropdown-item" :to="''">Edit</NuxtLink>
                          </li>
                          <li v-if="loggedInUser.data.roleId === '1'"
                              @click="edit(offering)"
                              data-bs-toggle="modal" data-bs-target="#staticBackdrop10">
                            <NuxtLink class="dropdown-item" :to="''">Assign offering to family</NuxtLink>
                          </li>
                          <li v-if="loggedInUser.data.roleId === '1'"
                              @click="edit(offering)"
                              data-bs-toggle="modal" data-bs-target="#staticBackdrop11">
                            <NuxtLink class="dropdown-item" :to="''">Assign offering to member</NuxtLink>
                          </li>
                          <li v-if="loggedInUser.data.roleId === '1'">
                            <a @click="checkToDelete(offering.id)" class="dropdown-item text-danger"
                               style="cursor: pointer;"
                               data-bs-toggle="modal"
                               data-bs-target="#exampleModal7">Delete
                            </a>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  </tbody>
                </table>
                <nav aria-label="Page navigation example">
                  <ul class="pagination justify-content-end">
                    <li class="page-item">
                      <a @click="fetchMoreOfferings(currentPage - 1)" class="page-link" href="#" tabindex="-1"
                         aria-disabled="true">Previous</a>
                    </li>
                    <li v-for="index in numberOfPages" :key="index" class="page-item">
                      <a @click="fetchMoreOfferings(index)" class="page-link" href="#">{{ index }}</a>
                    </li>
                    <li class="page-item">
                      <a @click="fetchMoreOfferings(currentPage+1)" class="page-link" href="#">Next</a>
                    </li>
                  </ul>
                </nav>
                <div v-if="!isLoading">
                  <p v-if="offerings.results.length === 0" class="align-self-center text-center">No data found</p>
                </div>
              </div>
              <page-loader v-else></page-loader>
            </div>
          </div>


          <!--           Modal-->
          <div class="modal fade" id="exampleModal7" tabindex="-1" aria-labelledby="exampleModalLabel"
               aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-sm">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                  <ul class="list-unstyled">
                    <li><h3>{{ this.title }}</h3></li>
                    <li><p>
                      {{ this.message }}
                    </p></li>
                  </ul>
                </div>
                <div class="modal-footer d-flex justify-content-center">
                  <button type="button" class="btn btn-secondary" @click="negativeButton()" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button type="button" class="btn btn-primary" @click="positiveButton()" data-bs-dismiss="modal">
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>


          <!--           Modal-->
          <div class="modal fade" id="staticBackdrop4" data-bs-keyboard="false" tabindex="-1"
               aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="staticBackdropLabel">Add Offering</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <form>
                    <ul class="list-unstyled">
                      <li>
                        <div class="mb-3">
                          <label for="recipient-name" class="col-form-label">Name</label>
                          <input type="text" v-model="offeringName" class="form-control" id="recipient-name">
                        </div>
                      </li>
                      <li>
                        <div class="mb-3">
                          <label for="recipient-amount" class="col-form-label">Amount</label>
                          <input type="text" v-model="amount" class="form-control" id="recipient-amount">
                        </div>
                      </li>
                      <li class="my-3" v-if="!isOfferingTypeLoaded">
                        <label class="mb-2 text-start">Select Offering Type</label>
                        <select v-model="offeringTypeId" class="form-select form-control-lg"
                                aria-label="Default select example">
                          <option :value="offeringType.id"
                                  v-for="offeringType in offeringTypes.data">{{ offeringType.name }}
                          </option>
                        </select>
                      </li>
                      <li class="my-3" v-if="!isServiceLoaded">
                        <label class="mb-2 text-start">Select Service</label>
                        <select v-model="serviceId" class="form-select form-control-lg"
                                aria-label="Default select example">
                          <option :value="service.id"
                                  v-for="service in services.data">{{ service.name }}
                          </option>
                        </select>
                      </li>
                      <li class="my-3" v-if="!isFamilyLoaded">
                        <label class="mb-2 text-start">Select Family</label>
                        <select v-model="familyId" class="form-select form-control-lg"
                                aria-label="Default select example">
                          <option :value="family.id"
                                  v-for="family in families.data">{{ family.name }}
                          </option>
                        </select>
                      </li>
                      <li class="my-3" v-if="!isFamilyLoaded">
                        <label class="mb-2 text-start">Select Member</label>

                        <input v-model="membersQuery" @keyup="getMembers()" class="form-control">
                        <ul v-if="!this.isMembersLoading" :class="showSuggestions">
                          <li v-if="members.results.length !== 0" @click="selectedMember(member)"
                              v-for="(member,index) in members.results"
                              :value="member.name" :key="index"><a class="dropdown-item" href="#">{{ member.name }}</a>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <label class="mb-2 text-start">Date</label>
                        <input type="date" v-model="offeringDate" class="form-control">
                      </li>
                    </ul>
                  </form>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button @click="saveOffering()" type="button" data-bs-dismiss="modal" class="btn btn-primary">Save
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal fade" id="staticBackdrop10" data-bs-keyboard="false" tabindex="-1"
               aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="staticBackdropLabel">Assign Offering to Family</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <form>
                    <ul class="list-unstyled">
                      <li>
                        <div class="mb-3">
                          <label for="recipient-name" class="col-form-label">Name</label>
                          <input type="text" v-model="offeringName" class="form-control disabled" id="recipient-name"
                                 disabled>
                        </div>
                      </li>
                      <li>
                        <div class="mb-3">
                          <label for="recipient-amount" class="col-form-label">Amount</label>
                          <input type="text" v-model="amount" class="form-control disabled" id="recipient-amount"
                                 disabled>
                        </div>
                      </li>
                      <li class="my-3" v-if="!isFamilyLoaded">
                        <label class="mb-2 text-start">Select Family</label>
                        <select v-model="familyId" class="form-select form-control-lg"
                                aria-label="Default select example">
                          <option :value="family.id"
                                  v-for="family in families.data">{{ family.name }}
                          </option>
                        </select>
                      </li>
                    </ul>
                  </form>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button @click="assignToFamily()" type="button" data-bs-dismiss="modal" class="btn btn-primary">Save
                  </button>
                </div>
              </div>
            </div>
          </div>


          <div class="modal fade" id="staticBackdrop11" data-bs-keyboard="false" tabindex="-1"
               aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="staticBackdropLabel">Assign Offering to Member</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <form>
                    <ul class="list-unstyled">
                      <li>
                        <div class="mb-3">
                          <label for="recipient-name" class="col-form-label">Name</label>
                          <input type="text" v-model="offeringName" class="form-control disabled" id="recipient-name"
                                 disabled>
                        </div>
                      </li>
                      <li>
                        <div class="mb-3">
                          <label for="recipient-amount" class="col-form-label">Amount</label>
                          <input type="text" v-model="amount" class="form-control disabled" id="recipient-amount"
                                 disabled>
                        </div>
                      </li>
                      <li class="my-3" v-if="!isFamilyLoaded">
                        <label class="mb-2 text-start">Select Member</label>

                        <input v-model="membersQuery" @keyup="getMembers()" class="form-control">
                        <ul v-if="!this.isMembersLoading" :class="showSuggestions">
                          <li v-if="members.results.length !== 0" @click="selectedMember(member)"
                              v-for="(member,index) in members.results"
                              :value="member.name" :key="index"><a class="dropdown-item" href="#">{{ member.name }}</a>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </form>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button @click="assignToMember()" type="button" data-bs-dismiss="modal" class="btn btn-primary">Save
                  </button>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  </div>
</template>

<script>

import {ChurchFamilyList, MemberList, OfferingList, OfferingType, ServiceList} from "../../network/Member";
import {numberWithCommas} from "../../resources/constants";
import {mapGetters} from "vuex";
import {AnnouncementList} from "../../network/Announcement";


export default {
  name: "Offerings",
  beforeMount() {
    this.fetchFamilies()
    this.getServices()
    this.fetchMoreOfferings()
    this.getOfferingType()
  },
  mounted() {
    // this.getServices()
    this.getMembers()
  },
  data() {
    return {
      title: "Are you sure?",
      message: 'You are about to delete this Offering.',
      isLoading: false,
      isServiceLoaded: false,
      isFamilyLoaded: false,
      isOfferingTypeLoaded: false,
      isMembersLoading: false,
      services: ServiceList,
      offeringTypes: OfferingType,
      numberOfPages: 0,
      currentPage: 0,
      offeringName: '',
      members: MemberList,
      showSuggestions: 'dropdown-menu',
      offeringDate: null,
      amount: '',
      searchQuery: '',
      membersQuery: '',
      offeringId: '',
      offeringTypeId: '',
      serviceId: '',
      familyId: '',
      userId: '',
      toDeleteId: '',
      familyDescription: '',
      offerings: OfferingList,
      families: ChurchFamilyList
    }
  },
  methods: {
    formatMoney(value) {
      return numberWithCommas(value)
    },
    fetchFamilies() {
      this.isFamilyLoaded = true
      this.$axios.get(`churchfamilies`).then(response => {
        this.families = Object.assign(ChurchFamilyList, response.data)
        this.isFamilyLoaded = false
      }).catch(error => {
        this.isFamilyLoaded = false
      })
    },
    clearFields() {
      this.offeringName = ''
      this.amount = ''
      this.serviceId = ''
      this.offeringId = ''
      this.familyId = ''
      this.userId = ''
      this.membersQuery = ''
      this.offeringDate = null
    },
    edit(data) {
      this.offeringId = data.id
      this.offeringName = data.name
      this.amount = data.amount
      this.serviceId = data.serviceId
      this.offeringDate = data.createdAt
    },
    cleanString(first, second) {
      if (first && second) {
        return [first, second].join(', ')
      } else if (first || second) {
        return first
      }

      return ''
    },
    assignToFamily() {

      if (this.familyId.length !== 0) {
        let requestBody = {
          familyId: this.familyId
        }
        this.$axios.put(`offerings/assign-family/${this.offeringId}`, requestBody).then(response => {
          this.$toast.success("Successfully updated")
          this.isLoading = false
          this.fetchMoreOfferings()
          this.clearFields()
        }).catch(error => {
          this.$toast.success(error.response.data.message)
          this.isLoading = false
        })

      }
    },
    assignToMember() {

      if (this.userId.length !== 0) {
        let requestBody = {
          userId: this.userId
        }
        this.$axios.put(`offerings/assign-user/${this.offeringId}`, requestBody).then(response => {
          this.$toast.success("Successfully updated")
          this.isLoading = false
          this.fetchMoreOfferings()
          this.clearFields()
        }).catch(error => {
          this.$toast.success(error.response.data.message)
          this.isLoading = false
        })

      }
    },
    saveOffering() {
      const requestBody = {
        name: this.offeringName,
        amount: parseFloat(this.amount),
        serviceId: this.serviceId,
        offeringTypeId: this.offeringTypeId,
        serviceName: this.services.data.filter(service => service.id === this.serviceId)[0].name,
        userId: this.userId,
        assignFamilyId: this.familyId,
        createdAt: this.offeringDate
      }

      if (this.offeringId.length === 0 && (this.offeringTypeId.length !== 0 && this.serviceId.length !== 0)) {
        this.$axios.post(`offerings`, requestBody).then(response => {
          this.$toast.success("Successfully added")
          this.isLoading = false
          this.clearFields()
          this.fetchMoreOfferings()
        }).catch(error => {
          this.$toast.success(error.response.data.message)
          this.isLoading = false
        })
      } else {
        this.$axios.put(`offerings/${this.offeringId}`, requestBody).then(response => {
          this.$toast.success("Successfully updated")
          this.isLoading = false
          this.fetchMoreOfferings()
          this.clearFields()
        }).catch(error => {
          this.$toast.success(error.response.data.message)
          this.isLoading = false
        })
      }

    },
    selectedMember(member) {
      this.userId = member.id
      this.membersQuery = member.name
      this.showSuggestions = 'dropdown-menu'
    },
    getMembers() {
      let filterBy = `Name=${this.membersQuery}`

      if (this.membersQuery.length === 0) {
        this.showSuggestions = 'dropdown-menu'
      } else {
        this.showSuggestions = 'dropdown-menu d-block'
      }
      this.isMembersLoading = true
      console.log(this.isMembersLoading);
      this.$axios.get(`churchmembers?${filterBy}`).then(response => {
        this.members = Object.assign(MemberList, response.data.data)
        this.isMembersLoading = false
        // this.showSuggestions = 'dropdown-menu d-block'
      }).catch(error => {
        this.isMembersLoading = false
      })
    },
    fetchMoreOfferings(page = 1, pageSize = 10) {
      this.currentPage = page
      this.isLoading = true

      this.$axios.get(`offerings?Page=${page}&PageSize=${pageSize}`).then(response => {
        this.offerings = Object.assign(OfferingList, response.data.data)
        this.numberOfPages = this.offerings.totalPages
        this.totalCount = this.offerings.totalCount

        this.isLoading = false
      }).catch(error => {
        this.isLoading = false
      })
    },
    searchByName() {

      let filterBy = ''
      filterBy = `Name=${this.searchQuery}`

      this.$axios.get(`offerings?${filterBy}`).then(response => {
        this.offerings = Object.assign(OfferingList, response.data.data)

      }).catch(error => {
        // this.isLoading = false
      })
    },
    checkToDelete(id) {
      this.toDeleteId = id
    },
    deleteService(id) {
      this.$axios.delete(`offerings/${id}`).then(response => {
        this.fetchMoreOfferings()
        this.$toast.info("Offering successfully deleted.")
      }).catch(error => {
        console.log(error)
      })
    },
    positiveButton() {
      this.deleteService(this.toDeleteId)
    },
    negativeButton() {
      // this.$emit("onclick", "negative")
    },
    getServices() {
      this.isServiceLoaded = true
      this.$axios.get(`services`).then(response => {
        this.isServiceLoaded = false
        this.services = Object.assign(this.services, response.data)
      }).catch(error => {
        this.isServiceLoaded = false
      })
    },
    getOfferingType() {
      this.isOfferingTypeLoaded = true
      this.$axios.get(`offeringtype`).then(response => {
        this.isOfferingTypeLoaded = false
        this.offeringTypes = Object.assign(this.offeringTypes, response.data)
      }).catch(error => {
        this.isOfferingTypeLoaded = false
      })
    }
  }
  ,
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser'])
  }
}
</script>

<style scoped>

</style>
