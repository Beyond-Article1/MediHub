<template>
  <div class="template-item">
    <div class="template-content">
      <p>{{ template.name }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  template: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.template-item {
  border: 1px solid #ddd;
  padding: 20px;
  text-align: center;
  width: 200px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  cursor: pointer;
}
</style>
