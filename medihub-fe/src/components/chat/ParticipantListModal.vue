<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  participants: {
    type: Array,
    required: true,
  }
});

const emit = defineEmits(['close']);
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h4 class="modal-title">참여자</h4>

      <ul class="participant-list">
        <li v-for="participant in participants" :key="participant.userSeq" class="participant-item">
          <img :src="participant.userProfileUrl || '/chat/profile.png'" alt="프로필 이미지" class="profile-img"/>
          <div class="participant-info">
            <span class="user-name">{{ participant.userName }}</span>
            <span class="user-details">{{ participant.partName }} {{ participant.rankingName }}</span>
          </div>
        </li>
      </ul>
      <button class="close-button" @click="emit('close')">닫기</button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
  width: 300px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  padding-bottom: 7px;
  margin-bottom: 10px;
  border-bottom: 2px solid #FFC653;
}

.participant-list {
  list-style: none;
  padding: 0;
}

.participant-item {
  display: flex;
  align-items: center;
  padding: 10px;
}

.profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.participant-info {
  margin-left: 10px;
}

.user-name {
  font-weight: bold;
  display: block;
}

.user-details {
  font-size: 12px;
  display: block;
}

.close-button {
  padding: 7px 20px;
  font-size: 14px;
  background-color: #FFC653;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.close-button:hover {
  background-color: #e5b34c;
}
</style>
