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

const filteredUsers = computed(() =>
  users.value.filter((user) => user.userSeq !== authStore.userSeq)
);

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
      <ul class="user-list">
        <li
          v-for="user in filteredUsers"
          :key="user.userSeq"
          @click="toggleUserSelection(user)"
          :class="{ selected: selectedUsers.includes(user.userSeq)  }"
        >
          <!-- 프로필 사진 -->
          <div class="user-profile">
            <img :src="user.profileImage || 'src/assets/images/chat/Default_Profile.png'" alt="Profile" />
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
}

.modal-content {
  position: absolute;
  top: 60px; /* 버튼 바로 아래로 위치 (버튼 높이에 따라 조정 가능) */
  left: 50%; /* 화면 중앙 정렬 */
  transform: translateX(-50%); /* X축 중앙 정렬 */
  width: 350px; /* 모달 너비 */
  height: auto; /* 내용에 따라 높이 자동 조정 */
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h4 {
  text-align: center; /* 제목 중앙 정렬 */
  margin-bottom: 20px; /* 제목과 목록 사이 간격 */
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 400px; /* 최대 높이 설정 */
  overflow-y: auto; /* 세로 스크롤 활성화 */
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
  background-color: #f9f9f9; /* 호버 시 배경색 변경 */
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
  object-fit: cover; /* 이미지 비율 유지 */
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
  padding: 7px 20px; /* 버튼 크기 */
  font-size: 14px; /* 글자 크기 */
  border-radius: 5px; /* 둥근 모서리 */
  border: none; /* 테두리 제거 */
  cursor: pointer;
}

.modal-actions button:first-child {
  background-color: #ffc653; /* 확인 버튼 색상 */
  color: white;
}

.modal-actions button:first-child:hover {
  background-color: #e5b34c; /* 확인 버튼 호버 색상 */
}

.modal-actions button:last-child {
  background-color: #ddd; /* 취소 버튼 색상 */
}

.modal-actions button:last-child:hover {
  background-color: #bbb; /* 취소 버튼 호버 색상 */
}
</style>