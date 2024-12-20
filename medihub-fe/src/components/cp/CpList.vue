<script setup>
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {useAuthStore} from "@/store/authStore.js";
import axios from "axios";
import CpLi from "@/components/cp/CpLi.vue";
import CpLiInfo from "@/components/cp/CpLiInfo.vue";

// vue 설정 변수
const router = useRouter();
const cpList = ref([]); // CP 리스트를 저장할 ref

// 데이터 호출 함수
async function fetchData() {
  try {
    const response = await axios.get("cp");

    if (response.status === 200) {
      console.log("CP 리스트 조회 성공");
      cpList.value = response.data.data; // 데이터 저장
      console.log(cpList.value);
    } else {
      console.log("CP 리스트 조회 실패");
    }
  } catch (error) {
    console.error("예기치 못한 오류가 발생했습니다. 에러: ", error);
  }
}

// CP 버전 별 페이지 이동 함수
const moveCpVersionPage = (cpVersionSeq) => {
  router.push(`/cp/${cpVersionSeq}`); // 해당 페이지로 이동
};

// 컴포넌트 마운트 시 데이터 호출
onMounted(() => {
  fetchData();
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
