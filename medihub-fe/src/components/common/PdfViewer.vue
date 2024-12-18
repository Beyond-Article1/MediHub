<script setup>
import {onMounted, ref, watch, defineProps} from 'vue';
import axios from "axios";
import {useRoute} from "vue-router";
import * as pdfjsLib from 'pdfjs-dist';
import Button from "@/components/common/button/Button.vue";
import IconButton from "@/components/common/button/IconButton.vue";
import DropBox from "@/components/common/DropBox.vue"; // MiniButton 임포트

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
const isMarkerEnabled = ref(false); // 마커 활성 상태
let isRendering = false; // 렌더링 중 상태

const cpOpinionLocationList = ref([]);
const cpVersionList = ref([]);

// PDF 클릭 이벤트 리스너 추가
onMounted(async () => {
  pdfCanvas.value = document.getElementById('pdf-canvas');
  // fetchCpOpinionLocationData();
  fetchCpVersion();
});

// pdfUrl 변경 시 PDF 로드
watch(() => props.pdfUrl, async (newUrl) => {
  if (newUrl) {
    currentPage.value = 1; // 페이지 초기화
    await loadPage(newUrl); // 새로운 URL로 PDF 로드
    setMarkerOnPDF();       // 마커를 마킹
  }
});

// currentPage 변경 시 PDF 로드
watch(currentPage, async () => {
  if (props.pdfUrl) { // pdfUrl이 유효한지 확인
    await loadPage(props.pdfUrl); // 현재 페이지에 맞는 PDF 로드
    setMarkerOnPDF();             // 등록된 의견 위치 확인
  }
});

// 클릭 이벤트 핸들러 정의
const handlePdfClick = (event) => {
  const rect = pdfCanvas.value.getBoundingClientRect();
  const x = event.offsetX - rect.left; // 클릭된 X 좌표
  const y = event.offsetY - rect.top; // 클릭된 Y 좌표

  addMarker(x, y);
};

// isMarkerEnabled 변경 시 마커 기능 활성화
watch(isMarkerEnabled, (newValue) => {
  console.log(`마커 기능 ${newValue ? '활성화' : '비활성화'}`);

  if (newValue) {
    // PDF 클릭 이벤트 리스너 추가
    pdfCanvas.value.addEventListener('click', handlePdfClick);
  } else {
    // 이벤트 제거
    pdfCanvas.value.removeEventListener('click', handlePdfClick);
  }
});

// PDF 위에 마커 마킹 함수
function setMarkerOnPDF() {
  // 현재 페이지와 마커 데이터가 비어 있지 않은지 확인
  if (cpOpinionLocationList.value.length > 0) {
    const ctx = pdfCanvas.value.getContext('2d'); // 캔버스의 2D 컨텍스트 가져오기

    cpOpinionLocationList.value.forEach(location => {
      const {cpOpinionLocationPageNum, cpOpinionLocationX, cpOpinionLocationY} = location;

      // 현재 페이지와 마커의 페이지 번호가 일치하는지 확인
      if (cpOpinionLocationPageNum === currentPage.value) {
        console.log("등록된 마커를 표시합니다.");
        const markerImage = new Image();
        markerImage.src = '/icons/marker.png'; // 마커 이미지 경로

        markerImage.onload = () => {
          const markerWidth = markerImage.width / 14; // 마커 크기 조정
          const markerHeight = markerImage.height / 14; // 마커 크기 조정

          // 클릭된 위치에 이미지 중심을 맞추기 위해 좌표 조정
          ctx.drawImage(markerImage,
              cpOpinionLocationX - (markerWidth / 2),
              cpOpinionLocationY - (markerHeight / 2),
              markerWidth,
              markerHeight); // 지정된 위치에 마커 이미지 추가
        };
      }
    });
  }
}

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

// 마커 추가 함수
function addMarker(x, y) {
  const markerImage = new Image();
  markerImage.src = '/icons/marker.png'; // 마커 이미지 경로

  markerImage.onload = () => {
    const ctx = pdfCanvas.value.getContext('2d');

    const markerWidth = markerImage.width / 14; // 마커 크기 조정
    const markerHeight = markerImage.height / 14; // 마커 크기 조정

    // 클릭된 위치에 이미지 중심을 맞추기 위해 좌표 조정
    ctx.drawImage(markerImage,
        x - (markerWidth / 2),
        y - (markerHeight / 2),
        markerWidth,
        markerHeight); // 클릭된 위치에 이미지 추가
  };
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

// 마커 활성 함수
function handleMakerToggle() {
  console.log("handleMakerToggle()")
  isMarkerEnabled.value = !isMarkerEnabled.value;
  console.log("isMarkerEnabled.value = " + isMarkerEnabled.value)
}

// 확인용 함수 수정해야함
function handleButtonClick(text) {
  console.log(`${text} 클릭`);
}

// 데이터 호출 함수
async function fetchCpOpinionLocationData() {
  try {
    const response = await axios.get(`cp/${useRoute().params.cpVersionSeq}/cpOpinionLocation`);

    if (response.status === 200) {
      console.log("CP 의견 위치 조회 성공");
      cpOpinionLocationList.value = response.data.data; // 데이터 저장
      console.log(cpOpinionLocationList.value);
    } else {
      console.log("CP 의견 위치 조회 실패");
    }
  } catch (error) {
    console.error("예기치 못한 오류가 발생했습니다. 에러: ", error);
  }
}

// 데이터 호출 함수
async function fetchCpVersion() {
  try {
    const response = await axios.get(`cp/${useRoute().params.cpVersionSeq}/cpVersion`);

    if (response.status === 200) {
      console.log("CP 버전 조회 성공");
      cpVersionList.value = response.data.data; // 데이터 저장
      console.log(cpVersionList.value);
    } else {
      console.log("CP 버전 조회 실패");
    }
  } catch (error) {
    console.error("예기치 못한 오류가 발생했습니다. 에러: ", error);
  }
}
</script>

<template>
  <div class="container">
    <div class="pdf-viewer-container">
      <div class="dropdown-container">
        <!--        <DropBox :options="versions" v-model="selectedVersion" @change="handleVersionChange"/>-->
      </div>
      <canvas id="pdf-canvas" class="pdf-canvas"></canvas>
      <span class="pagination-container">{{ currentPage }} / {{ totalPages }}</span>
      <div class="navigation-buttons">
        <Button @click="goToPreviousPage" :isDisabled="currentPage <= 1">이전 페이지</Button>
        <Button @click="goToNextPage" :isDisabled="currentPage >= totalPages">다음 페이지</Button>
      </div>
    </div>
    <div>
      <div class="button-container">
        <template v-if="isMarkerEnabled">
          <IconButton class="mini-button active-button" iconClass="bi bi-pencil" @click="handleMakerToggle"/>
        </template>
        <template v-else>
          <IconButton class="mini-button" iconClass="bi bi-pencil" @click="handleMakerToggle"/>
        </template>
        <IconButton class="mini-button" iconClass="bi bi-file-earmark-arrow-down"
                    :onClick="() => handleButtonClick('button2')"/>
        <IconButton class="mini-button" iconClass="bi bi-calendar2-x" :onClick="() => handleButtonClick('button3')"/>
        <IconButton class="mini-button" iconClass="bi bi-bookmark" :onClick="() => handleButtonClick('button4')"/>
        <IconButton class="mini-button" iconClass="bi bi-plus-circle" :onClick="() => handleButtonClick('button5')"/>
        <IconButton class="mini-button" iconClass="bi bi-dash-circle" :onClick="() => handleButtonClick('button6')"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dropdown-container {
  position: absolute; /* 절대 위치 지정 */
  top: 20px; /* 상단에서의 거리 */
  right: 20px; /* 오른쪽에서의 거리 */
  z-index: 10; /* 다른 요소 위에 표시되도록 */
}

.active-button {
  background-color: var(--symbol-yellow); /* 노란색 배경 설정 */
}

.active-button:hover {
  background-color: var(--symbol-yellow); /* 호버 시 배경색을 동일하게 유지 */
  cursor: default; /* 포인터 커서로 변경하지 않음 */
}

.container {
  display: flex;
  height: 100vh; /* 전체 화면 높이 사용 */
}

.button-container {
  display: flex;
  flex-direction: column; /* 버튼 세로 정렬 */
  justify-content: flex-start; /* 위쪽 정렬 */
  padding: 10px; /* 여백 추가 */
  background-color: #f8f9fa; /* 배경색 설정 */
}

.button-container .mini-button { /* MiniButton의 클래스를 지정 */
  margin-bottom: 10px; /* 버튼 간의 간격 추가 */
}

.pdf-viewer-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* 수평 중앙 정렬 */
  justify-content: center; /* 수직 중앙 정렬 */
  flex-grow: 1; /* 가능한 공간을 모두 차지하도록 설정 */
}

.pdf-canvas {
  border: 1px solid #ccc;
  width: 90%; /* 캔버스 너비를 90%로 설정 */
  max-width: 1200px; /* 최대 너비 설정 */
  height: auto; /* 높이를 자동으로 설정 */
}

.pagination-container {
  margin: 10px 0; /* 페이지 번호와 캔버스 사이의 여백 */
}

.navigation-buttons {
  display: flex; /* 버튼을 가로로 배치 */
  justify-content: center; /* 버튼을 가운데 정렬 */
  margin-top: 10px; /* 위쪽 여백 */
}
</style>
