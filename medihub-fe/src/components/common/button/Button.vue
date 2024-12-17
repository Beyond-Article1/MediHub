<script setup>
/*
* 기본 버튼 입니다.
* */

import {defineEmits, defineProps} from 'vue';

const props = defineProps({
  isDisabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['click']); // click 이벤트 정의

const handleClick = (event) => {
  if (!props.isDisabled) {
    emit('click', event); // 클릭 이벤트 발생
  }
};
</script>

<template>
  <button
      :class="['custom-button', { 'disabled': isDisabled }]"
      :disabled="isDisabled"
      @click="handleClick"
  >
    <slot></slot> <!-- Slot을 사용하여 버튼 텍스트를 삽입 -->
  </button>
</template>

<style scoped>
.custom-button {
  background-color: var(--symbol-blue);
  color: white; /* 글자색 흰색 */
  border: none; /* 테두리 제거 */
  padding: 10px 15px; /* 패딩 추가 */
  margin-right: 5px; /* 버튼 간 여백 추가 */
  border-radius: 5px; /* 모서리 둥글게 */
  cursor: pointer; /* 포인터 커서 */
}

.custom-button.disabled {
  background-color: #6c757d; /* 비활성화 시 회색 배경 */
  cursor: not-allowed; /* 비활성화된 상태에서 커서 모양 변경 */
}

.custom-button:hover:not(.disabled) {
  background-color: #274A8A; /* 호버 시 색상 변경 */
}
</style>
