<template>
  <div>
    <div class="row justify-content-center">
      <div class="col-md-12 text-left d-flex justify-content-between mb-3">


        <ul class="list-unstyled">
          <li>
            <h3>Issues <span style="font-size: 0.9em;">({{getStatus()}})</span></h3>
          </li>
        </ul>


        <div>
          <div class="dropdown">
            <a class="btn btn-secondary dropdown-toggle" href="#" role="button" id="dropdownMenuLink"
               data-bs-toggle="dropdown" aria-expanded="false">
              Filter
            </a>

            <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink">
              <li><a @click="selectFilter(true)" class="dropdown-item" href="#">Resolved</a></li>
              <li><a @click="selectFilter(false)" class="dropdown-item" href="#">Unresolved</a></li>
            </ul>
          </div>
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
              <th scope="col">Member</th>
              <th scope="col">Title</th>
              <th scope="col">Message</th>
              <th class="text-end" scope="col">Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(issue,index) in issues.results" :key="index">
              <th scope="row">{{index +1}}</th>
              <td>{{issue.userName}}</td>
              <td>{{issue.title}}</td>
              <td>{{issue.issueMessage}}</td>
              <td class="text-end">
                <div class="btn-group">
                  <button type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown"
                          aria-expanded="false">
                    Action
                  </button>
                  <ul class="dropdown-menu">
                    <li v-if="loggedInUser.data.roleId === '1'" @click="updateState(issue)">
                      <NuxtLink v-if="!isResolved" class="dropdown-item" :to="''">Resolve</NuxtLink>
                    </li>
                    <li v-if="loggedInUser.data.roleId === '1'">
                      <a @click="checkToDelete(issue.id)" class="dropdown-item text-danger" style="cursor: pointer;"
                         data-bs-toggle="modal"
                         data-bs-target="#exampleModal4">Delete
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
    <div class="modal fade" id="exampleModal4" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
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


  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {IssuesList} from "../network/Member";

  export default {
    name: "Issues",
    beforeMount() {
      this.fetchServices()
    },
    data() {
      return {
        title: "Are you sure?",
        message: 'You are about to delete this Issue.',
        isLoading: false,
        serviceName: '',
        toDeleteId: '',
        isResolved: false,
        serviceDescription: '',
        issues: IssuesList
      }
    },
    methods: {
      updateState(data) {

        const requestBody = {
          userId: this.loggedInUser.data.id,
          isResolved: true
        }

        this.$axios.put(`issues/${data.id}`, requestBody).then(response => {
          this.$toast.success("Successfully Updated")
          this.isLoading = false
          this.fetchServices()
        }).catch(error => {
          this.$toast.success(error.response.data.message)
          this.isLoading = false
        })
      },
      getStatus() {
        if (this.isResolved) {
          return "Resolved"
        } else {
          return "Unresolved"
        }
      },
      selectFilter(status) {
        this.isResolved = status
        this.fetchServices()
      },
      saveService() {
        const requestBody = {
          name: this.serviceName,
          description: this.serviceDescription
        }
        this.$axios.post(`issues`, requestBody).then(response => {
          this.$toast.success("Successfully recorded")
          this.isLoading = false
          this.fetchServices()
        }).catch(error => {
          this.$toast.success(error.response.data.message)
          this.isLoading = false
        })
      },
      fetchServices() {
        this.isLoading = true
        this.$axios.get(`issues?IsResolved=${this.isResolved}`).then(response => {
          this.issues = Object.assign(IssuesList, response.data.data)

          this.isLoading = false
        }).catch(error => {
          this.isLoading = false
        })
      },
      checkToDelete(id) {
        this.toDeleteId = id
      },
      deleteService(id) {
        this.$axios.delete(`issues/${id}`).then(response => {
          this.fetchServices()
          this.$toast.info("Issue successfully deleted.")
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
