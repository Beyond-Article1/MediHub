<template>
  <div class="main-page">
    <Header />

    <!-- 검색 영역 -->
    <div class="search-section">
      <div class="search-bar">
        <select v-model="searchCategory" class="search-dropdown">
          <option v-for="category in categories" :key="category.value" :value="category.value">
            {{ category.label }}
          </option>
        </select>
        <input
            type="text"
            class="search-input"
            v-model="searchQuery"
            placeholder="검색어를 입력하세요"
        />
        <button class="search-button" @click="performSearch">검색</button>
      </div>
      <div class="search-tags">
        <span v-for="tag in tags" :key="tag" class="search-tag" @click="setTag(tag)">
          #{{ tag }}
        </span>
      </div>
    </div>

    <!-- HOT CONTENTS -->
    <div class="content">
      <HotContents />

      <!-- MONTHLY TOP + NEWS -->
      <div class="right-column">
        <MonthlyTop />
        <NewsSection />
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from "vue";
import HotContents from "@/components/main/HotContents.vue";
import MonthlyTop from "@/components/main/MonthlyTop.vue";
import NewsSection from "@/components/main/NewsSection.vue";

const searchQuery = ref("");
const searchCategory = ref("all");
const tags = ["임상연구", "AI", "유전자", "정형외과", "서울대병원", "척추뼈", "생활습관", "스트레칭"];
const categories = [
  { label: "통합 검색", value: "all" },
  { label: "케이스 공유", value: "case_sharing" },
  { label: "뉴스", value: "news" },
  { label: "익명 게시판", value: "anonymous" },
];

const performSearch = () => {
  console.log("검색 실행:", { query: searchQuery.value, category: searchCategory.value });
};

const setTag = (tag) => {
  searchQuery.value = tag;
  console.log("태그 검색 실행:", tag);
};
</script>

<style scoped>
.main-page {
  background: linear-gradient(to bottom, #5a6fa9, #ffffff);
  padding: 0;
  min-height: 100vh;

  display: flex; /* 수직 정렬을 위한 flexbox */
  flex-direction: column; /* 세로 방향 정렬 */
  align-items: center; /* 가로 가운데 정렬 */
}

.search-section {
  text-align: center;
  margin: 30px auto;
  padding: 20px 30px; /* 좌우 패딩 추가 */
  background-color: #ffffff;
  border-radius: 15px;
  width: 1100px; /* 검색 영역 최대 너비 설정 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  max-width: 1100px;
  margin: 0 auto;
}

.search-dropdown {
  padding: 10px;
  font-size: 14px;
  border: 3px solid #ffc653;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.search-input {
  flex: 1;
  padding: 10px;
  font-size: 14px;
  border: 3px solid #ffc653;
  border-radius: 5px;
}

.search-button {
  padding: 10px 20px;
  background-color: #ffc653;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-button:hover {
  background-color: #e6b53b;
}

.search-tags {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
}

.search-tag {
  font-size: 14px;
  background-color: #f5f5f5;
  padding: 5px 10px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.search-tag:hover {
  background-color: #ffc653;
  color: white;
}

.content {
  display: grid;
  grid-template-columns: 2fr 1fr; /* 왼쪽과 오른쪽 컬럼 비율 */
  gap: 20px;
  padding: 20px;
  background: white; /* 아래는 흰색으로 처리 */
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>

