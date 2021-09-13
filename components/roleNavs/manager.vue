<template>
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
</template>

<script>
  export default {
    name: "manager",
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
