<script setup>
import {ref, watch, onMounted, nextTick} from 'vue';
import { useWebSocketStore } from '@/store/webSocket';
import { useAuthStore } from "@/store/authStore";
import axios from "axios";

const authStore = useAuthStore();
const webSocketStore = useWebSocketStore();
const props = defineProps({
  room: Object,
});

const messages = ref([]);
const newMessage = ref('');
const isLoadingMessages = ref(false); // 메시지 로딩 상태

// 기존 채팅방 메시지 가져오기
const getChatMessages = async () => {
  try {
    const response = await axios.get(`/chat/${props.room.chatroomSeq}/messages`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
      }
    });
    // 메시지를 createdAt 기준으로 정렬
    messages.value = response.data.data.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    console.log('채팅 메시지를 불러오는 데 성공했습니다.', messages.value);

    // 페이지 로딩 후, 스크롤을 맨 아래로 이동
    nextTick(() => {
      scrollToBottom();
    });
  } catch (error) {
    console.error('채팅방 목록을 불러오는 데 실패했습니다.', error);
  }
};

onMounted(() => {
  getChatMessages();
});

// 채팅방이 열려있고 새 메시지가 수신되었을 때 처리
watch(
    () => webSocketStore.receivedMessages,
    (newMessages) => {
      const currentRoomMessages = newMessages.filter(
          (msg) => msg.chatroomSeq === props.room.chatroomSeq && msg.senderUserSeq !== authStore.userSeq
      );

      // 중복 메시지 필터링
      const uniqueMessages = currentRoomMessages.filter(
          (msg) => !messages.value.some((existingMsg) => existingMsg.messageSeq === msg.messageSeq)
      );

      if(uniqueMessages.length > 0) {
        messages.value.push(...uniqueMessages);  // 새로운 메시지 추가
        nextTick(() => scrollToBottom());
      }
    },
    { deep: true }
);

// 메시지 전송 함수
const sendMessage = () => {
  if (newMessage.value.trim()) {
    console.log('백엔드 서버로 메시지 보내기', newMessage.value);
    console.log('stompClient 확인: ', webSocketStore.stompClient);
    console.log('WebSocket 연결 확인: ', webSocketStore.isConnected);

    // STOMP 메시지 전송
    if (webSocketStore.stompClient) {
      webSocketStore.stompClient.publish({
        destination: `/publish/${props.room.chatroomSeq}`,
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
        },
        body: JSON.stringify({
          chatroomSeq: props.room.chatroomSeq,
          senderUserSeq: authStore.userSeq,
          message: newMessage.value,
          type: 'text',
          createdAt: new Date().toISOString(),
        }),
      });

    // 메시지 배열에 추가
    messages.value.push({
      senderUserSeq: authStore.userSeq,
      message: newMessage.value,
      createdAt: new Date().toISOString(),
    });
    newMessage.value = ''; // 입력 필드 초기화
    nextTick(() => {
      scrollToBottom();
    });
  } else {
      console.error('WebSocket 연결이 되어 있지 않습니다.');
    }
  }
};

// 스크롤 이벤트 처리 (위로 스크롤하면 이전 메시지 불러옴)
const messagesContainer = ref(null);

// 메시지를 맨 아래로 스크롤하는 함수
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};
</script>

<template>
  <div class="chatroom-detail">
    <!-- 채팅방 이름 -->
    <div class="chat-header">
      <h5 class="chatroom-name">
        {{ room.chatroomCustomName || room.chatroomDefaultName }}
      </h5>
    </div>

    <!-- 메시지 목록 -->
    <div class="messages" ref="messagesContainer">
      <div
          v-for="message in messages"
          :key="message.messageSeq"
          :class="{ 'my-message': message.senderUserSeq === authStore.userSeq, 'other-message': message.senderUserSeq !== authStore.userSeq }"
      >

      <!-- 내가 보낸 메시지 -->
      <template v-if="message.senderUserSeq === authStore.userSeq">
        <div class="my-message-content">
          <p class="message-text">{{ message.message }}</p>
          <p class="message-time">{{ message.createdAt }}</p>
        </div>
      </template>

      <!-- 다른 사람이 보낸 메시지 -->
      <template v-else>
        <div class="other-message-content">
          <img class="profile-img" :src="message.senderUserProfileUrl || '/default-profile.png'" alt="프로필 이미지" />
          <div class="message-info">
            <p class="sender-name">{{ message.senderUserName }}</p>
            <p class="message-text">{{ message.message }}</p>
            <p class="message-time">{{ message.createdAt }}</p>
          </div>
        </div>
      </template>
    </div>
    </div>

    <!-- 메시지 보내기 -->
    <div class="message-input">
      <textarea v-model="newMessage" placeholder="메시지를 입력하세요" />
      <div class="message-input-btn">
        <button class="attach-button" @click="attachFile">
          <img src="@/assets/images/chat/Attach.png" alt="FileAttachment">
        </button>
        <button class="send-button" @click="sendMessage">보내기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chatroom-detail {
  padding: 10px;
}

.messages {
  height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.my-message {
  display: flex;
  justify-content: flex-end;
}

.my-message-content {
  background-color: #FFE3A9;
  color: black;
  padding: 10px;
  border-radius: 10px;
  max-width: 60%; /* 메시지 최대 너비 */
}

.other-message {
  display: flex;
  justify-content: flex-start;
}

.other-message-content {
  display: flex;
  align-items: flex-start; /* 프로필 이미지와 텍스트 수직 정렬 */
}

.profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px; /* 프로필 이미지와 텍스트 간격 */
}

.message-info {
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 10px;
}

.message-text {
  margin-bottom: 5px; /* 텍스트와 시간 간격 */
}

.message-time {
  font-size: 0.8rem;
  color: gray;
}

.message-input {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.message-input textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  resize: none; /* 사용자가 크기를 조정하지 못하도록 */
}

.message-input-btn {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.message-input-btn .attach-button {
  padding: 8px;
  background-color: transparent; /* 배경색 제거 */
  border: none; /* 테두리 제거 */
  cursor: pointer;
}

.message-input-btn .attach-button img {
  width: 30px;
  height: auto;
}

/* 보내기 버튼 */
.message-input-btn .send-button {
  padding: 8px;
  background-color: #E1E1E1;
  color: #20346D;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.message-input-btn .send-button:hover {
  background-color: #0056b3;
}

</style>
