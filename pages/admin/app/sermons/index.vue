<template>
  <ContentTable
    title="Sermons"
    description="Everything members hear in the app. Series grouping drives the filter chips on their sermons screen."
    singular="sermon"
    plural="Sermons"
    base-path="/admin/app/sermons"
    endpoint="admin/sermons"
    search-placeholder="Search by title, speaker or scripture"
    empty-hint="Sermons you publish appear in the app straight away."
    :secondary="speakerLine"
    :columns="columns"
  />
</template>

<script>
import ContentTable from '../../../../components/ContentTable'

export default {
  name: 'AdminAppSermons',
  components: { ContentTable },
  computed: {
    columns () {
      return [
        { key: 'series', label: 'Series', value: row => row.series },
        {
          key: 'media',
          label: 'Recording',
          // A published sermon with nothing attached is the mistake this column
          // exists to make visible at a glance.
          value: row => {
            const parts = []
            if (row.video) { parts.push('Video') }
            if (row.audio) { parts.push('Audio') }
            return parts.length ? parts.join(' + ') : 'None'
          }
        },
        {
          key: 'preachedOn',
          label: 'Preached',
          value: row => row.preachedOn ? this.$moment(row.preachedOn).format('D MMM YYYY') : ''
        }
      ]
    }
  },
  methods: {
    speakerLine (row) {
      return row.speaker || ''
    }
  }
}
</script>
