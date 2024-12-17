<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import PdfViewer from "@/components/common/PdfViewer.vue";

// 조회된 CP 정보
const cp = ref({
  cpName: '',
  cpDescription: '',
  cpViewCount: '',
  cpVersion: '',
  cpVersionDescription: '',
  createdAt: '',
  cpUrl: '',
  userName: '',
  userId: '',
  partName: '',
  isBookmarked: ''
});

// 데이터 호출 함수
async function fetchData() {
  try {
    const cpVersionSeq = useRoute().params.cpVersionSeq;
    const response = await axios.get(`cp/${cpVersionSeq}`);

    if (response.status === 200) {
      console.log("CP 조회 성공");
      cp.value = response.data.data; // API 응답에서 CP 정보를 가져옴
      console.log(cp.value);
    } else {
      console.log("CP 조회 실패");
    }
  } catch (error) {
    console.error("예기치 못한 오류가 발생했습니다. 에러: \n", error);
  }
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <PdfViewer :data="cp" :pdf-url="cp.cpUrl"/>
</template>

<style scoped>

</style>
