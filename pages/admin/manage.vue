<template>
  <div class="container">

    <div class="row justify-content-center mt-10">
      <div class="col-md-8 text-left justify-content-between mb-3">
        <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
          <li class="nav-item" role="presentation">
            <button @click="onTabClicked('members')" class="nav-link active" id="pills-home-tab" data-bs-toggle="pill"
                    data-bs-target="#pills-home"
                    type="button" role="tab" aria-controls="pills-home" aria-selected="true">Members
            </button>
          </li>
          <li class="nav-item" role="presentation" v-if="loggedInUser.data.roleId === '1'">
            <button @click="onTabClicked('issues')" class="nav-link" id="pills-profile-tab" data-bs-toggle="pill"
                    data-bs-target="#pills-profile"
                    type="button" role="tab" aria-controls="pills-profile" aria-selected="false">Reported Issues
            </button>
          </li>
          <li class="nav-item" role="presentation" v-if="loggedInUser.data.roleId === '1'">
            <button @click="onTabClicked('offerings')" class="nav-link" id="pills-contact-tab" data-bs-toggle="pill"
                    data-bs-target="#pills-contact"
                    type="button" role="tab" aria-controls="pills-contact" aria-selected="false">Offerings
            </button>
          </li>
          <li class="nav-item d-none" role="presentation" v-if="loggedInUser.data.roleId === '1'">
            <button class="nav-link" id="pills-users-tab" data-bs-toggle="pill" data-bs-target="#pills-users"
                    type="button" role="tab" aria-controls="pills-contact" aria-selected="false">Users
            </button>
          </li>
          <li class="nav-item dropdown" v-if="loggedInUser.data.roleId === '1'">
            <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">Settings</a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item"
                     @click="onTabClicked('church-groups')"
                     id="pills-church-group-tab" data-bs-toggle="pill" data-bs-target="#pills-church-group"
                     href="#">Church Group</a></li>
              <li><a class="dropdown-item"
                     @click="onTabClicked('services')"
                     id="pills-services-tab" data-bs-toggle="pill" data-bs-target="#pills-services"
                     href="#">Church Services</a></li>
              <li><a class="dropdown-item"
                     @click="onTabClicked('families')"
                     id="pills-family-tab" data-bs-toggle="pill" data-bs-target="#pills-family"
                     href="#">Church Family</a></li>
              <li><a class="dropdown-item"
                     @click="onTabClicked('offering-type')"
                     id="pills-offering-tab" data-bs-toggle="pill" data-bs-target="#pills-offering-type"
                     href="#">Offering Type</a></li>
            </ul>
          </li>
        </ul>

      </div>
    </div>
    <div class="row justify-content-center mb-3">
      <div class="col-md-8 text-left justify-content-between mb-3">
        <div class="tab-content" id="pills-tabContent">
          <div class="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
            <Members :is-active="isMembersActive"></Members>
          </div>
          <div class="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
            <Issues :is-active="isIssuesActive"></Issues>
          </div>
          <div class="tab-pane fade" id="pills-contact" role="tabpanel" aria-labelledby="pills-contact-tab">
            <Offerings :is-active="isOfferingsActive"></Offerings>
          </div>
          <div class="tab-pane fade" id="pills-users" role="tabpanel" aria-labelledby="pills-users-tab">
            <Users></Users>
          </div>
          <div class="tab-pane fade" id="pills-church-group" role="tabpanel" aria-labelledby="pills-church-group-tab">
            <ChurchGroup :is-active="isChurchGroupsActive"></ChurchGroup>
          </div>
          <div class="tab-pane fade" id="pills-family" role="tabpanel" aria-labelledby="pills-family-tab">
            <ChurchFamily :is-active="isFamilyGroupActive"></ChurchFamily>
          </div>
          <div class="tab-pane fade" id="pills-services" role="tabpanel" aria-labelledby="pills-services-tab">
            <Services :is-active="isServicesActive"></Services>
          </div>
          <div class="tab-pane fade" id="pills-offering-type" role="tabpanel" aria-labelledby="pills-offering-tab">
            <OfferingType :is-active="isOfferingTypeActive"></OfferingType>
          </div>
        </div>
      </div>
    </div>
  </div>


</template>

<script>

import {mapGetters} from 'vuex'

import Members from "../../components/Members";
import ChurchFamily from "../../components/ChurchFamily";
import Users from "../../components/Users";
import Issues from "../../components/Issues";
import OfferingType from "../../components/OfferingType";

export default {
  name: "manage",
  data() {
    return {
      isMembersActive: false,
      isIssuesActive: false,
      isOfferingsActive: false,
      isChurchGroupsActive: false,
      isServicesActive: false,
      isOfferingTypeActive: false,
      isFamilyGroupActive: false
    }
  },
  methods: {
    onTabClicked(type) {
      switch (type) {
        case 'issues':
          this.isIssuesActive = true
          this.isMembersActive = false
          this.isServicesActive = false
          this.isFamilyGroupActive = false
          this.isChurchGroupsActive = false
          this.isOfferingsActive = false
          break;
        case 'members':
          this.isIssuesActive = false
          this.isMembersActive = true
          this.isServicesActive = false
          this.isFamilyGroupActive = false
          this.isChurchGroupsActive = false
          this.isOfferingsActive = false
          break;
        case 'families':
          this.isIssuesActive = false
          this.isMembersActive = false
          this.isServicesActive = false
          this.isFamilyGroupActive = true
          this.isChurchGroupsActive = false
          this.isOfferingsActive = false
          break;
        case 'services':
          this.isIssuesActive = false
          this.isMembersActive = false
          this.isServicesActive = true
          this.isFamilyGroupActive = false
          this.isChurchGroupsActive = false
          this.isOfferingsActive = false
          break;
        case 'church-groups':
          this.isIssuesActive = false
          this.isMembersActive = false
          this.isServicesActive = false
          this.isFamilyGroupActive = false
          this.isChurchGroupsActive = true
          this.isOfferingsActive = false
          break;
        case 'offerings':
          this.isIssuesActive = false
          this.isMembersActive = false
          this.isServicesActive = false
          this.isFamilyGroupActive = false
          this.isChurchGroupsActive = false
          this.isOfferingsActive = true
          break;
        default:
          this.isIssuesActive = false
          break;
      }
    },
  },
  components: {OfferingType, Issues, Users, ChurchFamily, Members},
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser'])
  }
}
</script>

<style scoped>

</style>
