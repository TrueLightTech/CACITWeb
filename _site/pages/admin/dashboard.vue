<template>
  <div class="container">
    <div class="row justify-content-center mt-10">
      <div class="col-sm-10 col-md-10 col-lg-10 col-xl-6">
        <h6>Hi, {{user.name}}</h6>
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
            <div
              class="d-flex justify-content-center align-middle align-self-center align-content-center align-items-center mt-5">
              <ul class="list-unstyled  justify-content-center text-center">
                <li class="my-2">
                  <img src="~assets/imgs/empty_state.svg" :style="{width: '340px'}"
                       class="img-fluid  align-self-center align-middle"/>
                </li>
                <li class="mt-4"><h4>Nothing Found Here</h4></li>
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
      return {
        user: JSON.parse(window.localStorage.getItem('auth.user'))
      }
    },
    mounted() {
    }
  }
</script>

<style scoped>

</style>
