<script setup>
import { computed } from 'vue';

const props = defineProps({

  keywordList: {

    type: Array,
    default: () => []
  }
});

// 키워드 명만 추출
const keywordNameList = computed(() => {

  return props.keywordList.map(keyword => keyword.keywordName);
});
</script>

<template>
  <div class="keywordList">
    <span class="keyword" v-for="(keyword, index) in keywordNameList" :key="index"># {{ keyword }}</span>
  </div>
</template>

<style scoped>
.keywordList {
  display: flex; /* 가로 배치 */
  flex-wrap: wrap; /* 줄 바꿈 */
  gap: 10px; /* 버튼 간 간격 */
}

.keyword {
  background-color: #fff0d3; /* 배경색 */
  padding: 8px 12px; /* 상하, 좌우 패딩 */
  font-size: 20px;
}
</style>