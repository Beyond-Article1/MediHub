<script setup>
import CpSearchCategory from "@/components/cp/CpSearchCategory.vue";
import CpList from "@/components/cp/CpList.vue";
</script>

<template>
  <div class="container">
    <div class="search-category">
      <CpSearchCategory />
    </div>
    <div class="cp-list">
      <CpList />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  margin: 0 8%; /* 양 옆에 20px의 마진 추가 */
}

.search-category {
  flex: 2; /* 2 부분 차지 */
  margin-right: 10px; /* 오른쪽에 마진 추가 */
}

.cp-list {
  flex: 8; /* 8 부분 차지 */
  margin-left: 10px; /* 왼쪽에 마진 추가 */
}
</style>
