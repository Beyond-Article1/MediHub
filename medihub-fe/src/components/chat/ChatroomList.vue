<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore.js';
import { useWebSocketStore } from "@/store/webSocket.js";
import { useChatStore } from "@/store/chatStore.js";
import SelectUserModal from './SelectUserModal.vue';

const emit = defineEmits(['open-chatroom']); // 이벤트 정의 (부모에게 이벤트 전달)
const authStore = useAuthStore();
const userSeq = ref(null);
const webSocketStore = useWebSocketStore();
const chatStore = useChatStore();

const isModalOpen = ref(false); // 모달 열림 상태
const openModal = () => (isModalOpen.value = true);
const closeModal = () => (isModalOpen.value = false);

const partnerNames = ref({}); // 채팅방 Seq별 상대방 이름 저장
const partnerProfileUrls = ref({}); // 채팅방 Seq별 상대방 프로필 URL 저장

onMounted(async () => {
  userSeq.value = Number(localStorage.getItem('userSeq'));

  if(webSocketStore.isConnected == false) {
    webSocketStore.connectWebSocket();
  } else {
    await webSocketStore.getUserChatrooms();  // 채팅방 목록 가져오기
  }

  for (const room of chatStore.chatrooms) {
    if (room.chatroomUsersCount === 2) {
      try {
        const response = await axios.get(`/chatroom/${room.chatroomSeq}/users`);
        const participants = response.data.data;

        // 현재 사용자와 다른 사용자를 필터링
        const partner = participants.find(
            (user) => user.userSeq !== userSeq.value
        );

        if (partner) {
          partnerProfileUrls.value[room.chatroomSeq] = partner.userProfileUrl;
          partnerNames.value[room.chatroomSeq] = partner.userName; // 상대방 이름 저장
        }
      } catch (error) {
        console.error(`채팅방 ${room.chatroomSeq}의 데이터 로드 실패:`, error);
      }
    }
  }
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
    webSocketStore.subscribeChatroom(chatroomSeq);

    // 새로 생성된 채팅방 정보를 Pinia Store에 추가
    await chatStore.addChatroom(chatroomSeq);

    closeModal();
  } catch(error) {
    console.error('채팅방 생성 실패: ', error);
    alert('채팅방 생성 중 오류가 발생하였습니다.');
  }
};

// 채팅방을 더블클릭하면 해당 채팅방 상세 페이지로 이동
const handleDoubleClick = (room) => {
  console.log('특정 채팅방 더블클릭 이벤트 발생');
  emit("open-chatroom", {
    ...room,
    partnerName: partnerNames.value[room.chatroomSeq],
    partnerProfileUrl: partnerProfileUrls.value[room.chatroomSeq],
  });
};

// 날짜 포맷 함수
const formatDateOrTime = (timestamp) => {
  if(!timestamp) return "";

  const messageDate = new Date(timestamp);
  const today = new Date();

  const isToday =
      messageDate.getFullYear() === today.getFullYear() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getDate() === today.getDate();

  if(isToday) {
    const hours = messageDate.getHours().toString().padStart(2, "0");
    const minutes = messageDate.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`
  } else {
    const month = (messageDate.getMonth() + 1).toString().padStart(2, "0");
    const day = messageDate.getDate().toString().padStart(2, "0");
    return `${month}-${day}`;
  }
};

const searchQuery = ref('');  // 검색어 상태
// 검색된 채팅방 목록 필터링
const filteredChatrooms = computed(() => {
  if(!searchQuery.value.trim()) {
    return chatStore.chatrooms;
  }
  return chatStore.chatrooms.filter((room) => {
    const lowerQuery = searchQuery.value.toLowerCase();
    const defaultName = room.chatroomDefaultName?.toLowerCase() || '';
    const customName = room.chatroomCustomName?.toLowerCase() || '';
    return defaultName.includes(lowerQuery) || customName.includes(lowerQuery);
  })
})
</script>

<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>대화</h2>
      <button class="create-chatroom-btn" @click="openModal">
        <img src="@/assets/images/chat/NewChat-Navy.png" alt="NewChat">
      </button>
    </div>

    <!-- 검색창 -->
    <div class="chat-search">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="이름/대화방명 검색"
        class="search-input"
      />
    </div>

    <div class="chatroom-list" v-if="chatStore.chatrooms.length > 0">
      <!-- 채팅방 목록을 반복문으로 표시 -->
      <div v-for="room in filteredChatrooms"  class="chatroom-item"
           :key="room.chatroomSeq"
           @dblclick="handleDoubleClick(room)">
        <div class="chatroom-info">
          <div class="chatroom-img">
            <img
                v-if="room.chatroomUsersCount === 1"
                :src="authStore.profileImage"
                alt="My Profile"
            />
            <img
                v-else-if="room.chatroomUsersCount > 2"
                src="@/assets/images/chat/group-chat.png"
                alt="Group Chat"
            />
            <img
                v-else
                :src="partnerProfileUrls[room.chatroomSeq]"
                alt="Partner Profile"
            />
          </div>
          <div class="chatroom-content">
            <div class="chatroom-meta">
              <h5 class="chatroom-name">
                <!-- 1:1 채팅일 경우 상대방 이름 표시 -->
                <template v-if="room.chatroomUsersCount === 2">
                  {{ room.chatroomCustomName || partnerNames[room.chatroomSeq] }}
                </template>

                <!-- 단체 채팅일 경우 customName이 없으면 defaultName 표시 -->
                <template v-else>
                  {{ room.chatroomCustomName || room.chatroomDefaultName }}
                </template>
              </h5>
              <span v-if="room.chatroomUsersCount !== 2" class="chatroom-users">{{ room.chatroomUsersCount }}</span>
              <span class="chatroom-last-time">{{ formatDateOrTime(room.lastMessageTime) }}</span>
            </div>
            <div class="chatroom-last">
              <span class="chatroom-last-message">{{ room.lastMessage }}</span>
              <span v-if="room.unreadMessageCount > 0" class="chat-unread-count">
                {{ room.unreadMessageCount }}
              </span>
            </div>
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
  position: absolute;
  padding: 20px;
  width: 88%;
  height: 600px;
  background-color: #fff;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
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

.chat-search {
  margin-top: 10px;
}

.search-input {
  width: 90%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.chatroom-img img {
  width: 40px;
  height: 40px;
  margin-right: 10px; /* 이미지와 내용 사이 간격 추가 */
  border-radius: 50%;
}

.chatroom-list {
  margin-top: 15px;
  overflow-y: auto;
}

.chatroom-item {
  display: flex;
  align-items: flex-start;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.chatroom-item:hover {
  background-color: #e0e0e0;
}

.chatroom-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
}

.chatroom-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chatroom-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-grow: 1;
  min-width: 0;
}

.chatroom-name {
  font-size: 17px;
  flex-shrink: 1; /* 공간 부족 시 크기 축소 허용 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; /* 한 줄로 유지 */
  max-width: 250px;
  margin-right: 3px;
}

.chatroom-last {
  font-size: 12px;
  color: #777;
  display: flex;
  justify-content: space-between;
  margin-top: 3px;
}

.chatroom-users {
  font-size: 12px;
  color: #777;
  margin-right: auto;
}

.chatroom-last-time{
  font-size: 12px;
  color: #777;
  margin-left: auto;
}

.chatroom-last-message {
  font-size: 14px;
  color: #555;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box; /* 다중 줄 처리 */
  -webkit-line-clamp: 2; /* 최대 두 줄로 제한 */
  -webkit-box-orient: vertical; /* 수직 박스 방향 설정 */
  max-width: 90%;
}

.chat-unread-count {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FF4D4D;
  color: white;
  font-size: 12px;
  font-weight: bold;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-left: 10px;
}
</style>
