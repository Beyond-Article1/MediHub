<script setup>
import axios from "axios";
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
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
    const response = await axios.get(`cp/${cpVersionSeq}`, {
      withCredentials: true, // 쿠키 허용 활성화
    });

    if (response.status === 200) {
      console.log("CP 조회 성공");
      cp.value = response.data.data; // API 응답에서 CP 정보를 가져옴
      // console.log(cp.value);
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
  <div class="container">
    <div class="pdf-viewer-container">
      <PdfViewer :data="cp" :pdf-url="cp.cpUrl"/>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center; /* 가운데 정렬 */
  align-items: flex-start; /* 세로 정렬 */
  height: 100vh; /* 전체 화면 높이 사용 */
}

.pdf-viewer-container {
  flex-grow: 1; /* PDF 뷰어가 가능한 공간을 모두 차지하도록 설정 */
  display: flex;
  justify-content: center; /* PDF 뷰어를 중앙에 배치 */
  align-items: flex-start; /* 수직 중앙 정렬 */
}
</style>
