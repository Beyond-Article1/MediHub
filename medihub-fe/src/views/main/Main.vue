<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

import router from "@/routers/index.js";
import HotContents from "@/components/main/HotContents.vue";
import MonthlyTop from "@/components/main/MonthlyTop.vue";
import NewsSection from "@/components/main/NewsSection.vue";

const searchQuery = ref("");
const searchCategory = ref("all");
const isSuggestionListVisible = ref(false);
const suggestionList = ref([]);
const keywordList = ref([]);
const categories = [
  { label: "통합 검색", value: "all" },
  { label: "Case Sharing", value: "case_sharing" },
  { label: "Medical Life", value: "medical_life" },
  { label: "Anonymous Board", value: "anonymous_board" }
];

const performSearch = () => {

  if(searchCategory.value === "all") {

    // 통합 검색 결과 페이지로 이동
    router.push(`/search/result/all/${searchQuery.value}?category=${searchCategory.value}`);
  } else if(searchCategory.value === "case_sharing") {

    // 케이스 공유 검색 결과 페이지로 이동
    router.push(`/search/result/case_sharing/${searchQuery.value}?category=${searchCategory.value}`);
  } else if(searchCategory.value === "medical_life") {

    // 메디컬 라이프 검색 결과 페이지로 이동
    router.push(`/search/result/medical_life/${searchQuery.value}?category=${searchCategory.value}`);
  } else if(searchCategory.value === "anonymous_board") {

    // 익명 게시판 검색 결과 페이지로 이동
    router.push(`/search/result/anonymous_board/${searchQuery.value}?category=${searchCategory.value}`);
  }

  // 검색 후, 자동 완성 목록 숨김
  isSuggestionListVisible.value = false;
};

const fetchSuggestionList = async (query) => {

  if(query.length > 0) {

    try {

      const caseSharingResponse = await axios.get(`/find/caseSharing/autoComplete/${query}`);
      const medicalLifeResponse = await axios.get(`/find/medicalLife/autoComplete/${query}`);
      const anonymousBoardResponse = await axios.get(`/find/anonymousBoard/autoComplete/${query}`);

      // 모든 제안 목록을 통합
      suggestionList.value = [
        ...caseSharingResponse.data.data,
        ...medicalLifeResponse.data.data,
        ...anonymousBoardResponse.data.data
      ];
      isSuggestionListVisible.value = true;
    } catch(error) {

      suggestionList.value = [];
    }
  } else {

    // 입력이 1글자 미만일 경우, 제안 초기화
    suggestionList.value = [];

    isSuggestionListVisible.value = false;
  }
};

const handleInputChange = () => {

  fetchSuggestionList(searchQuery.value);

  isSuggestionListVisible.value = true;
};

const handleClickSuggestion = (suggestion) => {

  // 클릭 된 제안어로 검색어 설정
  searchQuery.value = suggestion;
  isSuggestionListVisible.value = false;
};

// 외부 클릭 시, 제안 목록 숨김
const handleClickOutside = (event) => {

  const searchBox = document.querySelector('.search-bar');

  if(searchBox && !searchBox.contains(event.target)) isSuggestionListVisible.value = false;
};

const fetchKeywordList = async () => {

  try {

    const response = await axios.get("/keyword");

    const keywords = response.data.data.map(item => item.keywordName);

    // 키워드 출현 빈도 계산
    const keywordFrequency = keywords.reduce((acc, keyword) => {

      acc[keyword] = (acc[keyword] || 0) + 1;

      return acc;
      // 초기값을 빈 객체로 설정
    }, {});

    // 빈도수 기준으로 정렬하고, 상위 10개 키워드 추출
    keywordList.value = Object.entries(keywordFrequency)
        // 빈도수 기준 내림차순 정렬
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        // 키워드만 추출
        .map(entry => entry[0]);
  } catch(error) {

    alert("키워드 목록 불러오기 중 문제가 발생했습니다.");
  }
};

const setKeyword = (keyword) => {

  searchQuery.value = keyword;
};

// 이벤트 리스너 추가
document.addEventListener('click', handleClickOutside);

onMounted(() => {

  fetchKeywordList();
});
</script>

<template>
  <div class="main-page">
    <Header />

    <!-- 검색 영역 -->
    <div class="search-section">
      <div class="search-bar">
        <select class="search-dropdown" v-model="searchCategory">
          <option v-for="category in categories" :key="category.value" :value="category.value">
            {{ category.label }}
          </option>
        </select>

        <input
            class="search-input"
            type="text"
            v-model="searchQuery"
            placeholder="검색어를 입력하세요."
            @focus="isSuggestionListVisible = true"
            @input="handleInputChange"
        />

        <button class="search-button" @click="performSearch">검색</button>

        <ul class="suggestion-list" v-if="isSuggestionListVisible && suggestionList.length">
          <li v-for="suggestion in suggestionList" :key="suggestion" @click="handleClickSuggestion(suggestion)">
            {{ suggestion }}
          </li>
        </ul>
      </div>

      <p>추천 검색어</p>

      <div class="search-keyword-list">
        <span
            class="search-keyword"
            v-for="keyword in keywordList"
            :key="keyword"
            @click="setKeyword(keyword)"
        >
          # {{ keyword.length > 10 ? keyword.slice(0, 10) + '...' : keyword }}
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

.search-section p {
  text-align: left; /* 왼쪽 정렬 */
  margin-top: 25px;
  font-weight: bold;
}

.search-bar {
  position: relative; /* 자식 요소의 절대 위치를 위한 상대 위치 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.search-dropdown {
  padding: 10px;
  font-size: 14px;
  border: 3px solid #ffc653;
  border-radius: 5px;
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

.suggestion-list {
  text-align: left; /* 왼쪽 정렬 */
  position: absolute; /* 검색 입력창 아래에 위치 */
  top: 100%; /* 검색 입력창 바로 아래 */
  left: 177px; /* 왼쪽 정렬 */
  background-color: white;
  border: 2px solid #ffbf00;
  border-radius: 10px;
  list-style: none;
  padding: 0;
  margin: 0;
  width: calc(100% - 257px); /* 검색 입력창과 동일한 너비, 테두리 여백 고려 */
  max-height: 150px;
  overflow-y: auto;
  z-index: 1000;
  scrollbar-width: none;
}

.suggestion-list::-webkit-scrollbar {
  display: none;
}

.suggestion-list li {
  padding: 10px;
  cursor: pointer;
}

.suggestion-list li:hover {
  background-color: #f0f0f0;
}

.search-keyword-list {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
}

.search-keyword {
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.search-keyword:hover {
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