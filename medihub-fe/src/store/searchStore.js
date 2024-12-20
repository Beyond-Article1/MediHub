import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSearchStore = defineStore('search', () => {
    // 검색어 데이터
    const searchText = ref('');

    // 검색어 설정 함수
    function setSearchText(newText) {
        searchText.value = newText;
    }

    // 검색어 초기화 함수
    function clearSearchText() {
        searchText.value = '';
    }

    return {
        searchText,
        setSearchText,
        clearSearchText
    };
});
