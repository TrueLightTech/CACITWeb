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
          <button @click="clearFields()" type="button" data-bs-toggle="modal" data-bs-target="#staticBackdrop3"
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
                        data-bs-toggle="modal" data-bs-target="#staticBackdrop1">
                      <NuxtLink class="dropdown-item" :to="''">Edit</NuxtLink>
                    </li>
                    <li v-if="loggedInUser.data.roleId === '1'">
                      <a @click="checkToDelete(offering.id)" class="dropdown-item text-danger" style="cursor: pointer;"
                         data-bs-toggle="modal"
                         data-bs-target="#exampleModal1">Delete
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
    <div class="modal fade" id="exampleModal5" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
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
    <div class="modal fade" id="staticBackdrop3" data-bs-keyboard="false" tabindex="-1"
         aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Add Family</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form>
              <div class="mb-3">
                <label for="recipient-name" class="col-form-label">Name</label>
                <input type="text" v-model="familyName" class="form-control" id="recipient-name">
              </div>
              <div class="mb-3">
                <label for="message-text" class="col-form-label">Description</label>
                <textarea v-model="familyDescription" class="form-control" id="message-text"></textarea>
              </div>
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
  import { OfferingList} from "../network/Member";

  export default {
    name: "ChurchFamily",
    beforeMount() {
      this.fetchFamilies()
    },
    data() {
      return {
        title: "Are you sure?",
        message: 'You are about to delete this family.',
        isLoading: false,
        familyName: '',
        familyId: '',
        toDeleteId: '',
        familyDescription: '',
        offerings: OfferingList
      }
    },
    methods: {
      clearFields() {
        this.familyName = ''
        this.familyId = ''
        this.familyDescription = ''
      },
      edit(data) {
        this.familyId = data.id
        this.familyName = data.name
        this.familyDescription = data.description
      },
      saveFamily() {
        const requestBody = {
          name: this.familyName,
          description: this.familyDescription
        }

        if (this.familyId.length === 0) {
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
          this.$axios.put(`offerings/${this.familyId}`, requestBody).then(response => {
            this.$toast.success("Successfully updated")
            this.isLoading = false
            this.clearFields()
            this.fetchFamilies()
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
          this.$toast.info("Family successfully deleted.")
        }).catch(error => {
          console.log(error)
        })
      },
      positiveButton() {
        this.deleteService(this.toDeleteId)
      },
      negativeButton() {
        // this.$emit("onclick", "negative")
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'loggedInUser'])
    }
  }
</script>

<style scoped>

</style>
