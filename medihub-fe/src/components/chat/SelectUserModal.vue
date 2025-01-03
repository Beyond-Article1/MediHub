<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore} from "@/store/authStore.js";
import axios from "axios";

const users = ref([]);  // 사용자 목록
const selectedUsers = ref([]);  // 선택된 사용자 목록
const authStore = useAuthStore();

// 부모 컴포넌트로 이벤트 전달
const emit = defineEmits(['close', 'add-users']);
const confirmSelection = () => {
  emit('add-users', selectedUsers.value);
  emit('close');  // 모달 닫기
}

// 사용자 목록 가져오기
const getUsers = async () => {
  try {
    const response = await axios('/api/v1/users/allUser');
    users.value = response.data.data;
    console.log('사용자 목록을 불러오는 데 성공했습니다. ', users.value);
  } catch(error) {
    console.error('사용자 목록을 불러오는 중 오류가 발생했습니다.', error);
  }
};

const searchQuery = ref('');  // 검색어
// 검색어에 따라 필터링된 사용자 목록
const filteredUsers = computed(() => {
  return users.value.filter(user =>
      user.userSeq !== authStore.userSeq &&
      user.userName.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 사용자 선택/해제
const toggleUserSelection = (user) => {
  const index = selectedUsers.value.indexOf(user.userSeq); // userSeq 기준으로 확인
  if (index !== -1) {
    selectedUsers.value.splice(index, 1); // 선택 해제
  } else {
    selectedUsers.value.push(user.userSeq); // 선택 추가
  }
};

onMounted(getUsers);
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h4>대화상대 선택</h4>

      <!-- 검색 입력창 -->
      <input
          v-model="searchQuery"
          type="text"
          placeholder="이름으로 검색"
          class="search-input"
      />

      <ul class="user-list">
        <li
          v-for="user in filteredUsers"
          :key="user.userSeq"
          @click="toggleUserSelection(user)"
          :class="{ selected: selectedUsers.includes(user.userSeq)  }"
        >
          <!-- 프로필 사진 -->
          <div class="user-profile">
            <img :src="user.profileImage || '/chat/profile.png'" alt="Profile" />
          </div>
          <!-- 사용자 정보 -->
          <div class="user-info">
            <div class="user-name">{{ user.userName }} {{ user.rankingName }}</div>
            <div class="user-department">{{ user.partName }}</div>
          </div>
          <!-- 선택 원 -->
          <div class="select-circle" :class="{ active: selectedUsers.includes(user.userSeq) }"></div>
        </li>
      </ul>

      <div class="modal-actions">
        <button @click="confirmSelection">확인</button>
        <button @click="emit('close')">취소</button>
      </div>
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
  z-index: 10000;
}

.search-input {
  width: calc(100% - 20px);
  padding: 5px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-content {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 350px;
  height: auto;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h4 {
  text-align: center;
  margin-bottom: 20px;
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
}

.user-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
}

.user-list li:hover {
  background-color: #f9f9f9;
}

.user-list li.selected {
  background-color: #d3eaff;
}


.user-profile {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden; /* 이미지를 둥글게 자르기 */
  margin-right: 10px;
}

.user-profile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex-grow: 1;
}

.user-name {
  font-weight: bold;
}

.user-department {
  font-size: 12px;
  color: #888;
}

.select-circle {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 50%;
}

.select-circle.active {
  background-color: #FFC653;
  border-color: #555555;
}

.modal-actions {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.modal-actions button {
  padding: 7px 20px;
  font-size: 14px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.modal-actions button:first-child {
  background-color: #ffc653;
}

.modal-actions button:first-child:hover {
  background-color: #e5b34c;
}

.modal-actions button:last-child {
  background-color: #ddd;
}

.modal-actions button:last-child:hover {
  background-color: #bbb;
}
</style>