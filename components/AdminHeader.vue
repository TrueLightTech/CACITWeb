<template>
  <div v-if="isAuthenticated">
    <nav class="navbar fixed-top navbar-light bg-light">
      <div class="container d-flex justify-content-between">
        <NuxtLink class="navbar-brand" to="/admin/dashboard"><h6>CACI Church APP</h6></NuxtLink>
        <div class="d-flex justify-content-center align-content-center align-middle">

          <img src="~assets/imgs/menu.svg" :style="{width:'25px', height:'25px', cursor:'pointer'}" class="img-fluid"
               data-bs-toggle="offcanvas"
               data-bs-target="#offcanvasWithBackdrop" aria-controls="offcanvasWithBackdrop"/>
        </div>
      </div>
    </nav>

    <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasWithBackdrop"
         aria-labelledby="offcanvasWithBackdropLabel">
      <div class="offcanvas-header">
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>

      </div>
      <div class="offcanvas-body text-center">
        <div class="profile-header border-bottom-0 border-top-0 py-4">
          <div class="row">
            <div class="col-4">
              <img :src="getProfileImage(loggedInUser.data.profilePicture)" class="img-fluid w-50 rounded-circle">
            </div>
            <div class="col-8 text-start">
              <ul class="list-unstyled">
                <li><h6>{{ loggedInUser.data.name }}</h6></li>
                <li><p>{{ getCurrentRole(loggedInUser.data.roleId) }}</p></li>
              </ul>
            </div>
          </div>
        </div>

        <manager v-if="loggedInUser.data.roleId === '1'"></manager>
        <worker v-else-if="loggedInUser.data.roleId === '2'"></worker>
        <member v-else-if="loggedInUser.data.roleId === '3'"></member>
        <member v-else></member>
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import {profileImageBaseUrl} from "../resources/constants";
import Manager from "./roleNavs/manager";
import Worker from "./roleNavs/worker";
import Member from "./roleNavs/member";

export default {
  name: "AdminHeader",
  components: {Member, Worker, Manager},
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser'])
  },
  data() {
    return {
      roles: []
    }
  },
  mounted() {
    this.getRoles()
  },
  methods: {
    isLoggedIn() {
      return !(this.$route.fullPath.includes("login") || this.$route.fullPath.includes("register"))
    },
    getProfileImage(image) {
      if (image) {
        return `${profileImageBaseUrl}/${image}`
      }
      return require(`~/assets/imgs/user.svg`)
    },
    getRoles() {
      this.$axios.get('roles').then(response => {
        this.roles = response.data.data
      }).catch(error => {
      })
    },
    getCurrentRole(currentRoleId) {
      let role = this.roles.filter(role => role.id === currentRoleId)

      if (role.length === 0) {
        return "N/A"
      }
      return role[0].name
    }
  }
}
</script>

<style scoped>

</style>
