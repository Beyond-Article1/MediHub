<script setup>
import CpSearchCategory from "@/components/cp/CpSearchCategory.vue";
import CpList from "@/components/cp/CpList.vue";
</script>

<template>
  <div class="container">
    <CpSearchCategory/>
    <CpList/>
  </div>
</template>

<style scoped>
.container{
  display: flex;
}
</style>