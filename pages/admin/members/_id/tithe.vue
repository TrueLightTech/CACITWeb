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
          <div class="col-md-10">
            <div class="d-flex justify-content-between">
              <div class="dropdown w-100">
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

              <button type="button" class="btn btn-success w-25" disabled>Save</button>

            </div>
          </div>
        </div>


      </div>
      <div class="col-md-10">
        <div class="table-responsive">
          <table class="table table-bordered border-primary">
            <thead>
            <tr>
              <th scope="col">Months</th>
              <th scope="col">Week 1</th>
              <th scope="col">Week 2</th>
              <th scope="col">Week 3</th>
              <th scope="col">Week 4</th>
              <th scope="col">Week 5</th>
              <th scope="col">Total</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="i in months">
              <th scope="row">{{i}}</th>
              <td><input type="number" style="height: 50px;width: 100px;" class="w-100 form-control m-0 p-0"/></td>
              <td><input type="number" style="height: 50px;width: 100px;" class="w-100 form-control m-0 p-0"/></td>
              <td><input type="number" style="height: 50px;width: 100px;" class="w-100 form-control m-0 p-0"/></td>
              <td><input type="number" style="height: 50px;width: 100px;" class="w-100 form-control m-0 p-0"/></td>
              <td><input type="number" style="height: 50px;width: 100px;" class="w-100 form-control m-0 p-0"/></td>
              <td><input disabled type="number" style="height: 50px;width: 100px;"
                         class="w-100 form-control m-0 p-0"/>
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
