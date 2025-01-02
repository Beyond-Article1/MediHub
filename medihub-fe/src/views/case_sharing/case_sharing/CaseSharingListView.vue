<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

import router from "@/router/index.js";
import SearchBox from '@/components/case_sharing/case_sharing/CaseSharingSearchBox.vue';
import CategoryList from '@/components/case_sharing/case_sharing/CaseSharingCategory.vue';
import CaseList from '@/components/case_sharing/case_sharing/CaseSharingList.vue';
import LineDivider from "@/components/case_sharing/case_sharing/CaseSharingLineDivider.vue";

// 선택된 카테고리 ID
const isDoctor = ref(false);
const selectedCategory = ref(null);
// 검색 결과 상태 추가
const searchResult = ref([]);
const searchQuery = ref('');
// 의사 여부를 저장할 변수
const sortOption = ref('최신순');

// isDoctor 값 가져오기
const fetchIsDoctor = async () => {

  try {

    const response = await axios.get('/v1/users/isDoctor');

    const { success, data } = response.data;

    if(success) {

      // true or false 값 저장
      isDoctor.value = data;

      console.log('isDoctor:', isDoctor.value);
    } else console.error('Failed to fetch isDoctor status');
  } catch(error) {

    console.error('Error fetching isDoctor status:', error);
  }
};

// 카테고리 선택 시, 데이터 필터링
const handleCategorySelected = (category) => {

  // 객체 전체 출력
  console.log("Selected Category:", category);

  // 객체 저장
  selectedCategory.value = category;
};

// 신규 등록 화면 이동
const goToTemplateListView = () => {

  router.push('/case_sharing/template');
};

const search = async (query) => {

  console.log(`Searching for: ${query}`);

  try {

    const response = await axios.get(`/find/caseSharing/${query}`);

    // 검색 결과를 searchResult에 저장
    searchResult.value = response.data.data;
  } catch(error) {

    console.error('Error searching:', error);

    searchResult.value = [];
  }
};

// 컴포넌트 로드 시, isDoctor 값 가져오기
onMounted(() => {

  fetchIsDoctor();
});
</script>

<template>
  <div class="case-sharing-view">
    <div class="top">
      <h1 class="title">CASE SHARING</h1>

      <SearchBox v-model="searchQuery" @search="search" />

      <button class="new-post-button" v-if="isDoctor" @click="goToTemplateListView">신규 등록</button>

      <div>
        <select class="sort-select" v-model="sortOption">
          <option value="최신순">최신순</option>

          <option value="인기순">인기순</option>
        </select>
      </div>
    </div>

    <LineDivider />

    <div class="main-content">
      <!-- 카테고리 선택 시 선택된 ID 전달 -->
      <CategoryList class="category-section" @category-selected="handleCategorySelected"/>

      <!-- 선택된 카테고리를 CaseList에 전달 -->
      <CaseList
          class="case-section"
          :selectedCategory="selectedCategory"
          :sort-option="sortOption"
          :search-result="searchResult"
      />
    </div>
  </div>
</template>

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

.sort-select,
.new-post-button {
  padding: 10px 15px;
  border: 2px solid #004080;
  color: #004080;
  background: #ffffff;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 7px;
  transition: all 0.2s ease;
  display: inline-block; /* 요소를 인라인 블록으로 설정 */
}

.sort-select:hover,
.new-post-button:hover {
  background-color: #004080;
  color: #ffffff;
}

.sort-select option {
  text-align: left; /* 드롭다운 옵션 텍스트 왼쪽 정렬 */
}

.new-post-button {
  margin-right: -110px; /* '신규 등록' 버튼 오른쪽에 20px 간격을 추가 */
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