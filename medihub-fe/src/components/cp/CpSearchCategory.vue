<script setup>
import axios from "axios";
import {computed, onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import {useCpCategoryStore} from "@/stores/cpCategoryStore.js";
import DropBox from "@/components/common/MultiSelectDropBox.vue";

// vue 설정 변수
const router = useRouter();
const cpCategoryStore = useCpCategoryStore(); // Pinia 스토어 인스턴스

// 데이터 저장 변수
const cpSearchCategoryList = ref([]);
const openDropdown = ref(null); // 현재 펼쳐진 드롭박스의 인덱스

// 데이터 호출 함수
async function fetchData() {
  try {
    const response = await axios.get("cp/cpSearchCategory/cpSearchCategoryData");

    if (response.status === 200) {
      console.log("CP 검색 카테고리 조회 성공");
      cpSearchCategoryList.value = response.data.data;
      cpCategoryStore.setCpSearchCategoryList(response.data.data); // 스토어에 카테고리 목록 설정
      // 각 카테고리에 대해 빈 배열로 초기화
      cpCategoryStore.selectedDataList = cpSearchCategoryList.value.map(() => ({categorySeq: null, dataSeq: []}));
    } else {
      console.log("CP 검색 카테고리 조회 실패");
      console.log(`HTTP Status: ${response.status}`);
    }
  } catch (error) {
    console.error("예기치 못한 오류가 발생했습니다. 에러: ", error);
  }
}

// 드롭 옵션을 반환하는 함수
const getDropOptions = (category) => {
  return category.cpSearchCategoryDataDtoList.map(data => ({
    value: data.cpSearchCategoryDataSeq,
    text: data.cpSearchCategoryDataName
  }));
};

// 드롭다운 토글 함수
const toggleDropdown = (index) => {
  openDropdown.value = openDropdown.value === index ? null : index; // 클릭한 드롭박스의 인덱스 토글
};

// Pinia 스토어의 selectedDataList 변경 감지
watch(() => cpCategoryStore.selectedDataList, (newValue) => {
  // console.log("Pinia의 선택된 옵션:", newValue); // Pinia 스토어에서 선택된 데이터 출력
  newValue.forEach(item => {
    // console.log("카테고리 시퀀스:", item.categorySeq); // 선택된 카테고리 시퀀스 출력
  });
}, {deep: true}); // deep: true를 사용하여 중첩 배열의 변경도 감지

// 드롭박스에서 선택된 데이터 저장
const updateSelectedData = (index, selectedValues) => {
  const categorySeq = cpSearchCategoryList.value[index].cpSearchCategorySeq; // 현재 카테고리의 시퀀스
  cpCategoryStore.selectedDataList[index] = {categorySeq, dataSeq: selectedValues}; // 카테고리 시퀀스와 선택된 데이터 시퀀스 저장
};

// CP 검색 카테고리 페이지 이동 함수
function goToSearchCategoryUpdatePage() {
  router.push({
    name: 'CpSearchCategoryDataManagementPage'
  })
}

// 컴포넌트 마운트 시 데이터 호출
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
          v-model="cpCategoryStore.selectedDataList[index].dataSeq"
          @update:isOpen="toggleDropdown(index)"
          :isOpen="openDropdown === index"
          @update:modelValue="(selectedValues) => updateSelectedData(index, selectedValues)"
      />
    </div>
    <div class="span-container" @click="goToSearchCategoryUpdatePage()">
      <span>검색 카테고리를 수정하시려면 클릭하여주세요.</span>
    </div>
  </div>
</template>

<style scoped>
.span-container {
  width: 100%; /* 부모 컨테이너의 너비에 맞춤 */
  max-width: 100%; /* 최대 너비 설정 (DropBox와 동일하게 하려면 필요) */
  display: flex;
  justify-content: flex-start; /* 텍스트를 왼쪽 정렬 */
  color: gray;
}
</style>
