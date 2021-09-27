<template>
  <div class="container">
    <div v-if="!pageRefresh" class="row justify-content-center mt-10">
      <div class="row justify-content-center">
        <div class="col text-center">
          <ul class="list-unstyled">
            <li><h2 class="py-2">Report An Issue</h2></li>
            <li><p></p></li>
          </ul>
        </div>
      </div>
      <div class="col-md-6 mb-5">
        <div class="card p-3 mt-4">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12">

                <div class="mb-3">
                  <label for="exampleFormControlInput1" class="form-label">Title</label>
                  <input v-model="title" type="text" class="form-control" id="exampleFormControlInput1" placeholder="">
                </div>
                <div class="mb-3">
                  <label for="exampleFormControlTextarea1" class="form-label">Message</label>
                  <textarea v-model="message" class="form-control" id="exampleFormControlTextarea1" rows="5"></textarea>
                </div>
              </div>
            </div>

            <div class="row justify-content-end text-end">

              <div class="col-12 my-3">
                <button v-if="!isLoading" @click="createReport()" type="button" :class="activateButton()">Send
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
  import {mapGetters} from 'vuex'

  import {ChurchMember} from "../../network/Member";

  export default {
    name: "report",
    data() {
      return {
        update: ChurchMember,
        isLoading: false,
        pageRefresh: false,
        title: '',
        message: '',
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
      isInputFieldsValid() {
        const isValid = (currentValue) => currentValue.length !== 0;
        const inputArray = [this.title, this.message];
        return inputArray.every(isValid)
      },
      createReport() {
        this.isLoading = true

        let requestBody = {
          userId: this.loggedInUser.data.id,
          title: this.title,
          issueMessage: this.message
        }

        this.$axios.post('issues', requestBody).then(response => {
          this.$toast.success("Successfully created")
          this.isLoading = false

          this.$router.push('/admin/dashboard')
        }).catch(error => {
          this.$toast.success(error.response.data.message)
          this.isLoading = false
        })
      },
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'loggedInUser'])
    }
  }
</script>

<style scoped>

</style>
