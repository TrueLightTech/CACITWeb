<template>
  <div class="container">
    <div class="row justify-content-center mt-10">
      <div class="row justify-content-center">
        <div class="col text-center">
          <ul class="list-unstyled">
            <li><h2 class="py-2">Record Tithe</h2></li>
            <li><p>(Emmanuel Ayepah)</p></li>
          </ul>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12">
                <label>Week</label>
                <select class="form-select form-select-md" aria-label=".form-select-sm example">
                  <option v-for="(week,index) in weeks" :key="index">{{week}}</option>
                </select>
              </div>
              <div class="col-12">
                <label>Month</label>
                <select class="form-select form-select-md" aria-label=".form-select-sm example">
                  <option v-for="(month,index) in months" :key="index">{{month}}</option>
                </select>
              </div>
              <div class="col-12">
                <label>Year</label>
                <select class="form-select form-select-md" aria-label=".form-select-sm example">
                  <option v-for="(year,index) in years" :key="index">{{year}}</option>
                </select>
              </div>
            </div>
            <div class="row justify-content-between">
              <div class="col-12 my-3">
                <input type="text" class="form-control form-control-lg" placeholder="Amount" aria-label="First name">
              </div>

              <div class="col-12 my-3">
                <button type="button" class="btn btn-primary w-100">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "tithe",
    data() {
      return {
        weeks: [1, 2, 3, 4],
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        years: ["2019", "2020", "2021", "2022", "2023", "2024"]
      }
    }
  }
</script>

<style scoped>

</style>
