<template>
  <div v-if="isLoggedIn()">
    <nav class="navbar fixed-top navbar-light bg-light">
      <div class="container d-flex justify-content-between">
        <NuxtLink class="navbar-brand" to="/admin/dashboard"><h6>CACI Church APP</h6></NuxtLink>
        <div class="d-flex justify-content-center align-content-center align-middle">

          <img src="~assets/imgs/menu.svg" :style="{width:'25px', height:'25px'}" class="img-fluid"
               data-bs-toggle="offcanvas"
               data-bs-target="#offcanvasWithBackdrop" aria-controls="offcanvasWithBackdrop"/>
        </div>
      </div>
    </nav>

    <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasWithBackdrop"
         aria-labelledby="offcanvasWithBackdropLabel">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasWithBackdropLabel">Menu</h5>
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body text-center">
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
            <h4 :style="{'cursor':'pointer'}" @click="logout()" data-bs-dismiss="offcanvas" aria-label="Close">Logout</h4>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "AdminHeader",
    methods: {
      isLoggedIn() {
        return !(this.$route.fullPath.includes("login") || this.$route.fullPath.includes("register"))
      },
      async logout() {
        await this.$auth.logout();
        this.$router.push({path: `/login`})
      }
    }
  }
</script>

<style scoped>

</style>
