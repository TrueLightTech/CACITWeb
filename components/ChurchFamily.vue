<template>
  <ReferenceTable
    title="Church families"
    singular="church family"
    plural="Church families"
    description="Small groups members belong to. Giving totals are reported per family."
    empty-hint="Create a church family so members and their giving can be grouped."
    endpoint="churchfamilies"
    id-prefix="family"
    :is-active="isActive"
  />
</template>

<script>
import ReferenceTable from './ReferenceTable'

export default {
  name: 'ChurchFamily',
  components: { ReferenceTable },
  props: {
    isActive: { type: Boolean, default: false }
  }
}
</script>
