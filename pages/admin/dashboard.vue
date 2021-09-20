<template>
  <div class="container">
    <div class="row justify-content-center mt-10">
      <div class="col-sm-10 col-md-10 col-lg-10 col-xl-6">
        <h6>Hi,{{loggedInUser.data.name}}</h6>
        <div class="row">
          <div class="col-md-4 my-2">
            <div class="card">
              <div class="card-body">
                <ul class="list-unstyled text-center">
                  <li>
                    <h1>100</h1>
                  </li>
                  <li>
                    <p>Members</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-md-4 my-2">
            <div class="card">
              <div class="card-body">
                <ul class="list-unstyled text-center">
                  <li>
                    <h1>14</h1>
                  </li>
                  <li>
                    <p>Groups</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-md-4 my-2">
            <div class="card">
              <div class="card-body">
                <ul class="list-unstyled text-center">
                  <li>
                    <h1>12</h1>
                  </li>
                  <li>
                    <p>Families</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div v-if="!isLoading" class="col-md-12">
            <h5 class="mt-5">Announcements</h5>
            <ul class="list-group mb-5">
              <li v-for="(announcement,index) in announcements.results" :key="index"
                  class="list-group-item d-flex justify-content-between align-items-center">
                <ul class="list-unstyled">
                  <li><h6 class="p-0 m-0">{{announcement.title}}</h6></li>
                  <li><small class="text-muted">{{$moment(announcement.createdAt).format('Do MMMM, YYYY')}}</small></li>
                  <li><p class="p-0 m-0 mt-2">{{truncateMessage(announcement.body)}}</p></li>
                </ul>
                <NuxtLink :to="'/admin/announcements/'+announcement.id">
                  <span class="badge bg-primary rounded-pill">view</span>
                </NuxtLink>
              </li>
            </ul>
            <!--            <div-->
            <!--              class="d-flex justify-content-center align-middle align-self-center align-content-center align-items-center mt-5">-->
            <!--              <ul class="list-unstyled  justify-content-center text-center">-->
            <!--                <li class="my-2">-->
            <!--                  <img src="~assets/imgs/empty_state.svg" :style="{width: '340px'}"-->
            <!--                       class="img-fluid  align-self-center align-middle"/>-->
            <!--                </li>-->
            <!--                <li class="mt-4"><h4>Nothing Found Here</h4></li>-->
            <!--              </ul>-->
            <!--            </div>-->
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

  export default {
    name: "dashboard",
    components: {AdminHeader},
    computed: {
      ...mapGetters(['isAuthenticated', 'loggedInUser'])
    },
    beforeMount() {
      this.fetchAnnouncement()
    },
    data() {
      return {
        user: JSON.parse(window.localStorage.getItem('auth.user')),
        numberOfPages: 0,
        currentPage: 0,
        totalCount: 0,
        searchQuery: '',
        isLoading: false,
        announcements: AnnouncementList
      }
    },
    methods: {
      fetchAnnouncement(page = 1, pageSize = 10) {
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
    },
    mounted() {
    }
  }
</script>

<style scoped>

</style>
