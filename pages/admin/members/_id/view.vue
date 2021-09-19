<template>
  <div class="container">
    <div class="row justify-content-center mt-10">
      <div v-if="!pageRefresh" class="col-md-8">
        <div class="card py-4">
          <div class="row justify-content-center">
            <div class="col-md-4 d-flex text-center align-content-center justify-content-center">
              <img style="height: 150px; width: 150px;" :src="getProfileImage(this.member.profilePicture)"
                   class="img-fluid align-content-center justify-content-center align-self-center profileImage rounded-circle">
            </div>
            <div class="col-md-8">
              <ul class="list-unstyled">
                <li><h5 class="my-1">{{member.name}}</h5></li>
                <li><p class="my-1">{{member.phoneNumber}}</p></li>
                <li><p class="my-1">{{member.gender}}</p></li>
                <li><p class="my-2">{{member.dataOfBirth}}</p></li>
                <li><p class="my-2">{{member.churchFamilyName}}</p></li>
                <li>
                  <ul class="list-item mx-0 px-0">
                    <li class="list-unstyled mx-0">
                      <div class="" role="group" aria-label="Basic example">
                        <NuxtLink :to="'/admin/members/'+member.phoneNumber">
                          <button type="button" class="btn btn-primary">Update</button>
                        </NuxtLink>
                        <NuxtLink :to="'/admin/members/'+member.phoneNumber+'/tithe'">
                          <button type="button" class="btn btn-outline-primary">Record Tithe</button>
                        </NuxtLink>
                        <NuxtLink :to="'/admin/members/'+member.phoneNumber+'/role'"
                                  v-if="loggedInUser.data.roleId === '1'">
                          <button type="button" class="btn btn-secondary">Assign Role</button>
                        </NuxtLink>
                        <button v-if="loggedInUser.data.roleId === '1'" type="button" data-bs-target="#warningModal"
                                data-bs-toggle="modal"
                                class="btn btn-danger">Delete
                        </button>
                      </div>
                    </li>
                  </ul>
                </li>
              </ul>


            </div>
          </div>


        </div>

        <ul class="list-group my-4 d-none">
          <li class="list-group-item disabled" aria-disabled="true">A disabled item</li>
          <li class="list-group-item">A second item</li>
          <li class="list-group-item">A third item</li>
          <li class="list-group-item">A fourth item</li>
          <li class="list-group-item">And a fifth one</li>
        </ul>
      </div>
      <page-loader v-else></page-loader>
    </div>
    <warning-modal v-bind:title="'Are you sure?'" :message="'You are about to delete this users details.'"
                   @onclick="modalState($event)"></warning-modal>
  </div>
</template>

<script>
  import {profileImageBaseUrl} from "../../../../resources/constants";
  import {ChurchMember} from "../../../../network/Member";
  import {mapGetters} from 'vuex';


  export default {
    name: "view",
    beforeMount() {
      this.getMember(this.$route.params.id)
    },
    data() {
      return {
        pageRefresh: false,
        toDeleteId: '',
        member: ChurchMember
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'loggedInUser'])
    },
    methods: {
      getMember(id) {
        this.pageRefresh = true
        this.$axios.get(`churchmembers/${id}`).then(response => {
          this.member = Object.assign(this.member, response.data.data)
          this.member.dataOfBirth = this.member.dataOfBirth.split('T')[0]
          this.member.profilePicture = this.getProfileImage(this.member.profilePicture)
          // this.churchFamilies = response.data.data

          this.pageRefresh = false
        }).catch(error => {
          this.member.profilePicture = this.getProfileImage('')
          this.pageRefresh = false
        })
      },
      getProfileImage(image) {
        if (image) {
          return `${profileImageBaseUrl}/${image}`
        }
        return require(`~/assets/imgs/user.svg`)
      },
      deleteMember(id) {
        this.$axios.delete(`churchmembers/${id}`).then(response => {
          this.$toast.info("User successfully deleted.")
          this.$router.push('/admin/manage')

        }).catch(error => {
        })
      },
      checkUserToDelete(id) {
        this.toDeleteId = id
      },
      modalState(data) {
        if (data.toString().toLowerCase() === 'positive') {
          this.deleteMember(this.$route.params.id)
        }
      }
    }
  }
</script>

<style scoped>

</style>
