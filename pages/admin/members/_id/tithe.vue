<template>
  <div class="container">
    <div v-if="!pageRefresh" class="row justify-content-center mt-10">
      <div class="row justify-content-center">
        <div class="col text-center">
          <ul class="list-unstyled">
            <li><h2 class="py-2">Record Tithe ({{year}}) </h2></li>
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
                    <li @click="setMonth(month)" v-for="(month,index) in months" :key="index"><a
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
              <td><h2>5,000</h2></td>
              <td>
                <button class="btn btn-success"><i class="fa fa-plus-circle"></i> Record</button>
              </td>
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
  import {ChurchMember} from "../../../../network/Member";

  export default {
    name: "tithe",
    data() {
      return {
        week: 1,
        pageRefresh: false,
        user: ChurchMember,
        month: 10,
        year: "2021",
        weeks: ["1", "2", "3", "4", "5", "Total"],
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      }
    },
    beforeMount() {
      let id = this.$route.params.id
      this.getMember(id)
    },
    methods: {
      setYear(yr) {
        this.year = yr
      },
      setMonth(mth) {
      },
      generateArrayOfYears() {
        let max = new Date().getFullYear()
        let min = max - 9
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

          this.pageRefresh = false
        }).catch(error => {
          this.pageRefresh = false
        })
      }
    }
  }
</script>

<style scoped>

</style>
