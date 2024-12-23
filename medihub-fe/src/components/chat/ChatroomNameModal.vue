<script setup>
import { ref } from 'vue';

const props = defineProps({
  currentName: {
    type: String,
    default: '',
  }
});
const emit = defineEmits(['close', 'update-name']);
const newChatroomName = ref(props.currentName);

const updateName = () => {
  if(!newChatroomName.value.trim()) {
    alert('채팅방 이름을 입력해주세요.');
    return;
  }
  emit('update-name', newChatroomName.value.trim());
  emit('close');
};
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h4 class="modal-title">채팅방 이름 설정</h4>
      <input
        v-model="newChatroomName"
        type="text"
        placeholder="채팅방 이름 입력"
        class="name-input"
      />
      <div class="modal-actions">
        <button class="confirm-button" @click="updateName">확인</button>
        <button class="cancel-button" @click="emit('close')">취소</button>
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
  width: 400px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.name-input {
  display: block;
  width: calc(100% - 20px);
  margin: 20px auto;
  padding: 10px;
  border-radius: 5px;
  border: solid #ccc 1px;
}

/* 버튼 컨테이너 */
.modal-actions {
  display: flex;
  justify-content: space-evenly;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.modal-actions button {
  padding: 7px 20px;
  font-size: 14px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.modal-actions button:first-child {
  background-color: #ffc653;
}

.modal-actions button:first-child:hover {
  background-color: #e5b34c;
}

.modal-actions button:last-child {
  background-color: #ddd;
}

.modal-actions button:last-child:hover {
  background-color: #bbb;
}
</style>