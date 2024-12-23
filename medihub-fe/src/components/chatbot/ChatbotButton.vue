<template>
  <div
      class="chatbot-button"
      :class="{ 'scrolling': isScrolling }"
      @click="toggleChatbotWindow"
  >
    <img src="@/assets/images/chatbot/bot.png" alt="Chat Icon" />
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, defineEmits} from "vue";

const isScrolling = ref(false); // 스크롤 중 여부

// 스크롤 이벤트 처리
const handleScroll = () => {
  isScrolling.value = true;

  // 일정 시간 후에 "스크롤 중" 상태를 해제
  setTimeout(() => {
    isScrolling.value = false;
  }, 300); // 애니메이션 지속 시간과 맞춤
};

const emit = defineEmits();
const toggleChatbotWindow = () => {
  emit('toggle-chatbot-window');
};


onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.chatbot-button {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 60px;
  height: 60px;
  background-color: #1a2f69;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.5s ease, box-shadow 0.5s ease;
}

/* 스크롤 중일 때 흔들리는 애니메이션 */
.chatbot-button.scrolling {
  transform: translateY(-20px); /* 살짝 위로 이동하며 회전 */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}
</style>
