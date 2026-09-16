<template>
  <ContentTable
    title="Shorts"
    description="The vertical feed. A short is any short thing — a clip, a voice note, a flyer, slides, an event or a verse."
    singular="short"
    plural="Shorts"
    base-path="/admin/app/shorts"
    endpoint="admin/shorts"
    search-placeholder="Search by title"
    empty-hint="Shorts appear in the app's feed, newest first, with pinned ones at the top."
    :columns="columns"
  />
</template>

<script>
import ContentTable from '../../../../components/ContentTable'
import { SHORT_KINDS } from '../../../../network/MobileApp'

export default {
  name: 'AdminAppShorts',
  components: { ContentTable },
  computed: {
    columns () {
      const labels = SHORT_KINDS.reduce((map, kind) => {
        map[kind.value] = kind.label
        return map
      }, {})

      return [
        { key: 'kind', label: 'Kind', value: row => labels[row.kind] || row.kind },
        { key: 'views', label: 'Watched', value: row => row.views || 0 },
        { key: 'likes', label: 'Likes', value: row => row.likes || 0 }
      ]
    }
  }
}
</script>
