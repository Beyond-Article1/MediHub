<template>
  <div class="case-sharing-view">
    <div class="top">
      <h1 class="title">CASE SHARING</h1>
      <div class="search-bar-container">
        <SearchBar @sort-changed="updateSortOption" @search="handleSearch" />
      </div>
    </div>
    <LineDivider />

    <div class="main-content">
      <!-- 카테고리 선택 시 선택된 ID 전달 -->
      <CategoryList
          class="category-section"
          @category-selected="handleCategorySelected"
      />
      <!-- 선택된 카테고리를 CaseList에 전달 -->
      <CaseList
          class="case-section"
          :selectedCategory="selectedCategory"
          :sortOption="sortOption"
          :searchQuery="searchQuery"
      />
    </div>
  </div>
</template>

<script setup>
import SearchBar from '@/components/case_sharing/case_sharing/CaseSharingSearchBar.vue';
import CategoryList from '@/components/case_sharing/case_sharing/CaseSharingCategory.vue';
import CaseList from '@/components/case_sharing/case_sharing/CaseSharingList.vue';
import LineDivider from "@/components/case_sharing/case_sharing/CaseSharingLineDivider.vue";
import {ref, watch} from "vue";

const selectedCategory = ref(null); // 선택된 카테고리 ID
const sortOption = ref("latest"); // 기본 정렬 옵션
const searchQuery = ref(""); // 검색어 추가

// 카테고리 선택 시 데이터 필터링
const handleCategorySelected = (category) => {
  selectedCategory.value = category; // 객체 저장
};

const updateSortOption = (newSortOption) => {
  sortOption.value = newSortOption;
};

const handleSearch = (query) => {

  searchQuery.value = query;
};

watch([selectedCategory, sortOption, searchQuery], () => {
});
</script>

<style scoped>
.case-sharing-view {
  padding: 30px;
}

.top {
  display: flex;
  justify-content: space-between; /* 양쪽 끝으로 정렬 */
  align-items: center; /* 세로 중앙 정렬 */
  margin-bottom: 10px; /* 제목과 메인 콘텐츠 사이 여백 */
}

.title {
  font-size: 30px;
  font-weight: bold;
  margin: 0;
}

.search-bar-container {
  display: flex; /* Flex 컨테이너로 설정 */
  align-items: center; /* 세로 중앙 정렬 */
  justify-content: flex-end; /* 내부 요소를 오른쪽 정렬 */
  flex: 1; /* 남은 너비를 모두 차지 */
  margin-left: 100px; /* 제목과 검색바 사이 여백 */
}

.main-content {
  display: flex;
}

.category-section {
  width: 20%;
}

.case-section {
  margin-top: 20px;
  flex: 1;
  margin-left: 20px;
}
</style>