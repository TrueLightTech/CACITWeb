<template>
  <div class="mt-10">
    <div class="container">

      <div class="row justify-content-center my-4">
        <div class="col-md-8 g-0">
          <div class="d-flex justify-content-end">
            <div class="d-flex justify-content-end float-end text-end">
              <div class="dropdown w-100">
                <button class="btn btn-primary btn-md dropdown-toggle" type="button" id="dropdownMenuButton1"
                        data-bs-toggle="dropdown" aria-expanded="false">
                  Filter By Family
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                  <li><a class="dropdown-item" href="#" @click="filterByFamilyId('')">All</a></li>
                  <li v-if="!isFamiliesLoading" @click="filterByFamilyId(family)"
                      v-for="(family,index) in families.data" :key="index"><a
                    class="dropdown-item" href="#">{{ family.name }}
                  </a></li>
                </ul>
              </div>

              <div class="dropdown w-100 mx-2">
                <button class="btn btn-primary btn-md dropdown-toggle" type="button" id="dropdownMenuButton1"
                        data-bs-toggle="dropdown" aria-expanded="false">
                  Filter By Service
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                  <li><a class="dropdown-item" href="#" @click="filterByService('')">All</a></li>
                  <li v-if="!isLoading" @click="filterByService(service)"
                      v-for="(service,index) in services.data" :key="index"><a
                    class="dropdown-item" href="#">
                    {{ service.name }}
                  </a></li>
                </ul>
              </div>

              <div class="mx-2  w-100">
                <date-range-picker
                  ref="picker"
                  class="border-0"
                  :locale-data="{ format: 'yyyy/mm/dd' }"
                  v-model="totalsDateRange"
                  :time-picker="false"
                  @update="datePickerCallback($event)">
                  <template v-slot:input="picker" style="min-width: 350px;">
                    <i class="far fa-calendar-alt"></i>
                    {{ $moment(picker.startDate).format('YYYY-MM-DD') }} - {{
                      $moment(picker.endDate).format('YYYY-MM-DD')
                    }}
                  </template>
                </date-range-picker>
              </div>
            </div>

          </div>
          <div class="d-flex justify-content-start mt-3 mx-2 float-start">
            <ul class="list-unstyled">
              <li>Selected Service: <span style="font-weight: bolder;">{{ selectedServiceName }}</span></li>
              <li>Selected Family: <span style="font-weight: bolder;">{{ selectedFamilyName }}</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="row justify-content-center">
        <div class="col-md-8" v-if="!isAccountingLoading">
          <div class="table-responsive">
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
                <td>GHS {{ formatMoney(accountTotals.total) }}</td>
                <td>GHS {{ formatMoney(accountTotals.offeringSum) }}</td>
                <td>GHS {{ formatMoney(accountTotals.titheSum) }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
        <PageLoader v-else></PageLoader>


        <div class="row justify-content-center my-4">
          <div class="col-md-10 g-0">
            <div class="d-flex justify-content-end">

            </div>
          </div>
        </div>


        <div class="col-md-8 mb-5" v-if="!isOfferingLoading">
          <h4 class="mb-4">List of All Offerings</h4>
          <div class="table-responsive" v-for="(offering,index) in offerings" :key="index">
            <h5 class="my-2">{{ offering.offeringTypeName }}</h5>
            <table class="table table-bordered border-primary">
              <thead>
              <tr>
                <th scope="col"><h4>Service</h4></th>
                <th scope="col"><h4>Family Name</h4></th>
                <th scope="col"><h4>Amount</h4></th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(off,index) in offering.data" :key="index">
                <td>{{ off.serviceName }}</td>
                <td>{{ off.assignFamilyName }}</td>
                <td>GHS {{ formatMoney(off.amount) }}</td>
              </tr>
              <tr class="thead-light" v-if="offering.data.length !== 0">
                <td></td>
                <td></td>
                <td><h6>GHS {{
                    formatMoney(Array.from(offering.data, x => x.amount).reduce((a, b) => a + b, 0))
                  }}</h6></td>
              </tr>
              </tbody>
            </table>
            <div v-if="!isOfferingLoading">
              <p class="align-self-center text-center mt-5" v-if="offerings.length === 0 ">No Data Found</p>
            </div>

          </div>
        </div>
        <PageLoader v-else></PageLoader>


        <div v-if="!isTitheLoading" class="col-md-8">
          <h4 class="mb-4">List of All Tithe By Family</h4>
          <i v-if="isIndividualTitheClicked" @click="goBack()" class="fas fa-long-arrow-alt-left fa-2x mb-2"
             style="cursor: pointer;"></i>
          <div class="table-responsive">
            <table v-if="!isIndividualTitheClicked" class="table table-bordered border-primary mb-5">
              <thead>
              <tr>
                <th scope="col"><h4>Family</h4></th>
                <th scope="col"><h4>Amount</h4></th>
                <th scope="col"><h4>Action</h4></th>
              </tr>
              </thead>
              <tbody v-if="!isTitheLoading">
              <tr v-for="(tithe,index) in titheAggregate.data" :key="index">
                <td>{{ tithe.userFamilyName }}
                </td>
                <td>{{ formatMoney(tithe.totalAmount) }}</td>
                <td>
                  <button @click="fetchTitheMembers(tithe.userFamilyId)" class="btn btn-primary btn-sm">View
                    more
                  </button>
                </td>
              </tr>
              <tr class="thead-light" v-if="titheAggregate.data.length !== 0">
                <td></td>
                <td><h6>GHS
                  {{ formatMoney(Array.from(titheAggregate.data, x => x.totalAmount).reduce((a, b) => a + b, 0)) }}</h6>
                </td>
              </tr>
              </tbody>
            </table>
            <table v-else class="table table-bordered border-primary mb-5">
              <thead>
              <tr>
                <th scope="col"><h4>Name</h4></th>
                <th scope="col"><h4>Service Name</h4></th>
                <th scope="col"><h4>Amount</h4></th>
              </tr>
              </thead>
              <tbody v-if="!isLoadingIndividualTithe">
              <tr v-for="(tithe,index) in individualTithe.results" :key="index">
                <td>{{ tithe.userName }}</td>
                <td>{{ tithe.serviceName }}</td>
                <td>{{ formatMoney(tithe.amountPaid) }}</td>
              </tr>
              <tr class="thead-light" v-if="titheAggregate.data.length !== 0">
                <td></td>
                <td></td>
                <td><h6>GHS {{
                    formatMoney(Array.from(individualTithe.results, x => x.amountPaid).reduce((a, b) => a + b, 0))
                  }}</h6></td>
              </tr>
              </tbody>
            </table>
          </div>

          <div v-if="!isTitheLoading">
            <p class="align-self-center text-center" v-if="titheAggregate.data.length === 0 ">No Data Found</p>
          </div>
        </div>
        <PageLoader v-else></PageLoader>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ChurchFamilyList,
  DashboardAccountingTotal, IndividualTitheList, OfferingAltList,
  OfferingList,
  ServiceList,
  TitheAggregateList
} from "../../network/Member";
import DateRangePicker from 'vue2-daterange-picker'
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css'
import moment from "moment";
import {numberWithCommas} from "../../resources/constants";

const date = new Date();

export default {
  name: "accounting",
  data() {
    return {
      selectedService: '',
      selectedFamily: '',
      selectedServiceName: 'All',
      selectedFamilyName: 'All',
      services: ServiceList,
      isLoading: false,
      families: ChurchFamilyList,
      accountTotals: DashboardAccountingTotal,
      titheAggregate: TitheAggregateList,
      offerings: OfferingAltList,
      isAccountingLoading: false,
      isLoadingIndividualTithe: false,
      isFamiliesLoading: false,
      isOfferingLoading: false,
      isTitheLoading: false,
      selectedTotalsFilterService: 'All',
      individualTithe: IndividualTitheList,
      totalFilterByServiceId: '',
      isIndividualTitheClicked: false,
      totalsDateRange: {
        startDate: `${moment().format('YYYY-MM-DD')}`,
        endDate: `${moment().format('YYYY-MM-DD')}`,
      },
      offeringsDateRange: {
        startDate: `${moment().format('YYYY-MM-DD')}`,
        endDate: `${moment().format('YYYY-MM-DD')}`,
      },
      selectedTitheFilterFamily: 'All',
      titheFilterByFamilyId: '',
      titheDateRange: {
        startDate: `${moment().format('YYYY-MM-DD')}`,
        endDate: `${moment().format('YYYY-MM-DD')}`,
      },
    }
  },
  beforeMount() {
    this.getAccounting()
    this.fetchServices()
    this.fetchFamilies()
    this.fetchOfferings()
    this.fetchTitheAggregate()
  },
  methods: {
    goBack() {
      this.isIndividualTitheClicked = false
    },
    formatMoney(value) {
      return numberWithCommas(value)
    },
    getAccounting() {
      let filter = ""
      if (this.selectedService) {
        filter = `&ServiceId=${this.selectedService}`
      } else {

      }

      this.isAccountingLoading = true
      this.$axios.get(`accounting/total?StartDate=${this.totalsDateRange.startDate}&EndDate=${this.totalsDateRange.endDate}${filter}`).then(response => {
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
      let filter = ""
      if (this.selectedService) {
        filter = `&ServiceId=${this.selectedService}`
      }

      this.$axios.get(`accounting/offeringtypes?StartDate=${this.totalsDateRange.startDate}&EndDate=${this.totalsDateRange.endDate}${filter}`).then(response => {
        this.offerings = Object.assign(OfferingAltList.data, response.data)
        this.isOfferingLoading = false
      }).catch(error => {
        this.isOfferingLoading = false
      })
    },
    filterByFamilyId(value) {
      this.isIndividualTitheClicked = false
      this.selectedFamily = value.id
      if (!value) {
        this.selectedFamilyName = 'All'
      } else {
        this.selectedFamilyName = value.name
      }
      this.fetchTitheAggregate()
    },
    filterByService(value) {
      this.isIndividualTitheClicked = false
      this.selectedService = value.id
      if (!value) {
        this.selectedServiceName = 'All'
      } else {
        this.selectedServiceName = value.name
      }
      if (this.selectedFamily) {
        this.fetchTitheAggregate()
      }
      this.getAccounting()
      this.fetchOfferings()
    },
    fetchTitheAggregate() {
      this.isTitheLoading = true
      let filter = ""
      if (this.selectedFamily) {
        filter = `&FamilyId=${this.selectedFamily}`
      } else {

      }
      let filterService = ""
      if (this.selectedService) {
        filterService = `&ServiceId=${this.selectedService}`
      }

      this.$axios.get(`/accounting/tithe-aggregate?StartDate=${this.totalsDateRange.startDate}&EndDate=${this.totalsDateRange.endDate}${filter}${filterService}`).then(response => {
        this.titheAggregate = Object.assign(this.titheAggregate, response.data.data)
        // console.log(response.data.data)
        // console.log(this.titheAggregate)

        this.isTitheLoading = false
      }).catch(error => {
        this.isTitheLoading = false
      })
    },
    fetchTitheMembers(familyId) {
      this.isLoadingIndividualTithe = true
      this.$axios.get(`/accounting/members-tithe?FamilyId=${familyId}&StartDate=${this.totalsDateRange.startDate}&EndDate=${this.totalsDateRange.endDate}`).then(response => {
        this.individualTithe = Object.assign(this.individualTithe, response.data.data)
        this.isLoadingIndividualTithe = false
        this.isIndividualTitheClicked = true

      }).catch(error => {
        this.isLoadingIndividualTithe = false
      })

    },
    datePickerCallback(date) {
      this.totalsDateRange.startDate = moment(date.startDate).format('YYYY-MM-DD')
      this.totalsDateRange.endDate = moment(date.endDate).format('YYYY-MM-DD')
      this.getAccounting()
      this.fetchOfferings()
      this.fetchTitheAggregate()
    },
  },
  components: {DateRangePicker},
}
</script>

<style scoped>
.calendars {
  color: #222222;
}
</style>
