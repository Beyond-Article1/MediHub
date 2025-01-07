// stores/cpCategoryStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCpCategoryStore = defineStore('cpCategory', () => {
    // 상태 변수
    const cpSearchCategoryList = ref([]); // CP 검색 카테고리 리스트
    const selectedDataList = ref([]); // 선택된 카테고리 데이터 리스트

    // 액션: 카테고리 목록 설정
    function setCpSearchCategoryList(categories) {
        cpSearchCategoryList.value = categories;
        selectedDataList.value = Array(categories.length).fill([]); // 빈 배열로 초기화
    }

    // 액션: 선택된 데이터 업데이트
    function updateSelectedData(index, selectedOptions) {
        selectedDataList.value[index] = selectedOptions;
    }

    return {
        cpSearchCategoryList,
        selectedDataList,
        setCpSearchCategoryList,
        updateSelectedData,
    };
});
