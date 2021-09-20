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
            <h5 class="modal-title text-center" id="exampleModalLabel">Amount</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body my-4 text-center d-flex justify-content-center">
            <input v-model="amountPaid" class="form-control form-control-lg w-75 text-center" type="text"
                   placeholder="GHs 100"
                   aria-label=".form-control-lg example">
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
  import {ChurchMember, Tithe} from "../../../../network/Member";

  const date = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]


  export default {
    name: "tithe",
    data() {
      return {
        week: 1,
        pageRefresh: false,
        user: ChurchMember,
        amountPaid: 0,
        tithe: Tithe,
        totalAmount: 0,
        month: months[date.getMonth()],
        year: date.getFullYear(),
        weeks: [1, 2, 3, 4, 5],
        months: months,
      }
    },
    beforeMount() {
      let id = this.$route.params.id
      this.getMember(id)
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
      getTotal() {
        return [this.tithe.week1, this.tithe.week2, this.tithe.week3, this.tithe.week4, this.tithe.week5].reduce((a, b) => a + b, 0)
      },
      recordTithe() {

        if (this.amountPaid !== 0) {
          this.tithe['week' + this.week] = parseFloat(this.amountPaid)

          const requestBody = {
            userId: this.user.id,
            year: this.year + "",
            signature: '',
            month: this.month,
            week1: this.tithe.week1,
            week2: this.tithe.week2,
            week3: this.tithe.week3,
            week4: this.tithe.week4,
            week5: this.tithe.week5,
            amountPaid: 0.0,
          }
          this.$axios.post('tithes', requestBody).then(response => {
            this.$toast.success("Successfully recorded")
            this.isLoading = false
            this.amountPaid = 0.0
          }).catch(error => {
            this.$toast.success(error.response.data.message)
            this.isLoading = false
          })
        }

      }
    }
  }
</script>

<style scoped>

</style>
