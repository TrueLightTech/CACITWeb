<template>
  <div class="mt-10">
    <div class="container">
      <div class="row justify-content-center">

        <div class="col-md-8">

          <h4>All tithes recorded</h4>

          <div class="d-flex justify-content-end float-end">
            <div class="w-100 my-2">
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

          <table v-if="!isLoadingIndividualTithe" class="table table-bordered border-primary mb-5">
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
            <tr class="thead-light">
              <td></td>
              <td></td>
              <td><h6>GHS {{
                  formatMoney(Array.from(individualTithe.results, x => x.amountPaid).reduce((a, b) => a + b, 0))
                }}</h6></td>
            </tr>
            </tbody>
          </table>
          <page-loader v-else></page-loader>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import {mapGetters} from "vuex";
import {IndividualTitheList} from "../../network/Member";
import {numberWithCommas} from "../../resources/constants";
import DateRangePicker from 'vue2-daterange-picker'
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css'
import PageLoader from "../../components/PageLoader";

export default {
  name: "records",
  data(){
    return{
      isLoadingIndividualTithe: false,
      individualTithe: IndividualTitheList,
      totalsDateRange: {
        startDate: `${moment().format('YYYY-MM-DD')}`,
        endDate: `${moment().format('YYYY-MM-DD')}`,
      },
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser'])
  },
  mounted() {
    this.fetchTitheMembers(this.loggedInUser.data.churchFamilyId)
  },
  components: {PageLoader, DateRangePicker},
  methods:{
    formatMoney(value) {
      return numberWithCommas(value)
    },
    datePickerCallback(date) {
      this.totalsDateRange.startDate = moment(date.startDate).format('YYYY-MM-DD')
      this.totalsDateRange.endDate = moment(date.endDate).format('YYYY-MM-DD')
      this.fetchTitheMembers(this.loggedInUser.data.churchFamilyId)
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

    }
  }
}
</script>

<style scoped>

</style>
