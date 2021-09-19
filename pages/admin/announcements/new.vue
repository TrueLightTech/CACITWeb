<template>
  <div class="container">
    <div v-if="!pageRefresh" class="row justify-content-center mt-10">
      <div class="row justify-content-center">
        <div class="col text-center">
          <ul class="list-unstyled">
            <li><h2 class="py-2">Announcement</h2></li>
            <li><p></p></li>
          </ul>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card p-3 mt-4">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12">
                <div>
                  <div class="d-flex justify-content-center">
                    <img :src="image" class="img-fluid w-25 rounded-circle">
                  </div>
                </div>
                <div class="mb-3">
                  <label for="exampleFormControlInput1" class="form-label">Title</label>
                  <input type="text" class="form-control" id="exampleFormControlInput1" placeholder="">
                </div>
                <div class="mb-3">
                  <label for="exampleFormControlTextarea1" class="form-label">Message</label>
                  <textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
                </div>
              </div>
            </div>

            <div class="row justify-content-between">

              <div class="col-12 my-3">
                <button v-if="!isLoading" type="button" :class="activateButton()">Save
                </button>
                <button v-else class="btn btn-primary btn-lg px-4 py-2 w-100" type="button" disabled>
                  <h6 class="p-0 m-0"><span class="spinner-border spinner-border-sm" role="status"
                                            aria-hidden="true"></span> LOADING ...</h6>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <PageLoader class="mt-10" v-else></PageLoader>
  </div>
</template>

<script>
  import {ChurchMember} from "../../../network/Member";
  import {profileImageBaseUrl} from "../../../resources/constants";

  export default {
    name: "new",
    data() {
      return {
        update: ChurchMember,
        isLoading: false,
        pageRefresh: false,
        title: '',
        message: '',
        image: this.getImage(''),
        roleId: "",
        emptyRole: true,
        roles: [],
      }
    },
    methods: {
      activateButton() {
        if (this.roleId) {
          return "btn btn-primary w-100"
        } else {
          return "btn btn-primary w-100 disabled"
        }
      },
      getImage(image) {
        if (image) {
          return `${profileImageBaseUrl}/${image}`
        }
        return require(`~/assets/imgs/no_photo.svg`)
      }
    }
  }
</script>

<style scoped>

</style>
