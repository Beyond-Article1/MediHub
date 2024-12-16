<script setup>
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import axios from "axios";
import CpLi from "@/components/cp/CpLi.vue";

const authStore = "your_auth_token"; // 실제 인증 토큰으로 대체
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

// 북마크 토글 처리 함수
async function toggleBookmark(cpVersionSeq) {
  try {
    const response = await axios.post(`cp/bookmark/${cpVersionSeq}`, {}, {
      headers: {
        Authorization: `Bearer ${authStore}`
      }
    });

    if (response.status === 200) {
      console.log("북마크 토글 성공");
      await fetchData(); // 데이터를 새로고침하여 UI 업데이트
    } else {
      console.log("북마크 토글 실패");
    }
  } catch (error) {
    console.error("북마크 요청 중 오류 발생: ", error);
  }
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
          @toggle-bookmark="toggleBookmark"
          @move="moveCpVersionPage"
      />
    </div>
  </div>
</template>

<style scoped>
/* 스타일 추가 */
</style>
