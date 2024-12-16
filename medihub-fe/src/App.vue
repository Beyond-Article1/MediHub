<script setup>
import { ref } from 'vue';
import Header from "@/components/common/Header.vue";
import ChatButton from "@/components/chat/ChatButton.vue";
import ChatWindow from "@/views/chat/ChatWindow.vue";

const isChatOpen = ref(false); // 채팅창 열기/닫기 상태 관리

const toggleChatWindow = () => {
  isChatOpen.value = !isChatOpen.value;
};
</script>

<template>
  <Header/>
  <div id="app">
    <RouterView :key="$route.fullPath"/>
    <ChatButton @toggle-chat-window="toggleChatWindow" />
    <ChatWindow v-if="isChatOpen" :isOpen="isChatOpen" @close-chat-window="toggleChatWindow" />
  </div>

</template>

<script setup>
import Header from "@/components/common/Header.vue";
</script>

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
