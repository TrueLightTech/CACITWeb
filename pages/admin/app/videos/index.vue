<template>
  <ContentTable
    title="Videos"
    description="Choir, testimonies and church life. Sermons live in their own section."
    singular="video"
    plural="Videos"
    base-path="/admin/app/videos"
    endpoint="admin/videos"
    search-placeholder="Search by title"
    empty-hint="Published videos appear in the app's video library."
    :columns="columns"
  />
</template>

<script>
import ContentTable from '../../../../components/ContentTable'

export default {
  name: 'AdminAppVideos',
  components: { ContentTable },
  computed: {
    columns () {
      return [
        { key: 'category', label: 'Category', value: row => row.category },
        { key: 'media', label: 'Recording', value: row => row.media ? 'Attached' : 'None' },
        { key: 'viewCount', label: 'Views', value: row => row.viewCount || 0 }
      ]
    }
  }
}
</script>
