<template>
  <div class="">
    <div class="row justify-content-center">
      <div class="col-md-12 text-left d-flex justify-content-between mb-3">


        <ul class="list-unstyled">
          <li>
            <h3>Church Group</h3>
          </li>
        </ul>


        <NuxtLink to="/admin/members/new">
          <button type="button" class="btn btn-primary"><i class="fas fa-plus-circle"></i> Add Church Group</button>
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
  import {GroupList, ServiceList} from "../network/Member";
  import {mapGetters} from 'vuex'


  export default {
    name: "ChurchGroup",
    beforeMount() {
      this.fetchGroups()
    },
    data() {
      return {
        isLoading: false,
        groups: GroupList
      }
    },
    methods: {
      fetchGroups() {
        this.isLoading = true
        this.$axios.get(`churchgroups`).then(response => {
          this.groups = Object.assign(GroupList, response.data)

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
