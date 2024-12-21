<script setup>
import {onMounted, ref, watch, defineProps} from 'vue';
import {useRoute} from "vue-router";

import axios from "axios";
import * as pdfjsLib from 'pdfjs-dist';

import Button from "@/components/common/button/Button.vue";
import IconButton from "@/components/common/button/IconButton.vue";
import DropBox from "@/components/common/SingleSelectDropBox.vue";
import CpModal from "@/components/cp/CpModal.vue";

// vue 설정 변수
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
const route = useRoute();

// PDF 관련 변수
const currentPage = ref(1);           // 현재 페이지
const totalPages = ref(0);            // 전체 페이지
const pdfCanvas = ref(null);          // PDF 뷰어
const isMarkerEnabled = ref(false);   // 마커 기능 활성 상태
let isRendering = false;                    // 렌더링 상태
const clickedMarkerData = ref({x: null, y: null, cpOpinionLocationSeq: null}); // 기본값 설정
const existingMarkers = ref([]); // 이미 추가된 마커 목록

// DB 조회 정보 변수
const cpOpinionLocationList = ref([]);    // 위치 정보
const objectCpVersionList = ref([]);      // 버전 정보
const varCpVersionList = ref([]);         // cpVersionList 객체어서 버전 정보만 저장한 리스트
const selectedCpVersion = ref('');        // 선택된 버전 정보

// 모달 관련 변수
const isOpen = ref(false);
const isModalVisible = ref(false);

// 상수
const MARKER_CHECK_RADIUS = 30;   // 주변 마커 감지 거리
const MARKER_SCALE_FACTOR = 14;   // 마커의 크기를 조졀할 때 사용

// Web Worker 경로 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.mjs';

// 마운트 시, 실행 함수
onMounted(async () => {
  pdfCanvas.value = document.getElementById('pdf-canvas');
  fetchCpOpinionLocationData();
  fetchCpVersion();
  pdfCanvas.value.addEventListener('click', handlePdfClick);
});

// 부모 컴포넌트에서 PDF url 전달하는 정보 감시
watch(() => props.pdfUrl, async (newUrl) => {
  if (newUrl) {
    currentPage.value = 1;
    await loadPage(newUrl);
    setMarkerOnPDF();
  }
});

// 페이지 변화 감시
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
  const existingMarker = cpOpinionLocationList.value.find(marker => {
    // console.log(`marker.cpOpinionLocationX = ${marker.cpOpinionLocationX}`);
    // console.log(`x = ${x}`);
    // console.log(`marker.cpOpinionLocationY = ${marker.cpOpinionLocationY}`);
    // console.log(`y = ${y}`);
    return Math.abs(marker.cpOpinionLocationX - x) < MARKER_CHECK_RADIUS && Math.abs(marker.cpOpinionLocationY - y) < MARKER_CHECK_RADIUS;
  });

  if (existingMarker) {
    // 기존 마커 정보를 가져옴
    console.log("기존 위치에 마커가 존재합니다.");

    const markerData = existingMarker; // 기존 마커 데이터
    console.log(markerData.cpOpinionLocationSeq);
    clickedMarkerData.value = {
      x,
      y,
      cpOpinionLocationSeq: markerData.cpOpinionLocationSeq // 기존 값으로 설정
    };
    console.log("마커가 존재하는 위치입니다. 모달을 엽니다.");
    isModalVisible.value = true; // 모달 열기
  } else {
    console.log("새로운 위치 입니다.");

    if (isMarkerEnabled.value) {
      addMarker(x, y);
      // 클릭된 마커에 대한 데이터 설정
      clickedMarkerData.value = {x, y, cpOpinionLocationSeq: -1}; // 추가 데이터 설정 가능
      isModalVisible.value = true; // 모달 열기
    }
  }
};

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
          const markerWidth = markerImage.width / MARKER_SCALE_FACTOR;
          const markerHeight = markerImage.height / MARKER_SCALE_FACTOR;

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
    const viewport = page.getViewport({scale: 1.14});

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

  const markerWidth = markerImage.width / MARKER_SCALE_FACTOR;
  const markerHeight = markerImage.height / MARKER_SCALE_FACTOR;

  markerImage.onload = () => {
    const ctx = pdfCanvas.value.getContext('2d');

    ctx.drawImage(markerImage,
        x - (markerWidth / 2),
        y - (markerHeight / 2),
        markerWidth,
        markerHeight
    );
  };

  const newPosition = {
    cpVersionSeq: route.params.cpVersionSeq,
    cpOpinionLocationSeq: -1,
    cpOpinionLocationPageNum: currentPage.value,
    cpOpinionLocationX: x - (markerWidth / 2),
    cpOpinionLocationY: y - (markerHeight / 2)
  };

  existingMarkers.value.push(newPosition);
  console.log("추가됨");
  console.log(existingMarkers.value);
}

// PDF 이전 페이지 이동 함수
function goToPreviousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

// DPF 이후 페이지 이동 함수
function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

// 마커 활성 변환 함수
function handleMakerToggle() {
  isMarkerEnabled.value = !isMarkerEnabled.value;
}

// 클릭 여부 확인 함수
function handleButtonClick(text) {
  console.log(`${text} 클릭`);
}

// 위치 정보 호출 함수
async function fetchCpOpinionLocationData() {
  try {
    const response = await axios.get(`cp/${useRoute().params.cpVersionSeq}/cpOpinionLocation`);

    if (response.status === 200) {
      cpOpinionLocationList.value = response.data.data;
      console.log("위치 조회 성공");
      console.log(cpOpinionLocationList.value);
      console.log("존재하는 위치 리스트 정보");
      existingMarkers.value = cpOpinionLocationList.value;
      console.log(existingMarkers.value);
    } else {
      console.log("CP 의견 위치 조회 실패");
    }
  } catch (error) {
    console.error("예기치 못한 오류가 발생했습니다. 에러: ", error);
  }
}

// 버전 정보 호출 함수
async function fetchCpVersion() {
  try {
    const response = await axios.get(`cp/${useRoute().params.cpVersionSeq}/cpVersion`);

    if (response.status === 200) {
      objectCpVersionList.value = response.data.data;
      selectedCpVersion.value = props.data.cpVersion;
      objectCpVersionList.value.forEach(item => {
        varCpVersionList.value.push(item.cpVersion);
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
          :options="varCpVersionList"
          :label="'다른 버전 선택'"
          :modelValue="selectedCpVersion"
          :isOpen="isOpen"
          @update:modelValue="selectedCpVersion = $event"
          @update:isOpen="isOpen = $event"
      />
    </div>

    <CpModal :isVisible="isModalVisible" @close="isModalVisible = false"
             :page-num="currentPage"
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
