<template>
  <div>
    <div class="row justify-content-center">
      <div class="col-md-12 text-left d-flex justify-content-between mb-3">


        <ul class="list-unstyled">
          <li>
            <h3>Issues</h3>
          </li>
        </ul>


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
              <th scope="col">Status</th>
              <th class="text-end" scope="col">Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(issue,index) in issues.results" :key="index">
              <th scope="row">{{index +1}}</th>
              <td>{{issue.userName}}</td>
              <td>{{issue.title}}</td>
              <td>{{issue.issueMessage}}</td>
              <td>{{issue.isResolved}}</td>
              <td class="text-end">
                <div class="btn-group">
                  <button type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown"
                          aria-expanded="false">
                    Action
                  </button>
                  <ul class="dropdown-menu">
                    <li v-if="loggedInUser.data.roleId === '1'">
                      <NuxtLink class="dropdown-item" :to="''">Edit</NuxtLink>
                    </li>
                    <li v-if="loggedInUser.data.roleId === '1'">
                      <a @click="checkToDelete(issue.id)" class="dropdown-item text-danger" style="cursor: pointer;"
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
        message: 'You are about to delete this service.',
        isLoading: false,
        serviceName: '',
        toDeleteId: '',
        serviceDescription: '',
        issues: IssuesList
      }
    },
    methods: {
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
        this.$axios.get(`issues?IsResolved=false`).then(response => {
          this.issues = Object.assign(IssuesList, response.data.data)

          console.log(this.issues)

          this.isLoading = false
        }).catch(error => {
          this.isLoading = false
        })
      },
      checkToDelete(id) {
        this.toDeleteId = id
      },
      deleteService(id) {
        this.$axios.delete(`services/${id}`).then(response => {
          this.fetchServices()
          this.$toast.info("User successfully deleted.")
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
