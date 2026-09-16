<template>
  <!-- isAccount === null puts the shared editor into "create" mode. -->
  <member-view :is-account="null" />
</template>

<script>
export default {
  name: 'new-member'
}
</script>
