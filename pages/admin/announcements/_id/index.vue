<template>
  <div class="container">
    <div class="row justify-content-center mt-10">
      <div v-if="!pageRefresh" class="col-md-7">
        <div class="card">
          <div class="card-body">
            <ul class="list-unstyled">
              <li class="mb-3">
                <img :src="getAnnouncementImage(announcement.image)"
                     style="height: 450px; object-fit: cover;"
                     class="card-img-top d-flex align-self-center justify-content-center w-100" alt="...">
              </li>
              <li>
                <div class="d-flex justify-content-between">

                  <h5>{{announcement.title}}</h5>

                  <div class="dropdown" v-if="loggedInUser.data.roleId === '1'">
                    <button class="btn btn-outline-primary dropdown-toggle" type="button" id="dropdownMenuButton1"
                            data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                      <li><a class="dropdown-item" href="#">Update</a></li>
                      <li><a class="dropdown-item text-danger" href="#">Delete</a></li>
                    </ul>
                  </div>
                </div>

              </li>
              <li>
                <small class="text-muted"> {{$moment(announcement.createdAt).format('Do MMMM, YYYY')}}</small>
              </li>
              <li class="mt-3">
                <p>
                  {{announcement.body}}
                </p>
              </li>
              <li></li>
            </ul>
          </div>
        </div>
      </div>
      <page-loader v-else></page-loader>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {Announcement} from "../../../../network/Announcement";
  import {profileImageBaseUrl} from "../../../../resources/constants";

  let id

  export default {
    name: "index",
    computed: {
      ...mapGetters(['isAuthenticated', 'loggedInUser'])
    },
    data() {
      return {
        pageRefresh: false,
        announcement: Announcement
      }
    },
    beforeMount() {
      id = this.$route.params.id
      this.getAnnouncement(id)
    },
    methods: {
      getAnnouncement(id) {
        this.pageRefresh = true
        this.$axios.get(`announcements/${id}`).then(response => {
          this.announcement = Object.assign(this.announcement, response.data.data)

          this.pageRefresh = false
        }).catch(error => {
          // this.update.profilePicture = this.getProfileImage('')
          this.pageRefresh = false
        })
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
