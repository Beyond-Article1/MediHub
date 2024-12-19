<template>
  <div class="keywords">
    <span v-for="(keyword, index) in keywordNames" :key="index" class="keyword">
      #{{ keyword }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  keywords: {
    type: Array,
    default: () => [],
  },
});

// 키워드명만 추출
const keywordNames = computed(() => {
  return props.keywords.map(keyword => keyword.keywordName);
});
</script>

<style scoped>
.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0;
}

.keyword {
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 14px;
}
</style>
