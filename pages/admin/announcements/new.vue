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
      <div class="col-md-6 mb-5">
        <div class="card p-3 mt-4">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12">
                <div class="my-3">
                  <div class="d-flex justify-content-center" style="height: 300px;">
                    <img :src="image" v-model="image" style="object-fit: cover;" class="img-fluid w-100">
                  </div>
                </div>
                <div class="text-center">
                  <input type="file" accept="image/*" class="custom-file-input"
                         aria-describedby="inputGroupFileAddon01" @change="imageUploaded($event)">
                </div>
                <div class="mb-3">
                  <label for="exampleFormControlInput1" class="form-label">Title</label>
                  <input v-model="title" type="text" class="form-control" id="exampleFormControlInput1" placeholder="">
                </div>
                <div class="mb-3">
                  <label for="exampleFormControlTextarea1" class="form-label">Message</label>
                  <textarea v-model="message" class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
                </div>
              </div>
            </div>

            <div class="row justify-content-end text-end">

              <div class="col-12 my-3">
                <button v-if="!isLoading" @click="createAnnouncement()" type="button" :class="activateButton()">Send
                </button>
                <button v-else class="btn btn-primary btn-lg px-4" type="button" disabled>
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
        if (this.isInputFieldsValid()) {
          return "btn btn-primary px-5"
        } else {
          return "btn btn-primary px-5 disabled"
        }
      },
      getImage(image) {
        if (image) {
          return `${profileImageBaseUrl}/${image}`
        }
        return require(`~/assets/imgs/no_photo.svg`)
      },
      imageToBase64: function (img) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.image = e.target.result;
        }
        reader.readAsDataURL(img);
      },
      imageUploaded: function (e) {
        const selectedImage = e.target.files[0]

        var re = /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i;
        if (!re.exec(selectedImage.name)) {
          alert("File extension not supported!");
        } else {
          this.imageToBase64(selectedImage)
        }
      },
      isInputFieldsValid() {
        const isValid = (currentValue) => currentValue.length !== 0;
        const inputArray = [this.title, this.message];
        return inputArray.every(isValid)
      },
      createAnnouncement() {
        this.isLoading = true

        let requestBody = {
          title: this.title,
          body: this.message,
          image: this.image,
          announcementSummaryMessage: ""
        }

        this.$axios.post('announcements', requestBody).then(response => {
          // this.churchFamilies = response.data.data
          this.$toast.success("Successfully created")
          this.isLoading = false

          this.$router.push('/admin/announcements')
        }).catch(error => {
          this.$toast.success(error.response.data.message)
          this.isLoading = false
        })
      },
    }
  }
</script>

<style scoped>

</style>
