<template>
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
          <table class="table table-hover table-responsive">
            <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Amount (GHS)</th>
              <th scope="col">Service Name</th>
              <th class="text-end" scope="col">Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(offering,index) in offerings.results" :key="index">
              <th scope="row">{{index +1}}</th>
              <td>{{offering.name}}</td>
              <td>{{offering.amount}}</td>
              <td>{{offering.serviceName}}</td>
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
                    <li v-if="loggedInUser.data.roleId === '1'">
                      <a @click="checkToDelete(offering.id)" class="dropdown-item text-danger" style="cursor: pointer;"
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
        </div>
        <page-loader v-else></page-loader>

      </div>
    </div>


    <!-- Modal -->
    <div class="modal fade" id="exampleModal7" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center">
            <ul class="list-unstyled">
              <li><h3>{{this.title}}</h3></li>
              <li><p>
                {{this.message}}
              </p></li>
            </ul>
          </div>
          <div class="modal-footer d-flex justify-content-center">
            <button type="button" class="btn btn-secondary" @click="negativeButton()" data-bs-dismiss="modal">Cancel
            </button>
            <button type="button" class="btn btn-primary" @click="positiveButton()" data-bs-dismiss="modal">Continue
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- Modal -->
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
                <li class="my-3" v-if="!isServiceLoaded">
                  <label class="mb-2 text-start">Select Service</label>
                  <select v-model="serviceId" class="form-select form-control-lg"
                          aria-label="Default select example">
                    <option :value="service.id"
                            v-for="service in services.data">{{service.name}}
                    </option>
                  </select>
                </li>
              </ul>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button @click="saveFamily()" type="button" data-bs-dismiss="modal" class="btn btn-primary">Save</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {OfferingList, ServiceList} from "../network/Member";

  export default {
    name: "Offerings",
    props: ['isActive'],
    watch: {
      isActive: function (newVal, oldVal) { // watch it
        if (newVal) {
          this.fetchFamilies()
          this.getServices()
        }
      }
    },
    beforeMount() {
      this.fetchFamilies()
      this.getServices()
    },
    mounted() {
      this.getServices()
    },
    data() {
      return {
        title: "Are you sure?",
        message: 'You are about to delete this Offering.',
        isLoading: false,
        isServiceLoaded: false,
        services: ServiceList,
        offeringName: '',
        amount: '',
        offeringId: '',
        serviceId: '',
        toDeleteId: '',
        familyDescription: '',
        offerings: OfferingList
      }
    },
    methods: {
      clearFields() {
        this.offeringName = ''
        this.amount = ''
        this.serviceId = ''
        this.offeringId = ''
      },
      edit(data) {
        this.offeringId = data.id
        this.offeringName = data.name
        this.amount = data.amount
        this.serviceId = data.serviceId
      },
      saveFamily() {
        const requestBody = {
          name: this.offeringName,
          amount: parseFloat(this.amount),
          serviceId: this.serviceId,
          serviceName: this.services.data.filter(service => service.id === this.serviceId)[0].name
        }

        if (this.offeringId.length === 0) {
          this.$axios.post(`offerings`, requestBody).then(response => {
            this.$toast.success("Successfully added")
            this.isLoading = false
            this.clearFields()
            this.fetchFamilies()
          }).catch(error => {
            this.$toast.success(error.response.data.message)
            this.isLoading = false
          })
        } else {
          this.$axios.put(`offerings/${this.offeringId}`, requestBody).then(response => {
            this.$toast.success("Successfully updated")
            this.isLoading = false
            this.fetchFamilies()
            this.clearFields()
          }).catch(error => {
            this.$toast.success(error.response.data.message)
            this.isLoading = false
          })
        }

      },
      fetchFamilies() {
        this.isLoading = true
        this.$axios.get(`offerings`).then(response => {
          this.services = Object.assign(OfferingList, response.data.data)
          this.isLoading = false
        }).catch(error => {
          this.isLoading = false
        })
      },
      checkToDelete(id) {
        this.toDeleteId = id
      },
      deleteService(id) {
        this.$axios.delete(`offerings/${id}`).then(response => {
          this.fetchFamilies()
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
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'loggedInUser'])
    }
  }
</script>

<style scoped>

</style>
