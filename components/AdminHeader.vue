<template>
  <div v-if="isAuthenticated" class="admin-shell-header">
    <nav class="navbar fixed-top admin-navbar">
      <div class="container admin-navbar-inner">
        <NuxtLink class="admin-brand" to="/admin/dashboard">
          <span class="admin-brand-mark">C</span>
          <span class="admin-brand-copy">
            <strong>CACI Taifa</strong>
            <small>Church App</small>
          </span>
        </NuxtLink>

        <button
          class="admin-menu-toggle"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasWithBackdrop"
          aria-controls="offcanvasWithBackdrop"
          aria-label="Open menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>

    <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasWithBackdrop"
         aria-labelledby="offcanvasWithBackdropLabel">
      <div class="offcanvas-header admin-drawer-header">
        <div>
          <span>Menu</span>
          <h5 id="offcanvasWithBackdropLabel">Navigation</h5>
        </div>
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body admin-drawer-body">
        <div class="admin-profile-card">
          <img :src="getProfileImage(loggedInUser.data.profilePicture)" class="admin-profile-avatar">
          <div class="admin-profile-copy">
            <strong>{{ loggedInUser.data.name }}</strong>
            <span>{{ getCurrentRole(loggedInUser.data.roleId) }}</span>
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
