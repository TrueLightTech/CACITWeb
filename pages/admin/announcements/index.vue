<template>
  <div class="container">
    <div class="row justify-content-center mt-10">
      <div class="col-md-8 text-left d-flex justify-content-between mb-3">


        <ul class="list-unstyled">
          <li>
            <h3>Announcement</h3>
          </li>
        </ul>


        <NuxtLink v-if="loggedInUser.data.roleId === '1'" to="/admin/announcements/new">
          <button type="button" class="btn btn-primary"><i class="fas fa-plus-circle"></i> Add Announcement</button>
        </NuxtLink>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-md-8">
        <div v-if="!isLoading">

          <div class="row justify-content-end g-0 w-100">
            <div class="input-group text-end float-end w-50 mb-3">
            <span class="input-group-text" id="basic-addon1" style="background-color: #f8f8f8;">
              <i class="fa fa-search" style="color:#cdcdcd;"></i>
            </span>
              <input type="text" v-model="searchQuery" @keyup="searchByTitle()" class="form-control"
                     placeholder="Search Announcement"
                     aria-label="Username"
                     aria-describedby="basic-addon1">

            </div>
          </div>


          <div class="row justify-content-start my-3">
            <div v-for="(announcement,index) in announcements.results" :key="index" class="col-md-4 my-3">
              <div class="card h-100">
                <img :src="getAnnouncementImage(announcement.image)"
                     style="height: 200px; object-fit: cover;"
                     class="card-img-top d-flex align-self-center justify-content-center w-100" alt="...">
                <div class="card-body">
                  <h6 class="card-title">{{announcement.title}}</h6>
                  <small>{{$moment(announcement.createdAt).format('Do MMMM, YYYY')}}</small>
                  <p class="mt-2 card-text text-muted">
                    {{truncateMessage(announcement.body)}}
                  </p>
                  <NuxtLink :to="'/admin/announcements/'+announcement.id" class="btn btn-sm btn-outline-primary">View
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <nav aria-label="Page navigation example">
            <ul class="pagination justify-content-end">
              <li class="page-item">
                <a @click="fetchAnnouncement(currentPage - 1)" class="page-link" href="#" tabindex="-1"
                   aria-disabled="true">Previous</a>
              </li>
              <li v-for="index in numberOfPages" :key="index" class="page-item">
                <a @click="fetchAnnouncement(index)" class="page-link" href="#">{{index}}</a>
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


  <!--  <div-->
  <!--    class="d-flex justify-content-center align-middle align-self-center align-content-center align-items-center mt-10">-->
  <!--    <ul class="list-unstyled  justify-content-center text-center">-->
  <!--      <li class="my-2">-->
  <!--        <img src="~assets/imgs/empty_state.svg" :style="{width: '340px'}"-->
  <!--             class="img-fluid  align-self-center align-middle"/>-->
  <!--      </li>-->
  <!--      <li class="mt-4"><h4>Nothing Found Here</h4></li>-->
  <!--    </ul>-->
  <!--  </div>-->
</template>

<script>

  import {profileImageBaseUrl} from "../../../resources/constants";
  import {AnnouncementList} from "../../../network/Announcement";
  import {mapGetters} from 'vuex'


  export default {
    name: "index",
    data() {
      return {
        numberOfPages: 0,
        currentPage: 0,
        totalCount: 0,
        searchQuery: '',
        isLoading: false,
        announcements: AnnouncementList
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'loggedInUser'])
    },
    beforeMount() {
      this.fetchAnnouncement()
    },
    methods: {
      searchByTitle() {
        // this.isLoading = true
        this.$axios.get(`announcements?Title=${this.searchQuery}`).then(response => {
          this.announcements = Object.assign(AnnouncementList, response.data.data)
          this.numberOfPages = this.announcements.totalPages
          this.totalCount = this.announcements.totalCount

          this.isLoading = false

        }).catch(error => {
          // this.isLoading = false
        })
      },
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
        if (message.length >= 80) {
          return message.toString().substring(0, 80) + " ..."
        }
        return message
      },
      getAnnouncementImage(image) {
        if (image) {
          return `${profileImageBaseUrl}/${image}`
        }
        return require(`~/assets/imgs/no_image.png`)
      }
    }
  }
</script>

<style scoped>

</style>
