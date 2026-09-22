<template>
  <PublicRecord kind="shorts" />
</template>

<script>
import PublicRecord from '../../../components/PublicRecord'

export default {
  name: 'shorts-detail',
  components: { PublicRecord },
  // Public: a shared link has to open for someone with no account.
  auth: false
}
</script>
