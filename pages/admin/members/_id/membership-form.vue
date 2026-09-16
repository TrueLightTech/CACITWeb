<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">Membership form</h1>
        <p>{{ subtitle }}</p>
      </div>
      <div class="ds-page-head__actions">
        <NuxtLink class="ds-btn ds-btn--secondary" :to="`/admin/members/${id}/view`">
          Back to member
        </NuxtLink>
      </div>
    </div>

    <!-- Named steps, rather than a repurposed pagination widget showing 1 2 3 -->
    <nav class="ds-stepper" aria-label="Membership form sections">
      <button
        v-for="(step, index) in steps"
        :key="step.key"
        class="ds-step"
        :class="{ 'is-active': initial === index + 1 }"
        type="button"
        :aria-current="initial === index + 1 ? 'step' : false"
        @click="selectedSection(index + 1)"
      >
        <span class="ds-step__num">{{ index + 1 }}</span>
        {{ step.label }}
      </button>
    </nav>

    <div class="ds-card">
      <div class="ds-card__body">
        <div v-if="isLoading" style="display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(210px,1fr))">
          <div v-for="n in 9" :key="n" style="display:grid;gap:8px">
            <span class="ds-skeleton" style="height:10px;width:45%"></span>
            <span class="ds-skeleton" style="height:38px"></span>
          </div>
        </div>

        <template v-else>
          <SectionOne v-if="initial === 1" :member="memberInfo" />
          <SectionTwo v-else-if="initial === 2" :member="memberInfo" />
          <SectionThree v-else :member="memberInfo" />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import SectionOne from '../../../../components/membershipForm/SectionOne'
import SectionTwo from '../../../../components/membershipForm/SectionTwo'
import SectionThree from '../../../../components/membershipForm/SectionThree'

const STEPS = [
  { key: 'personal', label: 'Personal information' },
  { key: 'family', label: 'Spouse and children' },
  { key: 'parental', label: 'Parents and next of kin' }
]

export default {
  name: 'membership-form',
  components: { SectionThree, SectionTwo, SectionOne },
  data () {
    return {
      steps: STEPS,
      id: '',
      initial: 1,
      isLoading: false,
      memberInfo: {}
    }
  },
  computed: {
    subtitle () {
      const name = this.memberInfo && (this.memberInfo.firstName || this.memberInfo.surname)
        ? [this.memberInfo.firstName, this.memberInfo.surname].filter(Boolean).join(' ')
        : ''
      const step = STEPS[this.initial - 1]
      return name
        ? `${name} — ${step.label.toLowerCase()}. Each section saves on its own.`
        : `${step.label}. Each section saves on its own.`
    }
  },
  mounted () {
    this.id = this.$route.params.id
    this.getMembershipDetails()
  },
  methods: {
    selectedSection (index) {
      this.initial = index
    },
    getMembershipDetails () {
      this.isLoading = true

      this.$axios.get(`/churchmembers/userdetails/${this.id}`).then(response => {
        this.memberInfo = Object.assign({}, response.data.data)
        this.isLoading = false
      }).catch(() => {
        this.isLoading = false
      })
    }
  }
}
</script>
