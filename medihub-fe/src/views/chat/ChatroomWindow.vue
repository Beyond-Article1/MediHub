<script setup>
import { ref, watch, onMounted, nextTick, defineProps, defineEmits } from 'vue';
import { useAuthStore} from '@/store/authStore';
import { useWebSocketStore} from '@/store/webSocket';
import { useChatStore } from '@/store/chatStore.js';
import axios from 'axios';
import SelectUserModal from '@/components/chat/SelectUserModal.vue';
import ChatroomNameModal from '@/components/chat/ChatroomNameModal.vue';
import ParticipantListModal from '@/components/chat/ParticipantListModal.vue';
import MessageItem from "@/components/chat/MessageItem.vue";

const authStore = useAuthStore();
const userSeq = ref(null);
const webSocketStore = useWebSocketStore();
const chatStore = useChatStore();

const props = defineProps({
  room: Object,
});
const emit = defineEmits(['close-chatroom']);

const messages = ref([]);
const isLoadingMessages = ref(false); // 메시지 로딩 상태

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

// 메시지 날짜 비교 함수
const isSameDay = (date1, date2) => {
  if(!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
  );
};

onMounted(() => {
  userSeq.value = Number(localStorage.getItem('userSeq'));
  getParticipants();
  getChatMessages();
});

// 채팅방 참여자 목록 가져오기
const participants = ref([]);
const isParticipantModalOpen = ref(false);

const openParticipantModal = async () => {
  await getParticipants();  // 참여자 정보 조회
  isParticipantModalOpen.value = true;
}
const closeParticipantModal = () => {
  isParticipantModalOpen.value = false;
}

const getParticipants = async () => {
  try {
    const response = await axios.get(`/chatroom/${props.room.chatroomSeq}/users`);
    participants.value = response.data.data;
    console.log('참여자 목록 불러오기 성공: ', participants.value);
  } catch(error) {
    console.error(`참여자 목록 불러오기 실패:`, error);
  }
}

// 헤더 이미지 경로 계산 함수
const getHeaderImage = () => {
  if (participants.value.length === 1) {
    // 사용자 혼자만 있을 경우 자신의 프로필 이미지
    return authStore.userInfo.profileImage || '/chat/profile.png';
  } else if (participants.value.length > 2) {
    // 단체 채팅일 경우 그룹 채팅 이미지
    return '/chat/group-chat.png';
  } else if (participants.value.length === 2) {
    // 1:1 채팅일 경우 상대방 프로필 이미지
    const partner = participants.value.find((p) => p.userSeq !== userSeq.value);
    return partner?.userProfileUrl || '/chat/profile.png';
  }
};

const getPartnerName = () => {
  if (participants.value.length === 2) {
    const partner = participants.value.find((p) => p.userSeq !== userSeq.value);
    return partner?.userName || '알 수 없는 사용자'; // 상대방 이름 반환
  }
  return props.room.chatroomDefaultName; // 기본 채팅방 이름 반환
};

const deletedMessageSeqs = ref([]); // 삭제된 메시지 ID(MessageSeq) 목록
// 채팅방이 열려있고 새 메시지가 수신되었을 때 처리
watch(
    () => webSocketStore.receivedMessages,
    (newMessages) => {
      const currentRoomMessages = newMessages.filter(
          (msg) => msg.chatroomSeq === props.room.chatroomSeq
      );

      // 삭제 메시지 처리
      const deleteMessages = currentRoomMessages.filter((msg) => msg.type === 'delete');
      deleteMessages.forEach((deleteMsg) => {
        deletedMessageSeqs.value.push(deleteMsg.messageSeq);  // 삭제된 메시지 messageSeq 저장
        const index = messages.value.findIndex(
            (msg) => msg.messageSeq === deleteMsg.messageSeq
        );
        if (index !== -1) {
          messages.value.splice(index, 1); // 화면에서 해당 메시지 제거
          console.log(`메시지 ${deleteMsg.messageSeq} 삭제됨`);
        }
      });

      // 중복 메시지 필터링
      const uniqueMessages = currentRoomMessages.filter(
          (msg) =>
              msg.type !== 'delete' && // 삭제 메시지는 제외
              !deletedMessageSeqs.value.includes(msg.messageSeq) && // 이미 삭제된 메시지도 제외
              !messages.value.some((existingMsg) => existingMsg.messageSeq === msg.messageSeq)
      );

      if (uniqueMessages.length > 0) {
        messages.value.push(...uniqueMessages);  // 새로운 메시지 추가
        nextTick(() => scrollToBottom());
      }
    },
    {deep: true}
);

const newMessage = ref(''); // 입력 필드의 메시지

// 메시지 전송 함수
const sendMessage = (event) => {
  if(event.isComposing || event.keyCode === 229) return;
  if (newMessage.value.trim()) {
    console.log('백엔드 서버로 전송하는 메시지: ', newMessage.value);
    console.log('stompClient 확인: ', webSocketStore.stompClient);
    console.log('WebSocket 연결 확인: ', webSocketStore.isConnected);

    // STOMP 메시지 전송
    if (webSocketStore.stompClient) {
      webSocketStore.stompClient.publish({
        destination: `/publish/${props.room.chatroomSeq}`,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          chatroomSeq: props.room.chatroomSeq,
          senderUserSeq: userSeq.value,
          message: newMessage.value,
          type: 'text',
          createdAt: new Date().toISOString(),
        }),
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

// 옵션 메뉴 상태
const isOptionsMenuOpen = ref(false);
const isInviteModalOpen = ref(false);
const isNameModalOpen = ref(false);

const toggleOptionsMenu = (event) => {  // 옵션 메뉴 토글 함수
  event.stopPropagation(); // 이벤트 전파 중단 (외부 클릭 감지 방지)
  isOptionsMenuOpen.value = !isOptionsMenuOpen.value;

  if (isOptionsMenuOpen.value) {
    document.addEventListener('click', closeOptionsMenuOnOutsideClick);
  } else {
    document.removeEventListener('click', closeOptionsMenuOnOutsideClick);
  }
};

const closeOptionsMenuOnOutsideClick = (event) => {
  const optionsMenu = document.querySelector('.options-dropdown');
  if (optionsMenu && !optionsMenu.contains(event.target)) {
    isOptionsMenuOpen.value = false;
    document.removeEventListener('click', closeOptionsMenuOnOutsideClick);
  }
};

const openInviteModal = () => {
  isInviteModalOpen.value = true;
}
const openNameModal = () => {
  isNameModalOpen.value = true;
}

const inviteUsers = async (users) => {
  //console.log('대화상대 초대 버튼 클릭');
  try {
    const response = await axios.post(`/chatroom/${props.room.chatroomSeq}`, {users});
    // console.log('대화상대 초대 성공: ', response.data);
    alert('대화 상대가 성공적으로 초대되었습니다.');

    const chatroomResponse = await axios.get(`/chatroom/${response.data.data}`);
    console.log(`채팅방 ${response.data.data} 정보 불러오기 성공:`, chatroomResponse.data);

    //console.log(chatStore.updateChatroomUsers);
    chatStore.updateChatroomUsers(chatroomResponse.data.data);
  } catch(error) {
    console.error('대화상대 초대 실패: ', error);
    alert('대화 상대 초대에 실패했습니다. 다시 시도해주세요.');
  }
};
const updateChatroomName = async (newName) => {
  //console.log('새 채팅방 이름 설정:', newName);
  try {
    const response = await axios.put(`/chatroom/${props.room.chatroomSeq}`, { chatroomCustomName: newName });
    console.log('채팅방 이름 변경 성공: ', response.data);
    props.room.chatroomCustomName = newName;
    alert('채팅방 이름이 성공적으로 설정되었습니다.');
  } catch(error) {
    console.error('채팅방 이름 변경 실패: ', error);
    alert('채팅방 이름 변경에 실패했습니다.');
  }
}
const leaveChatroom = async () => {
  const isConfirmed = confirm('채팅방을 나가시겠습니까?');
  if (!isConfirmed) {
    console.log('채팅방 나가기 취소');
    return;
  }
  try {
    // 1. WebSocket 구독 해제
      webSocketStore.unsubscribeChatroom(props.room.chatroomSeq);
      console.log(`채팅방 ${props.room.chatroomSeq}의 구독 해제 완료`);

    // 2. DELETE 요청 보내기
    await axios.delete(`/chatroom/${props.room.chatroomSeq}`);
    console.log(`채팅방 ${props.room.chatroomSeq}에서 나가기 완료`)

    // 3. ChatroomWindow.vue 닫기
    emit('close-chatroom', props.room.chatroomSeq);

    // 4. Pinia ChatStore에서 해당 채팅방 삭제
    chatStore.removeChatroom(props.room.chatroomSeq);
    //console.log(`채팅방 목록 업데이트 완료`);
  } catch (error) {
    console.error(`채팅방 ${props.room.chatroomSeq}에서 나가는 중 오류 발생: `, error);
    alert('채팅방에서 나가는 중 문제가 발생했습니다. 다시 시도해주세요');
  }
  alert('채팅방을 나갑니다.');
};

// 파일 업로드 핸들러
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const isConfirmed = confirm(`"${file.name}" 파일을 전송하시겠습니까?`);
  if(!isConfirmed) {
    console.log('파일 전송 취소됨');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append(
      'message',
      new Blob(
          [
            JSON.stringify({
              chatroomSeq: props.room.chatroomSeq,
              senderUserSeq: userSeq.value,
              message: file.name,
              createdAt: new Date().toISOString(),
            }),
          ],
          { type: 'application/json' }
      )
  );

  try {
    const response = await axios.post('/chat/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('파일 업로드 성공:', response.data);
    // 메시지 목록에 추가
    messages.value.push(response.data);

    nextTick(() => scrollToBottom());
  } catch (error) {
    console.error('파일 업로드 실패:', error);
    alert('파일 업로드 중 오류가 발생했습니다.');
  }
};

// 채팅창 드래그 상태 관리
const currentChatWindow = ref(null);  // 현재 드래그 중인 창
const isDragging = ref(false);
const offset = ref({ x: 0, y: 0 });

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

  isDragging.value = true;    // 드래그 시작
  currentChatWindow.value = chatWindow;

  // 전역 이벤트 리스너 등록
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

// 드래그 이동 이벤트
const onDrag = (event) => {
  if (!isDragging.value || !currentChatWindow.value) return;

  const left = event.clientX - offset.value.x;
  const top = event.clientY - offset.value.y;

  // 화면을 벗어나지 않도록 위치 제한
  const maxLeft = window.innerWidth - currentChatWindow.value.offsetWidth;
  const maxTop = window.innerHeight - currentChatWindow.value.offsetHeight;

  // 위치를 화면 내로 제한
  currentChatWindow.value.style.left = `${Math.max(0, Math.min(left, maxLeft))}px`;
  currentChatWindow.value.style.top = `${Math.max(0, Math.min(top, maxTop))}px`;
};

// 드래그 종료 이벤트
const stopDrag = () => {
  isDragging.value = false;
  currentChatWindow.value = null;

  // 전역 이벤트 리스너 제거
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};
</script>

<template>
  <div class="chatroom-window" @mousedown="startDrag">
    <!-- 기본 헤더 -->
    <header class="chat-header">
      <img src="@/assets/images/chat/Communication.png" alt="Communication">
      <h3>대화</h3>
      <button class="close-button" @click="$emit('close-chatroom', room.chatroomSeq)">X</button>
    </header>

    <!-- 채팅방 정보 헤더 -->
    <div class="chatroom-header">
      <img :src="props.room.partnerProfileUrl || getHeaderImage() ||'/chat/group-chat.png'" />
      <div class="chatroom-info">
        <h4>{{ room.chatroomCustomName || getPartnerName() || room.chatroomDefaultName }}</h4>
        <p @click="openParticipantModal" style="cursor: pointer;">
          참여자 {{ props.room.chatroomUsersCount }}
        </p>

        <!-- 참여자 목록 모달 -->
        <ParticipantListModal
            v-if="isParticipantModalOpen"
            :participants="participants"
            @close="closeParticipantModal"
        />
      </div>
      <div class="options-menu">
        <button @click="toggleOptionsMenu">⋮</button>
        <ul v-if="isOptionsMenuOpen" class="options-dropdown list-unstyled">
          <li @click="openInviteModal">대화상대 초대</li>
          <li @click="openNameModal">채팅방 이름 설정</li>
          <li @click="leaveChatroom">채팅방 나가기</li>
        </ul>
      </div>
    </div>

    <!-- 대화 상대 초대 모달 -->
    <SelectUserModal
      v-if="isInviteModalOpen"
      @close="isInviteModalOpen = false"
      @add-users="inviteUsers"
    />

    <!-- 채팅방 이름 설정 모달 -->
    <ChatroomNameModal
      v-if="isNameModalOpen"
      :currentName="room.chatroomCustomName || room.chatroomDefaultName"
      @close="isNameModalOpen = false"
      @update-name="updateChatroomName"
    />

    <!-- 메시지 목록 -->
    <div class="messages" ref="messagesContainer">
      <!-- 메시지 목록 렌더링 -->
      <MessageItem
          v-for="(msg, index) in messages"
          :key="msg.messageSeq"
          :message="msg"
          :isDateDivider="index === 0 || !isSameDay(msg.createdAt, messages[index - 1]?.createdAt)"
          :currentUserSeq="userSeq"
      />
    </div>

    <!-- 메시지 보내기 -->
    <div class="message-input">
      <textarea
          v-model="newMessage"
          placeholder="메시지를 입력하세요"
          @keydown.enter.prevent="sendMessage"
      />
      <div class="message-input-btn">
        <div>
          <button class="attach-button">
            <label for="fileInput">
              <img src="@/assets/images/chat/Attach.png" alt="FileAttachment">
            </label>
          </button>
          <!-- 파일 선택 -->
          <input
              type="file"
              id="fileInput"
              style="display: none"
              @change="handleFileUpload"
          />
        </div>
        <button class="send-button" @click="sendMessage">보내기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chatroom-window {
  position: absolute;  /* absolute로 변경하여 위치를 절대좌표로 설정 */
  bottom: 0;
  right: 0;
  width: 500px;
  height: 650px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 5px;
  background: linear-gradient(to bottom, #1A2F69, #3A4F89, #5A6FA9);
  color: white;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  position: relative; /* close-button을 절대 위치로 배치하기 위해 사용 */
  cursor: move;
}

.chat-header h3 {
  margin: 0;
  font-size: 20px;
}

.chat-header img {
  width: 40px;
  height: 40px;
  margin: 0px 10px;
}

.chatroom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #555555;
  background-color: #f2f2f2;
}

.chatroom-header img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

.chatroom-info {
  flex-grow: 1;
  margin-left: 10px;
}

.chatroom-info h4 {
  margin: 0;
  font-size: 16px;
}

.chatroom-info p {
  margin: 5px 0;
  font-size: 14px;
  color: gray;
}

.options-menu {
  position: relative;
}

.options-menu button {
  background: none;
  border: none;
  font-size: 20px;
}

.options-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  background-color: #1A2F69;
  border: solid #ddd;
  border-radius: 7px;
  box-shadow: rgba(0,0,0,0.1) 0px 4px 8px;
  width: 110px;
}

.options-dropdown li {
  padding: 5px;
  text-align: center;
  font-size: 12px;
  font-family: 'Arial', sans-serif;
  color: #f0f0f0;
  cursor: pointer;
}

.options-dropdown li:hover {
  background-color: #FFC653;
}

.messages {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  padding: 10px;
  background-color: #f2f2f2;
}

.message-input {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 3px;
  border-top: 1px solid #ccc;
}

.message-input textarea {
  flex-grow: 1;
  padding: 10px;
  border: none;
  resize: none;
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
  cursor: pointer;
}

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
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #f0f0f0;
  font-size: 20px;
  cursor: pointer;
}
</style>
