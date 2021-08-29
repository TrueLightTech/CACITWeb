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
                <li><h6>{{loggedInUser.data.name}}</h6></li>
                <li><p>Church Worker</p></li>
              </ul>
            </div>
          </div>
        </div>
        <ul class="list-unstyled">
          <li class="my-5">
            <NuxtLink to="/admin/dashboard" data-bs-dismiss="offcanvas" aria-label="Close"><h4>Home</h4></NuxtLink>
          </li>
          <li class="my-5">
            <NuxtLink to="/admin/announcements" data-bs-dismiss="offcanvas" aria-label="Close"><h4>Announcements</h4>
            </NuxtLink>
          </li>
          <li class="my-5">
            <NuxtLink to="/admin/tithe" data-bs-dismiss="offcanvas" aria-label="Close"><h4>Record Tithe</h4></NuxtLink>
          </li>
          <li class="my-5">
            <NuxtLink to="/admin/manage" data-bs-dismiss="offcanvas" aria-label="Close"><h4>Manage</h4></NuxtLink>
          </li>
          <li class="my-5">
            <NuxtLink to="/admin/account" data-bs-dismiss="offcanvas" aria-label="Close"><h4>Account</h4></NuxtLink>
          </li>
          <li class="my-5">
            <h4 :style="{'cursor':'pointer'}" @click="logout()" data-bs-dismiss="offcanvas" aria-label="Close">
              Logout</h4>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {profileImageBaseUrl} from "../resources/constants";

  export default {
    name: "AdminHeader",
    computed: {
      ...mapGetters(['isAuthenticated', 'loggedInUser'])
    },
    methods: {
      isLoggedIn() {
        return !(this.$route.fullPath.includes("login") || this.$route.fullPath.includes("register"))
      },
      getProfileImage(image) {
        if (image) {
          return `${profileImageBaseUrl}/${image}`
        }
        return "~assets/imgs/user.svg"
      },
      async logout() {
        await this.$auth.logout();
        this.$toast.success("Logged out")
      }
    }
  }
</script>

<style scoped>

</style>
