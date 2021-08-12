<template>
  <div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-md-4 g-0">
        <div class="form-window card p-4 border-0 rounded-0 pt-5">
          <div class="card-body">
            <ul class="list-unstyled">
              <li>
                <h3>Register</h3>
              </li>
              <li class="mt-4">
                <div class="mb-3">
                  <label for="exampleFormControlInput1" class="form-label">Full name</label>
                  <input type="email" class="form-control" id="exampleFormControlInput1"
                         placeholder="">
                </div>
              </li>
              <li>
                <div class="mb-3">
                  <label for="exampleFormControlInput1" class="form-label">Phone number</label>
                  <input type="text" class="form-control" id="exampleFormControlInput1"
                         placeholder="">
                </div>
              </li>
              <li>
                <form class="row g-4">
                  <div class="col-auto">
                    <input type="text" class="form-control" placeholder="Email address">
                  </div>
                  <div class="col-auto">
                    <input type="text" class="form-control" placeholder="Church ID">
                  </div>
                </form>
              </li>
              <li>
                <hr>
              </li>
              <li>
                <div class="mb-3">
                  <label for="exampleFormControlInput1" class="form-label">Profile Image</label>
                  <input type="file" class="form-control form-control-sm w-75" id="exampleFormControlInput1"
                         placeholder="">
                </div>
              </li>
              <li>
                <hr>
              </li>
              <li>
                <div class="mb-3">
                  <div class="btn-group">
                    <input type="date" class="form-control" placeholder="Church ID">
                  </div>
                  <div class="btn-group">
                    <button class="btn btn-secondary btn-md" type="button">
                      Gender
                    </button>
                    <button type="button" class="btn btn-md btn-secondary dropdown-toggle dropdown-toggle-split"
                            data-bs-toggle="dropdown" aria-expanded="false">
                      <span class="visually-hidden">Toggle Dropdown</span>
                    </button>
                    <ul class="dropdown-menu">
                      ...
                    </ul>
                  </div>
                </div>
              </li>
              <li>
                <div class="mb-3">
                  <div class="btn-group">
                    <button class="btn btn-secondary btn-md" type="button">
                      Church Family
                    </button>
                    <button type="button" class="btn btn-md btn-secondary dropdown-toggle dropdown-toggle-split"
                            data-bs-toggle="dropdown" aria-expanded="false">
                      <span class="visually-hidden">Toggle Dropdown</span>
                    </button>
                    <ul class="dropdown-menu">
                      ...
                    </ul>
                  </div>
                  <div class="btn-group">
                    <button class="btn btn-secondary btn-md" type="button">
                      Church Group
                    </button>
                    <button type="button" class="btn btn-md btn-secondary dropdown-toggle dropdown-toggle-split"
                            data-bs-toggle="dropdown" aria-expanded="false">
                      <span class="visually-hidden">Toggle Dropdown</span>
                    </button>
                    <ul class="dropdown-menu">
                      ...
                    </ul>
                  </div>
                </div>
              </li>
              <li class="mt-4">
                <button type="button" class="btn btn-primary btn-lg px-4 py-2">
                  <h6 class="p-0 m-0">REGISTER NOW</h6>
                </button>
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
    name: "register"
  }
</script>

<style scoped>

</style>
