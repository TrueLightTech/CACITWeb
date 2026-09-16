<template>
  <div>
    <!-- Identity header -->
    <div v-if="pageRefresh" class="ds-card" style="margin-bottom:24px">
      <div class="ds-recordhead">
        <span class="ds-skeleton" style="width:64px;height:64px;border-radius:999px"></span>
        <div style="display:grid;gap:10px;flex:1;max-width:320px">
          <span class="ds-skeleton" style="height:18px;width:60%"></span>
          <span class="ds-skeleton" style="height:12px;width:80%"></span>
        </div>
      </div>
    </div>

    <div v-else class="ds-card" style="margin-bottom:24px">
      <div class="ds-recordhead">
        <img :src="member.profilePicture" alt="" class="ds-recordhead__avatar">

        <div class="ds-recordhead__copy">
          <h1 class="ds-h1">{{ member.name || 'Member' }}</h1>
          <div class="ds-recordhead__meta">
            <span v-if="member.phoneNumber" class="ds-num">{{ member.phoneNumber }}</span>
            <span v-if="member.gender">{{ member.gender }}</span>
            <span v-if="member.dataOfBirth">Born {{ fmtDate(member.dataOfBirth) }}</span>
            <span v-if="member.churchFamilyName" class="ds-badge ds-badge--neutral">
              {{ member.churchFamilyName }}
            </span>
          </div>
        </div>

        <div class="ds-recordhead__actions">
          <NuxtLink class="ds-btn ds-btn--secondary" :to="`/admin/members/${member.id}/tithe`">
            Record tithe
          </NuxtLink>
          <NuxtLink class="ds-btn ds-btn--primary" :to="`/admin/members/${member.id}`">
            Edit member
          </NuxtLink>

          <RowMenu v-if="isChurchManager" label="More actions for this member">
            <template #default="{ close }">
              <NuxtLink class="ds-menu__item" :to="`/admin/members/${member.id}/membership-form`" @click.native="close">
                Membership form
              </NuxtLink>
              <NuxtLink class="ds-menu__item" :to="`/admin/members/${member.id}/welfare`" @click.native="close">
                Welfare
              </NuxtLink>
              <NuxtLink class="ds-menu__item" :to="`/admin/members/${member.id}/role`" @click.native="close">
                Assign role
              </NuxtLink>
              <span class="ds-menu__sep"></span>
              <button class="ds-menu__item ds-menu__item--danger" type="button" @click="confirmOpen = true; close()">
                Delete member
              </button>
            </template>
          </RowMenu>
        </div>
      </div>
    </div>

    <!-- Membership form detail -->
    <div class="ds-section__head">
      <h2 class="ds-h2">Membership details</h2>
      <NuxtLink
        v-if="isChurchManager"
        class="ds-btn ds-btn--secondary ds-btn--sm"
        :to="`/admin/members/${member.id}/membership-form`"
      >
        Edit membership form
      </NuxtLink>
    </div>

    <div class="ds-card">
      <div class="ds-card__body">
        <!-- Tab state lives in the URL, so these views can be linked and the
             back button works. -->
        <div class="ds-tabs" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="ds-tab"
            :class="{ 'is-active': activeTab === tab.key }"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.key ? 'true' : 'false'"
            @click="selectTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="isLoading" style="display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(210px,1fr))">
          <div v-for="n in 8" :key="n" style="display:grid;gap:8px">
            <span class="ds-skeleton" style="height:10px;width:50%"></span>
            <span class="ds-skeleton" style="height:14px;width:75%"></span>
          </div>
        </div>

        <template v-else>
          <!-- Personal -->
          <dl v-if="activeTab === 'personal'" class="ds-deflist">
            <div v-for="row in personalRows" :key="row.label">
              <dt>{{ row.label }}</dt>
              <dd :class="{ 'is-empty': !row.value }">{{ row.value }}</dd>
            </div>
          </dl>

          <!-- Family -->
          <div v-else-if="activeTab === 'family'">
            <h3 class="ds-h3" style="margin-bottom:16px">Spouse</h3>
            <dl class="ds-deflist">
              <div v-for="row in spouseRows" :key="row.label">
                <dt>{{ row.label }}</dt>
                <dd :class="{ 'is-empty': !row.value }">{{ row.value }}</dd>
              </div>
            </dl>

            <h3 class="ds-h3" style="margin:28px 0 16px">Children</h3>
            <div v-if="children.length" class="ds-tablewrap">
              <div class="ds-tablescroll">
                <table class="ds-table ds-table--cards">
                  <thead>
                    <tr><th>Name</th><th>Date of birth</th><th>Phone</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="(child, index) in children" :key="index">
                      <td data-label="Name">{{ child.nameOfChild || '—' }}</td>
                      <td data-label="Date of birth">{{ fmtDate(child.childDateOfBirth) }}</td>
                      <td data-label="Phone" class="ds-muted">{{ child.telephoneNumber || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p v-else class="ds-muted" style="margin:0">No children recorded.</p>
          </div>

          <!-- Parental -->
          <div v-else>
            <h3 class="ds-h3" style="margin-bottom:16px">Father</h3>
            <dl class="ds-deflist">
              <div v-for="row in fatherRows" :key="row.label">
                <dt>{{ row.label }}</dt>
                <dd :class="{ 'is-empty': !row.value }">{{ row.value }}</dd>
              </div>
            </dl>

            <h3 class="ds-h3" style="margin:28px 0 16px">Mother</h3>
            <dl class="ds-deflist">
              <div v-for="row in motherRows" :key="row.label">
                <dt>{{ row.label }}</dt>
                <dd :class="{ 'is-empty': !row.value }">{{ row.value }}</dd>
              </div>
            </dl>

            <h3 class="ds-h3" style="margin:28px 0 16px">Next of kin</h3>
            <dl class="ds-deflist">
              <div v-for="row in nextOfKinRows" :key="row.label">
                <dt>{{ row.label }}</dt>
                <dd :class="{ 'is-empty': !row.value }">{{ row.value }}</dd>
              </div>
            </dl>
          </div>
        </template>
      </div>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      :busy="isDeleting"
      title="Delete this member?"
      :message="`${member.name || 'This member'} will be removed from the register. Their giving history stays in accounting reports. This cannot be undone.`"
      confirm-label="Delete member"
      @cancel="confirmOpen = false"
      @confirm="deleteMember"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { profileImageBaseUrl } from '../../../../resources/constants'
import { ChurchMember, MembershipFormOne, MembershipFormThree, MembershipFormTwo } from '../../../../network/Member'
import { ROLE_CHURCH_MANAGER } from '../../../../resources/navigation'
import RowMenu from '../../../../components/RowMenu'
import ConfirmDialog from '../../../../components/ConfirmDialog'

const TABS = [
  { key: 'personal', label: 'Personal info' },
  { key: 'family', label: 'Family details' },
  { key: 'parental', label: 'Parental details' }
]

export default {
  name: 'member-view',
  components: { RowMenu, ConfirmDialog },
  data () {
    return {
      tabs: TABS,
      pageRefresh: false,
      isLoading: false,
      isDeleting: false,
      confirmOpen: false,
      member: ChurchMember,
      memberInfoSectionOne: MembershipFormOne,
      memberInfoSectionTwo: MembershipFormTwo,
      memberInfoSectionThree: MembershipFormThree
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
    isChurchManager () {
      return this.loggedInUser &&
        this.loggedInUser.data &&
        this.loggedInUser.data.roleId === ROLE_CHURCH_MANAGER
    },
    activeTab () {
      const requested = String(this.$route.query.tab || '')
      return TABS.some(tab => tab.key === requested) ? requested : 'personal'
    },
    children () {
      const list = this.memberInfoSectionTwo.childInformation
      return Array.isArray(list) ? list : []
    },
    personalRows () {
      const one = this.memberInfoSectionOne
      return [
        { label: 'First name', value: one.firstName },
        { label: 'Surname', value: one.surname },
        { label: 'Other names', value: one.otherNames },
        { label: 'Date of birth', value: this.fmtDate(one.dateOfBirth) },
        { label: 'Gender', value: one.gender },
        { label: 'Nationality', value: one.nationality },
        { label: 'Hometown', value: one.town },
        { label: 'Region', value: one.region },
        { label: 'Marital status', value: one.maritalStatus },
        { label: 'Postal address', value: one.contactAddress },
        { label: 'Phone 1', value: one.firstTelephoneNumber },
        { label: 'Phone 2', value: one.secondTelephoneNumber },
        { label: 'Email address', value: one.emailAddress },
        { label: 'Date of baptism', value: this.fmtDate(one.dateOfBaptism) },
        { label: 'Assembly of baptism', value: one.churchOfBaptism },
        { label: 'Education', value: one.educationLevel },
        { label: 'Profession', value: one.memberProfession },
        { label: 'Occupation', value: one.memberOccupation },
        { label: 'Spoken languages', value: this.fmtList(one.spokenLanguage) },
        { label: 'Written languages', value: this.fmtList(one.writtenLanguage) },
        { label: 'Hobbies', value: one.hobbies }
      ]
    },
    spouseRows () {
      const two = this.memberInfoSectionTwo
      return [
        { label: 'First name', value: two.spouseFirstName },
        { label: 'Surname', value: two.spouseSurname },
        { label: 'Other names', value: two.spouseOtherName },
        { label: 'Phone 1', value: two.spouseFirstTelephoneNumber },
        { label: 'Phone 2', value: two.spouseSecondTelephoneNumber }
      ]
    },
    fatherRows () {
      const three = this.memberInfoSectionThree
      return [
        { label: 'First name', value: three.fatherFirstName },
        // The form writes fatherLastName while the model also carries
        // fatherSurname; read both so whichever was stored is shown.
        { label: 'Surname', value: three.fatherSurname || three.fatherLastName },
        { label: 'Other names', value: three.fatherOtherName },
        { label: 'Biological father', value: this.fmtYesNo(three.isBiologicalFather) },
        { label: 'Living', value: this.fmtYesNo(three.isFatherAlive) }
      ]
    },
    motherRows () {
      const three = this.memberInfoSectionThree
      return [
        { label: 'First name', value: three.motherFirstName },
        { label: 'Surname', value: three.motherSurname },
        { label: 'Other names', value: three.motherOtherName || three.motherLastName },
        { label: 'Biological mother', value: this.fmtYesNo(three.isBiologicalMother) },
        { label: 'Living', value: this.fmtYesNo(three.isMotherAlive) }
      ]
    },
    nextOfKinRows () {
      const three = this.memberInfoSectionThree
      return [
        { label: 'Full name', value: three.nextOfKinFullname },
        { label: 'Relationship to member', value: three.memberNextOfKinRelationship },
        { label: 'Phone 1', value: three.nextOfKinFirstTelephoneNumber },
        { label: 'Phone 2', value: three.nextOfKinSecondTelephoneNumber }
      ]
    }
  },
  beforeMount () {
    this.getMember(this.$route.params.id)
    this.getMembershipDetails(this.$route.params.id)
  },
  methods: {
    selectTab (key) {
      if (this.activeTab === key) { return }
      this.$router.replace({ query: Object.assign({}, this.$route.query, { tab: key }) })
    },
    /** Empty dates rendered as a real date read as "Invalid date" before. */
    fmtDate (value) {
      if (!value) { return '' }
      const parsed = this.$moment(value)
      return parsed.isValid() ? parsed.format('D MMMM YYYY') : ''
    },
    fmtList (value) {
      if (Array.isArray(value)) { return value.filter(Boolean).join(', ') }
      return value || ''
    },
    fmtYesNo (value) {
      if (value === true || value === 'true') { return 'Yes' }
      if (value === false || value === 'false') { return 'No' }
      return value || ''
    },
    getMember (id) {
      this.pageRefresh = true
      this.$axios.get(`churchmembers/user/${id}`).then(response => {
        this.member = Object.assign({}, ChurchMember, response.data.data)
        this.member.profilePicture = this.getProfileImage(response.data.data.profilePicture)
        this.pageRefresh = false
      }).catch(() => {
        this.member = Object.assign({}, ChurchMember)
        this.member.profilePicture = this.getProfileImage('')
        this.pageRefresh = false
      })
    },
    getMembershipDetails (id) {
      this.isLoading = true
      this.$axios.get(`/churchmembers/userdetails/${id}`).then(response => {
        this.memberInfoSectionOne = Object.assign({}, MembershipFormOne, response.data.data)
        this.memberInfoSectionTwo = Object.assign({}, MembershipFormTwo, response.data.data)
        this.memberInfoSectionThree = Object.assign({}, MembershipFormThree, response.data.data)
        this.isLoading = false
      }).catch(() => {
        this.isLoading = false
      })
    },
    getProfileImage (image) {
      if (image) {
        if (String(image).includes('user.svg')) {
          return require('~/assets/imgs/user.svg')
        }
        return `${profileImageBaseUrl}/${image}`
      }
      return require('~/assets/imgs/user.svg')
    },
    deleteMember () {
      // The delete endpoint is keyed by phone number (UserAccountService
      // matches on PhoneNumber), not by user id. This page previously passed
      // the route's user id, so the request always 404'd and the button never
      // worked. The members list has always passed phoneNumber.
      const phoneNumber = this.member && this.member.phoneNumber

      if (!phoneNumber) {
        this.confirmOpen = false
        this.$toast.error('This member has no phone number recorded, so they cannot be deleted here.')
        return
      }

      this.isDeleting = true
      this.$axios.delete(`churchmembers/${phoneNumber}`).then(() => {
        this.isDeleting = false
        this.confirmOpen = false
        this.$toast.success('Member deleted')
        this.$router.push('/admin/members')
      }).catch(error => {
        this.isDeleting = false
        this.confirmOpen = false
        const message = error && error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Could not delete this member. Nothing was changed.'
        this.$toast.error(message)
      })
    }
  }
}
</script>
