<template>
  <div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-md-4 g-0">
        <div class="form-window card p-4 border-0 rounded-0 pt-5">
          <div class="card-body">
            <ul class="list-unstyled">
              <li>
                <h3>LOG IN</h3>
              </li>
              <li class="mb-4">
                <h5>[CACI Taifa]</h5>
              </li>
              <li>
                <div class="mb-3">
                  <label for="exampleFormControlInput1" class="form-label">Phone number</label>
                  <input type="email" class="form-control w-75" id="exampleFormControlInput1"
                         placeholder="">
                </div>
              </li>

              <li>
                <div class="mb-3">
                  <label for="exampleFormControlInput1" class="form-label">Password</label>
                  <input type="password" class="form-control w-75" id="exampleFormControlInput1"
                         placeholder="">
                </div>
              </li>
              <li class="mt-4">
                <button type="button" class="btn btn-primary btn-lg px-4 py-2">
                  <h6 class="p-0 m-0">LOG IN</h6>
                </button>
              </li>
              <li class="mt-2">
                <small>You dont have an account, create on
                  <NuxtLink to="/register" class="bg-active">here</NuxtLink>
                </small>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-md-8 g-0">
        <div class="form-right-window d-flex justify-content-center">
          <img src="~assets/imgs/login_form_image.svg" class="img-fluid w-50 align-self-center"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "login"
  }
</script>

<style scoped>
  body {
    background-color: #7F828B;
  }
</style>
