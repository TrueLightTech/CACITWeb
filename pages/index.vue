<template>
  <div>
    <h1>CACI Church APP</h1>
  </div>
</template>

<script>
  export default {
    mounted() {
      this.redirect()
    },
    methods: {
      redirect() {
        // redirects to login
        this.$router.push({path: `/login`})
      }
    }
  }
</script>
