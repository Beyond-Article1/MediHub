<script setup>
import { ref, computed, onMounted } from "vue";
import BookmarkButton from "@/components/common/button/BookmarkButton.vue";
import Pagination from "@/components/common/Pagination.vue";
import Sidebar from "@/components/user/MyPage.vue";
import axios from "axios";

const users = ref([]);
const currentPage = ref(1);
const itemsPerPage = 6;
const defaultImage = "https://via.placeholder.com/120";
const currentFilter = ref("journal");

// 팔로우 동작
const followUser = async (user) => {
  try {
    await axios.post(`/follow?toUserSeq=${user.userSeq}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    });
    user.isFollowing = true;
  } catch (error) {
    console.error("팔로우 실패:", error);
  }
};

// 언팔로우 동작
const unfollowUser = async (user) => {
  try {
    await axios.delete(`/follow`, {
      params: { toUserSeq: user.userSeq },
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    });
    user.isFollowing = false;
  } catch (error) {
    console.error("언팔로우 실패:", error);
  }
};

// 팔로우 상태 업데이트
const updateFollow = async (user) => {
  if (user.isFollowing) {
    await unfollowUser(user);
  } else {
    await followUser(user);
  }
};

// 팔로잉 사용자 목록 가져오기
const fetchFollowingUsers = async () => {
  try {
    const response = await axios.get("/follow", {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    });

    users.value = response.data.data.map((user) => ({
      userSeq: user.userSeq,
      userName: user.userName,
      userEmail: user.userEmail,
      userPhone: user.userPhone,
      partName: user.partName,
      rankingName: user.rankingName,
      profileImage: user.profileImage || defaultImage,
      isFollowing: true,
    }));
  } catch (error) {
    console.error("팔로잉 사용자 목록 불러오기 실패:", error);
  }
};

// 페이지네이션 데이터
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return users.value.slice(start, start + itemsPerPage);
});

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page;
};

// 필터 변경
const handleFilterChange = (newFilter) => {
  currentFilter.value = newFilter;
};

// 초기 데이터 로드
onMounted(fetchFollowingUsers);
</script>

<template>
  <div class="d-flex">
    <!-- 사이드바 -->
    <Sidebar
        :currentFilter="currentFilter"
        @update:currentFilter="handleFilterChange"
        class="sidebar"
    />

    <!-- 메인 콘텐츠 -->
    <div class="content-container flex-grow-1">
      <div class="container mt-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="fw-bold">내가 팔로우한 사용자</h3>
        </div>

        <!-- 사용자 카드 -->
        <div class="row justify-content-start">
          <div
              class="col-md-6 col-lg-6 mb-4"
              v-for="user in paginatedUsers"
              :key="user.userSeq"
          >
            <div class="user-card position-relative">
              <div class="profile-image">
                <img :src="user.profileImage" alt="Profile" />
              </div>
              <div class="user-info">
                <h4>
                  {{ user.userName }}
                  <small class="text-muted">({{ user.rankingName }})</small>
                </h4>
                <p>{{ user.partName }}</p>
                <p>{{ user.userEmail }}</p>
                <p>{{ user.userPhone }}</p>
              </div>
              <!-- 팔로우 버튼 -->
              <BookmarkButton
                  :currentIsBookmark="user.isFollowing"
                  @updateBookmark="updateFollow(user)"
                  class="bookmark-button"
                  :label="user.isFollowing ? '팔로우 중' : '팔로우'"
              />
            </div>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <Pagination
            :totalData="users.length"
            :limitPage="itemsPerPage"
            :page="currentPage"
            @updatePage="changePage"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1000px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.profile-image img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ccc;
}

.bookmark-button {
  position: absolute;
  top: 10px;
  right: 10px;
}

.user-info h4 {
  font-size: 1.5rem;
  color: #333;
}

.user-info p {
  font-size: 1.1rem;
  color: #555;
}
</style>
