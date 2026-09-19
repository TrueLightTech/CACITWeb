<template>
  <PublicRecord kind="sermons" />
</template>

<script>
import PublicRecord from '../../../components/PublicRecord'

export default {
  name: 'sermons-detail',
  components: { PublicRecord },
  // Public: a shared link has to open for someone with no account.
  auth: false
}
</script>
