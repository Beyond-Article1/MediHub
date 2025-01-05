<template>
  <div class="monthly-top">
    <h4>MONTHLY TOP</h4>
    <div class="top-items">
      <div v-for="(user, index) in topUsers" :key="index" class="user-item">
        <div class="profile-wrapper">
          <img :src="user.profileUrl || defaultProfileImage" alt="User profile" />
        </div>
        <div class="info">
          <!-- 이름과 랭킹 이름 함께 표시 -->
          <p class="name">{{ user.userName }} {{ user.rankingName }}</p>
          <p class="department">{{ user.partName }}</p>
          <p class="likes">좋아요 {{ user.likeNum }}개</p>
          <p class="cases">북마크 {{ user.bookmarkNum }}개</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// 기본 프로필 이미지
const defaultProfileImage = new URL("@/assets/images/doctor.png", import.meta.url).href;

// API를 통해 가져올 유저 데이터
const topUsers = ref([]);

// 컴포넌트가 마운트될 때 API 호출
onMounted(async () => {
  try {
    const response = await axios.get("/api/v1/users/top3"); // API 호출

    // API 응답 구조를 확인하고 데이터 반영
    if (response.data && response.data.success && response.data.data) {
      topUsers.value = response.data.data;
    } else {
      console.error("Unexpected API response:", response.data);
    }
  } catch (error) {
    console.error("Failed to fetch top users:", error);
  }
});
</script>

<style scoped>
.monthly-top {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #dddddd;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.top-items {
  display: flex;
  justify-content: space-around; /* 간격 균등 배치 */
  align-items: center;
  gap: 20px;
}

.user-item {
  margin-top: 20px;
  text-align: center;
  background: #ffffff;
  padding: 15px;
  border-radius: 12px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 180px; /* 고정된 넓이 */
}

.profile-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  margin: 0 auto 10px; /* 하단 여백 추가 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-item img {
  border-radius: 50%;
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.info {
  margin-top: 0px;
}

.name {
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 5px;
}

.department {
  font-size: 1em;
  color: #666;
  margin-bottom: 10px;
}

.likes,
.cases {
  font-size: 0.9em;
  color: #444;
  margin-bottom: 0px;
}
</style>
