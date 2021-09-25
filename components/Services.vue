<template>
  <div>
    <div class="row justify-content-center">
      <div class="col-md-12 text-left d-flex justify-content-between mb-3">


        <ul class="list-unstyled">
          <li>
            <h3>Services</h3>
          </li>
        </ul>


        <NuxtLink to="/admin/members/new">
          <button type="button" class="btn btn-primary"><i class="fas fa-plus-circle"></i> Add Service</button>
        </NuxtLink>
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
            <tr v-for="(service,index) in services.data" :key="index">
              <th scope="row">{{index +1}}</th>
              <td>{{service.name}}</td>
              <td>{{service.description}}</td>
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
                      <a class="dropdown-item text-danger" style="cursor: pointer;" data-bs-toggle="modal"
                         data-bs-target="#warningModal">Delete
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
  import {ServiceList} from "../network/Member";

  export default {
    name: "Services",
    beforeMount() {
      this.fetchServices()
    },
    data() {
      return {
        isLoading: false,
        services: ServiceList
      }
    },
    methods: {
      fetchServices() {
        this.isLoading = true
        this.$axios.get(`services`).then(response => {
          this.services = Object.assign(ServiceList, response.data)

          this.isLoading = false
        }).catch(error => {
          this.isLoading = false
        })
      },
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'loggedInUser'])
    }
  }
</script>

<style scoped>

</style>
