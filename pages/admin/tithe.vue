<template>

  <div class="container">

    <div v-if="!pageRefresh" class="row justify-content-center mt-10">
      <div class="row justify-content-center">
        <div class="col text-center">
          <ul class="list-unstyled">
            <li><h2 class="py-2">Tithe ( {{month}} {{year}}) </h2></li>
            <li><h5>({{this.loggedInUser.data.name}})</h5></li>
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
            </tr>
            </thead>
            <tbody>
            <tr class="text-center" v-for="i in weeks">
              <th scope="row"><h2>{{i}}</h2></th>
              <td><h2>{{tithe['week'+i]}}</h2></td>
            </tr>
            <tr scope="row" class="text-center">
              <th><h2>Total</h2></th>
              <td><h2>GHS {{getTotal()}}</h2></td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <PageLoader v-else class="mt-10"></PageLoader>

  </div>

</template>

<script>
  import {mapGetters} from 'vuex'
  import {Tithe} from "../../network/Member";

  const date = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]


  export default {
    name: "tithe",
    data() {
      return {
        week: 1,
        pageRefresh: false,
        amountPaid: 0,
        tithe: Tithe,
        totalAmount: 0,
        month: months[date.getMonth()],
        year: date.getFullYear(),
        weeks: [1, 2, 3, 4, 5],
        months: months,
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'loggedInUser'])
    },
    beforeMount() {
      this.getTithe(this.loggedInUser.data.id)
    },
    methods: {
      weekSelected(i) {
        this.week = i
      },
      setYear(yr) {
        this.year = yr
        this.getTithe(this.loggedInUser.data.id)
      },
      setMonth(mth) {
        this.month = this.months[mth];
        this.getTithe(this.loggedInUser.data.id)
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
    }
  }
</script>

<style scoped>

</style>
