<template>
  <div class="container">

    <div v-if="!pageRefresh" class="row justify-content-center mt-10">
      <div class="col-sm-8 col-md-9 col-lg-8 col-xl-8 text-left justify-content-between mb-3">
        <ul class="list-unstyled">
          <li>
            <h3>Membership Form</h3>
          </li>
        </ul>
        <div class="row mb-3">
          <nav class="col-md-12">
            <ul class="pagination pagination-lg">
              <li @click="selectedSection(index)" v-for="index in 3" :class="pageActivation(index)" :key="index"><a
                class="page-link" href="#">{{ index }}</a></li>
            </ul>
          </nav>
        </div>

        <div class="row">
          <div class="col-md-12">
            <div v-if="!isLoading">
              <SectionOne :member="this.memberInfo" v-if="initial === 1"></SectionOne>
              <SectionTwo :member="this.memberInfo" v-if="initial === 2"></SectionTwo>
              <SectionThree :member="this.memberInfo" v-if="initial === 3"></SectionThree>
            </div>
            <page-loader v-else></page-loader>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script>
import SectionOne from "../../../../components/membershipForm/SectionOne";
import SectionTwo from "../../../../components/membershipForm/SectionTwo";
import SectionThree from "../../../../components/membershipForm/SectionThree";


export default {
  name: "membership-form",
  components: {SectionThree, SectionTwo, SectionOne},
  data() {
    return {
      id: '',
      pageRefresh: false,
      initial: 1,
      isLoading: false,
      memberInfo: {}
    }
  },
  mounted() {
    this.id = this.$route.params.id;
    this.getMembershipDetails()
  },
  methods: {
    pageActivation(index) {
      if (index === this.initial) {
        return "page-item active"
      }
      return "page-item"
    },
    selectedSection(index) {
      this.initial = index
    },
    getMembershipDetails() {
      this.isLoading = true

      this.$axios.get(`/churchmembers/userdetails/${this.id}`).then(response => {
        this.memberInfo = Object.assign({}, response.data.data)

        this.isLoading = false
      }).catch(error => {
        this.isLoading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
