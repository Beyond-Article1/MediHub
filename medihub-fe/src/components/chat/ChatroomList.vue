<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore.js';
import { useWebSocketStore } from "@/store/webSocket.js";
import SelectUserModal from './SelectUserModal.vue';

const emit = defineEmits(['open-chatroom']); // 이벤트 정의 (부모에게 이벤트 전달)
const authStore = useAuthStore();
const chatrooms = ref([]);  // 채팅방 목록

const isModalOpen = ref(false); // 모달 열림 상태
const selectedUsers = ref([]);  // 대화상대로 초대할 사용자
const openModal = () => (isModalOpen.value = true);
const closeModal = () => (isModalOpen.value = false);

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
const createChatroom = async (users) => {
  if(!users || users.length === 0) {
    alert('대화상대를 선택해주세요');
    return;
  }

  try {
    console.log('채팅방 생성 버튼 클릭됨, 선택된 사용자: ', users);
    const response = await axios.post(`/chatroom`, { users });
    console.log('채팅방 생성 성공: ', response.data);
    const chatroomSeq = response.data.data;
    console.log('생성된 1:1 채팅방 Seq 확인: ', chatroomSeq);
    // 채팅방 구독 요청
    useWebSocketStore().subscribeChatroom(chatroomSeq);
    closeModal();
    getChatrooms(); // 채팅방 목록 갱신
  } catch(error) {
    console.error('채팅방 생성 실패: ', error);
    alert('채팅방 생성 중 오류가 발생하였습니다.');
  }
};

// 채팅방을 더블클릭하면 해당 채팅방 상세 페이지로 이동
const handleDoubleClick = (room) => {
  console.log('특정 채팅방 더블클릭 이벤트 발생');
  emit('open-chatroom', room);  // 부모 컴포넌트로 이벤트 전달
};
</script>

<template>
  <div class="chat-container">
      <div class="chat-header">
        <h2>대화</h2>
        <button class="create-chatroom-btn" @click="openModal">
          <img src="@/assets/images/chat/NewChat-Navy.png" alt="NewChat">
        </button>
      </div>

    <div class="chatroom-list" v-if="chatrooms.length > 0">
      <!-- 채팅방 목록을 반복문으로 표시 -->
      <div v-for="room in chatrooms" :key="room.chatroomSeq" @dblclick="handleDoubleClick(room)" class="chatroom-item">
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

    <!-- 대화상대 초대 모달 -->
    <SelectUserModal v-if="isModalOpen" @close="closeModal" @add-users="createChatroom"/>
  </div>
</template>

<style scoped>
.chat-container {
  padding: 20px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #fff;
  position: sticky;
  top: 0;
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
  margin-right: 25px;
}

.create-chatroom-btn:hover {
  background-color: #FFC653;
}

.create-chatroom-btn img {
  width: 25px;
  height: 25px;
}

.chatroom-list {
  padding: 3px;
  padding-top: 15px;
  overflow-y: auto; /* 스크롤 가능하게 설정 */
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
