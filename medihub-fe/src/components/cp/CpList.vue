<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter, useRoute} from "vue-router";
import {useCpCategoryStore} from "@/store/cpCategoryStore.js";
import axios from "axios";
import CpLi from "@/components/cp/CpLi.vue";
import CpLiInfo from "@/components/cp/CpLiInfo.vue";

// vue 설정 변수
const router = useRouter();
const route = useRoute(); // 현재 라우트 정보를 가져옴
const cpList = ref([]); // CP 리스트를 저장할 ref
const cpCategoryStore = useCpCategoryStore();

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
      console.log(`cpList.value = ${cpList.value}`);

      console.log(cpList.value);
    } else {
      console.log("CP 리스트 조회 실패");
    }
  } catch (error) {
    if(error.status === 404) {
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
  // API 호출
  fetchData();
}, {deep: true}); // deep: true를 사용하여 중첩 배열의 변경도 감지

// 컴포넌트 마운트 시 데이터 호출
onMounted(() => {
  fetchData(); // 초기 데이터 호출
});
</script>

<template>
  <div class="cp-container">
    <CpLiInfo/>
    <CpLi
        v-for="cp in cpList"
        :key="cp.cpVersionSeq"
        :data="cp"
        @update="fetchData"
        @move="moveCpVersionPage"
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
