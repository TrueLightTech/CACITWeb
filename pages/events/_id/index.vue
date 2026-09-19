<template>
  <PublicRecord kind="events" />
</template>

<script>
import PublicRecord from '../../../components/PublicRecord'

export default {
  name: 'events-detail',
  components: { PublicRecord },
  // Public: a shared link has to open for someone with no account.
  auth: false
}
</script>
