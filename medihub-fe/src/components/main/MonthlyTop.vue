<template>
  <div class="monthly-top">
    <div class="header">
      <h4>MONTHLY TOP</h4>
      <div class="tooltip-container">
        <span class="tooltip-icon">?</span>
        <div class="tooltip-text">
          지난 한 달 동안 가장 많은 북마크와 좋아요를 받은 상위 3명의 사용자입니다.
        </div>
      </div>
    </div>
    <div class="top-items">
      <div v-for="(user, index) in topUsers" :key="index" class="user-item">
        <div class="profile-wrapper">
          <img :src="user.profileUrl || defaultProfileImage" alt="User profile" />
        </div>
        <div class="info">
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
    const response = await axios.get("/v1/users/top3"); // API 호출

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

.header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip-icon {
  font-size: 0.9em;
  color: #888;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tooltip-text {
  visibility: hidden;
  width: 300px;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 120%; /* 버튼 위에 위치하도록 설정 */
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tooltip-container:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.top-items {
  display: flex;
  justify-content: space-around;
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
  width: 180px;
}

.profile-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  margin: 0 auto 10px;
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
