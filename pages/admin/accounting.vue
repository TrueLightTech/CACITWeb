<template>
  <div class="mt-10">
    <div class="row justify-content-center my-4">
      <div class="col-md-8 g-0">
        <div class="d-flex justify-content-between">
          <div class="align-self-center">
            <h5 class="mx-1"> ({{ selectedTotalsFilterService }})</h5>
          </div>
          <div class="d-flex justify-content-end">
            <div class="dropdown w-100">
              <button class="btn btn-primary btn-md dropdown-toggle" type="button" id="dropdownMenuButton1"
                      data-bs-toggle="dropdown" aria-expanded="false">
                Filter By Service
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li v-if="!isLoading" @click="filterTotalsByServiceId(service)"
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
                @update="totalsDatePickerCallback($event)">
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

              <div class="mx-2  w-100">
                <date-range-picker
                  ref="picker"
                  v-model="offeringsDateRange"
                  :time-picker="false"
                  @update="offeringsDatePickerCallback($event)"
                >
                  <template v-slot:input="picker" style="min-width: 350px;">
                    <i class="far fa-calendar-alt"></i>
                    {{ $moment(picker.startDate).format('YYYY-MM-DD') }} -
                    {{ $moment(picker.endDate).format('YYYY-MM-DD') }}
                  </template>
                </date-range-picker>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div class="col-md-8 mb-5" v-if="!isOfferingLoading">
        <h4 class="mb-4">List of All Offerings</h4>
        <div class="table-responsive">
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
          <div v-if="!isOfferingLoading">
            <p class="align-self-center text-center mt-5" v-if="offerings.results.length === 0 ">No Data Found</p>
          </div>

        </div>
      </div>
      <PageLoader v-else></PageLoader>


      <div class="row justify-content-center my-4">
        <div class="col-md-8 g-0">
          <div class="d-flex justify-content-between">
            <div class="align-self-center">
              <h5 class="mx-1"> ({{ selectedTitheFilterFamily }})</h5>
            </div>
            <div class="d-flex justify-content-end">
              <div class="dropdown w-100">
                <button class="btn btn-primary btn-md dropdown-toggle" type="button" id="dropdownMenuButton1"
                        data-bs-toggle="dropdown" aria-expanded="false">
                  Filter By Family
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                  <li><a class="dropdown-item" href="#" @click="filterTitheFamilyByID('')">All</a></li>
                  <li v-if="!isFamiliesLoading" @click="filterTitheFamilyByID(family)"
                      v-for="(family,index) in families.data" :key="index"><a
                    class="dropdown-item" href="#">{{ family.name }}
                  </a></li>
                </ul>
              </div>

              <div class="mx-2  w-100">
                <date-range-picker
                  ref="picker"
                  v-model="titheDateRange"
                  :locale-data="{ format: 'yyyy/mm/dd' }"
                  :time-picker="false"
                  @update="titheDatePickerCallback($event)"
                >
                  <template v-slot:input="picker" style="min-width: 350px;">
                    <i class="far fa-calendar-alt"></i>
                    {{ $moment(picker.startDate).format('YYYY-MM-DD') }} -
                    {{ $moment(picker.endDate).format('YYYY-MM-DD') }}
                  </template>
                </date-range-picker>
              </div>

            </div>

          </div>
        </div>
      </div>

      <div v-if="!isTitheLoading" class="col-md-8">
        <h4 class="mb-4">List of All Tithe By Family</h4>
        <table class="table table-bordered border-primary mb-5">
          <thead>
          <tr>
            <th scope="col"><h4>Family</h4></th>
            <th scope="col"><h4>Service</h4></th>
            <th scope="col"><h4>Amount</h4></th>
          </tr>
          </thead>
          <tbody v-if="!isTitheLoading">
          <tr v-for="(tithe,index) in titheAggregate.data" :key="index">
            <td>GHS {{ tithe.userFamilyName }}</td>
            <td>GHS {{ tithe.serviceName }}</td>
            <td>GHS {{ tithe.totalAmount }}</td>
          </tr>
          </tbody>
        </table>
        <div v-if="!isTitheLoading">
          <p class="align-self-center text-center" v-if="titheAggregate.data.length === 0 ">No Data Found</p>
        </div>
      </div>
      <PageLoader v-else></PageLoader>
    </div>
    <!--    <PageLoader v-else></PageLoader>-->
  </div>
</template>

<script>
import {
  ChurchFamilyList,
  DashboardAccountingTotal,
  OfferingList,
  ServiceList,
  TitheAggregateList
} from "../../network/Member";
import DateRangePicker from 'vue2-daterange-picker'
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css'
import moment from "moment";

const date = new Date();

export default {
  name: "accounting",
  data() {
    return {
      services: ServiceList,
      isLoading: false,
      families: ChurchFamilyList,
      accountTotals: DashboardAccountingTotal,
      titheAggregate: TitheAggregateList,
      offerings: OfferingList,
      isAccountingLoading: false,
      isFamiliesLoading: false,
      isOfferingLoading: false,
      isTitheLoading: false,
      selectedTotalsFilterService: 'All',
      totalFilterByServiceId: '',
      totalsDateRange: {
        startDate: `${date.getFullYear()}-${date.getMonth()}-${date.getDay() - 1}`,
        endDate: `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`,
      },
      offeringsDateRange: {
        startDate: `${date.getFullYear()}-${date.getMonth()}-${date.getDay() - 1}`,
        endDate: `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`,
      },
      selectedTitheFilterFamily: 'All',
      titheFilterByFamilyId: '',
      titheDateRange: {
        startDate: `${date.getFullYear()}-${date.getMonth()}-${date.getDay() - 1}`,
        endDate: `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`,
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
    getAccounting() {
      let filter = ""
      if (this.totalFilterByServiceId) {
        filter = `&ServiceId=${this.totalFilterByServiceId}`
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
      this.$axios.get(`offerings?StartDate=${this.offeringsDateRange.startDate}&EndDate=${this.offeringsDateRange.endDate}`).then(response => {
        this.offerings = Object.assign(OfferingList, response.data.data)
        this.isOfferingLoading = false
      }).catch(error => {
        this.isOfferingLoading = false
      })
    },
    filterTitheFamilyByID(value) {
      this.titheFilterByFamilyId = value.id
      if (!value) {
        this.selectedTitheFilterFamily = 'All'
      } else {
        this.selectedTitheFilterFamily = value.name
      }
      this.fetchTitheAggregate()
    },
    filterTotalsByServiceId(value) {
      this.totalFilterByServiceId = value.id
      if (!value) {
        this.selectedTotalsFilterService = 'All'
      } else {
        this.selectedTotalsFilterService = value.name
      }
      this.getAccounting()
    },
    fetchTitheAggregate() {
      this.isTitheLoading = true
      let filter = ""
      if (this.titheFilterByFamilyId) {
        filter = `&FamilyId=${this.titheFilterByFamilyId}`
      } else {

      }

      this.$axios.get(`/accounting/tithe-aggregate?StartDate=${this.titheDateRange.startDate}&EndDate=${this.titheDateRange.endDate}${filter}`).then(response => {
        this.titheAggregate = Object.assign(TitheAggregateList, response.data.data)

        this.isTitheLoading = false
      }).catch(error => {
        this.isTitheLoading = false
      })

    },
    titheDatePickerCallback(date) {
      this.titheDateRange.startDate = moment(date.startDate).format('YYYY-MM-DD')
      this.titheDateRange.endDate = moment(date.endDate).format('YYYY-MM-DD')
      this.fetchTitheAggregate()
    },
    totalsDatePickerCallback(date) {
      this.totalsDateRange.startDate = moment(date.startDate).format('YYYY-MM-DD')
      this.totalsDateRange.endDate = moment(date.endDate).format('YYYY-MM-DD')
      this.getAccounting()
    },
    offeringsDatePickerCallback(date) {
      this.offeringsDateRange.startDate = moment(date.startDate).format('YYYY-MM-DD')
      this.offeringsDateRange.endDate = moment(date.endDate).format('YYYY-MM-DD')
      this.fetchOfferings()
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
