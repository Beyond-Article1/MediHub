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
  margin: 0 auto; /* 수평 중앙 정렬을 위해 자동 마진 사용 */
  max-width: 1200px; /* 최대 너비 설정 (필요에 따라 조정) */
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
