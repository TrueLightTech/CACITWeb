<template>
  <div>
    <nav class="navbar fixed-top navbar-light bg-light">
      <div class="container d-flex justify-content-between">
        <a class="navbar-brand" href="#"><h6>CACI Church APP</h6></a>
        <div class="d-flex justify-content-center align-content-center align-middle">

          <img src="~assets/imgs/menu.svg" :style="{width:'25px', height:'25px'}" class="img-fluid"
               data-bs-toggle="offcanvas"
               data-bs-target="#offcanvasWithBackdrop" aria-controls="offcanvasWithBackdrop"/>
        </div>
      </div>
    </nav>

    <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasWithBackdrop"
         aria-labelledby="offcanvasWithBackdropLabel">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasWithBackdropLabel">Menu</h5>
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body text-center">
        <ul class="list-unstyled">
          <li class="my-5"><h4>Home</h4></li>
          <li class="my-5"><h4>Announcements</h4></li>
          <li class="my-5"><h4>Record Tithe</h4></li>
          <li class="my-5"><h4>Manage</h4></li>
          <li class="my-5"><h4>Account</h4></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "AdminHeader"
  }
</script>

<style scoped>

</style>
