<script setup>
import {onMounted, ref} from 'vue';
import * as pdfjsLib from 'pdfjs-dist';

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
    const viewport = page.getViewport({scale: 1});

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
  <div>
    <canvas id="pdf-canvas"></canvas>
    <div>
      <button @click="goToPreviousPage" :disabled="currentPage <= 1">이전 페이지</button>
      <button @click="goToNextPage" :disabled="currentPage >= totalPages">다음 페이지</button>
      <span>페이지 {{ currentPage }} / {{ totalPages }}</span>
    </div>
  </div>
</template>

<style scoped>
#pdf-canvas {
  border: 1px solid #ccc;
}
</style>