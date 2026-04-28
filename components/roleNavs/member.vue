<template>
  <ul class="admin-menu-list">
    <li>
      <NuxtLink to="/admin/dashboard" class="admin-menu-link" active-class="is-active" data-bs-dismiss="offcanvas">
        Dashboard
      </NuxtLink>
    </li>
    <li>
      <NuxtLink to="/admin/tithe" class="admin-menu-link" active-class="is-active" data-bs-dismiss="offcanvas">
        Tithe
      </NuxtLink>
    </li>
    <li>
      <NuxtLink to="/admin/welfare" class="admin-menu-link" active-class="is-active" data-bs-dismiss="offcanvas">
        Welfare
      </NuxtLink>
    </li>
    <li>
      <NuxtLink to="/admin/report" class="admin-menu-link" active-class="is-active" data-bs-dismiss="offcanvas">
        Report an Issue
      </NuxtLink>
    </li>
    <li>
      <NuxtLink to="/admin/account" class="admin-menu-link" active-class="is-active" data-bs-dismiss="offcanvas">
        My Profile
      </NuxtLink>
    </li>
    <li>
      <button class="admin-menu-link admin-menu-link-danger" type="button" @click="logout()" data-bs-dismiss="offcanvas">
        Logout
      </button>
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
