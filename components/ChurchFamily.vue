<template>
  <div>
    <div class="row justify-content-center">
      <div class="col-md-12 text-left d-flex justify-content-between mb-3">


        <ul class="list-unstyled">
          <li>
            <h3>Church Family</h3>
          </li>
        </ul>

        <div>
          <button @click="clearFields()" type="button" data-bs-toggle="modal" data-bs-target="#staticBackdrop1"
                  class="btn btn-primary"><i
            class="fas fa-plus-circle"></i> Add Family
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
            <tr v-for="(family,index) in families.data" :key="index">
              <th scope="row">{{ index + 1 }}</th>
              <td>{{ family.name }}</td>
              <td>{{ family.description }}</td>
              <td class="text-end">
                <div class="btn-group">
                  <button type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown"
                          aria-expanded="false">
                    Action
                  </button>
                  <ul class="dropdown-menu">
                    <li v-if="loggedInUser.data.roleId === '1'"
                        @click="edit(family)"
                        data-bs-toggle="modal" data-bs-target="#staticBackdrop1">
                      <NuxtLink class="dropdown-item" :to="''">Edit</NuxtLink>
                    </li>
                    <li v-if="loggedInUser.data.roleId === '1'">
                      <a @click="checkToDelete(family.id)" class="dropdown-item text-danger" style="cursor: pointer;"
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
    <div class="modal fade" id="exampleModal1" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
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
            <button type="button" class="btn btn-secondary" @click="negativeButton()" data-bs-dismiss="modal">Cancel
            </button>
            <button type="button" class="btn btn-primary" @click="positiveButton()" data-bs-dismiss="modal">Continue
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- Modal -->
    <div class="modal fade" id="staticBackdrop1" data-bs-keyboard="false" tabindex="-1"
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
import {ChurchFamilyList, ServiceList} from "../network/Member";

export default {
  name: "ChurchFamily",
  props: ['isActive'],
  watch: {
    isActive: function (newVal, oldVal) { // watch it
      if (newVal) {
        this.fetchFamilies()
      }
    }
  },
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
      families: ChurchFamilyList
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
        if (this.familyName.length !== 0 && this.familyDescription !== 0) {
          this.$axios.post(`churchfamilies`, requestBody).then(response => {
            this.$toast.success("Successfully added")
            this.isLoading = false
            this.clearFields()
            this.fetchFamilies()
          }).catch(error => {
            this.$toast.success(error.response.data.message)
            this.isLoading = false
          })
        }
      } else {
        if (this.familyName.length !== 0 && this.familyDescription !== 0) {
          this.$axios.put(`churchfamilies/${this.familyId}`, requestBody).then(response => {
            this.$toast.success("Successfully updated")
            this.isLoading = false
            this.clearFields()
            this.fetchFamilies()
          }).catch(error => {
            this.$toast.success(error.response.data.message)
            this.isLoading = false
          })
        }

      }

    },
    fetchFamilies() {
      this.isLoading = true
      this.$axios.get(`churchfamilies`).then(response => {
        this.families = Object.assign(ChurchFamilyList, response.data)
        this.isLoading = false
      }).catch(error => {
        this.isLoading = false
      })
    },
    checkToDelete(id) {
      this.toDeleteId = id
    },
    deleteService(id) {
      this.$axios.delete(`churchfamilies/${id}`).then(response => {
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
