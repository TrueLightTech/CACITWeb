<template>
  <div class="container">


    <div class="row justify-content-center mt-10">
      <div class="col-md-12 col-lg-8 col-lx-8 text-left d-flex justify-content-between mb-3">

        <ul class="list-unstyled">
          <li>
            <h3>Welfare</h3>
          </li>
        </ul>

        <div>
          <div class="btn-group">
            <button type="button" class="btn btn-secondary dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false">
              Year ({{ this.year }})
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li v-for="(year,index) in generateArrayOfYears()" :key="index">
                <button @click="setYear(year)" class="dropdown-item" type="button">{{ year }}</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>


    <div class="container">
      <div class="row justify-content-around" v-if="!isLoadingMember">
        <div class="col-md-12 col-lg-8 col-lx-8 text-left justify-content-between mb-3">
          <hr>
          <h4>{{ member.name }}</h4>
        </div>
      </div>
      <div class="row justify-content-around">
        <div class="col-md-12 col-lg-8 col-lx-8 text-center justify-content-between mb-3">
          <div v-if="!isLoadingTotal" class="row justify-content-center text-center mb-3">
            <div class="col-md-6 my-2">
              <div class="card">
                <div class="card-body text-center">
                  <ul class="list-unstyled">
                    <li><h6>GHs</h6></li>
                    <li><h1>{{ formatMoney(welfareTotals.data.welfareBySelf) }}</h1></li>
                    <li><p>Paid</p></li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="col-md-6 my-2">
              <div class="card">
                <div class="card-body">
                  <ul class="list-unstyled">
                    <li><h6>GHs</h6></li>
                    <li><h1>{{ formatMoney(welfareTotals.data.welfareByChurch) }}</h1></li>
                    <li><p>Awarded</p></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <PageLoader v-else></PageLoader>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row justify-content-center">

        <div class="col-md-12 col-lg-8 col-lx-8 text-left justify-content-between mb-3">
          <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
            <li class="nav-item" role="presentation">
              <button @click="isWelfareSelected(true)" class="nav-link active" id="pills-home-tab"
                      data-bs-toggle="pill" data-bs-target="#pills-home"
                      type="button" role="tab" aria-controls="pills-home" aria-selected="true">Paid
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button @click="isWelfareSelected(false)" class="nav-link" id="pills-profile-tab"
                      data-bs-toggle="pill" data-bs-target="#pills-profile"
                      type="button" role="tab" aria-controls="pills-profile" aria-selected="false">Awarded
              </button>
            </li>
          </ul>
          <div class="tab-content" id="pills-tabContent">
            <div class="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
              <div v-if="!isWelfareLoading" class="">
                <div v-if="welfare.data.results.length !== 0">
                  <table class="table">
                    <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Amount (GHS)</th>
                      <th scope="col">Date</th>
                      <th scope="col">Received By</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(item,index) in welfare.data.results" :key="index">
                      <th scope="row">{{ index + 1 }}</th>
                      <td>{{ formatMoney(item.transactionAmount) }}</td>
                      <td>{{ $moment(item.createdAt).format('Do MMMM YYYY') }}</td>
                      <td>{{ item.receivedBy }}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
                <p class="d-flex justify-content-center my-5" v-else>
                  No data
                </p>
              </div>
              <PageLoader v-else></PageLoader>
            </div>
            <div class="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
              <div class="" v-if="!isWelfareLoading">
                <div v-if="welfare.data.results.length !== 0">
                  <table class="table">
                    <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Amount (GHS)</th>
                      <th scope="col">Date</th>
                      <th scope="col">Description</th>
                      <th scope="col">Given By</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(item,index) in welfare.data.results" :key="index">
                      <th scope="row">{{ index + 1 }}</th>
                      <td>{{ formatMoney(item.transactionAmount) }}</td>
                      <td>{{ $moment(item.createdAt).format('Do MMMM YYYY') }}</td>
                      <td>{{ item.description }}</td>
                      <td>{{ item.receivedBy }}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
                <p class="d-flex justify-content-center my-5" v-else>
                  No data
                </p>
              </div>
              <PageLoader v-else></PageLoader>
            </div>
          </div>


        </div>

      </div>
    </div>


  </div>
</template>

<script>

import {mapGetters} from "vuex";
import PageLoader from "../../components/PageLoader";
import {ChurchMember, WelfareList, WelfareTotals} from "../../network/Member";
import {numberWithCommas} from "../../resources/constants";

const date = new Date();

export default {

  name: "welfare",
  components: {PageLoader},
  mounted() {
    this.id = this.loggedInUser.data.id;
    this.getWelfares();
    this.getWelfareTotals();
    this.getMemberDetails();
  },
  data() {
    return {
      id: '',
      amount: 0.0,
      title: "Are you sure?",
      message: 'You are about to delete this Welfare.',
      year: date.getFullYear() + "",
      description: '',
      toDeleteId: '',
      isLoadingMember: false,
      member: ChurchMember,
      isWelfareLoading: false,
      isLoadingTotal: false,
      welfare: WelfareList,
      welfareTotals: WelfareTotals,
      isSelf: true,
      isChurch: false
    }
  },
  methods: {
    formatMoney(value) {
      return numberWithCommas(value)
    },
    setYear(year) {
      this.year = year
      this.getWelfares();
      this.getWelfareTotals();
    },
    checkToDelete(id) {
      this.toDeleteId = id
    },
    generateArrayOfYears() {
      let max = new Date().getFullYear()
      let min = max - 12
      let years = []

      for (let i = max; i >= min; i--) {
        years.push(i)
      }
      return years
    },
    isWelfareSelected(type) {
      if (type) {
        this.isSelf = true
        this.isChurch = false
      } else {
        this.isSelf = false
        this.isChurch = true
      }
      this.getWelfares();
    }, isSelected(type) {
      if (type) {
        this.isSelf = true
        this.isChurch = false
      } else {
        this.isSelf = false
        this.isChurch = true
      }
    },
    recordWelfare() {
      const requestBody = {
        userId: this.id,
        transactionAmount: parseFloat(this.amount),
        year: this.year + "",
        isWelfarePaidBySelf: this.isSelf,
        isWelfarePaidByChurch: this.isChurch,
        description: this.description
      }

      if (this.amount > 0.0) {
        if (this.isChurch && this.description.length !== 0) {
          this.$axios.post(`welfaretransactions`, requestBody).then(response => {
            this.$toast.success("Successfully added")
            this.isLoading = false
            this.getWelfares();
            this.getWelfareTotals();
            this.clearFields();
          }).catch(error => {
            this.$toast.success(error.response.data.message)
            this.isLoading = false
          })
        } else if (this.isSelf) {
          this.$axios.post(`welfaretransactions`, requestBody).then(response => {
            this.$toast.success("Successfully added")
            this.isLoading = false
            this.getWelfares();
            this.getWelfareTotals();
            this.clearFields();
          }).catch(error => {
            this.$toast.success(error.response.data.message)
            this.isLoading = false
          })
        }
      }
    },
    getWelfareTotals() {
      this.isLoadingTotal = true
      this.$axios.get(`welfaretransactions/total?userId=${this.id}&year=${this.year}`).then(response => {
        this.welfareTotals = Object.assign(WelfareTotals, response.data)
        this.isLoadingTotal = false
      }).catch(error => {
        // this.$toast.success(error.response.data.message)
        this.isLoadingTotal = false
      })

    },
    getMemberDetails() {
      this.isLoadingMember = true
      this.$axios.get(`churchmembers/user/${this.id}`).then(response => {
        this.member = Object.assign(ChurchMember, response.data.data)
        this.isLoadingMember = false
      }).catch(error => {
        // this.$toast.success(error.response.data.message)
        this.isLoadingMember = false
      })

    },
    getWelfares() {
      this.isWelfareLoading = true
      this.$axios.get(`welfaretransactions?UserId=${this.id}&IsWelfarePaidBySelf=${this.isSelf}&IsWelfarePaidByChurch=${this.isChurch}&Year=${this.year}&PageSize=20`).then(response => {
        this.welfare = Object.assign(WelfareList, response.data)
        this.isWelfareLoading = false
      }).catch(error => {
        this.$toast.success(error.response.data.message)
        this.isWelfareLoading = false
      })
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser'])
  }
}
</script>

<style scoped>

</style>
