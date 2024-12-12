<script setup>
import axios from "axios";
import {computed, onMounted, ref} from "vue";
import DropBox from "@/components/common/DropBox.vue";

const authStore = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMjM0NSIsInVzZXJTZXEiOjQsInVzZXJOYW1lIjoiMTIzNDUiLCJhdXRoIjpbIlVTRVIiXSwiZXhwIjoxNzM0MDAxMzc0fQ.SApTOTHaBDihNtQ9N7mJovnq4u6p3kHekX48gKi2TQfR7BOI9AT4B9BP3o0boE5AxDz3tmKYEDUziOtPLxShJQ";
const cpSearchCategoryList = ref([]);
const selectedDataList = ref([]); // 선택된 옵션을 저장할 배열
const openDropdown = ref(null); // 현재 펼쳐진 드롭박스의 인덱스를 저장

async function fetchData() {
  try {
    const response = await axios.get("http://localhost:8088/cp/cpSearchCategory/cpSearchCategoryData", {
      headers: {
        Authorization: `Bearer ${authStore}`
      }
    });

    if (response.status === 200) {
      console.log("CP 검색 카테고리 조회 성공");
      cpSearchCategoryList.value = response.data.data;
      selectedDataList.value = Array(cpSearchCategoryList.value.length).fill([]); // 각 카테고리에 대해 빈 배열로 초기화
    } else {
      console.log("CP 검색 카테고리 조회 실패");
      console.log(`http status = ` + response.status);
    }
  } catch (error) {
    console.error("예기치 못한 오류가 발생했습니다. 에러: \n", error);
  }
}

const getDropOptions = (category) => {
  return category.cpSearchCategoryDataDtoList.map(data => ({
    value: data.cpSearchCategoryDataSeq,
    text: data.cpSearchCategoryDataName
  }));
};

const toggleDropdown = (index) => {
  openDropdown.value = openDropdown.value === index ? null : index; // 클릭한 드롭박스의 인덱스 토글
};

// 선택된 모든 옵션을 통합하여 하나의 배열로 저장하는 계산된 속성
const selectedCategoyDataSeq = computed(() => {
  return selectedDataList.value.flat(); // 중첩 배열을 평탄화하여 하나의 배열로 만듭니다.
});

// 선택된 카테고리 번호와 옵션을 함께 출력하는 계산된 속성
const selectedCategoriesWithOptions = computed(() => {
  return cpSearchCategoryList.value.map((category, index) => ({
    categoryNumber: category.cpSearchCategorySeq, // 카테고리 번호
    selectedOptions: selectedDataList.value[index] // 해당 카테고리에서 선택된 옵션
  })).filter(item => item.selectedOptions.length > 0); // 선택된 옵션이 있는 카테고리만 필터링
});

// 선택된 카테고리 번호를 하나의 배열로 저장하는 계산된 속성
const selectedCategorySeq = computed(() => {
  return selectedCategoriesWithOptions.value.map(item => item.categoryNumber); // 선택된 카테고리 번호만 추출
});

// 선택된 카테고리 번호와 옵션을 하나의 배열로 저장하는 계산된 속성
const combinedSelectedData = computed(() => {
  return selectedCategoriesWithOptions.value.map(item => ({
    categoryNumber: item.categoryNumber,
    selectedOptions: item.selectedOptions
  }));
});

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div v-for="(category, index) in cpSearchCategoryList" :key="category.cpSearchCategorySeq">
      <DropBox
          :options="getDropOptions(category)"
          :label="category.cpSearchCategoryName"
          v-model="selectedDataList[index]"
          @update:isOpen="toggleDropdown(index)"
          :isOpen="openDropdown === index"
      />
    </div>
    <p>모든 선택된 옵션: {{ selectedCategoyDataSeq }}</p> <!-- 모든 선택된 옵션을 출력 -->
    <p>선택된 카테고리 번호 배열: {{ selectedCategorySeq }}</p> <!-- 선택된 카테고리 번호 배열 출력 -->
  </div>
</template>

<style scoped>
</style>
