<script setup>
import { ref } from 'vue';

const props = defineProps({
  room: Object,
});

const newMessage = ref('');

// 메시지 전송 함수
const sendMessage = () => {
  if (newMessage.value.trim()) {
    props.room.messages.push({
      id: props.room.messages.length + 1,
      sender: 'User',
      content: newMessage.value,
    });
    newMessage.value = ''; // 입력 필드 초기화
  }
};
</script>

<template>
  <h1>채팅방 상세</h1>
  <div class="chatroom-detail">
    <h2>{{ room.name }}</h2>
    <div class="messages">
      <div v-for="message in room.messages" :key="message.id">
        <p>{{ message.sender }}: {{ message.content }}</p>
      </div>
    </div>
    <input v-model="newMessage" placeholder="메시지를 입력하세요" />
    <button @click="sendMessage">보내기</button>
  </div>
</template>

<style scoped>
.chatroom-detail {
  padding: 10px;
}

.messages {
  height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
}

input {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
