<script setup>
import axios from "axios";
import {ref, onMounted} from "vue";
import Board from '@/components/common/Board.vue'
import IconButton from "@/components/common/button/IconButton.vue";
import Card from "@/components/common/Card.vue";
import Modal from "@/components/common/InputModal.vue";

// 데이터 저장 변수
const cpSearchCategoryList = ref([]);         // CP 검색 카테고리 리스트
const cpSearchCategoryNameList = ref([]);     // CP 검색 카테고리 이름 리스트
const selectedData = ref();                         // 선택된 옵션
const updatedName = ref('');                  // 변경할 이름
const showModal = ref(false);                 // 모달 시각화 여부
const isCreatingNewData = ref(false);          // 새로운 카테고리 생성 플레그

// CP 검색 카테고리 조회 요청 함수
async function fetchCpSearchCategory() {
  try {
    const response = await axios.get('cp/cpSearchCategory');

    if (response.status === 200) {
      console.log(response.data.data);
      cpSearchCategoryList.value = response.data.data;
      // console.log(cpSearchCategoryList.value);
      // cpSearchCategoryNameList 업데이트
      cpSearchCategoryNameList.value = cpSearchCategoryList.value.map(data => ({
        cpSearchCategorySeq: data.cpSearchCategorySeq,
        cpSearchCategoryName: data.cpSearchCategoryName
      }));
    } else {
      console.error("CP 검색 카테고리 조회 중 에러가 발생했습니다.");
      console.error("HTTP 코드 = " + response.status);
    }
  } catch (error) {
    console.error("CP 검색 카테고리 조회 중 예기치 못한 에러가 발생했습니다.", error);
  }
}

// CP 검색 카테고리 생성 요청 함수
async function createCpSearchCategory(newName) {
  try {
    console.log("입력받은 값 = ", newName);
    const response = await axios.post(
        `cp/cpSearchCategory`,
        newName, {
          headers: {
            'Content-Type': 'text/plain' // 문자열 전송을 위한 Content-Type 설정
          }
        });

    if (response.status === 200 || response.status === 201) {
      console.log("CP 검색 카테고리 생성 성공");
      // 새로 생성된 카테고리 목록을 업데이트
      await fetchCpSearchCategory(); // 전체 카테고리 목록을 다시 가져옴
    } else {
      console.error("생성 실패", response.status);
    }

    showModal.value = false; // 모달 닫기
  } catch (error) {
    console.error("생성 중 에러가 발생했습니다.", error);
  }
}

// CP 검색 카테고리 수정 요청 함수
async function updateCpSearchCategory(newName) {
  if (isCreatingNewData.value) {
    await createCpSearchCategory(newName);
  } else {
    console.log("수정할 이름: ", newName); // 로그 추가
    try {
      const response = await axios.put(
          `cp/cpSearchCategory/${selectedData.value.cpSearchCategorySeq}`,
          newName,
          {
            headers: {
              'Content-Type': 'text/plain'
            }
          }
      );

      if (response.status === 200) {
        console.log("CP 검색 카테고리 수정 성공");
        alert("수정에 성공하였습니다.");
        await fetchCpSearchCategory();
      } else {
        console.error("CP 검색 카테고리 수정 실패", response.status);
      }
      showModal.value = false; // 모달 닫기
    } catch (error) {
      console.error("CP 검색 카테고리 수정 중 에러가 발생했습니다.", error);
    }
  }
}

// CP 검색 카테고리 삭제 요청 함수
async function deleteCpSearchCategory(seq) {
  try {
    const response = await axios.delete(`cp/cpSearchCategory/${seq}`);
    // 응답이 성공적으로 오면
    if (response.status === 200) {
      console.log("삭제 성공");
      alert("삭제에 성공하였습니다.");
      await fetchCpSearchCategory(); // 카테고리 목록 갱신
    }
  } catch (error) {
    // 에러가 발생한 경우
    if (error.response) {
      // 서버가 응답을 보냈지만 상태 코드가 2xx가 아닌 경우
      if (error.response.status === 409) {
        alert("CP 검색 카테고리 데이터가 존재하여 삭제가 불가능합니다.");
        console.log("CP 검색 카테고리 데이터가 존재하여 삭제가 불가능합니다.");
      } else {
        console.error("삭제 실패", error.response.status);
      }
    } else {
      // 요청을 보내지 못한 경우
      console.error("삭제 중 에러가 발생했습니다.", error);
    }
  }
}

// Card 클릭하면 발생하는 함수
const handleCardAction = ({actionType, seq}) => {
  if (actionType === 'update') {
    selectedData.value = cpSearchCategoryList.value.find(data => data.cpSearchCategorySeq === seq);
    updatedName.value = selectedData.value ? selectedData.value.cpSearchCategoryDataName : '';
    isCreatingNewData.value = false;
    showModal.value = true; // 모달 열기
  } else if (actionType === 'delete') {
    console.log(`Delete action for seq: ${seq}`);
    selectedData.value = cpSearchCategoryList.value.find(data => data.cpSearchCategoryDataSeq === seq);
    deleteCpSearchCategory(seq);
  }
};

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

// 마운트 시점에 실행되는 함수
onMounted(() => {
  fetchCpSearchCategory();
});
</script>

<template>
  <div class="board-container">
    <Board class="card-board">
      <template v-if="cpSearchCategoryNameList.length > 0">
        <Card
            v-for="cpSearchCategory in cpSearchCategoryNameList"
            :key="cpSearchCategory.cpSearchCategorySeq"
            :seq="cpSearchCategory.cpSearchCategorySeq"
            :name="cpSearchCategory.cpSearchCategoryName"
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
  <Modal
      v-if="showModal"
      :show="showModal"
      :title="isCreatingNewData.value ? '새 데이터 추가' : (selectedData?.cpSearchCategoryName || '새 데이터 추가')"
      @close="closeModal"
      @update="updateCpSearchCategory"
  />
</template>

<style scoped>
.board-container {
  display: flex; /* Flexbox 사용 */
  justify-content: center; /* 수평 중앙 정렬 */
  height: 100vh; /* 전체 화면 높이 사용 (필요에 따라 조정) */
  margin-top: 2%;
}

.card-board {
  display: flex; /* Flexbox 사용 */
  flex-wrap: wrap; /* 줄바꿈 허용 */
  gap: 1rem; /* 카드 간의 간격 */
}
</style>
