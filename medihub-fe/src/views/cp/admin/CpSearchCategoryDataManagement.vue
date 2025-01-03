<script setup>
import axios from "axios";
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

import CpHeader from "@/components/cp/CpHeader.vue";
import DropBox from "@/components/common/SingleSelectDropBox.vue";
import Card from "@/components/common/Card.vue";
import Board from "@/components/common/Board.vue";
import Modal from "@/components/common/InputModal.vue";
import IconButton from "@/components/common/button/IconButton.vue";

// vue 변수
const router = useRouter();

// 데이터 저장 변수
const cpSearchCategoryList = ref([]);       // CP 검색 카테고리 목록을 저장하는 변수
const cpSearchCategoryNameList = ref([]);   // CP 검색 카테고리의 이름 목록을 저장하는 변수
const selectedOption = ref('');             // 선택된 옵션을 저장하는 변수
const cpSearchCategoryDataList = ref([]);   // 선택된 CP 검색 카테고리 데이터 목록을 저장하는 변수
const showModal = ref(false);               // 모달의 표시 상태를 관리하는 변수
const selectedData = ref(null);             // 선택된 데이터 정보를 저장하는 변수
const updatedName = ref('');                // 사용자가 입력한 새로운 이름을 저장하는 변수
const isCreatingNewData = ref(true);        // 카테고리 데이터 생성 여부 확인 변수

// CP 검색 카테고리 이동 함수
function goToCpCategoryManagementPage() {
  router.push({
    name: 'CpSearchCategoryManagementPage'
  })
}

// CP 검색 카테고리 데이터 호출 함수
async function fetchCpSearchCategoryData() {
  try {
    const response = await axios.get(`/cp/cpSearchCategory`);
    if (response.status === 200) {
      console.log("CP 검색 카테고리 데이터 조회 성공");
      cpSearchCategoryList.value = response.data.data;
      cpSearchCategoryNameList.value = cpSearchCategoryList.value.map(data => data.cpSearchCategoryName);
    } else {
      console.error("CP 검색 카테고리 데이터 조회 실패", response.status);
    }
  } catch (error) {
    console.error("CP 검색 카테고리 조회 중 에러가 발생했습니다.", error);
  }
}

// CP 검색 카테고리 데이터 호출 함수
async function fetchCpSearchCategoryDataData(cpSearchCategorySeq) {
  try {
    if (!cpSearchCategorySeq) {
      console.error("cpSearchCategorySeq가 유효하지 않습니다.");
      return;
    }

    const match = cpSearchCategorySeq.toString().match(/\d+/);
    if (match) {
      cpSearchCategorySeq = parseInt(match[0], 10);
    } else {
      console.error("cpSearchCategorySeq에서 숫자를 찾을 수 없습니다.");
      return;
    }

    if (isNaN(cpSearchCategorySeq)) {
      console.error("cpSearchCategorySeq가 숫자로 변환되지 않았습니다.");
      return;
    }

    const response = await axios.get(`/cp/cpSearchCategory/${cpSearchCategorySeq}/cpSearchCategoryData`);
    if (response.status === 200) {
      console.log("CP 검색 카테고리 데이터 조회 성공");
      cpSearchCategoryDataList.value = response.data.data; // 데이터를 리스트에 저장
    } else {
      console.error("CP 검색 카테고리 데이터 조회 실패", response.status);
    }
  } catch (error) {
    console.error("CP 검색 카테고리 조회 중 에러가 발생했습니다.", error);
  }
}

// Card 클릭하면 발생하는 함수
const handleCardAction = ({actionType, seq}) => {
  if (actionType === 'update') {
    selectedData.value = cpSearchCategoryDataList.value.find(data => data.cpSearchCategoryDataSeq === seq);
    updatedName.value = selectedData.value ? selectedData.value.cpSearchCategoryDataName : '';
    isCreatingNewData.value = false; // 수정 모드
    showModal.value = true; // 모달 열기
  } else if (actionType === 'delete') {
    console.log(`Delete action for seq: ${seq}`);
    selectedData.value = cpSearchCategoryDataList.value.find(data => data.cpSearchCategoryDataSeq === seq);
    deleteCpSearchCategoryData();
  }
};

// 검색 카테고리 데이터 수정 요청 함수
async function updateCpSearchCategoryData(newName) {
  if (isCreatingNewData.value) {
    await addCpSearchCategoryData(newName);
  } else {
    console.log("수정할 이름: ", newName); // 로그 추가
    try {
      const response = await axios.put(
          `cp/cpSearchCategory/${selectedData.value.cpSearchCategorySeq}/cpSearchCategoryData/${selectedData.value.cpSearchCategoryDataSeq}`,
          newName,
          {
            headers: {
              'Content-Type': 'text/plain'
            }
          }
      );

      if (response.status === 200) {
        console.log("CP 검색 카테고리 수정 성공");
        await fetchCpSearchCategoryDataData(selectedOption.value); // 데이터 갱신
      } else {
        console.error("CP 검색 카테고리 수정 실패", response.status);
      }
      showModal.value = false; // 모달 닫기
    } catch (error) {
      console.error("CP 검색 카테고리 수정 중 에러가 발생했습니다.", error);
    }
  }
}

// 검색 카테고리 데이터 삭제 요청 함수
async function deleteCpSearchCategoryData() {
  try {
    const response = await axios.delete(
        `cp/cpSearchCategory/${selectedData.value.cpSearchCategorySeq}/cpSearchCategoryData/${selectedData.value.cpSearchCategoryDataSeq}`
    );

    if (response.status === 200) {
      console.log("삭제 성공");
      const cpSearchCategorySeq = findSelectedCategory(selectedOption.value).cpSearchCategorySeq;
      await fetchCpSearchCategoryDataData(cpSearchCategorySeq); // 데이터 갱신
    } else {
      console.error("삭제 실패", response.status);
    }
  } catch (error) {
    console.error("삭제 중 에러가 발생했습니다.", error);
  }
}

// 검색 카테고리 데이터 생성 요청 함수
async function addCpSearchCategoryData(newName) {
  console.log(`생성 요청 = ${newName}`);

  const selectedCategory = findSelectedCategory();
  const cpSearchCategorySeq = selectedCategory ? selectedCategory.cpSearchCategorySeq : null; // 선택된 카테고리의 시퀀스

  if (!cpSearchCategorySeq) {
    console.error("선택된 카테고리가 없습니다.");
    return; // 요청 중단
  }

  try {
    const response = await axios.post(
        `cp/cpSearchCategory/${cpSearchCategorySeq}/cpSearchCategoryData`,
        newName, // newName이 문자열인지 확인
        {
          headers: {
            'Content-Type': 'text/plain' // 문자열 전송을 위한 Content-Type 설정
          }
        }
    );

    if (response.status === 201) {
      console.log("생성 성공");
      await fetchCpSearchCategoryDataData(cpSearchCategorySeq); // 데이터 갱신
    } else {
      console.error("생성 실패", response.status);
    }
    showModal.value = false; // 모달 닫기
  } catch (error) {
    console.error("생성 중 에러가 발생했습니다.", error);
  }
}

// 모달 여는 함수
function openAddModal() {
  showModal.value = true;
  isCreatingNewData.value = true; // 새로운 데이터 추가 모드
  updatedName.value = ''; // 입력 필드 초기화
  selectedData.value = null; // 선택된 데이터 초기화
}

// 모달 닫는 함수
function closeModal() {
  showModal.value = false;
  updatedName.value = '';
  isCreatingNewData.value = true;
}

// 선택된 카테고리 데이터를 찾는 함수
function findSelectedCategory() {
  if (!selectedOption.value) {
    return null; // 선택된 옵션이 없으면 null 반환
  }
  const selectedCategory =
      cpSearchCategoryList.value.find(category => category.cpSearchCategoryName === selectedOption.value);
  return selectedCategory || null; // 찾은 카테고리 반환, 없으면 null 반환
}

// 마운트 시점 실행 함수
onMounted(() => {
  fetchCpSearchCategoryData();
});

// CP 검색 카테고리 변경 감지 함수
watch(selectedOption, (newValue) => {
  console.log(`선택된 옵션: ${newValue}`);
  const cpSearchCategorySeq = findSelectedCategory(newValue).cpSearchCategorySeq;
  // console.log(`선택된 옵션 시퀀스: ${cpSearchCategorySeq}`);
  fetchCpSearchCategoryDataData(cpSearchCategorySeq);
});
</script>

<template>
  <div>
    <CpHeader />
    <div class="d-flex">
      <div class="me-3 position-relative">
        <DropBox
            :options="cpSearchCategoryNameList"
            :label="'분류'"
            :modelValue="selectedOption"
            :isOpen="true"
            @update:modelValue="selectedOption = $event"
            @update:isOpen="(value) => {}"
        />
        <IconButton
            :iconClass="'bi bi-gear-wide-connected'"
            class="add-button-top"
            @click="goToCpCategoryManagementPage"
        />
      </div>
      <div class="board-container">
        <Board class="card-board">
          <template v-if="cpSearchCategoryDataList.length > 0">
            <Card
                v-for="cpSearchCategoryData in cpSearchCategoryDataList"
                :key="cpSearchCategoryData.cpSearchCategoryDataSeq"
                :seq="cpSearchCategoryData.cpSearchCategoryDataSeq"
                :name="cpSearchCategoryData.cpSearchCategoryDataName"
                @cardAction="handleCardAction"
            />
          </template>
          <template v-else>
            <div class="text-center">데이터가 없습니다.</div>
          </template>
        </Board>
        <IconButton
            :iconClass="'bi bi-plus-circle-fill'"
            class="add-button"
            @click="openAddModal"
        />
      </div>
    </div>

    <Modal
        v-if="showModal"
        :show="showModal"
        :title="isCreatingNewData.value ? '새 데이터 추가' : (selectedData?.cpSearchCategoryDataName || '새 데이터 추가')"
        @close="closeModal"
        @update="updateCpSearchCategoryData"
    />
  </div>
</template>

<style scoped>
.d-flex {
  display: flex;
  justify-content: center;
}

.me-3 {
  margin-right: 1rem; /* 드롭박스와 보드 간의 여백 */
}

.board-container {
  position: relative; /* 버튼을 절대 위치로 설정하기 위해 부모를 상대 위치로 설정 */
}

.card-board {
  display: flex; /* Flexbox 사용 */
  flex-wrap: wrap; /* 줄바꿈 허용 */
  gap: 1rem; /* 카드 간의 간격 */
  margin-left: 2%;
  max-height: 400px; /* 최대 높이 설정 */
  overflow-y: auto; /* 세로 스크롤 가능 */
}

.add-button {
  position: absolute; /* 버튼을 절대 위치로 설정 */
  bottom: 20px; /* 하단 여백 */
  right: 20px; /* 우측 여백 */
  padding: 10px; /* 버튼 패딩 */
  cursor: pointer; /* 커서 포인터 */
  width: 50px; /* 버튼 너비 */
  height: 50px; /* 버튼 높이 */
  border-radius: 50%; /* 버튼을 둥글게 만들기 */
  background-color: var(--symbol-blue); /* 배경색 추가 */
  border: none; /* 테두리 제거 */
  display: flex; /* Flexbox 사용하여 아이콘 중앙 배치 */
  justify-content: center; /* 중앙 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
  transition: background-color 0.3s; /* 배경색 변경 시 부드러운 전환 효과 */
}

.add-button-top {
  position: absolute; /* 버튼을 절대 위치로 설정 */
  top: 5px; /* 드롭박스 상단에서의 여백 */
  right: 5px; /* 드롭박스 우측에서의 여백 */
  padding: 5px; /* 버튼 패딩 */
  cursor: pointer; /* 커서 포인터 */
  width: 30px; /* 버튼 너비 */
  height: 30px; /* 버튼 높이 */
  border-radius: 50%; /* 버튼을 둥글게 만들기 */
  background-color: var(--symbol-blue); /* 배경색 추가 */
  border: none; /* 테두리 제거 */
  display: flex; /* Flexbox 사용하여 아이콘 중앙 배치 */
  justify-content: center; /* 중앙 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
  transition: background-color 0.3s; /* 배경색 변경 시 부드러운 전환 효과 */
  z-index: 1; /* 버튼이 다른 요소 위에 보이도록 z-index 추가 */
}

.position-relative {
  position: relative; /* 드롭박스 부모 요소에 상대 위치 설정 */
}
</style>