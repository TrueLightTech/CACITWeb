<template>
  <div class="container">
    <div class="row justify-content-center mt-10">
      <div class="col-sm-10 col-md-10 col-lg-10 col-xl-8">

        <div class="d-flex justify-content-between">
          <h6 v-if="loggedInUser.data.roleId === '1'">Total Monies Received Today</h6>
          <h6 v-else>Hello, {{ loggedInUser.data.name }}</h6>

          <div v-if="loggedInUser.data.roleId === '1'">
            <NuxtLink to="/admin/accounting">
              <span class="badge bg-primary">View more</span>
            </NuxtLink>
          </div>
          <div v-if="loggedInUser.data.roleId === '2'">
            <NuxtLink to="/admin/records">
              <span class="badge bg-primary">View more</span>
            </NuxtLink>
          </div>
        </div>

        <div class="row justify-content-center">
          <div class="col" v-if="loggedInUser.data.roleId === '1'">
            <div class="row justify-content-center" v-if="!isAccountingLoading">
              <div class="col-md-4 my-2 h-100">
                <div class="card h-100">
                  <div class="card-body h-100">
                    <ul class="list-unstyled text-center">
                      <li>
                        <h6>GHS</h6>
                      </li>
                      <li>
                        <h1>{{ formatMoney(accountTotals.total) }}</h1>
                      </li>
                      <li>
                        <p>Total Money Received</p>
                      </li>

                    </ul>
                  </div>
                </div>
              </div>
              <div class="col-md-4 my-2 h-100">
                <div class="card h-100">
                  <div class="card-body">
                    <ul class="list-unstyled text-center">
                      <li>
                        <h6>GHS</h6>
                      </li>
                      <li>
                        <h1>{{ formatMoney(accountTotals.offeringSum) }}</h1>
                      </li>
                      <li>
                        <p>Total Offering Received</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="col-md-4 my-2 h-100">
                <div class="card h-100">
                  <div class="card-body h-100">
                    <ul class="list-unstyled text-center">
                      <li>
                        <h6>GHS</h6>
                      </li>
                      <li>
                        <h1>{{ formatMoney(accountTotals.titheSum) }}</h1>
                      </li>
                      <li>
                        <p>Total Tithe Received </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="col-md-4 my-2">
                <div class="card h-100">
                  <div class="card-body">
                    <ul class="list-unstyled text-center" v-if="!isIssueLoading">
                      <li>
                        <h1>{{ unResolvedIssuesCount }}</h1>
                      </li>
                      <li>
                        <p>Unresolved Issues </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="col my-2 h-100">
                <div class="card h-100">
                  <div class="card-body">

                    <div class="w-100 text-end float-end">
                      <div class="d-flex justify-content-between">
                        <p>{{ selectedFamilyName }}</p>
                        <div class="dropdown">
                          <a class="btn btn-secondary dropdown-toggle" href="#" role="button" id="dropdownMenuLink"
                             data-bs-toggle="dropdown" aria-expanded="false">
                            Filter by Family
                          </a>

                          <ul v-if="!isChurchFamiliesLoading" class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                            <li><a class="dropdown-item" href="#" @click="getMembersCount('')">All</a></li>
                            <li v-for="(family,index) in families.data" :key="index" @click="getMembersCount(family)">
                              <a class="dropdown-item" href="#">{{ family.name }}</a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <ul class="list-unstyled text-center w-100">
                      <li v-if="!isMembersLoading">
                        <h1>{{ totalMembersCount }}</h1>
                      </li>
                      <li v-else>
                        <h1>0</h1>
                      </li>
                      <li>
                        <p>Members</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col" v-if="loggedInUser.data.roleId === '2'">
            <div class="row justify-content-center" v-if="!isAccountingLoading">
              <div class="col-md-6 my-2 h-100">
                <div class="card h-100">
                  <div class="card-body h-100">
                    <ul class="list-unstyled text-center">
                      <li>
                        <h6>GHS</h6>
                      </li>
                      <li>
                        <h1>{{ formatMoney(accountTotals.titheSum) }}</h1>
                      </li>
                      <li>
                        <p>Total Tithe Received </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="col-md-6 my-2 h-100">
                <div class="card h-100">
                  <div class="card-body h-100">

                    <ul class="list-unstyled text-center w-100">
                      <li v-if="!isMembersLoading">
                        <h1>{{ totalMembersCount }}</h1>
                      </li>
                      <li v-else>
                        <h1>0</h1>
                      </li>
                      <li>
                        <p>Members</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!isLoading" class="col-md-12">
            <div class="d-flex justify-content-between mt-5 mb-2">
              <h5>Announcements</h5>

              <div v-if="loggedInUser.data.roleId === '1'">
                <NuxtLink to="/admin/announcements">
                  <span class="badge bg-primary">View more</span>
                </NuxtLink>
              </div>

            </div>
            <ul class="list-group mb-3">
              <li v-for="(announcement,index) in announcements.results" :key="index"
                  class="list-group-item align-items-center">

                <div class="row justify-content-center align-self-center d-flex">
                  <div class="col-2">
                    <div class="d-flex justify-content-center align-content-center" style="height: 50px;width: 50px;">
                      <img :src="getImage(announcement.image)" style="object-fit: cover;" class="img-fluid w-100">
                    </div>
                  </div>
                  <div class="col-8">
                    <ul class="list-unstyled text-start">
                      <li><h6 class="p-0 m-0">{{ announcement.title }}</h6></li>
                      <li><small
                        class="text-muted">{{ $moment(announcement.createdAt).format('Do MMMM, YYYY') }}</small>
                      </li>
                      <li><p class="p-0 m-0 mt-2">{{ truncateMessage(announcement.body) }}</p></li>
                    </ul>
                  </div>

                  <div class="col-2 text-end">
                    <NuxtLink :to="'/admin/announcements/'+announcement.id">
                      <span class="badge bg-primary rounded-pill">view</span>
                    </NuxtLink>
                  </div>
                </div>


              </li>
            </ul>
            <nav aria-label="Page navigation example">
              <ul class="pagination justify-content-end">
                <li class="page-item">
                  <a @click="fetchAnnouncement(currentPage - 1)" class="page-link" href="#" tabindex="-1"
                     aria-disabled="true">Previous</a>
                </li>
                <li v-for="index in numberOfPages" :key="index" class="page-item">
                  <a v-if="index < currentPage + 5" @click="fetchAnnouncement(index)"
                     class="page-link" href="#">{{ index }}</a>
                  <!--                  <a>...</a>-->
                  <a v-if="index > numberOfPages - 5" @click="fetchAnnouncement(index)" class="page-link"
                     href="#">{{ index }}</a>
                </li>
                <li class="page-item">
                  <a @click="fetchAnnouncement(currentPage+1)" class="page-link" href="#">Next</a>
                </li>
              </ul>
            </nav>

          </div>
          <page-loader v-else></page-loader>
        </div>
      </div>

    </div>

  </div>
</template>

<script>

import {mapGetters} from 'vuex'
import AdminHeader from "../../components/AdminHeader";
import {AnnouncementList} from "../../network/Announcement";
import {numberWithCommas, profileImageBaseUrl} from "../../resources/constants";
import {ChurchFamilyList, DashboardAccountingTotal} from "../../network/Member";
import PageLoader from "../../components/PageLoader";
import {formatNumber} from "accounting-js";


export default {
  name: "dashboard",
  components: {PageLoader, AdminHeader},
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser'])
  },
  beforeMount() {

    this.fetchAnnouncement()
    this.getUnresolvedIssuesCount()
    this.fetchFamilies()
    this.getMembersCount()
    if (this.loggedInUser.data.roleId === '1') {
      this.getAccounting()
    } else if (this.loggedInUser.data.roleId === '2') {
      this.getAccountingForFamilyManager()
    }
  },
  data() {
    return {
      user: JSON.parse(window.localStorage.getItem('auth.user')),
      unResolvedIssuesCount: 0,
      selectedFamilyName: 'All',
      families: ChurchFamilyList,
      numberOfPages: 0,
      currentPage: 0,
      totalCount: 0,
      totalMembersCount: 0,
      searchQuery: '',
      isLoading: false,
      isIssueLoading: false,
      isAccountingLoading: false,
      isChurchFamiliesLoading: false,
      isMembersLoading: false,
      announcements: AnnouncementList,
      accountTotals: DashboardAccountingTotal
    }
  },
  methods: {
    formatMoney(value) {
      return numberWithCommas(value)
    },
    getMembersCount(family = "") {
      let famId = ""
      if (this.loggedInUser.data.roleId === '2') {
        famId = this.loggedInUser.data.churchFamilyId
      }

      if (family.length !== 0) {
        famId = family.id
        this.selectedFamilyName = family.name
      } else {
        // famId = ""
        this.selectedFamilyName = "All"
      }
      this.isMembersLoading = true
      this.$axios.get(`accounting/users?FamilyId=${famId}`).then(response => {
        this.totalMembersCount = response.data.data.totalCount
        this.isMembersLoading = false
      }).catch(error => {
        this.isMembersLoading = false
      })
    },
    fetchFamilies() {
      this.isChurchFamiliesLoading = true
      this.$axios.get(`churchfamilies`).then(response => {
        this.families = Object.assign(ChurchFamilyList, response.data)
        this.isChurchFamiliesLoading = false
      }).catch(error => {
        this.isChurchFamiliesLoading = false
      })
    },
    getUnresolvedIssuesCount() {
      this.isIssueLoading = true
      this.$axios.get(`accounting/issues?IsResolved=false`).then(response => {
        this.unResolvedIssuesCount = response.data.data.totalCount
        this.isIssueLoading = false
      }).catch(error => {
        this.isIssueLoading = false
      })
    },
    getAccounting() {
      this.isAccountingLoading = true
      this.$axios.get(`accounting/total`).then(response => {
        this.accountTotals = Object.assign(DashboardAccountingTotal, response.data.data)

        this.isAccountingLoading = false
      }).catch(error => {
        this.isAccountingLoading = false
      })
    },
    getAccountingForFamilyManager() {
      this.isAccountingLoading = true
      this.$axios.get(`accounting/tithe-total?ChurchFamilyId=${this.loggedInUser.data.churchFamilyId}`).then(response => {
        this.accountTotals = Object.assign(DashboardAccountingTotal, response.data.data)

        this.isAccountingLoading = false
      }).catch(error => {
        this.isAccountingLoading = false
      })
    },
    fetchAnnouncement(page = 1, pageSize = 5) {
      this.currentPage = page
      this.isLoading = true

      this.$axios.get(`announcements?Page=${page}&PageSize=${pageSize}`).then(response => {
        this.announcements = Object.assign(AnnouncementList, response.data.data)
        this.numberOfPages = this.announcements.totalPages
        this.totalCount = this.announcements.totalCount

        this.isLoading = false
      }).catch(error => {
        this.isLoading = false
      })
    },
    truncateMessage(message) {
      if (message.length >= 60) {
        return message.toString().substring(0, 60) + " ..."
      }
      return message
    },
    getImage(image) {
      if (image) {
        return `${profileImageBaseUrl}/${image}`
      }
      return require(`~/assets/imgs/no_image.png`)
    }
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>
