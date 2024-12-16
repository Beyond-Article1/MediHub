<script setup>
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {useAuthStore} from "@/store/authStore.js";
import axios from "axios";
import CpLi from "@/components/cp/CpLi.vue";

const authStore = useAuthStore();
const router = useRouter();
const cpList = ref([]);

// 데이터 호출 함수
async function fetchData() {
  try {
    const response = await axios.get("cp", {
      headers: {
        Authorization: `Bearer ${authStore}`
      }
    });

    if (response.status === 200) {
      console.log("CP 리스트 조회 성공");
      cpList.value = response.data.data;
    } else {
      console.log("CP 조회 실패");
    }
  } catch (error) {
    console.error("예기치 못한 오류가 발생했습니다. 에러: \n", error);
  }
}

// CP 버전 별 페이지 이동 함수
async function moveCpVersionPage(cpVersionSeq) {
  router.push(`/cp/${cpVersionSeq}`);
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div>
      <CpLi
          v-for="cp in cpList"
          :key="cp.cpVersionSeq"
          :data="cp"
          @update="fetchData"
          @move="moveCpVersionPage"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
