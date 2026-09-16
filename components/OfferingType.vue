<template>
  <ReferenceTable
    title="Offering types"
    singular="offering type"
    plural="Offering types"
    description="How offerings are categorised in accounting reports."
    empty-hint="Add an offering type to categorise offerings in reports."
    endpoint="offeringtype"
    id-prefix="offeringType"
    :is-active="isActive"
  />
</template>

<script>
import ReferenceTable from './ReferenceTable'

export default {
  name: 'OfferingType',
  components: { ReferenceTable },
  props: {
    isActive: { type: Boolean, default: false }
  }
}
</script>
