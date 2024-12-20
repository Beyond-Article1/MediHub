<!-- Card.vue -->
<script setup>
import { defineProps } from "vue";

const props = defineProps({
  seq: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});
</script>

<template>
  <div class="col-md-4 mb-4">
    <div class="card custom-card shadow-sm">
      <div class="card-body d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0">{{ name }}</h5>
        <div>
          <button class="btn btn-outline-dark btn-sm me-2">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-card {
  width: 300px; /* 고정 너비 설정 */
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}

.custom-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
