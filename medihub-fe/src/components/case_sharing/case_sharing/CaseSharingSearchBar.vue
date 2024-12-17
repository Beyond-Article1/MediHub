<!-- components/SearchBar.vue -->
<template>
  <div class="search-bar">
    <input
        type="text"
        v-model="searchQuery"
        placeholder="검색어를 입력해주세요."
    />
    <button class="search-button" @click="search">
      🔍
    </button>

    <button class="new-post-button" @click="goToTemplateListView">
      신규 등록
    </button>
    <select class="sort-select">
      <option>최신순</option>
      <option>인기순</option>
    </select>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/store/authStore';
import router from "@/router/index.js"; // Pinia 스토어 가져오기

const searchQuery = ref('');
const store = useAuthStore();

const search = () => {
  console.log(`Searching for: ${searchQuery.value}`);
};

const goToTemplateListView = () => {
  router.push('/case_sharing/template');
};
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center; /* 세로 중앙 정렬 */
  width: 100%; /* 전체 너비 */
  height: 50px; /* 높이 고정 */
}

input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 2px solid #ffbf00; /* 노란색 테두리 */
  border-radius: 5px;
  outline: none;
  font-weight: bold;
  margin-right: 10px; /* 검색 필드와 검색 버튼 사이 간격 */
}

.search-button {
  background-color: #ffbf00;
  color: white;
  padding: 8px 15px;
  cursor: pointer;
  border: 2px solid #ffbf00;
  border-radius: 5px;
  font-size: 16px;
  margin-right: 70px;
}

.sort-select {
  padding: 8px 15px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.new-post-button {
  background-color: #ffbf00;

  margin-right: 20px;
  color: white;
  border: none;
  padding: 8px 15px;
  cursor: pointer;
  border-radius: 5px;
  font-size: 16px;
}

</style>
