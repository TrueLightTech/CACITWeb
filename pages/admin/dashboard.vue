<template>
  <div class="container-fluid">
    <nav class="navbar fixed-top navbar-light bg-light">
      <div class="container d-flex justify-content-between">
        <a class="navbar-brand" href="#"><h5>CACI Church APP</h5></a>
        <div class="d-flex justify-content-center align-content-center align-middle">

          <div class="rounded mx-2" style="width: 30px;height: 30px;">
            <img src="~assets/imgs/user.svg"/>
          </div>
          <ul class="list-unstyled">
            <li>Maxwell</li>
          </ul>
          <!--          <p class="d-flex align-content-center"><i class="fa fa-caret"></i></p>-->
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
        <div class="col-md-6">
          <div class="dashboard rounded-3">
            <canvas id="myChart"></canvas>
          </div>
        </div>
      </div>

      <div class="row justify-content-center mt-10">
        <div class="col-md-6">
          <div class="dashboard rounded-2"></div>
        </div>
        <div class="col-md-6">
          <h3>Members</h3>
          <table class="table table-striped">
            <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">First</th>
              <th scope="col">Last</th>
              <th scope="col">Group</th>
              <th scope="col">Family</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <th scope="row">1</th>
              <td>Mark</td>
              <td>Isaac</td>
              <td>Name</td>
              <td>Precious</td>
            </tr>
            <tr>
              <th scope="row">2</th>
              <td>Jacob</td>
              <td>Thornton</td>
              <td>Name</td>
              <td>Name</td>
            </tr>
            <tr>
              <th scope="row">3</th>
              <td colspan="2">Mavis</td>
              <td>Name</td>
              <td>Name</td>
            </tr>
            <tr>
              <th scope="row">4</th>
              <td colspan="2">Bernice</td>
              <td>Name</td>
              <td>Name</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  const chartData = {
    labels: labels,
    datasets: [{
      label: 'My First dataset',
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgb(255, 99, 132)',
      data: [0, 10, 5, 2, 20, 30, 45],
    }]
  };

  const config = {
    type: 'line',
    chartData,
    options: {}
  };

  const labels = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
  ];

  var myChart = new Chart(
    document.getElementById('myChart'),
    config
  );

  export default {
    name: "dashboard",
    data() {
      return {}
    },
    mounted() {
    }
  }
</script>

<style scoped>

</style>
