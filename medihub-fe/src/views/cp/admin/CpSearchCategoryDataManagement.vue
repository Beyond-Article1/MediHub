<script setup>
import axios from "axios";
import {ref, onMounted, watch} from "vue";
import {useRoute} from "vue-router";

import CpHeader from "@/components/cp/CpHeader.vue";
import DropBox from "@/components/common/SingleSelectDropBox.vue";
import Card from "@/components/common/Card.vue";
import Board from "@/components/common/Board.vue";
import Modal from "@/components/common/InputModal.vue";

// vue 변수
const route = useRoute();

// 데이터 저장 변수
const cpSearchCategoryList = ref([]);       // CP 검색 카테고리 목록을 저장하는 변수
const cpSearchCategoryNameList = ref([]);   // CP 검색 카테고리의 이름 목록을 저장하는 변수
const selectedOption = ref('');             // 선택된 옵션을 저장하는 변수
const cpSearchCategoryDataList = ref([]);   // 선택된 CP 검색 카테고리 데이터 목록을 저장하는 변수
const showModal = ref(false);               // 모달의 표시 상태를 관리하는 변수 (true: 모달 표시, false: 모달 비표시)
const selectedData = ref(null);             // 선택된 데이터 정보를 저장하는 변수
const updatedName = ref('');                // 사용자가 입력한 새로운 이름을 저장하는 변수

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

    const match = cpSearchCategorySeq.match(/\d+/);
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
    updatedName.value = selectedData.value ? selectedData.value.cpSearchCategoryDataName : ''; // 선택된 데이터의 이름 초기화
    showModal.value = true; // 모달 열기
  } else if (actionType === 'delete') {
    console.log(`Delete action for seq: ${seq}`);
    // 삭제 관련 로직 추가
  }
};

// 검색 카테고리 수정 함수
async function updateCpSearchData(newName) {
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
      console.log("업데이트 성공");
      fetchCpSearchCategoryDataData(selectedOption.value); // 데이터 갱신
    } else {
      console.error("업데이트 실패", response.status);
    }
    showModal.value = false; // 모달 닫기
  } catch (error) {
    console.error("업데이트 중 에러가 발생했습니다.", error);
  }
}

// 모달 닫는 함수
function closeModal() {
  showModal.value = false;
}

// 마운트 시점 실행 함수
onMounted(() => {
  fetchCpSearchCategoryData();
});

// CP 검색 카테고리 변경 감지 함수
watch(selectedOption, (newValue) => {
  console.log(`선택된 옵션: ${newValue}`);
  fetchCpSearchCategoryDataData(newValue);
});
</script>

<template>
  <div>
    <CpHeader/>
    <div class="d-flex">
      <div class="me-3">
        <DropBox
            :options="cpSearchCategoryNameList"
            :label="'분류'"
            :modelValue="selectedOption"
            :isOpen="true"
            @update:modelValue="selectedOption = $event"
            @update:isOpen="(value) => {}"
        />
      </div>
      <div>
        <Board>
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
      </div>
    </div>

    <Modal
        v-if="showModal"
        :show="showModal"
        :title="`${selectedData?.cpSearchCategoryDataName}`"
        @update="updateCpSearchData"
        @close="closeModal"
    />
  </div>
</template>

<style scoped>
.d-flex {
  display: flex !important;
  justify-content: center;
}

.me-3 {
  margin-right: 1rem; /* 드롭박스와 보드 간의 여백 */
}
</style>
