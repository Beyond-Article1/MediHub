<script setup>
import {computed, ref, watch} from 'vue';
import Header from "@/components/common/Header.vue";
import { useRoute } from 'vue-router'; // useRoute 불러오기
import ChatButton from "@/components/chat/ChatButton.vue";
import ChatWindow from "@/views/chat/ChatWindow.vue";

const isChatOpen = ref(false); // 채팅창 열기/닫기 상태 관리
const route = useRoute(); // 현재 경로 정보 가져오기

// 로그인 페이지인지 확인하는 변수
const isLoginPage = computed(() => route.path === '/login');

const toggleChatWindow = () => {
  isChatOpen.value = !isChatOpen.value;

};

// 라우트가 변경될 때 채팅창 상태 초기화
watch(
    () => route.path,
    () => {
      isChatOpen.value = false; // 라우트 변경 시 채팅창 닫기
    }
);

</script>

<template>

  <!-- 로그인 페이지가 아닐 때만 Header와 ChatButton 보이기 -->
  <Header v-if="!isLoginPage" />
  
  <div id="app">
    <RouterView :key="$route.fullPath" />
    <ChatButton v-if="!isLoginPage" @toggle-chat-window="toggleChatWindow" />
    <ChatWindow v-if="isChatOpen && !isLoginPage" :isOpen="isChatOpen" @close-chat-window="toggleChatWindow" />

  </div>

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
