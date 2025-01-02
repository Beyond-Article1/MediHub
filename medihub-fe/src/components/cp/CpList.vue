<script setup>
import { onMounted, ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useCpCategoryStore } from "@/store/cpCategoryStore.js";
import axios from "axios";
import CpLi from "@/components/cp/CpLi.vue";
import CpLiInfo from "@/components/cp/CpLiInfo.vue";
import Pagination from "@/components/common/Pagination.vue";

// vue 설정 변수
const router = useRouter();
const cpList = ref([]); // CP 리스트를 저장할 ref
const cpCategoryStore = useCpCategoryStore();
const currentPage = ref(1); // 현재 페이지
const limitPage = ref(10); // 한 페이지에 보여줄 데이터 개수

// 데이터 호출 함수
async function fetchData() {
  console.log("데이터 호출 함수 실행");
  try {
    const selectedCategories = cpCategoryStore.selectedDataList.filter(item => item.categorySeq !== null);

    // 카테고리 시퀀스와 데이터 시퀀스를 추출
    const cpSearchCategorySeq = selectedCategories.map(item => item.categorySeq).join(',');
    const cpSearchCategoryData = selectedCategories.flatMap(item => item.dataSeq).join(',');

    let url;

    console.log("피니아 저장 길이: ", selectedCategories.length);
    // 저장된 값이 없을 경우 기본 cp 요청
    if (selectedCategories.length === 0) {
      url = "cp"; // 전체 데이터 요청
    } else if (cpSearchCategorySeq && cpSearchCategoryData) {
      url = `cp?cpSearchCategorySeq=${cpSearchCategorySeq}&cpSearchCategoryData=${cpSearchCategoryData}`;
    } else {
      url = "cp"; // 기본 요청
    }

    console.log("요청 url: ", url);

    // API 호출
    const response = await axios.get(url);

    if (response.status === 200) {
      console.log("CP 리스트 조회 성공");
      console.log("응답 데이터:", response.data.data); // 응답 데이터 확인

      cpList.value = response.data.data;
      // console.log(`cpList.value = ${cpList.value}`);

      // console.log(cpList.value);
    } else {
      console.log("CP 리스트 조회 실패");
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("조회 결과가 없습니다.");
      cpList.value = [];
    }
  }
}

// CP 버전 별 페이지 이동 함수
const moveCpVersionPage = (cpVersionSeq) => {
  router.push(`/cp/${cpVersionSeq}`); // 해당 페이지로 이동
};

// Pinia 스토어의 selectedDataList 변경 감시 및 API 호출
watch(() => cpCategoryStore.selectedDataList, (newValue) => {
  console.log("Pinia의 selectedDataList가 변경되었습니다:", newValue);
  fetchData(); // API 호출
}, {deep: true}); // deep: true를 사용하여 중첩 배열의 변경도 감지

// 컴포넌트 마운트 시 데이터 호출
onMounted(() => {
  fetchData(); // 초기 데이터 호출
});

// 페이지 변경 핸들러
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchData(); // 페이지가 변경될 때 데이터 다시 호출
};

// 페이지네이션을 위한 전체 데이터 개수 계산
const totalData = computed(() => cpList.value.length); // 전체 데이터 개수
</script>

<template>
  <div class="cp-container">
    <CpLiInfo/>
    <CpLi
        v-for="cp in cpList.slice((currentPage - 1) * limitPage, currentPage * limitPage)"
        :key="cp.cpVersionSeq"
        :data="cp"
        @update="fetchData"
        @move="moveCpVersionPage"
    />
    <Pagination
        :totalData="totalData"
        :limitPage="limitPage"
        :page="currentPage"
        @updatePage="handlePageChange"
    />
  </div>
</template>

<style scoped>
.cp-container {
  display: flex;
  flex-direction: column; /* 자식 요소를 세로로 배치 */
  align-items: stretch; /* 자식 요소가 부모 요소의 너비를 채우도록 */
  width: 100%; /* 부모 요소의 너비를 100%로 설정 */
}
</style>
