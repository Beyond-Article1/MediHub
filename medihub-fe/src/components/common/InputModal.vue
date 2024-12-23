<script setup>
import {ref} from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '값 입력'
  },
  placeholder: {
    type: String,
    default: '새로운 값을 입력하세요'
  }
});

const emit = defineEmits(['close', 'update']);

const inputValue = ref('');

function updateHandle() {
  emit('update', inputValue.value);
  emit('close');
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h4 class="modal-title">{{ props.title }}</h4>
      <input
          type="text"
          v-model="inputValue"
          :placeholder="props.placeholder"
          class="modal-input"
      />
      <div class="modal-actions">
        <button @click="updateHandle" class="btn-confirm">확인</button>
        <button @click="emit('close')" class="btn-cancel">취소</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7); /* 더 어두운 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* 모달을 다른 요소 위에 표시 */
}

.modal-content {
  position: relative;
  width: 400px; /* 모달 너비 조정 */
  background: white;
  padding: 20px;
  border-radius: 5px; /* 둥근 모서리 감소 */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s; /* 애니메이션 추가 */
}

.modal-title {
  text-align: center;
  margin-bottom: 20px; /* 제목과 입력 필드 사이의 간격 */
  font-size: 1.5rem; /* 제목 크기 조정 */
  color: #333; /* 제목 색상 조정 */
}

.modal-input {
  width: 100%; /* 입력 필드 너비 */
  padding: 10px; /* 패딩 추가 */
  border: 1px solid #ccc; /* 테두리 */
  border-radius: 5px; /* 둥근 모서리 */
  margin-bottom: 20px; /* 입력 필드와 버튼 사이의 간격 */
  font-size: 1rem; /* 글자 크기 조정 */
}

.modal-actions {
  display: flex;
  justify-content: center; /* 버튼 중앙 정렬 */
  gap: 10px; /* 버튼 간의 간격 추가 */
}

.btn-confirm {
  padding: 10px 20px; /* 버튼 크기 조정 */
  font-size: 1rem; /* 글자 크기 조정 */
  border: none; /* 테두리 제거 */
  border-radius: 5px; /* 둥근 모서리 */
  background-color: var(--symbol-blue); /* 확인 버튼 색상 */
  color: white; /* 글자 색상 */
  cursor: pointer; /* 커서 포인터 */
  transition: background-color 0.3s; /* 호버 시 색상 전환 효과 */
}

.btn-confirm:hover {
  background-color: var(--hover-blue); /* 호버 시 색상 변경 */
}

.btn-cancel {
  padding: 10px 20px; /* 버튼 크기 조정 */
  font-size: 1rem; /* 글자 크기 조정 */
  border: none; /* 테두리 제거 */
  border-radius: 5px; /* 둥근 모서리 */
  background-color: var(--symbol-blue); /* 취소 버튼 색상 */
  color: white; /* 글자 색상 */
  cursor: pointer; /* 커서 포인터 */
  transition: background-color 0.3s; /* 호버 시 색상 전환 효과 */
}

.btn-cancel:hover {
  background-color: var(--hover-blue); /* 호버 시 색상 변경 */
}

/* 애니메이션 효과 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px); /* 위에서 아래로 떨어지는 효과 */
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
