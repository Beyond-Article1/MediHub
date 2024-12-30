<script setup>
import { ref } from 'vue';
import { useAuthStore } from "@/store/authStore.js";
import Organization from "@/components/chat/Organization.vue";
import ChatroomList from "@/components/chat/ChatroomList.vue";
import FileBox from "@/components/chat/FileBox.vue";

const authStore = useAuthStore();

// 채팅창 상태 관리
const isChatOpen = ref(true);     // 채팅창 열기/닫기 상태
const currentPage = ref(ChatroomList);  // 초기 페이지 설정 (기본 채팅방)
const activeButton = ref('chatroom'); // 초기값: chatroom 버튼 활성화

// 채팅창 드래그 상태 관리
const isDragging = ref(false);  // 드래그 중인지
const initialPosition = ref({ x:0, y:0 });  // 초기 위치 기록(드래그 시작 위치)
const offset = ref({ x: 0, y: 0 });  // 드래그 시작 지점에서의 상대적인 위치

// 메뉴에서 페이지 전환 시
const handlePageChange = (page) => {
  activeButton.value = page;  // 메뉴 선택 시 버튼 상태 업데이트

  if (page === 'organization') {
    currentPage.value = Organization;
  } else if (page === 'chatroom') {
    currentPage.value = ChatroomList;
  } else if (page === 'file') {
    currentPage.value = FileBox;
  }
};

// 드래그 시작 이벤트
const startDrag = (event) => {
  if(event.button !== 0) return;    // 마우스 왼쪽 버튼일 때만 드래그 시작

  const chatHeader = event.target.closest('.chat-header');  // chat-header 영역에서만 드래그 시작
  if (!chatHeader) return;  // 만약 chat-header가 아니라면 드래그를 시작하지 않음

  const chatWindow = event.target.closest('.chat-window');
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

  const chatWindow = document.querySelector('.chat-window');

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
  <div v-if="isChatOpen" class="chat-window" @mousedown="startDrag">
    <header class="chat-header">
      <div class="chat-header-profile">
        <img :src="authStore.userInfo.profileImage || '@/assets/images/chat/default-profile.png'" alt="profile">
      </div>
      <div class="chat-header-menu">
        <button
            @click="handlePageChange('organization')"
            :class="{ active: activeButton === 'organization' }">
            <img src="@/assets/images/chat/FlowChart.png" alt="Organization">
        </button>
        <button
            @click="handlePageChange('chatroom')"
            :class="{ active: activeButton === 'chatroom' }">
            <img src="@/assets/images/chat/Communication.png" alt="Chatroom">
        </button>
        <button
            @click="handlePageChange('file')"
            :class="{ active: activeButton === 'file' }">
            <img src="@/assets/images/chat/FileExplorer.png" alt="File">
        </button>
      </div>
      <div class="chat-header-logo">
        <img src="@/assets/images/chat/MediHub_LOGO.png" alt="MediHub_LOGO">
      </div>
    </header>

    <!-- 메뉴 화면(조직도, 채팅방, 파일함) 또는 채팅방 화면을 동적으로 변경 -->
    <div id="container" class="chat-content">
      <component :is="currentPage" @open-chatroom="$emit('open-chatroom', $event)" />
    </div>

    <!-- X (닫기 버튼) -->
    <button class="close-button" @click="isChatOpen = false">X</button>
  </div>
</template>

<style scoped>
.chat-window {
  position: absolute;  /* absolute로 변경하여 위치를 절대좌표로 설정 */
  bottom: 0;
  right: 0;
  width: 500px;
  height: 600px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  z-index: 9999;
  display: flex;
  flex-direction: row;
}

.chat-header {
  display: flex;
  flex-direction: column;
  padding: 8px;
  background: linear-gradient(to right, #1A2F69, #3A4F89, #5A6FA9);
  color: white;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  height: 100%;
  justify-content: space-between;
  cursor: move;  /* 마우스를 올리면 드래그 가능하게 표시 */
}

.chat-header-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.chat-header-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  margin-top: 30px;
}

.chat-header-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: auto;
}

.chat-header-menu button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

.chat-header-profile img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
}

.chat-header-menu button img {
  width: 30px;
  height: 30px;
}

.chat-header-logo img {
  width: 45px;
  height: 45px;
}

.chat-header-menu button.active {
  background-color: #FFC653;
  border-radius: 5px;
  padding: 5px;
}

.chat-content {
  flex-grow: 1;
  overflow-y: auto;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  color: #1A2F69;
  font-size: 20px;
  cursor: pointer;
}
</style>
