<script setup>
import { onMounted, ref } from 'vue';
import * as pdfjsLib from 'pdfjs-dist';
import Button from "@/components/common/Button.vue";

// Web Worker 경로 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.mjs';

const pdfUrl = '/pdfs/tsutsugamushi_1.0.0.pdf'; // public 폴더에 위치
const currentPage = ref(1); // 현재 페이지
const totalPages = ref(0); // 총 페이지 수
const pdfCanvas = ref(null); // 캔버스 참조

onMounted(async () => {
  pdfCanvas.value = document.getElementById('pdf-canvas');
  await loadPage(currentPage.value);
});

async function loadPage(pageNumber) {
  try {
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise; // PDF 문서 가져오기
    totalPages.value = pdf.numPages; // 총 페이지 수 가져오기
    const page = await pdf.getPage(pageNumber); // 페이지 가져오기
    const viewport = page.getViewport({ scale: 1 });

    pdfCanvas.value.width = viewport.width; // 캔버스 너비 설정
    pdfCanvas.value.height = viewport.height; // 캔버스 높이 설정

    const renderContext = {
      canvasContext: pdfCanvas.value.getContext('2d'), // 2D 컨텍스트 가져오기
      viewport: viewport, // 뷰포트 설정
    };

    await page.render(renderContext).promise; // 페이지 렌더링
  } catch (error) {
    console.error("PDF 로드 중 오류 발생:", error);
  }
}

function goToPreviousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadPage(currentPage.value);
  }
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    loadPage(currentPage.value);
  }
}
</script>

<template>
  <div class="centered-container">
    <canvas id="pdf-canvas" class="pdf-canvas"></canvas>
    <span class="ml-2 pagination-container"> {{ currentPage }} / {{ totalPages }}</span>
    <div class="mt-3 button-container">
      <Button @click="goToPreviousPage" :isDisabled="currentPage <= 1">이전 페이지</Button>
      <Button @click="goToNextPage" :isDisabled="currentPage >= totalPages">다음 페이지</Button>
    </div>
  </div>
</template>

<style scoped>
.centered-container {
  display: flex;
  flex-direction: column; /* 세로 정렬 */
  align-items: center; /* 가로 가운데 정렬 */
  justify-content: center; /* 세로 가운데 정렬 */
  height: 100vh; /* 화면 높이 전체 사용 */
  overflow-y: auto; /* 세로 방향 스크롤 허용 */
}

.pdf-canvas {
  border: 1px solid #ccc;
  width: 90%; /* 캔버스 너비를 90%로 설정 */
  max-width: 1200px; /* 최대 너비 설정 */
  height: auto; /* 높이를 자동으로 설정 */
}

.button-container {
  display: flex; /* 버튼을 가로로 배치 */
  justify-content: center; /* 버튼을 가운데 정렬 */
  margin-top: 10px; /* 위쪽 여백 */
}

.pagination-container {
  margin-top: 2%;
}
</style>
