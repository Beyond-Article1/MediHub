<script setup>
import { defineProps } from 'vue';

// props 정의
const props = defineProps({
  svgIcon: {
    type: String,
    required: true
  },
  iconColor: {
    type: String,
    default: 'currentColor' // 기본 아이콘 색상 설정
  }
});
</script>

<template>
  <button class="svg-icon-button">
    <svg
        v-html="svgIcon"
        :style="{ fill: iconColor }"
        width="16"
        height="16"
        viewBox="0 0 16 16"
    ></svg>
  </button>
</template>

<style scoped>
.svg-icon-button {
  background-color: #f9f9f9; /* 일반 버튼과 동일한 배경색 */
  border: 1px solid #ddd; /* 테두리 색상 */
  border-radius: 4px; /* 둥글게 처리 */
  padding: 5px; /* 적절한 패딩 */
  cursor: pointer; /* 포인터 커서 */
  display: flex; /* Flexbox 사용 */
  justify-content: center; /* 중앙 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
  transition: background-color 0.3s; /* 배경색 변경 시 부드러운 전환 효과 */
}

.svg-icon-button:hover {
  background-color: #e0e0e0; /* 호버 시 배경색 변경 */
}
</style>
