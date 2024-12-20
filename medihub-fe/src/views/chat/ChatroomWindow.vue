<script setup>
import { ref, watch, onMounted, nextTick, defineProps, defineEmits } from 'vue';
import { useWebSocketStore} from '@/store/webSocket';
import { useAuthStore} from "@/store/authStore";
import axios from 'axios';

const authStore = useAuthStore();
const webSocketStore = useWebSocketStore();
const props = defineProps({
  room: Object,
});
const emit = defineEmits(['close-chatroom']);

const messages = ref([]);
const newMessage = ref('');
const isLoadingMessages = ref(false); // 메시지 로딩 상태

// 채팅창 드래그 상태 관리
const isDragging = ref(false);
const initialPosition = ref({ x:0, y:0 });
const offset = ref({ x: 0, y: 0 });

// 기존 채팅방 메시지 가져오기
const getChatMessages = async () => {
  try {
    const response = await axios.get(`/chat/${props.room.chatroomSeq}/messages`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
      }
    });
    // createdAt 기준으로 정렬
    messages.value = response.data.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
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

      if (uniqueMessages.length > 0) {
        messages.value.push(...uniqueMessages);  // 새로운 메시지 추가
        nextTick(() => scrollToBottom());
      }
    },
    {deep: true}
);

// 메시지 전송 함수
const sendMessage = () => {
  if (newMessage.value.trim()) {
    console.log('백엔드 서버로 전송하는 메시지: ', newMessage.value);
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

// 드래그 시작 이벤트
const startDrag = (event) => {
  if(event.button !== 0) return;    // 마우스 왼쪽 버튼일 때만 드래그 시작

  const chatHeader = event.target.closest('.chat-header');  // chat-header 영역에서만 드래그 시작
  if (!chatHeader) return;

  const chatWindow = event.target.closest('.chatroom-window');
  if (!chatWindow) return;  // chat-window 영역 내에서만 드래그 시작하도록 제한

  const rect = chatWindow.getBoundingClientRect();

  // 드래그 시작 위치와 chat-window의 상대적인 위치 계산
  offset.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };

  initialPosition.value = {
    x: rect.left,
    y: rect.top
  };

  isDragging.value = true;    // 드래그 시작

  // 전역 이벤트 리스너 등록
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

// 드래그 이동 이벤트
const onDrag = (event) => {
  if (!isDragging.value) return;

  const left = event.clientX - offset.value.x;
  const top = event.clientY - offset.value.y;

  const chatWindow = document.querySelector('.chatroom-window');

  // 화면을 벗어나지 않도록 위치 제한
  const maxLeft = window.innerWidth - chatWindow.offsetWidth;
  const maxTop = window.innerHeight - chatWindow.offsetHeight;

  // 위치를 화면 내로 제한
  chatWindow.style.left = `${Math.max(0, Math.min(left, maxLeft))}px`;
  chatWindow.style.top = `${Math.max(0, Math.min(top, maxTop))}px`;

};

// 드래그 종료 이벤트
const stopDrag = () => {
  isDragging.value = false;

  // 전역 이벤트 리스너 제거
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};
</script>

<template>
  <div class="chatroom-window" @mousedown="startDrag">
    <!-- 채팅방 이름 -->
    <header class="chat-header">
      <img src="@/assets/images/chat/Communication.png" alt="Communication">
      <h3>{{ room.chatroomCustomName || room.chatroomDefaultName }}</h3>
      <button class="close-button" @click="$emit('close-chatroom', room.chatroomSeq)">X</button>
    </header>

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
            <img class="profile-img" :src="message.senderUserProfileUrl || '/default-profile.png'" alt="프로필 이미지"/>
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
      <textarea v-model="newMessage" placeholder="메시지를 입력하세요"/>
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
.chatroom-window {
  position: absolute;  /* absolute로 변경하여 위치를 절대좌표로 설정 */
  width: 500px;
  height: 600px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center; /* 모든 자식 요소를 세로 가운데 정렬 */
  padding: 10px;
  background: linear-gradient(to bottom, #1A2F69, #3A4F89, #5A6FA9);
  color: white;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  position: relative; /* close-button을 절대 위치로 배치하기 위해 사용 */
  cursor: move;  /* 마우스를 올리면 드래그 가능하게 표시 */
}

.chat-header {
  padding: 5px;
}

.chat-header h3 {
  margin: 0; /* 기본 마진 제거 */
  font-size: 20px; /* 텍스트 크기 조정 */
}

.chat-header img {
  width: 40px;
  height: 40px;
  margin: 0px 10px;
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
  margin: 10px; /* 프로필 이미지와 텍스트 간격 */
}

.message-info {
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 10px;
}

.message-text {
  margin-bottom: 5px;
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
  background-color: transparent;
  border: none;
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

.close-button {
  position: absolute; /* 절대 위치 지정 */
  top: 50%; /* 부모 요소의 세로 중앙에 배치 */
  right: 15px; /* 오른쪽 끝에서 간격 설정 */
  transform: translateY(-50%); /* 세로 중앙 정렬 */
  background: none;
  border: none;
  color: #f0f0f0;
  font-size: 20px;
  cursor: pointer;
}

</style>
