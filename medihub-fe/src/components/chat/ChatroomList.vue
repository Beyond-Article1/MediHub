<template>
  <h1>채팅방 목록</h1>
  <div class="chatroom-list">
    <div v-for="room in chatRooms" :key="room.id" @dblclick="openChatRoom(room)">
      <p>{{ room.name }}</p>
    </div>
  </div>
</template>

<script setup>
// 이벤트 정의 (부모에게 이벤트를 전달)
const emit = defineEmits();

// 채팅방 목록
const chatRooms = [
  { id: 1, name: '채팅방 1', messages: [{ id: 1, sender: 'User1', content: '안녕하세요!' }] },
  { id: 2, name: '채팅방 2', messages: [{ id: 1, sender: 'User2', content: '안녕!' }] },
];

// 채팅방을 더블클릭하면 해당 채팅방 상세 페이지로 이동
const openChatRoom = (room) => {
  emit('open-chat-room', room);  // 부모 컴포넌트로 이벤트 전달
};
</script>

<style scoped>
.chatroom-list {
  padding: 10px;
}

.chatroom-list p {
  cursor: pointer;
  padding: 5px;
  border: 1px solid #ccc;
  margin: 5px 0;
}

.chatroom-list p:hover {
  background-color: #f0f0f0;
}
</style>
