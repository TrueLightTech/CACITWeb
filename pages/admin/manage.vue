<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Manage</h1>
        <p>Reported issues and the church settings that the rest of the app depends on.</p>
      </div>
    </div>

    <!-- Sections are routed through the URL, so each is linkable, the back
         button works, and a refresh keeps your place. They were component
         booleans set by a sixty-line switch before. -->
    <div class="ds-tabs" role="tablist">
      <button
        v-for="section in visibleSections"
        :key="section.key"
        class="ds-tab"
        :class="{ 'is-active': activeSection === section.key }"
        type="button"
        role="tab"
        :aria-selected="activeSection === section.key ? 'true' : 'false'"
        @click="selectSection(section.key)"
      >
        {{ section.label }}
      </button>
    </div>

    <Issues v-if="activeSection === 'issues'" :is-active="activeSection === 'issues'" />
    <ChurchFamily v-else-if="activeSection === 'families'" :is-active="activeSection === 'families'" />
    <ChurchGroup v-else-if="activeSection === 'groups'" :is-active="activeSection === 'groups'" />
    <Services v-else-if="activeSection === 'services'" :is-active="activeSection === 'services'" />
    <OfferingType v-else :is-active="activeSection === 'offering-types'" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ROLE_CHURCH_MANAGER } from '../../resources/navigation'
import Issues from '../../components/Issues'
import ChurchFamily from '../../components/ChurchFamily'
import ChurchGroup from '../../components/ChurchGroup'
import Services from '../../components/Services'
import OfferingType from '../../components/OfferingType'

const SECTIONS = [
  { key: 'issues', label: 'Reported issues', managerOnly: true },
  { key: 'families', label: 'Church families', managerOnly: false },
  { key: 'groups', label: 'Church groups', managerOnly: true },
  { key: 'services', label: 'Services', managerOnly: true },
  { key: 'offering-types', label: 'Offering types', managerOnly: true }
]

export default {
  name: 'manage',
  components: { Issues, ChurchFamily, ChurchGroup, Services, OfferingType },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
    isChurchManager () {
      return this.loggedInUser && this.loggedInUser.data &&
        this.loggedInUser.data.roleId === ROLE_CHURCH_MANAGER
    },
    /** Reproduces the previous gating: only the church manager saw the
        Reported Issues tab and the Settings dropdown. */
    visibleSections () {
      return SECTIONS.filter(section => !section.managerOnly || this.isChurchManager)
    },
    activeSection () {
      const requested = String(this.$route.query.section || '')
      const allowed = this.visibleSections.some(section => section.key === requested)
      if (allowed) { return requested }
      return this.visibleSections.length ? this.visibleSections[0].key : 'families'
    }
  },
  methods: {
    selectSection (key) {
      if (this.activeSection === key) { return }
      this.$router.replace({ query: Object.assign({}, this.$route.query, { section: key }) })
    }
  }
}
</script>
