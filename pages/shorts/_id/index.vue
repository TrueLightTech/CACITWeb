<template>
  <PublicRecord kind="shorts" />
</template>

<script>
import PublicRecord from '../../../components/PublicRecord'

export default {
  // Public site, not the admin app: no AppShell, so a signed-in visitor
  // does not get the admin sidebar stacked above this page's own header.
  layout: 'public',
  name: 'shorts-detail',
  components: { PublicRecord },
  // Public: a shared link has to open for someone with no account.
  auth: false
}
</script>
