<template>
  <!-- Modal -->
  <div class="modal fade" id="warningModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-center">
          <ul class="list-unstyled">
            <li><h3>{{this.title}}</h3></li>
            <li><p>
              {{this.message}}
            </p></li>
          </ul>
        </div>
        <div class="modal-footer d-flex justify-content-center">
          <button type="button" class="btn btn-secondary" @click="negativeButton()" data-bs-dismiss="modal">Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="positiveButton()" data-bs-dismiss="modal">Continue
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "WarningModal",
    props: ["title", "message"],
    methods: {
      positiveButton() {
        this.$emit("onclick", "positive")
      },
      negativeButton() {
        this.$emit("onclick", "negative")
      }
    }
  }
</script>

<style scoped>

</style>
