<template>
  <div class="container-fluid">
    <nav class="navbar fixed-top navbar-light bg-light">
      <div class="container d-flex justify-content-between">
        <a class="navbar-brand" href="#">Fixed top</a>
        <div class="d-flex justify-content-center align-content-center">

          <div class="rounded mx-2" style="width: 30px;height: 30px; background-color: orangered;"></div>
          <p class="d-flex align-content-center">Maxwell</p>
        </div>
      </div>
    </nav>

    <div class="container">
      <div class="row justify-content-center mt-10">
        <div class="col-md-6">
          <div class="row">
            <div class="col-md-4">
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
            <div class="col-md-4">
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
            <div class="col-md-4">
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
                    A list item
                    <span class="badge bg-primary rounded-pill">14</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    A second list item
                    <span class="badge bg-primary rounded-pill">2</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    A third list item
                    <span class="badge bg-primary rounded-pill">1</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    A third list item
                    <span class="badge bg-primary rounded-pill">1</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    A third list item
                    <span class="badge bg-primary rounded-pill">1</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    A third list item
                    <span class="badge bg-primary rounded-pill">1</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="dashboard bg-secondary rounded-3"></div>
        </div>
      </div>

      <div class="row justify-content-center mt-10">
        <div class="col-md-6">
          <div class="dashboard bg-secondary rounded-2"></div>
        </div>
        <div class="col-md-6">
          <h3>Members</h3>
          <table class="table table-striped">
            <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">First</th>
              <th scope="col">Last</th>
              <th scope="col">Handle</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <th scope="row">1</th>
              <td>Mark</td>
              <td>Otto</td>
              <td>@mdo</td>
            </tr>
            <tr>
              <th scope="row">2</th>
              <td>Jacob</td>
              <td>Thornton</td>
              <td>@fat</td>
            </tr>
            <tr>
              <th scope="row">3</th>
              <td colspan="2">Larry the Bird</td>
              <td>@twitter</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "dashboard"
  }
</script>

<style scoped>

</style>
