<script setup>
import {computed, ref, watch} from 'vue';
import Header from "@/components/common/Header.vue";
import { useRoute } from 'vue-router';
import { useChatStore } from "@/stores/chatStore";
import ChatButton from "@/components/chat/ChatButton.vue";
import ChatWindow from "@/views/chat/ChatWindow.vue";
import ChatroomWindow from "@/views/chat/ChatroomWindow.vue"
import ChatbotButton from "@/components/chatbot/ChatbotButton.vue";
import ChatbotWindow from "@/views/chatbot/ChatbotWindow.vue";

const route = useRoute(); // 현재 경로 정보 가져오기
const isLoginPage = computed(() => route.path === '/login');  // 로그인 페이지인지 확인하는 변수

const isChatOpen = ref(false);    // 채팅창(ChatWindow) 열기/닫기 상태 관리
const toggleChatWindow = () => {  // ChatWindow 열기/닫기
  isChatOpen.value = !isChatOpen.value;
};

const chatStore = useChatStore();
const openChatroomWindow = (room) => {
  chatStore.openChatroom(room);
};
const closeChatroomWindow = (chatroomSeq) => {
  chatStore.closeChatroom(chatroomSeq);
};

// 로그아웃 시, 열린 채팅방 목록 초기화
const resetOpenedChatrooms = () => {
  chatStore.openedChatrooms = [];
  console.log('openedChatrooms 초기화 완료');
};

// 로그아웃 이벤트 리스너 등록
window.addEventListener('logout', resetOpenedChatrooms);

// 라우트가 변경될 때 채팅창 상태 초기화
watch(
    () => route.path,
    () => {
      isChatOpen.value = false; // 라우트 변경 시 채팅창 닫기
    }
);

// 챗봇(ChatbotWindow) 상태 관리
const isChatbotOpen = ref(false);
const toggleChatbotWindow = () => {
  isChatbotOpen.value = !isChatbotOpen.value;
};

// 라우트가 변경될 때 챗봇 상태 초기화
watch(
    () => route.path,
    () => {
      isChatbotOpen.value = false; // 라우트 변경 시 챗봇 창 닫기
    }
);

</script>

<template>
  <!-- 로그인 페이지가 아닐 때만 Header와 ChatButton 보이기 -->
  <Header v-if="!isLoginPage" />
  
  <div id="app">
    <RouterView :key="$route.fullPath" />
    <ChatButton v-if="!isLoginPage" @toggle-chat-window="toggleChatWindow" />
    <!-- ChatWindow 열기 상태 관리 -->
    <ChatWindow
        v-if="isChatOpen && !isLoginPage"
        :isOpen="isChatOpen"
        @open-chatroom="openChatroomWindow"
    />

    <!-- 열린 채팅방 리스트 -->
    <div v-for="room in chatStore.openedChatrooms" :key="room.chatroomSeq">
      <ChatroomWindow
          v-if="!isLoginPage"
          :room="room"
          @close-chatroom="closeChatroomWindow(room.chatroomSeq)"
      />
    </div>
  </div>
  <!-- 챗봇 버튼 -->
  <ChatbotButton v-if="!isLoginPage" @toggle-chatbot-window="toggleChatbotWindow" />

  <!-- 챗봇 창 -->
  <ChatbotWindow
      v-if="isChatbotOpen && !isLoginPage"
      :isOpen="isChatbotOpen"
  />
</template>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

router-view {
  flex: 1;
  padding: 20px; /* 라우트 페이지에 여백 추가 */
}
</style>
