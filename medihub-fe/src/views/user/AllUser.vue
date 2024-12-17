<template>
  <div class="container mt-5">
    <!-- 제목 -->
    <h3 class="fw-bold mb-4 text-center">의료진</h3>
    <LineDivider />

    <!-- 사용자 카드 -->
    <div class="row justify-content-start">
      <div
          class="col-md-6 col-lg-6 mb-4"
          v-for="user in paginatedUsers"
          :key="user.userEmail"
      >
        <div class="user-card position-relative">
          <!-- 북마크 버튼 (오른쪽 위) -->
          <BookmarkButton
              class="bookmark-button"
              :isFavorite="favorites.includes(user.userEmail)"
              @click="toggleFavorite(user.userEmail)"
          />

          <!-- 프로필 이미지 -->
          <div class="profile-image">
            <img
                :src="user.profileImage || defaultImage"
                alt="Profile"
                class="rounded-circle"
            />
          </div>

          <!-- 사용자 정보 -->
          <div class="user-info">
            <h4 class="fw-bold mb-2">{{ user.userName }}</h4>
            <p class="mb-1 text-muted fs-5">{{ user.userPhone }}</p>
            <p class="mb-1 fs-5">{{ user.partName }}</p>
            <p class="fw-bold mb-0 fs-5">{{ user.rankingName }}</p>
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
import BookmarkButton from "@/components/common/button/BookmarkButton.vue";
import axios from "axios";

const users = ref([]);
const favorites = ref([]);
const defaultImage = "https://via.placeholder.com/150";


const currentPage = ref(1);
const itemsPerPage = 6;
const totalUsers = ref(0);


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

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage; // 시작 인덱스
  const end = start + itemsPerPage; // 종료 인덱스
  return users.value.slice(start, end);
});

const changePage = (page) => {
  currentPage.value = page; // 현재 페이지 변경
};

const toggleFavorite = (email) => {
  if (favorites.value.includes(email)) {
    favorites.value = favorites.value.filter((fav) => fav !== email);
  } else {
    favorites.value.push(email);
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.container {
  max-width: 1000px;
}

.user-card {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  height: 170px;
}

.profile-image img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #eaeaea;
}

.user-info h4 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.user-info p {
  margin: 0;
  font-size: 1.2rem;
}

.bookmark-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.8rem;
  color: #999;
}

.bookmark-button:hover {
  color: #f39c12;
}

.row {
  margin-left: 0;
  margin-right: 0;
}
</style>
