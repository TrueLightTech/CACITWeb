<template>
  <div class="container">
    Receipt not found
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'

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
  let id

  export default {
    name: "index",
    auth: false,
    computed: {
      ...mapGetters(['isAuthenticated', 'loggedInUser'])
    },
    data() {
      return {
        pageRefresh: false,
        receipt,
        months
      }
    },
    beforeMount() {
      id = this.$route.params.id
    },
    methods: {
      getReceipt(id) {
        this.pageRefresh = true
        this.$axios.get(`tithes/receipt/${id}`).then(response => {
          this.receipt = Object.assign(this.receipt, response.data.data)
          this.pageRefresh = false
        }).catch(error => {
          this.pageRefresh = false
        })
      }    }
  }
</script>

<style scoped>

body {
  background-color: #e6f8ff;
}

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
