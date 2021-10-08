<template>
  <div class="mt-10">
    <div class="row justify-content-center my-4">
      <div class="col-md-8 g-0">
        <div class="d-flex justify-content-end">
          <div class="d-flex justify-content-end">
            <div class="dropdown w-100">
              <button class="btn btn-primary btn-md dropdown-toggle" type="button" id="dropdownMenuButton1"
                      data-bs-toggle="dropdown" aria-expanded="false">
                Filter By Service
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li v-if="!isLoading" @click="fetchTotalByServiceId(service.id)"
                    v-for="(service,index) in services.data" :key="index"><a
                  class="dropdown-item" href="#">
                  {{ service.name }}
                </a></li>
              </ul>
            </div>

            <div class="dropdown mx-2  w-100">
              <button class="btn btn-primary btn-md dropdown-toggle" type="button" id="dropdownMenuButton1"
                      data-bs-toggle="dropdown" aria-expanded="false">
                Filter By Date
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <!--                <li @click="setYear(year)" v-for="(year,index) in generateArrayOfYears()" :key="index"><a-->
                <!--                  class="dropdown-item" href="#">-->
                <!--                  {{year}}-->
                <!--                </a></li>-->
              </ul>
            </div>
          </div>

          <button type="button" class="btn btn-success w-25 d-none" disabled>Save</button>
        </div>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-md-8" v-if="!isAccountingLoading">
        <table class="table table-bordered border-primary mb-5">
          <thead>
          <tr>
            <th scope="col"><h4>Total</h4></th>
            <th scope="col"><h4>Total Offering</h4></th>
            <th scope="col"><h4>Total Tithe</h4></th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>GHS {{ accountTotals.total }}</td>
            <td>GHS {{ accountTotals.offeringSum }}</td>
            <td>GHS {{ accountTotals.titheSum }}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <PageLoader v-else></PageLoader>


      <div class="row justify-content-center my-4">
        <div class="col-md-8 g-0">
          <div class="d-flex justify-content-end">
            <div class="d-flex justify-content-end">

              <div class="dropdown mx-2  w-100">
                <button class="btn btn-primary btn-md dropdown-toggle" type="button" id="dropdownMenuButton1"
                        data-bs-toggle="dropdown" aria-expanded="false">
                  Filter By Date
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                  <!--                <li @click="setYear(year)" v-for="(year,index) in generateArrayOfYears()" :key="index"><a-->
                  <!--                  class="dropdown-item" href="#">-->
                  <!--                  {{year}}-->
                  <!--                </a></li>-->
                </ul>
              </div>
            </div>

            <button type="button" class="btn btn-success w-25 d-none" disabled>Save</button>
          </div>
        </div>
      </div>


      <div class="col-md-8 mb-5" v-if="!isOfferingLoading">
        <h4 class="mb-4">List of All Offerings</h4>
        <table class="table table-bordered border-primary">
          <thead>
          <tr>
            <th scope="col"><h4>Name</h4></th>
            <th scope="col"><h4>Service</h4></th>
            <th scope="col"><h4>Amount</h4></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(offering,index) in offerings.results">
            <td>{{ offering.name }}</td>
            <td>{{ offering.serviceName }}</td>
            <td>GHS {{ offering.amount }}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <PageLoader v-else></PageLoader>


      <div class="row justify-content-center my-4">
        <div class="col-md-8 g-0">
          <div class="d-flex justify-content-end">
            <div class="d-flex justify-content-end">
              <div class="dropdown w-100">
                <button class="btn btn-primary btn-md dropdown-toggle" type="button" id="dropdownMenuButton1"
                        data-bs-toggle="dropdown" aria-expanded="false">
                  Filter By Family
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                  <li v-if="!isFamiliesLoading" @click="fetchTotalByServiceId(family.id)"
                      v-for="(family,index) in families.data" :key="index"><a
                    class="dropdown-item" href="#">
                    {{ family.name }}
                  </a></li>
                </ul>
              </div>

            </div>

            <button type="button" class="btn btn-success w-25 d-none" disabled>Save</button>
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <h4 class="mb-4">List of All Tithe By Family</h4>
        <table class="table table-bordered border-primary mb-5">
          <thead>
          <tr>
            <th scope="col"><h4>Family</h4></th>
            <th scope="col"><h4>Service</h4></th>
            <th scope="col"><h4>Amount</h4></th>
          </tr>
          </thead>
          <tbody>
          <tr class="d-none">
            <td>GHS {{ accountTotals.total.toLocaleString() }}</td>
            <td>GHS {{ accountTotals.offeringSum.toLocaleString() }}</td>
            <td>GHS {{ accountTotals.titheSum }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!--    <PageLoader v-else></PageLoader>-->
  </div>
</template>

<script>
import {ChurchFamilyList, DashboardAccountingTotal, OfferingList, ServiceList} from "../../network/Member";
import {numberWithCommas} from "../../resources/constants";

export default {
  name: "accounting",
  data() {
    return {
      services: ServiceList,
      isLoading: false,
      families: ChurchFamilyList,
      accountTotals: DashboardAccountingTotal,
      offerings: OfferingList,
      isAccountingLoading: false,
      isFamiliesLoading: false,
      isOfferingLoading: false
    }
  },
  beforeMount() {
    this.getAccounting()
    this.fetchServices()
    this.fetchFamilies()
    this.fetchOfferings()
  },
  methods: {
    getAccounting() {
      this.isAccountingLoading = true
      this.$axios.get(`accounting/total`).then(response => {
        this.accountTotals = Object.assign(DashboardAccountingTotal, response.data.data)
        this.isAccountingLoading = false
      }).catch(error => {
        this.isAccountingLoading = false
      })
    },
    fetchServices() {
      this.isLoading = true
      this.$axios.get(`services`).then(response => {
        this.services = Object.assign(ServiceList, response.data)

        this.isLoading = false
      }).catch(error => {
        this.isLoading = false
      })
    },
    fetchTotalByServiceId(serviceId) {
      this.isAccountingLoading = true
      this.$axios.get(`accounting/total?ServiceId=${serviceId}`).then(response => {
        this.accountTotals = Object.assign(DashboardAccountingTotal, response.data.data)
        this.isAccountingLoading = false
      }).catch(error => {
        this.isAccountingLoading = false
      })
    },
    fetchFamilies() {
      this.isFamiliesLoading = true
      this.$axios.get(`churchfamilies`).then(response => {
        this.families = Object.assign(ChurchFamilyList, response.data)
        this.isFamiliesLoading = false
      }).catch(error => {
        this.isFamiliesLoading = false
      })
    },
    fetchOfferings() {
      this.isOfferingLoading = true
      this.$axios.get(`offerings`).then(response => {
        this.offerings = Object.assign(OfferingList, response.data.data)
        this.isOfferingLoading = false
      }).catch(error => {
        this.isOfferingLoading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
