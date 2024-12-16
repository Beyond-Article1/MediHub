<!-- views/CaseSharingView.vue -->
<template>
  <div class="case-sharing-view">
    <!-- 상단 제목과 검색바 -->
    <div class="top">
      <h1 class="title">CASE SHARING</h1>
      <div class="search-bar-container">
        <SearchBar />
      </div>
    </div>
    <LineDivider />

    <!-- 메인 컨텐츠 -->
    <div class="main-content">
      <CategoryList class="category-section" />
      <CaseList class="case-section" />
    </div>
  </div>
</template>

<script setup>
import SearchBar from '@/components/case_sharing/case_sharing/CaseSharingSearchBar.vue';
import CategoryList from '@/components/case_sharing/case_sharing/CaseSharingCategory.vue';
import CaseList from '@/components/case_sharing/case_sharing/CaseSharingList.vue';
import LineDivider from "@/components/case_sharing/case_sharing/CaseSharingLineDivider.vue";

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
