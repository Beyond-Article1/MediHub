<template>
  <div class="search-bar">
    <input
        class="search-input"
        type="text"
        v-model="searchQuery"
        placeholder="검색어를 입력해 주세요."
        @focus="isSuggestionsVisible = true"
        @input="handleInputChange"
    />

    <button class="search-button" @click="onSearch">🔍</button>

    <ul class="suggestions-list" v-if="isSuggestionsVisible && suggestions.length">
      <li
          v-for="(suggestion, index) in suggestions"
          :key="suggestion + index"
          @click="handleClickSuggestion(suggestion)"
      >
        {{ suggestion }}
      </li>
    </ul>
  </div>

  <div class="button-container">
    <!-- 신규 등록 버튼: isDoctor가 true일 때만 표시 -->
    <button
        class="new-post-button"
        v-if="isDoctor"
        @click="goToTemplateListView"
    >
      신규 등록
    </button>

    <select class="sort-select" @change="updateSortOption">
      <option value="latest">최신순</option>
      <option value="views">조회순</option>
    </select>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import router from "@/routers/index.js";
import axios from 'axios';

const props = defineProps({

  // 부모에서 전달 받는 검색어
  modelValue: String
});

const emit = defineEmits(["sort-changed", "update:modelValue", "search"]);

const searchQuery = ref(props.modelValue);
const isDoctor = ref(false); // 의사 여부를 저장할 변수
const store = useAuthStore();
const suggestions = ref([]); // 자동 완성 제안 목록
const isSuggestionsVisible = ref(false); // 자동 완성 목록 표시 여부
const sortOption = ref("latest"); // 기본 정렬 옵션

// 검색 버튼 기능
const onSearch = () => {

  emit('search', searchQuery.value);

  isSuggestionsVisible.value = false;
};

// 신규 등록 화면 이동
const goToTemplateListView = () => {
  router.push('/case_sharing/template');
};

// isDoctor 값 가져오기
const fetchIsDoctor = async () => {
  try {
    const response = await axios.get('/v1/users/isDoctor', {
      headers: {
        Authorization: `Bearer ${store.accessToken}`, // 인증 토큰 추가
      },
    });
    const { success, data } = response.data;

    if (success) {
      isDoctor.value = data; // true/false 값 저장
    } else {
      console.error('doctor 여부 fetch 실패');
    }
  } catch (error) {
    console.error('doctor 여부 fetch 실패:', error);
  }
};

// 검색어를 가져와 자동 완성 목록 갱신
const fetchSuggestions = async (query) => {

  if(query && query.length > 0) {

    try {

      const response = await axios.get(`/find/caseSharing/autoComplete/${query}`);

      suggestions.value = response.data.data;
      isSuggestionsVisible.value = true;
    } catch(error) {

      suggestions.value = [];
    }
  } else {

    suggestions.value = [];
    isSuggestionsVisible.value = false;
  }
};

// 검색어 변경 시, 자동 완성 목록 갱신
const handleInputChange = () => {

  // searchQuery.value가 존재할 때만 fetchSuggestions 호출
  if(searchQuery.value !== undefined) {

    fetchSuggestions(searchQuery.value);

    isSuggestionsVisible.value = true;
  }
};

// 제안 항목 클릭 시, 자동 완성 목록 숨기기
const handleClickSuggestion = (suggestion) => {

  // 클릭된 제안어로 검색어 설정
  searchQuery.value = suggestion;
  isSuggestionsVisible.value = false;
};

// 클릭 이벤트 처리
const handleClickOutside = (event) => {

  const searchBox = document.querySelector('.search-bar');

  if(searchBox && !searchBox.contains(event.target)) isSuggestionsVisible.value = false;
};

const updateSortOption = (event) => {
  // 이벤트 객체에서 값 추출
  const selectedOption = event.target.value; // 선택된 옵션 값

  // 부모 컴포넌트로 정렬 옵션 전달
  emit("sort-changed", selectedOption);
};

// 이벤트 리스너 추가
document.addEventListener('click', handleClickOutside);

// searchQuery가 변경될 때마다 부모에게 업데이트
watch(searchQuery, (newValue) => {

  emit('update:modelValue', newValue);
});

// 컴포넌트 로드 시 isDoctor 값 가져오기
onMounted(() => {
  searchQuery.value = props.modelValue;
  fetchIsDoctor();
});
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  width: 100%;
  height: 50px;
  border: 2px solid #ffbf00;
  border-radius: 10px;
  padding: 0 10px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 그림자 효과 추가 */
  position: relative; /* 부모 요소에 상대 위치 설정 */
}

.search-input {
  flex: 1;
  padding: 10px;
  border: none; /* 테두리 제거 */
  outline: none; /* 포커스 시 테두리 제거 */
  font-size: 16px;
  color: #999; /* 글자색 */
}

.search-input::placeholder {
  color: #999; /* 플레이스홀더 색상 */
}

.search-button {
  background-color: white; /* 배경색 */
  border: none; /* 테두리 제거 */
  border-radius: 5px; /* 둥글게 */
  padding: 8px; /* 패딩 추가 */
  cursor: pointer; /* 포인터 커서 */
}

.suggestions-list {
  position: absolute; /* 절대 위치 설정 */
  top: 100%; /* 검색 입력 창 바로 아래에 위치 */
  left: 0;
  background-color: white;
  border: 2px solid #ffbf00; /* 검색 창과 동일한 테두리 색상과 두께 */
  border-radius: 10px; /* 검색 창과 동일한 둥글기 */
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%; /* 입력창 너비와 같게 설정 */
  max-height: 150px;
  overflow-y: auto; /* 세로로 스크롤 가능 */
  z-index: 1000;
  scrollbar-width: none; /* Firefox에서 스크롤바 숨기기 */
}

.suggestions-list::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge에서 스크롤바 숨기기 */
}

.suggestions-list li {
  padding: 10px;
  cursor: pointer;
}

.suggestions-list li:hover {
  background-color: #f0f0f0;
}

.button-container {
  display: flex; /* Flexbox 사용 */
  align-items: center; /* 수직 중앙 정렬 */
  margin-top: 10px; /* 상단 여백 추가 */
}

.new-post-button {
  background-color: #ffbf00;
  margin-left: 40px;
  margin-top: 2px; /* 상단 여백 추가 */
  margin-bottom: 10px; /* 하단 여백 추가 */
  color: white;
  border: none;
  padding: 8px 15px;
  cursor: pointer;
  border-radius: 5px;
  font-size: 16px;
  height: 40px; /* 버튼 높이 설정 */
  width: 100px; /* 원하는 가로 길이 설정 */
}

.sort-select {
  padding: 8px 15px; /* 드롭다운 패딩 */
  margin: 2px 10px 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  height: 40px; /* 드롭다운 높이를 버튼과 맞춤 */
}
</style>