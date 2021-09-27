<template>
  <div class="">
    <div class="row justify-content-center">
      <div class="col-md-12 text-left d-flex justify-content-between mb-3">


        <ul class="list-unstyled">
          <li>
            <h3>Church Group</h3>
          </li>
        </ul>


        <div>
          <button @click="clearFields()" data-bs-toggle="modal" data-bs-target="#staticBackdrop"
                  class="btn btn-primary"><i
            class="fas fa-plus-circle"></i> Add Church Group
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
              <th scope="col">Description</th>
              <th class="text-end" scope="col">Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(group,index) in groups.data" :key="index">
              <th scope="row">{{index +1}}</th>
              <td>{{group.name}}</td>
              <td>{{group.description}}</td>
              <td class="text-end">
                <div class="btn-group">
                  <button type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown"
                          aria-expanded="false">
                    Action
                  </button>
                  <ul class="dropdown-menu">
                    <li v-if="loggedInUser.data.roleId === '1'"
                        @click="edit(group)"
                        data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                      <NuxtLink class="dropdown-item" :to="''">Edit</NuxtLink>
                    </li>
                    <li v-if="loggedInUser.data.roleId === '1'">
                      <a @click="checkToDelete(group.id)" class="dropdown-item text-danger" style="cursor: pointer;"
                         data-bs-toggle="modal" data-bs-target="#exampleModal">Delete
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
    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
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
    <div class="modal fade" id="staticBackdrop" data-bs-keyboard="false" tabindex="-1"
         aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Add Church Group</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form>
              <div class="mb-3">
                <label for="recipient-name" class="col-form-label">Name</label>
                <input type="text" v-model="groupName" class="form-control" id="recipient-name">
              </div>
              <div class="mb-3">
                <label for="message-text" class="col-form-label">Description</label>
                <textarea v-model="groupDescription" class="form-control" id="message-text"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button @click="saveGroup()" type="button" data-bs-dismiss="modal" class="btn btn-primary">Save</button>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script>
  import {GroupList, ServiceList} from "../network/Member";
  import {mapGetters} from 'vuex'


  export default {
    name: "ChurchGroup",
    beforeMount() {
      this.fetchGroups()
    },
    data() {
      return {
        title: "Are you sure?",
        message: 'You are about to delete this group.',
        groupId: '',
        groupName: '',
        groupDescription: '',
        toDeleteId: '',
        isLoading: false,
        groups: GroupList
      }
    },
    methods: {
      clearFields() {
        this.groupName = ''
        this.groupId = ''
        this.groupDescription = ''
      },
      edit(group) {
        this.groupId = group.id
        this.groupName = group.name
        this.groupDescription = group.description
      },
      fetchGroups() {
        this.isLoading = true
        this.$axios.get(`churchgroups`).then(response => {
          this.groups = Object.assign(GroupList, response.data)

          this.isLoading = false
        }).catch(error => {
          this.isLoading = false
        })
      },
      checkToDelete(id) {
        this.toDeleteId = id
      },
      saveGroup() {
        const requestBody = {
          name: this.groupName,
          description: this.groupDescription
        }

        if (this.groupId.length === 0) {
          if (this.groupName.length !== 0 && this.groupDescription.length !== 0) {
            this.$axios.post(`churchgroups/me`, requestBody).then(response => {
              this.$toast.success("Successfully recorded")
              this.fetchGroups()
              this.clearFields()
              this.isLoading = false
            }).catch(error => {
              this.$toast.success(error.response.data.message)
              this.isLoading = false
            })
          }
        } else {
          if (this.groupName.length !== 0 && this.groupDescription.length !== 0) {
            this.$axios.put(`churchgroups/${this.groupId}`, requestBody).then(response => {
              this.$toast.success("Successfully updated")
              this.fetchGroups()
              this.clearFields()
              this.isLoading = false
            }).catch(error => {
              this.$toast.success(error.response.data.message)
              this.isLoading = false
            })
          }
        }

      },
      deleteGroup(id) {
        this.$axios.delete(`churchgroups/${id}`).then(response => {
          this.fetchGroups()
          this.$toast.info("User successfully deleted.")
        }).catch(error => {
          console.log(error)
        })
      },
      positiveButton() {
        this.deleteGroup(this.toDeleteId)
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
