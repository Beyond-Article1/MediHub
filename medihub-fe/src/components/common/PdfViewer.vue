<script setup>
import {onMounted, ref, watch, defineProps} from 'vue';
import axios from "axios";
import {useRoute} from "vue-router";
import * as pdfjsLib from 'pdfjs-dist';
import Button from "@/components/common/button/Button.vue";
import IconButton from "@/components/common/button/IconButton.vue";
import DropBox from "@/components/common/SingleSelectDropBox.vue";
import CpModal from "@/components/cp/CpModal.vue";

// props 정의
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

const currentPage = ref(1);
const totalPages = ref(0);
const pdfCanvas = ref(null);
const isMarkerEnabled = ref(false);
let isRendering = false;

const cpOpinionLocationList = ref([]);
const cpVersionList = ref([]);
const fetchedCpVersionList = ref([]);
const selectedCpVersion = ref('');
const isOpen = ref(false);
const isModalVisible = ref(false);
const clickedMarkerData = ref({x: null, y: null, cpOpinionLocationSeq: null}); // 기본값 설정
const existingMarkers = ref([]); // 이미 추가된 마커 목록

onMounted(async () => {
  pdfCanvas.value = document.getElementById('pdf-canvas');
  fetchCpOpinionLocationData();
  fetchCpVersion();
  pdfCanvas.value.addEventListener('click', handlePdfClick);
});

watch(() => props.pdfUrl, async (newUrl) => {
  if (newUrl) {
    currentPage.value = 1;
    await loadPage(newUrl);
    setMarkerOnPDF();
  }
});

watch(currentPage, async () => {
  if (props.pdfUrl) {
    await loadPage(props.pdfUrl);
    setMarkerOnPDF();
  }
});

// 클릭 이벤트 핸들러 정의
const handlePdfClick = (event) => {
  const rect = pdfCanvas.value.getBoundingClientRect();
  const x = event.offsetX;
  const y = event.offsetY;

  // 클릭된 위치에 마커가 이미 있는지 확인
  const isMarkerExists = existingMarkers.value.some(marker => {
    return Math.abs(marker.x - x) < 10 && Math.abs(marker.y - y) < 15; // 10px 이내에 마커가 있는지 확인
  });

  if (isMarkerExists) {
    clickedMarkerData.value = {x, y, cpOpinionLocationSeq: -1}; // 추가 데이터 설정 가능
    console.log("마커가 존재하는 위치입니다. 모달을 엽니다.");
    isModalVisible.value = true; // 모달 열기
  } else {
    if (isMarkerEnabled.value) {
      addMarker(x, y);
      existingMarkers.value.push({x, y}); // 마커 목록에 추가

      // 클릭된 마커에 대한 데이터 설정
      clickedMarkerData.value = {x, y, cpOpinionLocationSeq: -1}; // 추가 데이터 설정 가능
      isModalVisible.value = true; // 모달 열기
    }
  }
};

// isMarkerEnabled 변경 시 마커 기능 활성화
// watch(isMarkerEnabled, (newValue) => {
//   if (newValue) {
//     pdfCanvas.value.addEventListener('click', handlePdfClick);
//   } else {
//     pdfCanvas.value.removeEventListener('click', handlePdfClick);
//   }
// });

// PDF 위에 마커 마킹 함수
function setMarkerOnPDF() {
  if (cpOpinionLocationList.value.length > 0) {
    const ctx = pdfCanvas.value.getContext('2d');

    cpOpinionLocationList.value.forEach(location => {
      const {cpOpinionLocationPageNum, cpOpinionLocationX, cpOpinionLocationY} = location;

      if (cpOpinionLocationPageNum === currentPage.value) {
        const markerImage = new Image();
        markerImage.src = '/icons/marker.png';

        markerImage.onload = () => {
          const markerWidth = markerImage.width / 14;
          const markerHeight = markerImage.height / 14;

          ctx.drawImage(markerImage,
              cpOpinionLocationX - (markerWidth / 2),
              cpOpinionLocationY - (markerHeight / 2),
              markerWidth,
              markerHeight);
        };
      }
    });
  }
}

// 페이지 로드 함수
async function loadPage(pdfUrlToLoad) {
  if (!pdfUrlToLoad) {
    console.error("PDF URL이 제공되지 않았습니다.");
    return;
  }

  if (isRendering) return;

  isRendering = true;
  try {
    const pdf = await pdfjsLib.getDocument(pdfUrlToLoad).promise;
    totalPages.value = pdf.numPages;
    const page = await pdf.getPage(currentPage.value);
    const viewport = page.getViewport({scale: 1});

    pdfCanvas.value.width = viewport.width;
    pdfCanvas.value.height = viewport.height;

    const renderContext = {
      canvasContext: pdfCanvas.value.getContext('2d'),
      viewport: viewport,
    };

    await page.render(renderContext).promise;
  } catch (error) {
    console.error("PDF 로드 중 오류 발생:", error);
  } finally {
    isRendering = false;
  }
}

// 마커 추가 함수
function addMarker(x, y) {
  const markerImage = new Image();
  markerImage.src = '/icons/marker.png';

  markerImage.onload = () => {
    const ctx = pdfCanvas.value.getContext('2d');

    const markerWidth = markerImage.width / 14;
    const markerHeight = markerImage.height / 14;

    ctx.drawImage(markerImage,
        x - (markerWidth / 2),
        y - (markerHeight / 2),
        markerWidth,
        markerHeight);
  };
}

function goToPreviousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function handleMakerToggle() {
  isMarkerEnabled.value = !isMarkerEnabled.value;
}

function handleButtonClick(text) {
  console.log(`${text} 클릭`);
}

async function fetchCpOpinionLocationData() {
  try {
    const response = await axios.get(`cp/${useRoute().params.cpVersionSeq}/cpOpinionLocation`);

    if (response.status === 200) {
      cpOpinionLocationList.value = response.data.data;
    } else {
      console.log("CP 의견 위치 조회 실패");
    }
  } catch (error) {
    console.error("예기치 못한 오류가 발생했습니다. 에러: ", error);
  }
}

async function fetchCpVersion() {
  try {
    const response = await axios.get(`cp/${useRoute().params.cpVersionSeq}/cpVersion`);

    if (response.status === 200) {
      cpVersionList.value = response.data.data;
      selectedCpVersion.value = props.data.cpVersion;
      cpVersionList.value.forEach(item => {
        fetchedCpVersionList.value.push(item.cpVersion);
      });
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
    <div class="button-container">
      <template v-if="isMarkerEnabled">
        <IconButton class="mini-button active-button" iconClass="bi bi-pencil" @click="handleMakerToggle"/>
      </template>
      <template v-else>
        <IconButton class="mini-button" iconClass="bi bi-pencil" @click="handleMakerToggle"/>
      </template>
      <IconButton class="mini-button" iconClass="bi bi-file-earmark-arrow-down"
                  @click="() => handleButtonClick('button2')"/>
      <IconButton class="mini-button" iconClass="bi bi-calendar2-x"
                  @click="() => handleButtonClick('button3')"/>
      <IconButton class="mini-button" iconClass="bi bi-bookmark"
                  @click="() => handleButtonClick('button4')"/>
      <IconButton class="mini-button" iconClass="bi bi-plus-circle"
                  @click="() => handleButtonClick('button5')"/>
      <IconButton class="mini-button" iconClass="bi bi-dash-circle"
                  @click="() => handleButtonClick('button6')"/>
    </div>

    <div class="pdf-viewer-container">
      <canvas id="pdf-canvas" class="pdf-canvas"></canvas>
      <span class="pagination-container">{{ currentPage }} / {{ totalPages }}</span>
      <div class="navigation-buttons">
        <Button @click="goToPreviousPage" :isDisabled="currentPage <= 1">이전 페이지</Button>
        <Button @click="goToNextPage" :isDisabled="currentPage >= totalPages">다음 페이지</Button>
      </div>
    </div>

    <div class="dropdown-container">
      <DropBox
          :options="fetchedCpVersionList"
          :label="'다른 버전 선택'"
          :modelValue="selectedCpVersion"
          :isOpen="isOpen"
          @update:modelValue="selectedCpVersion = $event"
          @update:isOpen="isOpen = $event"
      />
    </div>

    <CpModal :isVisible="isModalVisible" @close="isModalVisible = false"
             :x="clickedMarkerData.x"
             :y="clickedMarkerData.y"
             :cpOpinionLocationSeq="clickedMarkerData.cpOpinionLocationSeq">
      <div>
        <h3>마커 정보</h3>
        <p>위치: ({{ clickedMarkerData.x }}, {{ clickedMarkerData.y }})</p>
        <p>추가적인 정보를 여기에 표시합니다.</p>
        <ul>
          <li v-for="(opinion, index) in cpOpinionLocationList" :key="index">{{ opinion }}</li>
        </ul>
      </div>
    </CpModal>
  </div>
</template>

<style scoped>
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
  justify-content: flex-start; /* 위쪽 정렬 */
  flex-grow: 1; /* 가능한 공간을 모두 차지하도록 설정 */
  position: relative; /* 드롭다운을 절대 위치로 만들기 위해 상대 위치 설정 */
  margin-left: 20px; /* 미니 버튼과의 간격 조정 */
}

.dropdown-container {
  margin: 10px 0; /* 드롭박스와 PDF 뷰어 사이의 여백 */
  z-index: 10; /* 다른 요소 위에 표시되도록 */
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

.active-button {
  background-color: var(--symbol-yellow); /* 노란색 배경 설정 */
}

.active-button:hover {
  background-color: var(--symbol-yellow); /* 호버 시 배경색을 동일하게 유지 */
  cursor: default; /* 포인터 커서로 변경하지 않음 */
}
</style>
