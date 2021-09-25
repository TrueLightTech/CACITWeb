<template>
  <ul class="list-unstyled">
    <li class="my-5">
      <NuxtLink to="/admin/dashboard" data-bs-dismiss="offcanvas" aria-label="Close"><h4>Home</h4></NuxtLink>
    </li>
    <li class="my-5">
      <NuxtLink to="/admin/tithe" data-bs-dismiss="offcanvas" aria-label="Close"><h4>Tithe</h4></NuxtLink>
    </li>
    <li class="my-5">
      <NuxtLink to="/admin/account" data-bs-dismiss="offcanvas" aria-label="Close"><h4>My Profile</h4></NuxtLink>
    </li>
    <li class="my-5">
      <h4 :style="{'cursor':'pointer'}" @click="logout()" data-bs-dismiss="offcanvas" aria-label="Close">
        Logout</h4>
    </li>
  </ul>
</template>

<script>
  export default {
    name: "member",
    methods: {
      async logout() {
        await this.$auth.logout();
        this.$toast.success("Logged out")
      },
    }
  }
</script>

<style scoped>

</style>
