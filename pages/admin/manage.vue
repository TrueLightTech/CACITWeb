<template>
  <div class="container">

    <div class="row justify-content-center mt-10">
      <div class="col-md-8 text-left justify-content-between mb-3">
        <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home"
                    type="button" role="tab" aria-controls="pills-home" aria-selected="true">Members
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile"
                    type="button" role="tab" aria-controls="pills-profile" aria-selected="false">Reported Issues
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="pills-contact-tab" data-bs-toggle="pill" data-bs-target="#pills-contact"
                    type="button" role="tab" aria-controls="pills-contact" aria-selected="false">Offerings/Tithe
            </button>
          </li>
          <li class="nav-item d-none" role="presentation">
            <button class="nav-link" id="pills-users-tab" data-bs-toggle="pill" data-bs-target="#pills-users"
                    type="button" role="tab" aria-controls="pills-contact" aria-selected="false">Users
            </button>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">Settings</a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item"
                     id="pills-church-group-tab" data-bs-toggle="pill" data-bs-target="#pills-church-group"
                     href="#">Church Group</a></li>
              <li><a class="dropdown-item"
                     id="pills-services-tab" data-bs-toggle="pill" data-bs-target="#pills-services"
                     href="#">Church Services</a></li>
              <li><a class="dropdown-item"
                     id="pills-family-tab" data-bs-toggle="pill" data-bs-target="#pills-family"
                     href="#">Church Family</a></li>
            </ul>
          </li>
        </ul>

      </div>
    </div>
    <div class="row justify-content-center mb-3">
      <div class="col-md-8 text-left justify-content-between mb-3">
        <div class="tab-content" id="pills-tabContent">
          <div class="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
            <Members></Members>
          </div>
          <div class="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
            <Issues></Issues>
          </div>
          <div class="tab-pane fade" id="pills-contact" role="tabpanel" aria-labelledby="pills-contact-tab">

          </div>
          <div class="tab-pane fade" id="pills-users" role="tabpanel" aria-labelledby="pills-users-tab">
            <Users></Users>
          </div>
          <div class="tab-pane fade" id="pills-church-group" role="tabpanel" aria-labelledby="pills-church-group-tab">
            <ChurchGroup></ChurchGroup>
          </div>
          <div class="tab-pane fade" id="pills-family" role="tabpanel" aria-labelledby="pills-family-tab">
            <ChurchFamily></ChurchFamily>
          </div>
          <div class="tab-pane fade" id="pills-services" role="tabpanel" aria-labelledby="pills-services-tab">
            <Services></Services>
          </div>
        </div>
      </div>
    </div>
  </div>


</template>

<script>


  import Members from "../../components/Members";
  import ChurchFamily from "../../components/ChurchFamily";
  import Users from "../../components/Users";
  import Issues from "../../components/Issues";

  export default {
    name: "manage",
    components: {Issues, Users, ChurchFamily, Members}
  }
</script>

<style scoped>

</style>
