<template>
  <div class="chat-bot-button" @click="toggleChatWindow">
    💬
  </div>
</template>

<script setup>
import { defineEmits } from 'vue';

const emit = defineEmits();
const toggleChatWindow = () => {
  emit('toggle-chat-window');
};
</script>

<style scoped>
.chat-bot-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background-color: #1A2F69;
  color: white;
  border-radius: 50%;
  font-size: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
