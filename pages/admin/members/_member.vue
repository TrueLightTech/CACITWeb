<template>
  <member-view v-bind:is-account="false" v-bind:id="number"></member-view>
</template>

<script>
  export default {
    name: "_member",
    beforeMount() {
      this.getId()
    },
    data() {
      return {
        number: ""
      }
    },
    methods: {
      getId() {
        this.number = this.$route.params.member
      }
    }
  }
</script>

<style scoped>

</style>
