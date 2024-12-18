<script setup>
import { ref, onMounted } from 'vue';
import axios from "axios";
import { useAuthStore } from "@/store/authStore.js";

const emit = defineEmits(); // 이벤트 정의 (부모에게 이벤트 전달)
const authStore = useAuthStore();
const chatrooms = ref([]);  // 채팅방 목록

// 채팅방 목록 가져오기
const getChatrooms = async () => {
  try {
    const response = await axios.get('/chatroom', {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,  // 토큰을 헤더에 추가
      }
    });
    chatrooms.value = response.data.data;
    console.log('채팅방 목록을 불러오는 데 성공했습니다.', chatrooms.value);  // 받은 채팅방 목록 출력
  } catch (error) {
    console.error('채팅방 목록을 불러오는 데 실패했습니다.', error);
  }
};

onMounted(() => {
  getChatrooms();
});

// 채팅방 생성
const createChatroom = () => {
  console.log("채팅방 만들기 버튼 클릭됨");
};

// 채팅방을 더블클릭하면 해당 채팅방 상세 페이지로 이동
const openChatroom = (room) => {
  emit('open-chatroom', room);  // 부모 컴포넌트로 이벤트 전달
};
</script>

<template>
  <div>
    <div class="chat-header">
      <h2>대화</h2>
      <button class="create-chatroom-btn" @click="createChatroom">
        <img src="@/assets/images/chat/NewChat-Navy.png" alt="NewChat">
      </button>
    </div>
  </div>

  <div class="chatroom-list" v-if="chatrooms.length > 0">
    <!-- 채팅방 목록을 반복문으로 표시 -->
    <div v-for="room in chatrooms" :key="room.chatroomSeq" @dblclick="openChatroom(room)" class="chatroom-item">
      <div class="chatroom-info">
        <h5 class="chatroom-name">
          {{ room.chatroomCustomName || room.chatroomDefaultName }}
        </h5>
        <div class="chatroom-meta">
          <span class="chatroom-users">{{ room.chatroomUsersCount }}</span>
          <span class="chatroom-last-message">
              <strong>마지막 메시지:</strong> {{ room.lastMessage }}
            </span>
        </div>
      </div>
    </div>
  </div>
  <p v-else>채팅방이 없습니다.</p>

</template>

<style scoped>
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.chat-header h2 {
  margin: 0;
}

.create-chatroom-btn {
  border: none;
  font-size: 10px;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-right: 15px;
}

.create-chatroom-btn:hover {
  background-color: #FFC653;
}

.create-chatroom-btn img {
  width: 25px;
  height: 25px;
}

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

.chatroom-info {
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.chatroom-meta {
  margin-top: 10px;
}

.chatroom-users {
  font-size: 12px;
  color: #777;
}

.chatroom-last-message {
  font-size: 12px;
  color: #555;
}
</style>
