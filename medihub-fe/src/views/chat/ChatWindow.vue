<script setup>
import { ref } from 'vue';
import Organization from "@/components/chat/Organization.vue";
import ChatroomList from "@/components/chat/ChatroomList.vue";
import FileBox from "@/components/chat/FileBox.vue";
import ChatroomDetail from "@/components/chat/ChatroomDetail.vue"; // 채팅방 상세 화면 컴포넌트

// 채팅창 상태 관리
const isChatOpen = ref(true);     // 채팅창 열기/닫기 상태
const currentPage = ref(ChatroomList);  // 초기 페이지 설정 (기본 채팅방)
const currentRoom = ref(false);   // 현재 선택된 채팅방, 기본값 false (채팅방을 선택하지 않은 상태)

// 채팅창 드래그 상태 관리
const isDragging = ref(false);  // 드래그 중인지 여부
const offset = ref({ x: 0, y: 0 });  // 드래그 시작 지점에서의 상대적인 위치

// 현재 선택된 메뉴 버튼 상태 관리
const activeButton = ref('chatroom'); // 초기값: chatroom 버튼 활성화

// 메뉴에서 페이지 전환 시
const handlePageChange = (page) => {
  activeButton.value = page;  // 메뉴 선택 시 버튼 상태 업데이트

  if (page === 'organization') {
    currentPage.value = Organization;
    currentRoom.value = false;  // 채팅방 상세 화면에서는 메뉴로 돌아갈 수 있도록 상태 초기화
  } else if (page === 'chatroom') {
    currentPage.value = ChatroomList;
    currentRoom.value = false;
  } else if (page === 'file') {
    currentPage.value = FileBox;
    currentRoom.value = false;
  }
};

// 채팅방을 더블클릭하면 해당 채팅방 상세 화면을 보여줌
const openChatRoom = (room) => {
  currentRoom.value = room;  // 선택한 채팅방으로 상태 변경
  currentPage.value = ChatroomDetail;  // 채팅방 상세 화면으로 전환
};

// 드래그 시작 이벤트
const startDrag = (event) => {
  isDragging.value = true;
  offset.value = { x: event.clientX - event.target.getBoundingClientRect().left, y: event.clientY - event.target.getBoundingClientRect().top };
};

// 드래그 이동 이벤트
const onDrag = (event) => {
  if (isDragging.value) {
    const chatWindow = document.querySelector('.chat-window');
    chatWindow.style.left = `${event.clientX - offset.value.x}px`;
    chatWindow.style.top = `${event.clientY - offset.value.y}px`;
  }
};

// 드래그 종료 이벤트
const stopDrag = () => {
  isDragging.value = false;
};

</script>

<template>
  <div v-if="isChatOpen" class="chat-window" @mousedown="startDrag" @mousemove="onDrag" @mouseup="stopDrag" @mouseleave="stopDrag">
    <header class="chat-header">
      <div class="chat-header-profile">
        <img src="@/assets/images/chat/profile.png" alt="Organization">
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
        <img src="@/assets/images/chat/MediHub_LOGO.png" alt="Organization">
      </div>
    </header>

    <!-- 메뉴 화면(조직도, 채팅방, 파일함) 또는 채팅방 화면을 동적으로 변경 -->
    <div id="container" class="chat-content">
      <component :is="currentPage" v-if="!currentRoom" @open-chat-room="openChatRoom" />
      <ChatroomDetail v-if="currentRoom" :room="currentRoom" />
    </div>

    <!-- X (닫기 버튼) -->
    <button class="close-button" @click="isChatOpen = false">X</button>
  </div>
</template>

<style scoped>
.chat-window {
  position: fixed;
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
  cursor: move;  /* 마우스를 올리면 드래그 가능하게 표시 */
}

.chat-header {
  display: flex;
  flex-direction: column;
  padding: 5px;
  background: linear-gradient(to right, #1A2F69, #3A4F89, #5A6FA9);
  color: white;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  height: 98.5%;
  justify-content: space-between;
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
}

.chat-header-menu button img {
  width: 30px;  /* 이미지 크기 (작게 조정) */
  height: 30px;  /* 이미지 크기 (작게 조정) */
}

.chat-header-logo img {
  width: 45px;
  height: 45px;
}

/* 버튼이 활성화된 경우 스타일 */
.chat-header-menu button.active {
  background-color: #FFC653;  /* 버튼의 배경색을 노란색으로 */
  border-radius: 5px;  /* 원형 버튼 배경 */
  padding: 5px;  /* 버튼 여백 */
}

.chat-content {
  flex-grow: 1;
  padding: 10px;
  overflow-y: auto;
}

/* 닫기 버튼 (X 버튼) */
.close-button {
  position: absolute;
  top: 10px;  /* 상단 10px */
  right: 10px; /* 우측 10px */
  background: none;
  border: none;
  color: #1A2F69;
  font-size: 20px;
  cursor: pointer;
  z-index: 10000; /* X 버튼이 다른 요소 위에 보이게 */
}
</style>
