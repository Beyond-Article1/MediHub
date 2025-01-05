<script setup>
import {onMounted, ref, watch, defineProps} from 'vue';
import {useRoute, useRouter} from "vue-router";
import axios from "axios";
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.js?url';

import Button from "@/components/common/button/Button.vue";
import IconButton from "@/components/common/button/IconButton.vue";
import DropBox from "@/components/common/SingleSelectDropBox.vue" ;
import CpModal from "@/components/cp/CpModal.vue";

// pdfjs-dist 모듈 경로 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

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
const router = useRouter();

// PDF 관련 변수
const currentPage = ref(1); // 현재 보고 있는 페이지 번호
const totalPages = ref(0); // PDF 문서의 총 페이지 수
const pdfCanvas = ref(null); // PDF를 렌더링할 HTML Canvas 요소에 대한 참조
let isRendering = false; // PDF 페이지 렌더링 중인지 여부를 표시하는 플래그

// 마커 관련 변수
const isMarkerEnabled = ref(false); // 마커 추가 기능의 활성화 여부
const clickedMarkerData = ref({x: null, y: null, cpOpinionLocationSeq: null}); // 클릭한 마커의 위치 및 정보
const existingMarkers = ref([]); // 기존 마커 정보를 저장하는 배열
const isMarkerVisible = ref(true); // 마커의 표시 여부
const MARKER_CHECK_RADIUS = 30; // 마커 클릭 감지 반경
const MARKER_SCALE_FACTOR = 14; // 마커 이미지 크기 조정 비율

// CP 관련 변수
const cpOpinionLocationList = ref([]); // CP 의견 위치 목록
const objectCpVersionList = ref([]); // CP 버전 목록
const varCpVersionList = ref([]); // 선택 가능한 CP 버전 목록
const selectedCpVersion = ref(''); // 현재 선택된 CP 버전

// UI 관련 변수
const isOpen = ref(false); // 드롭다운 또는 모달의 열림 여부
const isModalVisible = ref(false); // 마커 정보 모달의 표시 여부

// 캔버스 크기 설정
const CANVAS_WIDTH = 1000; // 캔버스의 너비
const CANVAS_HEIGHT = 620; // 캔버스의 높이

// 마운트 시점 실행 함수
onMounted(async () => {
  pdfCanvas.value = document.getElementById('pdf-canvas');
  await fetchCpOpinionLocationData(null);
  await fetchCpVersion();
  pdfCanvas.value.addEventListener('click', handlePdfClick);
});

// 부모 컴포넌트에서 PDF url 전달하는 정보 감시
watch(() => props.pdfUrl, async (newUrl) => {
  if (newUrl) {
    await fetchCpOpinionLocationData(props.data.cpVersionSeq);
    currentPage.value = 1;
    await loadPage(newUrl);
    await setMarkerOnPDF();
  }
});

// 페이지 변화 감시
watch(currentPage, async () => {
  if (props.pdfUrl) {
    await loadPage(props.pdfUrl);
    await setMarkerOnPDF();
    // console.log("존재하는 마커");
    // console.log(existingMarkers.value);
  }
});

// 버전 변화 감지
watch(selectedCpVersion, async () => {
  console.log("버전 변화 감지");
  try {
    const response = await axios.get(`/cp/${route.params.cpVersionSeq}?cpVersion=${selectedCpVersion.value}`)

    if (response.status === 200) {
      console.log(response.data.data);
      currentPage.value = 1;
      const newUrl = response.data.data.cpUrl;
      await fetchCpOpinionLocationData(response.data.data.cpVersionSeq);
      await loadPage(newUrl);
      await setMarkerOnPDF();
    }
  } catch (error) {
    console.error("다른 버전 조회 시 에러 발생");
  }
})

// 마커 시각화 변화 감지
watch(isMarkerVisible, (newValue) => {
  if (newValue) {
    console.log("마커가 표시됩니다.");
    // 마커를 보이게 하는 로직을 추가합니다.
    setMarkerOnPDF(); // 마커를 PDF에 다시 그립니다.
  } else {
    console.log("마커가 숨겨집니다.");
    // 마커를 숨기는 로직을 추가합니다.
    const ctx = pdfCanvas.value.getContext('2d');
    ctx.clearRect(0, 0, pdfCanvas.value.width, pdfCanvas.value.height); // 캔버스를 지웁니다.
    loadPage(props.pdfUrl); // 페이지를 다시 로드하여 마커를 지웁니다.
  }
});

// PDF 클릭 핸들링 함수
const handlePdfClick = (event) => {
  const x = event.offsetX;
  const y = event.offsetY;

  const existingMarker = existingMarkers.value.find(marker => {
    // console.log(`clicked pos x = ${x}`);
    // console.log(`existingMarker's x = ${marker.cpOpinionLocationX}`);
    // console.log(`clicked pos y = ${y}`);
    // console.log(`existingMarker's y = ${marker.cpOpinionLocationY}`);
    //
    // console.log("x 좌표 검사: ", Math.abs(marker.cpOpinionLocationX - x));
    // console.log("y 좌표 검사: ", Math.abs(marker.cpOpinionLocationY - y));
    return Math.abs(marker.cpOpinionLocationX - x) < MARKER_CHECK_RADIUS
        && Math.abs(marker.cpOpinionLocationY - y) < MARKER_CHECK_RADIUS;
  });

  if (existingMarker) {
    console.log("기존 위치에 마커가 존재합니다.");
    console.log(`cpOpinionLocationSeq = ${existingMarker.cpOpinionLocationSeq}`);
    clickedMarkerData.value = {
      x,
      y,
      cpOpinionLocationSeq: existingMarker.cpOpinionLocationSeq
    };
    isModalVisible.value = true; // 모달 열기
  } else {
    if (isMarkerEnabled.value === true) {
      console.log("새로운 위치 입니다.");
      addMarker(x, y);
      clickedMarkerData.value = {x, y, cpOpinionLocationSeq: -1};
      console.log(clickedMarkerData.value);
      isModalVisible.value = true; // 모달 열기
    }
  }
};

// 저장된 마커 위치 설정 함수
async function setMarkerOnPDF() {
  console.log("마커 설정 함수 실행");
  // console.log(cpOpinionLocationList.value.length > 0);
  if (cpOpinionLocationList.value.length > 0) {
    const ctx = pdfCanvas.value.getContext('2d'); // 2D 컨텍스트 가져오기
    for (const location of cpOpinionLocationList.value) {
      const {cpOpinionLocationSeq, cpOpinionLocationPageNum, cpOpinionLocationX, cpOpinionLocationY} = location;

      console.log(`${cpOpinionLocationSeq}의 의견 조회`);

      // 해당 위치에 CP 의견의 존재 여부를 확인하고 없으면 해당 위치를 삭제한다.
      const exists = await checkCpOpinionExistsByLocationSeq(cpOpinionLocationSeq);
      console.log(`의견 존재 여부: ${exists}`);
      if (!exists) {
        await deleteCpOpinionLocation(cpOpinionLocationSeq); // 삭제 요청
        existingMarkers.value = existingMarkers.value.filter(marker => marker.cpOpinionLocationSeq !== cpOpinionLocationSeq); // 해당 값을 기억하지 않는다.
        continue; // 현재 반복을 종료하고 다음 위치로 넘어감
      }

      // 현재 페이지와 일치하는 경우에만 마커 그리기
      if (cpOpinionLocationPageNum === currentPage.value) {
        const markerImage = new Image(); // 마커 이미지 객체 생성
        markerImage.src = '/icons/marker.png'; // 이미지 소스 설정
        markerImage.onload = () => { // 이미지 로드 후 실행
          const markerWidth = markerImage.width / MARKER_SCALE_FACTOR; // 마커 너비 조정
          const markerHeight = markerImage.height / MARKER_SCALE_FACTOR; // 마커 높이 조정
          ctx.drawImage(markerImage,
              cpOpinionLocationX - (markerWidth / 2), // 중앙 정렬을 위한 X 좌표 조정
              cpOpinionLocationY - (markerHeight / 2), // 중앙 정렬을 위한 Y 좌표 조정
              markerWidth, // 그릴 마커의 너비
              markerHeight // 그릴 마커의 높이
          );
        };
      }
    }
  }
}

// CP 의견 위치에 CP 의견이 존재하는 확인하는 함수
async function checkCpOpinionExistsByLocationSeq(cpOpinionLocationSeq) {
  try {
    const cpVersionSeq = Number.parseFloat(props.data.cpVersionSeq);
    // console.log(`cpVersionSeq = ${cpVersionSeq}`);
    const response = await axios.get(`/cp/${cpVersionSeq}/cpOpinionLocation/${cpOpinionLocationSeq}`);

    if (response.status === 200) {
      console.log("해당 위치 정보 조회 성공");
      // console.log(response.data.data);

      return true;
    } else {
      return false;
    }
  } catch (error) {
    if (error.status === 404) {
      return false;
    }
  }
}

// CP 의견 위치 삭제 요청 함수
async function deleteCpOpinionLocation(cpOpinionLocationSeq) {
  try {
    const response = await axios.delete(`/cp/${route.params.cpVersionSeq}/cpOpinionLocation/${cpOpinionLocationSeq}`);

    if (response.status === 200) {
      console.log("의견이 없는 위치 삭제 처리");
    }
  } catch (error) {
    if (error.status === 404) {
      console.error("해당 CP 위치 데이터가 없지만 삭제 요청이 들어왔습니다.");
    }
  }
}

// 북마크 버튼 이벤트 함수
async function updateBookmark() {
  if (props.data.bookmarked) {
    props.data.bookmarked = false;
    await sendTogglingBookmark();
  } else {
    props.data.bookmarked = true;
    await sendTogglingBookmark();
  }
}

// 북마크 토글링 요청 함수
async function sendTogglingBookmark() {
  try {
    const cpVersionSeq = Number.parseFloat(props.data.cpVersionSeq);
    const response = await axios.post(`/cp/bookmark/${cpVersionSeq}`);

    if (response.status === 200) {
      console.log("북마크 토글링 성공");
    }
  } catch (error) {
    console.error("북마크 토글링 실패");
    console.error(error);
  }
}

// PDF 로드 함수
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

    // 캔버스 크기 설정
    pdfCanvas.value.width = CANVAS_WIDTH;
    pdfCanvas.value.height = CANVAS_HEIGHT;

    const scaleX = CANVAS_WIDTH / viewport.width;
    const scaleY = CANVAS_HEIGHT / viewport.height;
    const scale = Math.max(scaleX, scaleY); // 크기를 맞추기 위한 스케일 계산

    const renderContext = {
      canvasContext: pdfCanvas.value.getContext('2d'),
      viewport: page.getViewport({scale}), // 스케일 적용
    };

    await page.render(renderContext).promise;
  } catch (error) {
    console.error("PDF 로드 중 오류 발생:", error);
  } finally {
    isRendering = false;
  }
}

// 좌표에 마커 추가하는 함수
function addMarker(x, y) {
  console.log("마커 추가 함수 실행");
  const markerImage = new Image();
  markerImage.src = '/icons/marker.png';

  markerImage.onload = () => {
    const ctx = pdfCanvas.value.getContext('2d');

    const markerWidth = markerImage.width / MARKER_SCALE_FACTOR;
    const markerHeight = markerImage.height / MARKER_SCALE_FACTOR;

    // 마커를 그리기
    ctx.drawImage(markerImage,
        x - (markerWidth / 2),
        y - (markerHeight / 2),
        markerWidth,
        markerHeight
    );

    // 마커 추가 완료 후 위치 정보 업데이트
    const newPosition = {
      cpVersionSeq: route.params.cpVersionSeq,
      cpOpinionLocationSeq: -1,
      cpOpinionLocationPageNum: currentPage.value,
      cpOpinionLocationX: x - (markerWidth / 2),
      cpOpinionLocationY: y - (markerHeight / 2)
    };

    existingMarkers.value.push(newPosition);
    console.log("존재하는 마커 리스트에 새로운 좌표 추가됨");
    console.log(existingMarkers.value);
  };

  // 이미지 로드 전에 마커 추가 로그 확인
  console.log("마커 추가 완료");
}

// 이전 페이지 이동 함수
function goToPreviousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

// 다음 페이지 이동 함수
function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

// 등록 페이지 이동 함수
function goToRegisterPage() {
  console.log("CP 의견 등록 페이지로 이동합니다.");
  const cpVersionSeq = route.params.cpVersionSeq; // route 변수 사용

  // clickedMarkerData에서 cpOpinionLocationSeq를 안전하게 가져오기
  const cpOpinionLocationSeq = Number.parseFloat(clickedMarkerData.value.cpOpinionLocationSeq);
  if (isNaN(cpOpinionLocationSeq)) {
    console.error("cpOpinionLocationSeq가 유효하지 않습니다.");
    return; // 유효하지 않으면 함수 종료
  }

  let url;
  if (cpOpinionLocationSeq === -1) {
    // cpOpinionLocationSeq가 -1인 경우 x, y 좌표도 전달
    let pageNum = Number.parseFloat(currentPage.value);
    let x = Number.parseFloat(clickedMarkerData.value.x);
    let y = Number.parseFloat(clickedMarkerData.value.y);

    // NaN 체크
    if (isNaN(pageNum) || isNaN(x) || isNaN(y)) {
      console.error("페이지 번호 또는 좌표가 유효하지 않습니다.");
      return; // 유효하지 않으면 함수 종료
    }

    url = `/cp/${cpVersionSeq}/cpOpinionLocation/${cpOpinionLocationSeq}/cpOpinion?pageNum=${pageNum}&x=${x}&y=${y}`;
    console.log(`이동 url: ${url}`);
    router.push(url);
  } else {
    // cpOpinionLocationSeq가 -1이 아닐 경우
    console.log(`clickedMarkerData.cpOpinionLocationSeq: ${clickedMarkerData.value.cpOpinionLocationSeq}`);
    url = `/cp/${cpVersionSeq}/cpOpinionLocation/${cpOpinionLocationSeq}/cpOpinion`;
    console.log(`이동 url: ${url}`);
    router.push(url);
  }
}

// CP 의견 조회 페이지 이동 함수
function goToCpOpinionPage(cpOpinionSeq) {
  console.log("CP 의견 화면으로 이동합니다.");
  router.push(`/cp/${route.params.cpVersionSeq}/cpOpinionLocation/${clickedMarkerData.value.cpOpinionLocationSeq}/cpOpinion/${cpOpinionSeq}`);
}

// 마커 기능 토글링 함수
function handleMakerFunctionToggle() {
  isMarkerEnabled.value = !isMarkerEnabled.value;
  console.log(`isMarkerEnabled = ${isMarkerEnabled.value}`);
}

// 마커 시각화 토글링 함수
function handleMarkerVisualToggle() {
  isMarkerVisible.value = !isMarkerVisible.value;
}

// 위치 정보 호출 함수
async function fetchCpOpinionLocationData(cpVersionSeq) {
  console.log("위치 정보 조회 함수가 요청되었습니다.");
  if (cpVersionSeq === null) {
    console.log("등록된 위치 정보가 없습니다.");
    return;
  }

  try {
    const response = await axios.get(`cp/${cpVersionSeq}/cpOpinionLocation`);

    if (response.status === 200) {
      cpOpinionLocationList.value = response.data.data;
      console.log("위치 조회 성공");
      console.log(cpOpinionLocationList.value);
      existingMarkers.value = cpOpinionLocationList.value;
      console.log("존재하는 위치 리스트 정보", existingMarkers.value);
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
    const response = await axios.get(`/cp/${route.params.cpVersionSeq}/cpVersion`);

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

// 파일 다운로드 함수
const downloadFile = async () => {
  const url = props.data.cpUrl; // props에서 URL 가져오기
  // console.log(`다운로드할 URL: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) return new Error('다운로드 실패');

    const blob = await response.blob(); // 파일 데이터를 Blob으로 변환
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;

    // 파일 이름 추출
    link.download = props.data.cpName + "_" + props.data.cpVersion;
    document.body.appendChild(link); // 링크를 DOM에 추가
    link.click(); // 다운로드 시작
    document.body.removeChild(link); // 링크 제거
    URL.revokeObjectURL(downloadUrl); // URL 해제
  } catch (error) {
    console.error('이미지 다운로드 실패:', error);
    alert('이미지 다운로드에 실패했습니다.');
  }
};

// CP 목록으로 이동 함수
function moveToListPage() {
  console.log("CP 목록으로 이동합니다.");
  router.push({
    name:'CpListPage'
  })
}
</script>

<template>
  <div class="container">
    <div class="button-container">
      <template v-if="isMarkerEnabled">
        <IconButton class="mini-button active-button" iconClass="bi bi-pencil" @click="handleMakerFunctionToggle()"/>
      </template>
      <template v-else>
        <IconButton class="mini-button" iconClass="bi bi-pencil" @click="handleMakerFunctionToggle()"/>
      </template>
      <IconButton class="mini-button" iconClass="bi bi-file-earmark-arrow-down"
                  @click="() => downloadFile()"/>
      <template v-if="!isMarkerVisible">
        <IconButton class="mini-button active-button" iconClass="bi bi-calendar2-x"
                    @click="() => handleMarkerVisualToggle()"/>
      </template>
      <template v-else>
        <IconButton class="mini-button" iconClass="bi bi-calendar2-x"
                    @click="() => handleMarkerVisualToggle()"/>
      </template>
      <template v-if="props.data.bookmarked">
        <IconButton class="mini-button active-button" iconClass="bi bi-bookmark"
                    @click="() => updateBookmark()"/>
      </template>
      <template v-else>
        <IconButton class="mini-button" iconClass="bi bi-bookmark"
                    @click="() => updateBookmark()"/>
      </template>
    </div>

    <div class="pdf-viewer-container">
      <canvas id="pdf-canvas" class="pdf-canvas"></canvas>
      <span class="pagination-container">{{ currentPage }} / {{ totalPages }}</span>
      <div class="navigation-buttons">
        <Button @click="goToPreviousPage" :isDisabled="currentPage <= 1">이전 페이지</Button>
        <Button @click="goToNextPage" :isDisabled="currentPage >= totalPages">다음 페이지</Button>
        <Button @click="moveToListPage">목록</Button>
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

    <CpModal :isVisible="isModalVisible"
             :cpOpinionLocationSeq="clickedMarkerData.cpOpinionLocationSeq"
             :currentPage="currentPage"
             @close="isModalVisible = false"
             @register="goToRegisterPage"
             @detail="goToCpOpinionPage">
      <div>
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
  margin: 2% 0; /* 드롭박스와 PDF 뷰어 사이의 여백 */
  z-index: 10; /* 다른 요소 위에 표시되도록 */
  width: 100%; /* 드롭박스가 부모 요소의 너비를 가득 채우도록 설정 */
  max-width: 150px; /* 최대 너비 설정 */
}

.pdf-canvas {
  border: 1px solid #ccc;
  width: 1000px;
  height: 620px;
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