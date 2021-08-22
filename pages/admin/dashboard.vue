<template>
  <div class="container">
    <div class="row justify-content-center mt-10">
      <div class="col-sm-10 col-md-10 col-lg-10 col-xl-6">
        <div class="row">
          <div class="col-md-4 my-2">
            <div class="card">
              <div class="card-body">
                <ul class="list-unstyled text-center">
                  <li>
                    <h1>100</h1>
                  </li>
                  <li>
                    <p>Members</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-md-4 my-2">
            <div class="card">
              <div class="card-body">
                <ul class="list-unstyled text-center">
                  <li>
                    <h1>14</h1>
                  </li>
                  <li>
                    <p>Groups</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-md-4 my-2">
            <div class="card">
              <div class="card-body">
                <ul class="list-unstyled text-center">
                  <li>
                    <h1>12</h1>
                  </li>
                  <li>
                    <p>Families</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-md-12">
            <div class="dashboard-mini mt-4 rounded-3">
              <h3>Stats</h3>
              <ul class="list-group">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  Tuesday Borns Offering
                  <span class="badge bg-primary rounded-pill">14</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  A second list item
                  <span class="badge bg-primary rounded-pill">2</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  Sunday Offering
                  <span class="badge bg-primary rounded-pill">1</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  Tithe (July)
                  <span class="badge bg-primary rounded-pill">1</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  Harvest
                  <span class="badge bg-primary rounded-pill">1</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script>


  import AdminHeader from "../../components/AdminHeader";

  export default {
    name: "dashboard",
    components: {AdminHeader},
    data() {
      return {}
    },
    mounted() {
    }
  }
</script>

<style scoped>

</style>
