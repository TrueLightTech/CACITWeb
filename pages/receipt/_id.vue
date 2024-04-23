<template>
  <div class="container">
    <div class="receipt-header">
      <div class="mb-3">
        <img src="~assets/imgs/caci_logo.png" class="img-fluid w-25 align-self-right"/>
        <h4>CACI Taifa</h4>
      </div>
      <div class="receipt-information">
        <div class="info-item">
          <small>Receipt #:</small>
          <small>{{ receipt?.receiptNumber }}</small>
        </div>
        <div class="info-item">
          <small>Customer Name:</small>
          <small>{{ receipt?.memberName }}</small>
        </div>
        <div class="info-item">
          <small>Group Family:</small>
          <small>{{ receipt?.familyGroupName }}</small>
        </div>
      </div>
    </div>
    <div class="receipt-content">
      <table>
        <tr>
          <th>Month</th>
          <th>Description</th>
          <th>Amount</th>
        </tr>
        <tr v-for="t in receipt?.transactions">
          <td>{{ months[receipt?.month] }}</td>
          <td>{{ t?.description }}</td>
          <td>GHS{{ t?.amount }}</td>
        </tr>
      </table>
    </div>
    <div class="receipt-total">
      <p><strong>Total:</strong> GHS {{ receipt?.total }}</p>
    </div>
  </div>
</template>

<script>

const months = {
  Jan: "January",
  Feb: "February",
  Mar: "Mar",
  Apr: "April",
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December"
}

let receipt = {
  receiptNumber: "",
  memberNumber: "",
  memberName: "",
  familyGroupName: "",
  total: "",
  signature: "",
  paymentDate: "",
  transactions: [
    {
      description: "",
      amount: "",
      month: ""
    }
  ]
}
export default {
  name: "receipt",
  auth: false,
  beforeMount() {
    let id = this.$route.params.id
    this.getReceipt(id);
  },
  mounted() {
  },
  computed: {},
  methods: {
    getReceipt(id) {
      this.pageRefresh = true
      this.$axios.get(`tithes/receipt/${this.$route.params.id}`).then(response => {
        console.log(response.data.data)
        this.receipt = Object.assign(this.receipt, response.data.data)
        this.pageRefresh = false
      }).catch(error => {
        this.pageRefresh = false
      })
    }
  },
  data() {
    return {
      receipt,
      months
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-top: 0;
  margin-bottom: 0;
}

.receipt-header {
  text-align: center;
  margin-bottom: 20px;
}

.receipt-header h1 {
  color: #333;
}

.receipt-content {
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  padding: 20px 0;
}

.receipt-content table {
  width: 100%;
  border-collapse: collapse;
}

.receipt-content table th,
.receipt-content table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ccc;
}

.receipt-total {
  margin-top: 20px;
  text-align: right;
}

@media screen and (max-width: 600px) {
  .container {
    max-width: 100%;
    border-radius: 0;
  }
}
</style>
