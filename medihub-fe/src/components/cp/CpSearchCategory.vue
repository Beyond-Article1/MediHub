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
const allSelectedOptions = computed(() => {
  return selectedDataList.value.flat(); // 중첩 배열을 평탄화하여 하나의 배열로 만듭니다.
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
    <p>선택된 옵션: {{ allSelectedOptions }}</p> <!-- 모든 선택된 옵션을 출력 -->
  </div>
</template>

<style scoped>
.dropdown-container {
  margin-bottom: 10px; /* 드롭박스 간의 간격을 조정 */
}
</style>
