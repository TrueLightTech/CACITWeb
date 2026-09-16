<template>
  <ContentTable
    title="Events"
    description="Upcoming and past are one list, split by date. Members can say they are going and ask questions."
    singular="event"
    plural="Events"
    base-path="/admin/app/events"
    endpoint="admin/events"
    search-placeholder="Search by title"
    empty-hint="Published events appear on the member's home screen."
    :secondary="whenLine"
    :columns="columns"
  />
</template>

<script>
import ContentTable from '../../../../components/ContentTable'
import { EVENT_STATUSES } from '../../../../network/MobileApp'

export default {
  name: 'AdminAppEvents',
  components: { ContentTable },
  computed: {
    columns () {
      const labels = EVENT_STATUSES.reduce((map, s) => {
        map[s.value] = s.label
        return map
      }, {})

      return [
        { key: 'eventStatus', label: 'Event', value: row => labels[row.eventStatus] || row.eventStatus },
        { key: 'location', label: 'Where', value: row => row.location },
        { key: 'attendeeCount', label: 'Going', value: row => row.attendeeCount || 0 }
      ]
    }
  },
  methods: {
    whenLine (row) {
      return row.startsAt ? this.$moment(row.startsAt).format('ddd D MMM YYYY, HH:mm') : ''
    }
  }
}
</script>
