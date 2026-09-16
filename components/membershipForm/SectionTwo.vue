<template>
  <form @submit.prevent="updateRecord">
    <!-- Spouse -->
    <div class="ds-formsection">
      <div class="ds-formsection__head">
        <h3 class="ds-h3">Spouse</h3>
        <p>Complete only if the member is married.</p>
      </div>

      <div class="ds-formgrid">
        <div class="ds-field">
          <label class="ds-label" for="s2SpouseFirst">First name</label>
          <input id="s2SpouseFirst" v-model="memberInfo.spouseFirstName" class="ds-input" type="text">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s2SpouseSurname">Surname</label>
          <input id="s2SpouseSurname" v-model="memberInfo.spouseSurname" class="ds-input" type="text">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s2SpouseOther">Other names</label>
          <input id="s2SpouseOther" v-model="memberInfo.spouseOtherName" class="ds-input" type="text">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s2SpouseTel1">Telephone number 1</label>
          <input id="s2SpouseTel1" v-model="memberInfo.spouseFirstTelephoneNumber" class="ds-input" type="tel" inputmode="tel">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="s2SpouseTel2">Telephone number 2</label>
          <input id="s2SpouseTel2" v-model="memberInfo.spouseSecondTelephoneNumber" class="ds-input" type="tel" inputmode="tel">
        </div>
      </div>
    </div>

    <!-- Children -->
    <div class="ds-formsection">
      <div class="ds-formsection__head" style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap">
        <div>
          <h3 class="ds-h3">Children</h3>
          <p>Complete only for members who have children. Saved with this section.</p>
        </div>
        <button class="ds-btn ds-btn--secondary ds-btn--sm" type="button" @click="addChild">
          <svg class="ds-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-linecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add child
        </button>
      </div>

      <div v-if="children.length" class="ds-tablewrap">
        <div class="ds-tablescroll">
          <table class="ds-table ds-table--cards">
            <thead>
              <tr>
                <th>Name of child</th>
                <th>Date of birth</th>
                <th>Phone</th>
                <th class="ds-col-action">Remove</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(child, index) in children" :key="index">
                <td data-label="Name of child">
                  <label class="sr-only-label" :for="`s2ChildName${index}`">Name of child {{ index + 1 }}</label>
                  <input
                    :id="`s2ChildName${index}`"
                    v-model="child.nameOfChild"
                    class="ds-input"
                    type="text"
                  >
                </td>
                <td data-label="Date of birth">
                  <label class="sr-only-label" :for="`s2ChildDob${index}`">Date of birth of child {{ index + 1 }}</label>
                  <input
                    :id="`s2ChildDob${index}`"
                    v-model="child.childDateOfBirth"
                    class="ds-input"
                    type="date"
                  >
                </td>
                <td data-label="Phone">
                  <label class="sr-only-label" :for="`s2ChildTel${index}`">Phone number of child {{ index + 1 }}</label>
                  <input
                    :id="`s2ChildTel${index}`"
                    v-model="child.telephoneNumber"
                    class="ds-input"
                    type="tel"
                    inputmode="tel"
                  >
                </td>
                <td data-label="Remove" class="ds-col-action">
                  <button
                    class="ds-btn ds-btn--ghost ds-btn--sm ds-btn--danger-quiet"
                    type="button"
                    :aria-label="`Remove child ${index + 1}`"
                    @click="deleteChildRecord(index)"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="ds-empty" style="padding:32px 24px;border:1px dashed var(--ds-border);border-radius:6px">
        <h3 class="ds-h3">No children recorded</h3>
        <p>Add a row for each child, then save this section.</p>
        <button class="ds-btn ds-btn--secondary ds-btn--sm" type="button" @click="addChild">Add child</button>
      </div>
    </div>

    <div class="ds-formactions">
      <button class="ds-btn ds-btn--primary" type="submit" :disabled="isLoading">
        <span v-if="isLoading" class="ds-btn__spinner"></span>
        {{ isLoading ? 'Saving' : 'Save spouse and children' }}
      </button>
    </div>
  </form>
</template>

<script>
import { MembershipFormTwo } from '../../network/Member'

export default {
  name: 'SectionTwo',
  props: ['member'],
  data () {
    return {
      id: '',
      isLoading: false,
      memberInfo: Object.assign({}, MembershipFormTwo, { childInformation: [] })
    }
  },
  computed: {
    children () {
      return Array.isArray(this.memberInfo.childInformation) ? this.memberInfo.childInformation : []
    }
  },
  mounted () {
    this.id = this.$route.params.id
    this.memberInfo = Object.assign({}, MembershipFormTwo, this.member)

    // The API returns null when no children are recorded; the old code called
    // .map() on it directly and threw.
    if (!Array.isArray(this.memberInfo.childInformation)) {
      this.$set(this.memberInfo, 'childInformation', [])
    }

    this.memberInfo.childInformation.forEach(child => {
      child.childDateOfBirth = this.formatDate(child.childDateOfBirth)
    })
  },
  methods: {
    formatDate (rowDate) {
      if (rowDate == null) {
        return ''
      }
      return String(rowDate).split('T')[0]
    },
    addChild () {
      this.memberInfo.childInformation.push({
        nameOfChild: '',
        childDateOfBirth: null,
        telephoneNumber: ''
      })
    },
    deleteChildRecord (index) {
      this.memberInfo.childInformation.splice(index, 1)
    },
    updateRecord () {
      this.memberInfo.userId = this.id
      this.isLoading = true

      this.$axios.put(`churchmembers/userdetails/${this.id}`, this.memberInfo).then(() => {
        this.$toast.success('Spouse and children saved')
        this.isLoading = false
      }).catch(error => {
        const message = error && error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Could not save this section.'
        this.$toast.error(message)
        this.isLoading = false
      })
    }
  }
}
</script>

<style scoped>
.sr-only-label {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
