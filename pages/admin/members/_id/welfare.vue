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
          <button @click="isSelected(true)" type="button" class="btn btn-primary" data-bs-toggle="modal"
                  data-bs-target="#staticBackdrop67"><i
            class="fas fa-plus-circle"></i> Add Welfare
          </button>
          <button @click="isSelected(false)" type="button" class="btn btn-warning" data-bs-toggle="modal"
                  data-bs-target="#staticBackdrop67"><i class="fas fa-plus-circle"></i> Award Welfare
          </button>
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
                      <th scope="col">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(item,index) in welfare.data.results" :key="index">
                      <th scope="row">{{ index + 1 }}</th>
                      <td>{{ formatMoney(item.transactionAmount) }}</td>
                      <td>{{ $moment(item.createdAt).format('Do MMMM YYYY') }}</td>
                      <td>{{ item.receivedBy }}</td>
                      <td>
                        <button type="button" class="btn btn-danger" data-bs-toggle="modal"
                                data-bs-target="#exampleModal17" @click="checkToDelete(item.id)"><i
                          class="fas fa-trash-alt"></i>
                        </button>
                      </td>
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
                      <th scope="col">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(item,index) in welfare.data.results" :key="index">
                      <th scope="row">{{ index + 1 }}</th>
                      <td>{{ formatMoney(item.transactionAmount) }}</td>
                      <td>{{ $moment(item.createdAt).format('Do MMMM YYYY') }}</td>
                      <td>{{ item.description }}</td>
                      <td>{{ item.receivedBy }}</td>
                      <td>
                        <button type="button" class="btn btn-danger" data-bs-toggle="modal"
                                data-bs-target="#exampleModal17" @click="checkToDelete(item.id)"><i
                          class="fas fa-trash-alt"></i>
                        </button>
                      </td>
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


    <div class="modal fade" id="staticBackdrop67" data-bs-keyboard="false" tabindex="-1"
         aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 v-if="this.isSelf" class="modal-title">Add Welfare</h5>
            <h5 v-if="this.isChurch" class="modal-title">Award Welfare</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form>
              <ul class="list-unstyled">
                <li>
                  <div class="mb-3">
                    <label for="recipient-name" class="col-form-label">Amount</label>
                    <input type="text" class="form-control" v-model="amount" id="recipient-name">
                  </div>
                </li>
                <li class="my-3">
                  <label class="mb-2 text-start">Year</label>
                  <select v-model="year" class="form-select form-control-lg"
                          aria-label="Default select example">
                    <option v-for="year in generateArrayOfYears()">{{ year }}
                    </option>
                  </select>
                </li>
                <li v-if="this.isChurch">
                  <div class="mb-3">
                    <label for="recipient-name" class="col-form-label">Description</label>
                    <textarea type="text" class="form-control" v-model="description"></textarea>
                  </div>
                </li>
              </ul>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button @click="recordWelfare()" type="button" data-bs-dismiss="modal" class="btn btn-primary">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>

    <!--           Modal-->
    <div class="modal fade" id="exampleModal17" tabindex="-1" aria-labelledby="exampleModalLabel"
         aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center">
            <ul class="list-unstyled">
              <li><h3>{{ this.title }}</h3></li>
              <li><p>
                {{ this.message }}
              </p></li>
            </ul>
          </div>
          <div class="modal-footer d-flex justify-content-center">
            <button type="button" class="btn btn-secondary" @click="negativeButton()" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" @click="positiveButton()" data-bs-dismiss="modal">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script>
import {ChurchMember, WelfareList, WelfareTotals} from "../../../../network/Member";
import PageLoader from "../../../../components/PageLoader";
import {mapGetters} from "vuex";
import {numberWithCommas} from "../../../../resources/constants";

const date = new Date();

export default {

  name: "welfare",
  components: {PageLoader},
  mounted() {
    this.id = this.$route.params.id;
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
    positiveButton() {
      this.deleteService(this.toDeleteId)
    },
    formatMoney(value) {
      return numberWithCommas(value)
    },
    deleteService(id) {
      this.$axios.delete(`welfaretransactions/${id}`).then(response => {
        this.getWelfares()
        this.getWelfareTotals()
        this.$toast.info("Welfare successfully deleted.")
      }).catch(error => {
        console.log(error)
      })
    },
    setYear(year) {
      this.year = year
      this.getWelfares();
      this.getWelfareTotals();
    },
    checkToDelete(id) {
      this.toDeleteId = id
    },
    negativeButton() {
      // this.$emit("onclick", "negative")
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
    clearFields() {
      this.amount = 0.0;
      this.year = date.getFullYear() + "";
    },
    recordWelfare() {
      const requestBody = {
        userId: this.id,
        transactionAmount: parseFloat(this.amount),
        year: this.year + "",
        isWelfarePaidBySelf: this.isSelf,
        isWelfarePaidByChurch: this.isChurch,
        receivedById: this.loggedInUser.data.id,
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
