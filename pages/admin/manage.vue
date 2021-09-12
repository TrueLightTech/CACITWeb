<template>

  <!--  </div>-->
  <div class="container">
    <div class="row justify-content-center mt-10">
      <div class="col-md-8 text-left d-flex justify-content-between mb-3">


        <ul class="list-unstyled">
          <li>
            <h3>Members</h3>
          </li>
        </ul>


        <NuxtLink to="/admin/members/new">
          <button type="button" class="btn btn-primary"><i class="fas fa-plus-circle"></i> Add Member</button>
        </NuxtLink>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-md-8">
        <div v-if="!isLoading">
          <div class="input-group text-end float-end w-25 mb-3">
            <span class="input-group-text" id="basic-addon1" style="background-color: #f8f8f8;">
              <i class="fa fa-search" style="color:#cdcdcd;"></i>
            </span>
            <input type="text" v-model="searchQuery" @keyup="searchByName()" class="form-control"
                   placeholder="Search Member"
                   aria-label="Username"
                   aria-describedby="basic-addon1">

          </div>
          <table class="table table-hover table-responsive">
            <caption>List of members <span class="badge rounded-pill bg-primary">{{totalCount}}</span>
            </caption>
            <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Profile</th>
              <th scope="col">Name</th>
              <th scope="col">Family</th>
              <th class="text-end" scope="col">Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(member,index) in members.results" :key="index">
              <th scope="row">{{index+1}}</th>
              <td>
                <NuxtLink :to="'members/'+member.phoneNumber+'/view'">
                  <img :src="getProfileImage(member.profilePicture)" class="img-fluid profileImage rounded-circle">
                </NuxtLink>
              </td>
              <td>
                <NuxtLink :to="'members/'+member.phoneNumber+'/view'">
                  {{member.name}}
                </NuxtLink>
              </td>
              <td>{{member.churchFamilyName}}</td>
              <td class="text-end">
                <!-- Example single danger button -->
                <div class="btn-group">
                  <button type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown"
                          aria-expanded="false">
                    Action
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <NuxtLink class="dropdown-item" :to="'members/'+member.phoneNumber+'/role'">Assign role</NuxtLink>
                    </li>
                    <li>
                      <NuxtLink class="dropdown-item" :to="'members/'+member.phoneNumber+'/tithe'">Record Tithe
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink class="dropdown-item" :to="'members/'+member.phoneNumber">Update User</NuxtLink>
                    </li>
                    <li>
                      <a class="dropdown-item text-danger" to="#" data-bs-toggle="modal"
                         @click="checkUserToDelete(member.phoneNumber)"
                         data-bs-target="#warningModal">Delete User
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
                <a @click="fetchMembers(currentPage - 1)" class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
              </li>
              <li v-for="index in numberOfPages" :key="index" class="page-item">
                <a @click="fetchMembers(index)" class="page-link" href="#">{{index}}</a>
              </li>
              <li class="page-item">
                <a @click="fetchMembers(currentPage+1)" class="page-link" href="#">Next</a>
              </li>
            </ul>
          </nav>
        </div>
        <page-loader v-else></page-loader>
        <warning-modal v-bind:title="'Are you sure?'" :message="'You are about to delete this users details.'"
                       @onclick="modalState($event)"></warning-modal>
      </div>
    </div>
  </div>
</template>

<script>
  import {MemberList} from "../../network/Member";
  import {profileImageBaseUrl} from "../../resources/constants";
  import PageLoader from "../../components/PageLoader";

  export default {
    name: "manage",
    components: {PageLoader},
    data() {
      return {
        numberOfPages: 0,
        currentPage: 0,
        totalCount: 0,
        searchQuery: '',
        isLoading: false,
        toDeleteId: '',
        members: MemberList
      }
    },
    beforeMount() {
      this.fetchMembers()
    },
    methods: {
      searchByName() {
        // this.isLoading = true
        this.$axios.get(`churchmembers?Name=${this.searchQuery}`).then(response => {
          this.members = Object.assign(MemberList, response.data.data)
          this.numberOfPages = this.members.totalPages
          this.totalCount = this.members.totalCount

        }).catch(error => {
          // this.isLoading = false
        })
      },
      fetchMembers(page = 1, pageSize = 10) {
        this.currentPage = page
        this.isLoading = true
        this.$axios.get(`churchmembers?Page=${page}&PageSize=${pageSize}`).then(response => {
          this.members = Object.assign(MemberList, response.data.data)
          this.numberOfPages = this.members.totalPages
          this.totalCount = this.members.totalCount

          this.isLoading = false
        }).catch(error => {
          this.isLoading = false
        })
      },
      deleteMember(id) {
        this.$axios.delete(`churchmembers/${id}`).then(response => {
          console.log(response.data)
          this.fetchMembers()
          this.$toast.info("User successfully deleted.")
        }).catch(error => {
          console.log(error)
        })
      },
      getProfileImage(image) {
        if (image) {
          return `${profileImageBaseUrl}/${image}`
        }
        return require(`~/assets/imgs/user.svg`)
      },
      modalState(data) {
        if (data.toString().toLowerCase() === 'positive') {
          this.deleteMember(this.toDeleteId)
        }
      },
      checkUserToDelete(id) {
        this.toDeleteId = id
      }
    }
  }
</script>

<style scoped>
  .profileImage {
    width: 50px;
    height: 50px;
  }
</style>
