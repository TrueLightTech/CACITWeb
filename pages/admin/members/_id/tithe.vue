<template>
  <div class="container">

    <div v-if="!pageRefresh" class="row justify-content-center mt-10">
      <div class="row justify-content-center">
        <div class="col text-center">
          <ul class="list-unstyled">
            <li><h2 class="py-2">Record Tithe ( {{month}} {{year}}) </h2></li>
            <li><h5>({{user.name}})</h5></li>
            <li>
            </li>
          </ul>
        </div>

        <div class="row justify-content-center my-4">
          <div class="col-md-6">
            <div class="d-flex justify-content-end">
              <div class="d-flex justify-content-end">
                <div class="dropdown w-100">
                  <button class="btn btn-primary btn-lg dropdown-toggle" type="button" id="dropdownMenuButton1"
                          data-bs-toggle="dropdown" aria-expanded="false">
                    Month
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li @click="setMonth(index)" v-for="(month,index) in months" :key="index"><a
                      class="dropdown-item" href="#">
                      {{month}}
                    </a></li>
                  </ul>
                </div>

                <div class="dropdown mx-2  w-100">
                  <button class="btn btn-primary btn-lg dropdown-toggle" type="button" id="dropdownMenuButton1"
                          data-bs-toggle="dropdown" aria-expanded="false">
                    Year
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li @click="setYear(year)" v-for="(year,index) in generateArrayOfYears()" :key="index"><a
                      class="dropdown-item" href="#">
                      {{year}}
                    </a></li>
                  </ul>
                </div>
              </div>

              <button type="button" class="btn btn-success w-25 d-none" disabled>Save</button>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="table-responsive">
          <table class="table table-bordered border-primary">
            <thead>
            <tr class="text-center">
              <th scope="col">Weeks</th>
              <th scope="col">Amount (GHS)</th>
              <th scope="col"></th>
            </tr>
            </thead>
            <tbody>
            <tr class="text-center" v-for="i in weeks">
              <th scope="row"><h2>{{i}}</h2></th>
              <td><h2>{{tithe['week'+i]}}</h2></td>
              <td>
                <button data-bs-toggle="modal" data-bs-target="#exampleModal" @click="weekSelected(i)"
                        class="btn btn-success"><i class="fa fa-plus-circle"></i> Record
                </button>
              </td>
            </tr>
            <tr scope="row" class="text-center">
              <th scope="row"><h2>Total</h2></th>
              <td colspan="2"><h2>GHS {{getTotal()}}</h2></td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <PageLoader v-else class="mt-10"></PageLoader>


    <!-- Modal -->
    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-center" id="exampleModalLabel">Record Tithe</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body my-4 text-center d-flex justify-content-center">
            <ul class="list-unstyled">
              <li>
                <label class="mb-2 text-start">Amount</label>
                <input v-model="amountPaid" class="form-control form-control-lg w-100 text-center" type="text"
                       placeholder="GHs 100"
                       aria-label=".form-control-lg example">
              </li>

              <li class="my-3" v-if="!isServiceLoaded">
                <label class="mb-2 text-start">Select Service</label>
                <select v-model="serviceId" class="form-select form-control-lg"
                        aria-label="Default select example">
                  <option :value="service.id"
                          v-for="service in services.data">{{service.name}}
                  </option>
                </select>
              </li>

            </ul>

          </div>
          <div class="modal-footer">
            <button data-bs-dismiss="modal" @click="recordTithe()" type="button" class="btn btn-primary">Save</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import {ChurchMember, ServiceList, Tithe} from "../../../../network/Member";
  import {mapGetters} from 'vuex'

  const date = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


  export default {
    name: "tithe",
    data() {
      return {
        week: 1,
        pageRefresh: false,
        isServiceLoaded: false,
        user: ChurchMember,
        amountPaid: "",
        tithe: Tithe,
        totalAmount: 0,
        month: months[date.getMonth()],
        year: date.getFullYear(),
        weeks: [1, 2, 3, 4, 5],
        services: ServiceList,
        serviceId: '',
        serviceName: '',
        months: months,
      }
    },
    beforeMount() {
      let id = this.$route.params.id
      this.getServices()
      this.getMember(id)
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'loggedInUser'])
    },
    methods: {
      weekSelected(i) {
        this.week = i
      },
      setYear(yr) {
        this.year = yr
        this.getTithe(this.user.id)
      },
      setMonth(mth) {
        this.month = this.months[mth];
        this.getTithe(this.user.id)
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
      getMember(id) {
        this.pageRefresh = true
        this.$axios.get(`churchmembers/${id}`).then(response => {
          this.user = Object.assign(this.user, response.data.data)
          this.user.dataOfBirth = this.user.dataOfBirth.split('T')[0]

          this.getTithe(this.user.id)
        }).catch(error => {
          this.pageRefresh = false
        })
      },
      getTithe(id) {
        this.pageRefresh = true
        this.$axios.get(`tithes/${id}/?Month=${this.month}&Year=${this.year}`).then(response => {
          this.tithe = Object.assign(this.tithe, response.data.data)[this.month]
          this.pageRefresh = false
        }).catch(error => {
          this.pageRefresh = false
        })
      },
      getServices() {
        this.isServiceLoaded = true
        this.$axios.get(`services`).then(response => {
          this.isServiceLoaded = false
          this.services = Object.assign(this.services, response.data)
        }).catch(error => {
          this.isServiceLoaded = false
        })
      },
      getTotal() {
        return [this.tithe.week1, this.tithe.week2, this.tithe.week3, this.tithe.week4, this.tithe.week5].reduce((a, b) => a + b, 0)
      },
      recordTithe() {

        if (this.amountPaid.length !== 0 && this.serviceId.length !== 0) {
          this.tithe['week' + this.week] = parseFloat(this.amountPaid)

          const requestBody = {
            userId: this.user.id,
            year: this.year + "",
            signature: this.loggedInUser.data.name,
            serviceId: this.serviceId,
            serviceName: this.services.data.filter(service => service.id === this.serviceId)[0].name,
            month: this.month,
            amountPaid: 0.0,
          }

          requestBody[`week${this.week}`] = parseFloat(this.amountPaid)

          if (this.tithe.titheId == null) {
            this.$axios.post(`tithes`, requestBody).then(response => {
              this.tithe.titheId = response.data.data[this.month]["titheId"]
              this.$toast.success("Successfully recorded")
              this.isLoading = false
              this.amountPaid = 0.0
              this.serviceId = ''
            }).catch(error => {
              this.$toast.success(error.response.data.message)
              this.isLoading = false
            })
          } else {
            this.$axios.put(`tithes/${this.tithe.titheId}`, requestBody).then(response => {
              this.$toast.success("Successfully recorded")
              this.isLoading = false
              this.amountPaid = 0.0
              this.serviceId = ''
            }).catch(error => {
              this.$toast.success(error.response.data.message)
              this.isLoading = false
            })
          }


        }

      }
    }
  }
</script>

<style scoped>

</style>
