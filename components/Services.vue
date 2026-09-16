<template>
  <ReferenceTable
    title="Church services"
    singular="service"
    plural="Services"
    description="Services that offerings and tithe are recorded against."
    empty-hint="Add a service so giving can be recorded against it."
    endpoint="services"
    id-prefix="service"
    :is-active="isActive"
  />
</template>

<script>
import ReferenceTable from './ReferenceTable'

export default {
  name: 'Services',
  components: { ReferenceTable },
  props: {
    isActive: { type: Boolean, default: false }
  }
}
</script>
