<script setup>
import { ref, defineEmits } from 'vue';
import axios from 'axios';

const props = defineProps({

  // 부모에서 전달 받는 검색어
  modelValue: String
});

const emit = defineEmits(['update:modelValue', 'search']);

// 로컬 상태로 검색어 관리
const searchQuery = ref(props.modelValue);
// 자동 완성 제안 목록
const suggestions = ref([]);
// 자동 완성 목록 표시 여부
const isSuggestionsVisible = ref(false);

const onSearch = () => {

  // 부모에게 검색어 전달
  emit('search', searchQuery.value);
  // 부모에 검색어 업데이트
  emit('update:modelValue', searchQuery.value);

  // 검색 후, 자동 완성 목록 숨김
  isSuggestionsVisible.value = false;
};

// 검색어 변경 시, 자동 완성 목록 갱신
const fetchSuggestions = async (query) => {

  if(query.length > 0) {

    try {

      const response = await axios.get(`/find/caseSharing/autoComplete/${query}`);

      // 자동 완성 제안 저장
      suggestions.value = response.data.data;
      // 제안 목록 표시
      isSuggestionsVisible.value = true;
    } catch(error) {

      suggestions.value = [];
    }
  } else {

    // 입력이 1글자 미만일 경우 제안 초기화
    suggestions.value = [];
    // 제안 목록 숨김
    isSuggestionsVisible.value = false;
  }
};

// 입력 변경 시, 자동 완성 목록 갱신
const handleInputChange = () => {

  fetchSuggestions(searchQuery.value);

  // 입력 시, 자동 완성 목록 표시
  isSuggestionsVisible.value = true;
};

// 제안 항목 클릭 시, 자동 완성 목록 숨기기
const handleClickSuggestion = (suggestion) => {

  // 클릭된 제안어로 검색어 설정
  searchQuery.value = suggestion;
  // 자동 완성 목록 숨기기
  isSuggestionsVisible.value = false;
};

// 클릭 이벤트 처리
const handleClickOutside = (event) => {

  const searchBox = document.querySelector('.search-bar');

  // 외부 클릭 시 제안 목록 숨김
  if(searchBox && !searchBox.contains(event.target)) isSuggestionsVisible.value = false;
};

// 이벤트 리스너 추가
document.addEventListener('click', handleClickOutside);
</script>

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
          v-for="suggestion in suggestions"
          :key="suggestion"
          @click="handleClickSuggestion(suggestion)"
      >
        {{ suggestion }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  width: 50%;
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

/* Chrome, Safari, Edge에서 스크롤바 숨기기 */
.suggestions-list::-webkit-scrollbar {
  display: none;
}

.suggestions-list li {
  padding: 10px;
  cursor: pointer;
}

.suggestions-list li:hover {
  background-color: #f0f0f0;
}
</style>