<template>
  <div class="container mt-5">
    <!-- 상단 타이틀과 회원 등록 버튼 -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold">의료진</h3>
      <button class="btn btn-primary" @click="registerUser">
        <span class="material-icons me-1">person_add</span> 회원 등록
      </button>
    </div>
    <LineDivider />

    <!-- 사용자 카드 -->
    <div class="row justify-content-start">
      <div
          class="col-md-6 col-lg-6 mb-4"
          v-for="user in paginatedUsers"
          :key="user.userEmail"
      >
        <div class="user-card position-relative">
          <!-- 프로필 이미지 -->
          <div class="profile-image">
            <img
                :src="user.profileImage || defaultImage"
                alt="Profile"
            />
          </div>

          <!-- 사용자 정보 -->
          <div class="user-info">
            <h4 class="fw-bold mb-2">{{ user.userName }}</h4>
            <p class="mb-1">{{ user.partName }}</p>
            <p class="mb-1">{{ user.userEmail }}</p>
            <p class="fw-bold mb-0">{{ user.userPhone }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 페이지네이션 -->
    <Pagenation
        :totalData="totalUsers"
        :limitPage="itemsPerPage"
        :page="currentPage"
        @updatePage="changePage"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Pagenation from "@/components/common/Pagenation.vue";
import LineDivider from "@/components/common/LineDivider.vue";
import axios from "axios";

// 상태 변수
const users = ref([]); // 사용자 목록
const defaultImage = "https://via.placeholder.com/120"; // 기본 이미지

// 페이지네이션 상태
const currentPage = ref(1);
const itemsPerPage = 6;
const totalUsers = ref(0);

// API에서 사용자 데이터 불러오기
const fetchUsers = async () => {
  try {
    const response = await axios.get(`/api/v1/users/allUser`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    users.value = response.data.data; // 사용자 데이터
    totalUsers.value = users.value.length; // 전체 사용자 수
  } catch (error) {
    console.error("회원 정보 조회 실패:", error);
  }
};

// 현재 페이지에 보여질 사용자 계산
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return users.value.slice(start, end);
});

// 페이지 변경 이벤트
const changePage = (page) => {
  currentPage.value = page;
};

// 회원 등록 버튼 클릭 이벤트
const registerUser = () => {
  alert("회원 등록 기능이 준비 중입니다!");
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
/* 컨테이너 */
.container {
  max-width: 1000px;
}

/* 상단 버튼 스타일 */
button.btn-primary {
  display: flex;
  align-items: center;
  font-size: 1rem;
  padding: 8px 16px;
}

button.btn-primary .material-icons {
  font-size: 1.2rem;
}

/* 사용자 카드 */
.user-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 170px;
}

/* 프로필 이미지 */
.profile-image img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #eaeaea;
  border: 2px solid #ccc;
}

/* 사용자 정보 네모 박스 */
.user-info {
  flex-grow: 1;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info h4 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 10px;
}

.user-info p {
  margin: 0;
  font-size: 1.1rem;
  color: #555;
}

/* 버튼 및 간격 조정 */
.row {
  margin-left: 0;
  margin-right: 0;
}
</style>
