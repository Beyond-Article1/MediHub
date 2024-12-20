<script setup>
import axios from "axios";
import {ref, onMounted, watch} from "vue";

import CpHeader from "@/components/cp/CpHeader.vue";
import DropBox from "@/components/common/SingleSelectDropBox.vue";
import Card from "@/components/common/Card.vue";
import Board from "@/components/common/Board.vue";

// 데이터 저장 변수
const cpSearchCategoryList = ref([]);       // CP 검색 카테고리 리스트
const cpSearchCategoryNameList = ref([]);   // CP 검색 카테고리 이름 리스트
const selectedOption = ref('');             // 선택된 옵션
const cpSearchCategoryDataList = ref([]);   // CP 검색 카테고리 데이터 리스트

// CP 검색 카테고리 데이터 호출 함수
async function fetchCpSearchCategoryData() {
  try {
    const response = await axios.get(`/cp/cpSearchCategory`);

    if (response.status === 200) {
      console.log("CP 검색 카테고리 데이터 조회 성공");
      cpSearchCategoryList.value = response.data.data;

      cpSearchCategoryNameList.value = cpSearchCategoryList.value.map(data => data.cpSearchCategoryName);
    } else {
      console.error("CP 검색 카테고리 데이터 조회 실패");
      console.error(`코드: ${response.status}`);
      console.error(`내용: ${response}`);
    }
  } catch (error) {
    console.error("CP 검색 카테고리 조회 중 에러가 발생했습니다.", error);
  }
}

// CP 검색 카테고리 데이터 호출 함수
async function fetchCpSearchCategoryDataData(cpSearchCategorySeq) {
  try {
    // cpSearchCategorySeq가 undefined인 경우 기본값 설정
    if (!cpSearchCategorySeq) {
      console.error("cpSearchCategorySeq가 유효하지 않습니다.");
      return;
    }

    // cpSearchCategorySeq에서 숫자만 추출 (정규 표현식 사용)
    const match = cpSearchCategorySeq.match(/\d+/); // 숫자만 추출
    if (match) {
      cpSearchCategorySeq = parseInt(match[0], 10);
    } else {
      console.error("cpSearchCategorySeq에서 숫자를 찾을 수 없습니다.");
      return;
    }

    // 숫자로 변환된 값이 유효한지 확인
    if (isNaN(cpSearchCategorySeq)) {
      console.error("cpSearchCategorySeq가 숫자로 변환되지 않았습니다.");
      return;
    }

    const response = await axios.get(`/cp/cpSearchCategory/${cpSearchCategorySeq}/cpSearchCategoryData`);

    if (response.status === 200) {
      console.log("CP 검색 카테고리 데이터 조회 성공");
      cpSearchCategoryDataList.value = response.data.data;
      console.log(cpSearchCategoryDataList.value);
    } else {
      console.error("CP 검색 카테고리 데이터 조회 실패");
      console.error(`코드: ${response.status}`);
      console.error(`내용: ${response}`);
    }
  } catch (error) {
    console.error("CP 검색 카테고리 조회 중 에러가 발생했습니다.", error);
  }
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
    <CpHeader />
    <div class="d-flex"> <!-- Flexbox 추가 -->
      <div class="me-3"> <!-- 드롭박스와 보드 간의 여백 -->
        <!-- 좌측 드롭박스 옵션 구역 -->
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
        <!-- 우측 옵션에 대한 데이터 영역 -->
        <Board>
          <template v-if="cpSearchCategoryDataList.length > 0">
            <Card
                v-for="cpSearchCategoryData in cpSearchCategoryDataList"
                :key="cpSearchCategoryData.cpSearchCategoryDataSeq"
                :seq="cpSearchCategoryData.cpSearchCategoryDataSeq"
                :name="cpSearchCategoryData.cpSearchCategoryDataName"
            />
          </template>
        </Board>
      </div>
    </div>
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
