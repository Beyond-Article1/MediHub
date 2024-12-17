<script setup>
import {onMounted, ref, watch, defineProps} from 'vue';
import * as pdfjsLib from 'pdfjs-dist';
import {Canvas} from 'fabric';
import Button from "@/components/common/Button.vue";

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  pdfUrl: {
    type: String,
    required: true
  }
});

// Web Worker 경로 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.mjs';

const currentPage = ref(1); // 현재 페이지
const totalPages = ref(0); // 총 페이지 수
const pdfCanvas = ref(null); // PDF 캔버스 참조
let isRendering = false; // 렌더링 중 상태

// 컴포넌트가 마운트될 때 기본 PDF 페이지 로드
onMounted(async () => {
  pdfCanvas.value = document.getElementById('pdf-canvas');
});

// pdfUrl 변경 시 PDF 로드
watch(() => props.pdfUrl, async (newUrl) => {
  if (newUrl) {
    currentPage.value = 1; // 페이지 초기화
    await loadPage(newUrl); // 새로운 URL로 PDF 로드
  }
});

// currentPage 변경 시 PDF 로드
watch(currentPage, async () => {
  if (props.pdfUrl) { // pdfUrl이 유효한지 확인
    await loadPage(props.pdfUrl); // 현재 페이지에 맞는 PDF 로드
  }
});

// 페이지 로드 함수
async function loadPage(pdfUrlToLoad) {
  if (!pdfUrlToLoad) {
    console.error("PDF URL이 제공되지 않았습니다."); // URL 확인
    return;
  }

  if (isRendering) return; // 이미 렌더링 중이면 무시

  isRendering = true; // 렌더링 시작
  try {
    const pdf = await pdfjsLib.getDocument(pdfUrlToLoad).promise; // PDF 문서 가져오기
    totalPages.value = pdf.numPages; // 총 페이지 수 가져오기
    const page = await pdf.getPage(currentPage.value); // 현재 페이지 가져오기
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
  } finally {
    isRendering = false; // 렌더링 완료
  }
}

function goToPreviousPage() {
  if (currentPage.value > 1) {
    currentPage.value--; // 페이지 감소
  }
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++; // 페이지 증가
  }
}
</script>

<template>
  <div class="centered-container">
    <canvas id="pdf-canvas" class="pdf-canvas"></canvas>
    <span class="ml-2 pagination-container">{{ currentPage }} / {{ totalPages }}</span>
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
