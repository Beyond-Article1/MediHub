<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

import router from "@/router/index.js";
import LocalDateTimeFormat from '@/components/common/LocalDateTimeFormat.vue';
import beforeBookmark from "@/assets/images/bookmark/before-bookmark.png";
import afterBookmark from "@/assets/images/bookmark/after-bookmark.png";

const route = useRoute();

const searchQuery = ref(route.params.query);
const searchCategory = ref(route.query.category);
const isSuggestionListVisible = ref(false);
const suggestionList = ref([]);
const keywordList = ref([]);
const resultList = ref([]);
const categories = [
  { label: "통합 검색", value: "all" },
  { label: "Case Sharing", value: "case_sharing" },
  { label: "Medical Life", value: "medical_life" },
  { label: "Anonymous Board", value: "anonymous_board" }
];

const performSearch = () => {

  if(searchCategory.value === "all") {

    router.push(`/search/result/all/${searchQuery.value}?category=${searchCategory.value}`);
  } else if(searchCategory.value === "case_sharing") {

    router.push(`/search/result/case_sharing/${searchQuery.value}?category=${searchCategory.value}`);
  } else if(searchCategory.value === "medical_life") {

    router.push(`/search/result/medical_life/${searchQuery.value}?category=${searchCategory.value}`);
  } else if(searchCategory.value === "anonymous_board") {

    router.push(`/search/result/anonymous_board/${searchQuery.value}?category=${searchCategory.value}`);
  }

  isSuggestionListVisible.value = false;
};

const fetchSuggestionList = async (query) => {

  if(query.length > 0) {

    try {

      const caseSharingResponse = await axios.get(`/find/caseSharing/autoComplete/${query}`);
      const medicalLifeResponse = await axios.get(`/find/medicalLife/autoComplete/${query}`);
      const anonymousBoardResponse = await axios.get(`/find/anonymousBoard/autoComplete/${query}`);

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

    suggestionList.value = [];

    isSuggestionListVisible.value = false;
  }
};

const handleInputChange = () => {

  fetchSuggestionList(searchQuery.value);

  isSuggestionListVisible.value = true;
};

const handleClickSuggestion = (suggestion) => {

  searchQuery.value = suggestion;
  isSuggestionListVisible.value = false;
};

const handleClickOutside = (event) => {

  const searchBox = document.querySelector('.search-bar');

  if(searchBox && !searchBox.contains(event.target)) isSuggestionListVisible.value = false;
};

const fetchKeywordList = async () => {

  try {

    const response = await axios.get("/keyword");

    const keywords = response.data.data.map(item => item.keywordName);

    const keywordFrequency = keywords.reduce((acc, keyword) => {

      acc[keyword] = (acc[keyword] || 0) + 1;

      return acc;
    }, {});

    keywordList.value = Object.entries(keywordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(entry => entry[0]);
  } catch(error) {

    alert("키워드 목록 불러오기 중 문제가 발생했습니다.");
  }
};

const setKeyword = (keyword) => {

  searchQuery.value = keyword;

};

const fetchSearchResultList = async () => {

  const query = route.params.query;

  try {

    const response = await axios.get(`/find/caseSharing/${query}`);

    resultList.value = response.data.data.map(cases => ({
      ...cases,
      isLiked: false,
      isBookmark: false
    }));
    await Promise.all(resultList.value.map(result => {

      return Promise.all([updateBookmarkStatus(result)]);
    }));
  } catch(error) {

    alert("검색 결과 불러오기 중 문제가 발생했습니다.");
  }
};

const sortedResultList = computed(() => {

  return resultList.value.slice(0, 5);
});

const goToList = () => {

  router.push({ name: 'CaseSharingList' });
};

const goToDetail = (id) => {

  router.push({ name: 'CaseSharingDetailView', params: { id } });
};

const toggleBookmark = async (result) => {

  const caseSharingSeq = result.caseSharingSeq;

  try {

    const response = await axios.patch(`/case_sharing/${caseSharingSeq}/bookmark`);

    result.isBookmark = response.data.data;

    alert(result.isBookmark ? '북마크가 등록되었습니다.' : '북마크가 해제되었습니다.');
  } catch(error) {

    alert('북마크 처리에 실패했습니다.');
  }
};

const updateBookmarkStatus = async (result) => {

  try {

    const response = await axios.get(`/case_sharing/${result.caseSharingSeq}/bookmark`);

    result.isBookmark = response.data?.data ?? false;
  } catch(error) {

    if (error.response && error.response.status === 404) {

      result.isBookmark = false;
    } else result.isBookmark = false;
  }
};

document.addEventListener('click', handleClickOutside);

onMounted(() => {

  fetchSearchResultList();
  fetchKeywordList();
});
</script>

<template>
  <div class="result-list-page">
    <div class="result-list-container">
      <div class="search-bar-section">
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
    </div>

    <div class="search-result-section">
      <div class="header-section">
        <h2>CASE SHARING</h2>

        <div class="header-bar"></div>
      </div>

      <div class="total-result-list">
        <p>전체 : <span class="total-result-list-highlight">{{ resultList.length }}</span>건</p>
      </div>

      <ul>
        <li class="result-item" v-for="result in sortedResultList" :key="result.id">
          <div class="result-content">
            <span
                class="result-title"
                @click="goToDetail(result.caseSharingSeq)"
                style="cursor: pointer;"
            >
              {{ result.caseSharingTitle }}
            </span>
          </div>

          <div class="keyword-list">
            <span class="keyword" v-for="(keyword, index) in (result.keywordList || []).slice(0, 2)" :key="index">
              # {{ keyword.length > 10 ? keyword.slice(0, 10) + '...' : keyword }}
            </span>
          </div>

          <span class="result-user">{{ result.caseAuthorPartName }}</span>
          <span class="result-user">{{ result.caseAuthor }} {{ result.caseAuthorRankName }}</span>

          <span class="result-date"><LocalDateTimeFormat :data="result.regDate"/></span>

          <span class="result-icons">
            <span class="bookmark-btn" @click.stop="toggleBookmark(result)">
              <img
                  :src="result.isBookmark ? afterBookmark : beforeBookmark"
                  :alt="result.isBookmark ? 'After' : 'Before'"
              />
            </span>
          </span>
        </li>
      </ul>

      <div class="more-result-list" v-if="resultList.length > 5">
        <p @click="goToList()" style="cursor: pointer;">
          + 결과 더 보기 [<span class="highlight">{{ resultList.length }}</span>건]
        </p>
        <!--        <p>CASE SHARING으로 이동하기 →</p>-->
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-list-page {
  background: linear-gradient(to bottom, #5a6fa9, #ffffff);
  min-height: 100vh; /* 화면 전체 높이를 차지하도록 설정 */
  padding: 0; /* 여백 추가 */
}

.result-list-container {
  margin: 20px auto;
  max-width: 1100px; /* 최대 너비 설정 */
  background-color: #ffffff; /* 내부 컨텐츠 배경 색상 */
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-bar-section {
  text-align: center;
  margin: 30px auto;
  padding: 20px 30px;
}

.search-bar-section p {
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

.search-result-section {
  text-align: center;
  padding: 20px 30px; /* 좌우 패딩 추가 */
  background-color: #ffffff;
  width: 100%; /* 너비를 100%로 설정 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-height: 616px;
}

.header-section {
  text-align: center;
  margin: 20px 0;
}

.header-section h2 {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
}

.header-bar {
  width: 60px; /* 바의 너비 */
  height: 4px; /* 바의 높이 */
  background-color: #1A2F69; /* 바의 색상 */
  margin: 10px auto; /* 상하 여백 및 중앙 정렬 */
}

.total-result-list {
  text-align: left; /* 왼쪽 정렬 */
  margin-bottom: 10px; /* 간격 추가 */
}

.total-result-list-highlight {
  color: #ffc653;
  font-weight: bold;
}

.result-item {
  display: flex;
  justify-content: space-between; /* 요소들을 양쪽으로 분배 */
  align-items: center;
  border-radius: 10px; /* 모서리 둥글게 */
  padding: 10px;
  border-bottom: 1px solid #eee; /* 항목 간 구분선 */
  gap: 20px; /* 전체 항목 간의 간격 조절 */
  margin-bottom: 10px; /* 항목 간 간격 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
  width: 100%; /* 가로 길이 조절 (100%로 설정하면 부모 요소의 너비를 따름) */
  height: 70px; /* 세로 길이 조절 */
}


.result-content {
  display: flex;
  flex-direction: column; /* 제목과 태그를 수직으로 정렬 */
  flex: 1; /* 남은 공간을 차지하도록 설정 */
  text-align: left; /* 왼쪽 정렬 */
  margin-right: 10px; /* 날짜와 아이콘과의 간격 조절 */
}

.result-title {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px; /* 제목과 키워드 간의 간격 추가 */
  margin-bottom: 5px; /* 제목과 키워드 간의 간격 추가 */
}

.keyword-list {
  display: flex; /* 가로 배치 */
  flex-wrap: wrap; /* 줄 바꿈 */
  gap: 5px; /* 키워드 간 간격 조절 */
}

.keyword {
  background-color: #fff0d3; /* 배경색 */
  padding: 8px 12px; /* 상하, 좌우 패딩 */
  font-size: 20px;
}

.result-user {
  font-size: 20px;
  background-color: #1A2F69;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 4px 12px;
  font-weight: bold;
  width: 180px; /* 원하는 가로 길이 설정 */
  text-align: center; /* 텍스트 중앙 정렬 */
}

.result-date {
  font-size: 14px;
  font-weight: bold;
}

.result-icons {
  display: flex; /* 플렉스 박스를 사용하여 버튼을 가로로 배치 */
  align-items: center; /* 수직 정렬 */
}

.like-btn, .bookmark-btn {
  cursor: pointer;
  margin-left: 10px; /* 버튼 간 간격 추가 */
}

.like-btn img, .bookmark-btn img {
  width: 25px; /* 아이콘 크기 조정 */
}

.more-result-list {
  text-align: right; /* 왼쪽 정렬 */
  margin-top: 60px; /* 간격 추가 */
  margin-bottom: 0; /* 간격 추가 */
}

.highlight {
  font-weight: bold;
}
</style>