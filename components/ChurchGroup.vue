<template>
  <ReferenceTable
    title="Church groups"
    singular="church group"
    plural="Church groups"
    description="Ministries and groups a member can be assigned to."
    empty-hint="Create a church group to start assigning members to ministries."
    endpoint="churchgroups"
    create-endpoint="churchgroups/me"
    id-prefix="group"
    :is-active="isActive"
  />
</template>

<script>
import ReferenceTable from './ReferenceTable'

export default {
  name: 'ChurchGroup',
  components: { ReferenceTable },
  props: {
    isActive: { type: Boolean, default: false }
  }
}
</script>
