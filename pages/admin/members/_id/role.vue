<template>
  <div class="container">
    <div v-if="!pageRefresh" class="row justify-content-center mt-10">
      <div class="row justify-content-center">
        <div class="col text-center">
          <ul class="list-unstyled">
            <li><h2 class="py-2">Assign Role</h2></li>
            <li><p>({{update.name}})</p></li>
          </ul>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3 mt-4">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12">
                <p class="m-0 p-0">Current Role: </p><h6>{{getCurrentRole()}}</h6>
              </div>
              <div class="col-12">
                <label>Select Role</label>
                <select v-model="roleId" class="form-select form-select-md" aria-label=".form-select-sm example">
                  <option :value="role.id" :selected="update.roleId === role.id" v-for="(role,index) in roles"
                          :key="index">{{role.name}}
                  </option>
                </select>
                <small class="text-danger" v-show="!emptyRole">Please select a role</small>

              </div>
            </div>
            <div class="row justify-content-between">

              <div class="col-12 my-3">
                <button v-if="!isLoading" @click="assignRole()" type="button" :class="activateButton()">Save
                </button>
                <button v-else class="btn btn-primary btn-lg px-4 py-2 w-100" type="button" disabled>
                  <h6 class="p-0 m-0"><span class="spinner-border spinner-border-sm" role="status"
                                            aria-hidden="true"></span> LOADING ...</h6>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <PageLoader class="mt-10" v-else></PageLoader>
  </div>
</template>

<script>
  import {ChurchMember} from "../../../../network/Member";

  export default {
    name: "role",
    mounted() {
      const id = this.number = this.$route.params.id;
      this.getMember(id)
      this.getRoles()
    },
    data() {
      return {
        update: ChurchMember,
        isLoading: false,
        pageRefresh: false,
        roleId: "",
        emptyRole: true,
        roles: [],
      }
    },
    methods: {
      getMember(id) {
        this.pageRefresh = true
        this.$axios.get(`churchmembers/${id}`).then(response => {
          this.update = Object.assign(this.update, response.data.data)
          this.update.dataOfBirth = this.update.dataOfBirth.split('T')[0]

          this.pageRefresh = false
        }).catch(error => {
          this.pageRefresh = false
        })
      },
      getRoles() {
        this.$axios.get('roles').then(response => {
          this.roles = response.data.data
        }).catch(error => {
        })
      },
      getCurrentRole() {
        let role = this.roles.filter(role => role.id === this.update.roleId)

        if (role.length === 0) {
          return "N/A"
        }
        return role[0].name
      },
      async assignRole() {

        const requestData = {
          userId: this.update.id,
          roleId: this.roleId
        }

        if (this.roleId) {
          this.emptyRole = true
          try {
            this.isLoading = true
            let user = await this.$axios.post(`roles/assign`, requestData, {
              headers: {
                Authorization: 'Bearer ' + window.localStorage.getItem('auth._token.local')
              }
            })
            this.$toast.success("Successfully updated")
            this.isLoading = false
          } catch (e) {
            this.$toast.error(e.response.data.message, {fitToScreen: true})
            this.isLoading = false
          }
        } else {
          this.emptyRole = false
        }
      },
      activateButton() {
        if (this.roleId) {
          return "btn btn-primary w-100"
        } else {
          return "btn btn-primary w-100 disabled"
        }
      }
    }
  }
</script>

<style scoped>

</style>
