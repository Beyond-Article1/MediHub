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
    <RouterView/>
    <ChatButton @toggle-chat-window="toggleChatWindow" />
    <ChatWindow v-if="isChatOpen" :isOpen="isChatOpen" @close-chat-window="toggleChatWindow" />
  </div>
</template>

<style scoped>

</style>
