<script setup>
import {defineProps} from 'vue';

// props 정의
const props = defineProps({
  iconClass: {
    type: String,
    required: true
  },
  onClick: {
    type: Function,
    required: true
  }
});

// 클릭 이벤트 핸들러
const handleClick = () => {
  props.onClick(); // 부모 컴포넌트의 클릭 핸들러 호출
}
</script>

<template>
  <button class="image-button" @click="handleClick">
    <i :class="iconClass"></i>
  </button>
</template>

<style scoped>
.image-button {
  background-color: var(--symbol-blue);
  border: none; /* 테두리 없애기 */
  padding: 10px; /* 패딩 추가 */
  cursor: pointer; /* 포인터 커서로 변경 */
  display: flex; /* Flexbox 사용 */
  justify-content: center; /* 중앙 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
  border-radius: 5px; /* 모서리 둥글게 */
  transition: background-color 0.3s; /* 배경색 변경 시 부드러운 전환 효과 */
  width: 50px;
  height: 50px;
}

.image-button:hover {
  background-color: var(--hover-blue);
}

.image-button i {
  font-size: 24px; /* 아이콘 크기 */
  color: white; /* 아이콘 색상 흰색으로 설정 */
}
</style>
