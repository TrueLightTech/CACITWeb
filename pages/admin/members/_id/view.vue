<template>
  <div class="container">
    <div class="row justify-content-center mt-10">
      <div v-if="!pageRefresh" class="col-md-8">
        <div class="card py-4">
          <div class="row justify-content-center">
            <div class="col-md-4 text-center">
              <img :src="getProfileImage(this.member.profilePicture)" class="img-fluid w-50 rounded-circle">
            </div>
            <div class="col-md-8">
              <ul class="list-unstyled">
                <li><h5 class="my-1">{{member.name}}</h5></li>
                <li><p class="my-1">{{member.phoneNumber}}</p></li>
                <li><p class="my-1">{{member.gender}}</p></li>
                <li><p class="my-2">{{member.churchFamilyId}}</p></li>
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
                        <NuxtLink :to="'/admin/members/'+member.phoneNumber">
                          <button type="button" class="btn btn-secondary">Assign Roles</button>
                        </NuxtLink>
                        <button type="button" data-bs-target="#warningModal" data-bs-toggle="modal"
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

        <ul class="list-group my-4">
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

  export default {
    name: "view",
    beforeMount() {
      this.getMember(this.$route.params.id)
    },
    data() {
      return {
        pageRefresh: false,
        toDeleteId: '',
        member: {
          id: "",
          name: "",
          emailAddress: "",
          phoneNumber: "",
          churchId: "",
          passCode: '',
          countryCode: 'GH',
          dataOfBirth: "1990-08-20",
          gender: "",
          profilePicture: "",
          churchFamilyId: "",
          churchGroupId: ""
        }
      }
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
