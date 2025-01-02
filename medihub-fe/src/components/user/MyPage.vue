<template>
  <div class="sidebar p-3">
    <!-- 사이드바 메뉴 -->
    <router-link
        v-for="item in menuItems"
        :key="item.name"
        :to="item.path"
        class="sidebar-btn"
        :class="{ active: $route.path === item.path }"
    >
      {{ item.name }}
    </router-link>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 사이드바 메뉴 항목 정의
const menuItems = ref([
  { name: "FOLLOW MEMBER", path: "/myPage/followmember" },
  { name: "CASE SHARING", path: "/myPage/CaseSharing" },
  { name: "MEDICAL LIFE", path: "/myPage/MedicalLife" },
  { name: "ANONYMOUS BOARD", path: "/myPage/anonymousboard" },
  { name: "CP", path: "/myPage/CP" },
  { name: "JOURNAL", path: "/myPage/journal" },
]);
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 300px;
  background-color: #f8f9fa;
  border-right: 1px solid #ddd;
  padding: 10px;
}

.sidebar-btn {
  background-color: white;
  border: 1px solid #003366;
  color: #003366;
  padding: 15px 15px;
  margin-bottom: 30px;
  text-align: center;
  font-size: 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
}

.sidebar-btn.active {
  background-color: #ffc107;
  color: white;
  border-color: #ffc107;
}

.sidebar-btn:hover {
  background-color: #003366;
  color: white;
}
</style>
