<!-- Board.vue -->
<script setup>
</script>

<template>
  <div class="board">
    <slot></slot> <!-- 자식 요소를 여기서 렌더링 -->
  </div>
</template>

<style scoped>
.board {
  color: #333; /* 텍스트 색상 */
  display: flex;
  width: 1000px;
  height: 540px;
  background-color: var(--light-gray); /* 부드러운 연한 파란색 배경 */
  border: 1px solid #ccc; /* 경계선 추가 */
  border-radius: 10px; /* 모서리 둥글게 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
  padding: 20px; /* 내부 여백 */
  gap: 20px; /* 카드 간격 */
}
</style>
