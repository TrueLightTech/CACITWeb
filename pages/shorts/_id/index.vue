<template>
  <ShortViewer />
</template>

<script>
import ShortViewer from '../../../components/ShortViewer'

export default {
  // Public site, not the admin app: no AppShell, so a signed-in visitor
  // does not get the admin sidebar stacked above this page's own header.
  layout: 'public',
  name: 'shorts-detail',
  // Keep the feed mounted while its shared-record URL follows the active short.
  key: 'shorts-viewer',
  components: { ShortViewer },
  // Public: a shared link has to open for someone with no account.
  auth: false
}
</script>
