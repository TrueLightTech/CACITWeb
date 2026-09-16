<template>
  <ol v-if="crumbs.length > 1" class="ds-crumbs" aria-label="Breadcrumb">
    <li v-for="(crumb, index) in crumbs" :key="index">
      <span v-if="index > 0" class="ds-crumbs__sep" aria-hidden="true">/</span>
      <NuxtLink v-if="crumb.to && index !== crumbs.length - 1" :to="crumb.to">{{ crumb.label }}</NuxtLink>
      <span v-else-if="index !== crumbs.length - 1">{{ crumb.label }}</span>
      <span v-else aria-current="page">{{ crumb.label }}</span>
    </li>
  </ol>
</template>

<script>
import { navigation } from '../resources/navigation'

/**
 * Labels for path segments that sit below a navigation entry. Anything not
 * listed — a member id, an announcement id — is dropped rather than shown raw,
 * so a crumb trail never reads "… / 4f2a9b1c / view".
 */
const SEGMENT_LABELS = {
  new: 'New',
  edit: 'Edit',
  view: 'Details',
  role: 'Assign role',
  tithe: 'Record tithe',
  welfare: 'Welfare',
  'membership-form': 'Membership form'
}

/**
 * Routes whose final segment is a record id, so no segment label can be
 * derived from the path. Keyed by the generated Nuxt route name.
 */
const ROUTE_TAIL_LABELS = {
  'admin-members-member': 'Edit member'
}

export default {
  name: 'AppBreadcrumbs',
  computed: {
    crumbs () {
      const path = this.$route.path.replace(/\/$/, '')

      // Longest matching navigation entry wins, so /admin/announcements/new
      // resolves to Announcements rather than to a shorter sibling.
      let match = null
      navigation.forEach(group => {
        group.items.forEach(item => {
          if (path === item.to || path.indexOf(item.to + '/') === 0) {
            if (!match || item.to.length > match.item.to.length) {
              match = { group: group, item: item }
            }
          }
        })
      })

      if (!match) {
        return []
      }

      const crumbs = [
        { label: match.group.title },
        { label: match.item.label, to: match.item.to }
      ]

      const rest = path
        .replace(match.item.to, '')
        .split('/')
        .filter(Boolean)

      rest.forEach(segment => {
        if (SEGMENT_LABELS[segment]) {
          crumbs.push({ label: SEGMENT_LABELS[segment] })
        }
      })

      const tail = ROUTE_TAIL_LABELS[this.$route.name]
      if (tail) {
        crumbs.push({ label: tail })
      }

      return crumbs
    }
  }
}
</script>
