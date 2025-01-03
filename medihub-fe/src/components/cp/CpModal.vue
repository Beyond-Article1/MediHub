<script setup>
import axios from "axios";

import { watch, defineEmits, ref } from 'vue';
import { useRoute } from "vue-router";

import Button from "@/components/common/button/Button.vue";
import CpOpinionLi from "@/components/cp/CpOpinionLi.vue";
import LineDivider from "@/components/common/LineDivider.vue";
import Pagination from "@/components/common/Pagination.vue";

// vue 설정 변수
const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  },
  cpOpinionLocationSeq: {
    type: Number,
    default: 0
  },
  currentPage: {
    type: Number,
    default: 0
  }
}); // props 정의
const emit = defineEmits(['close', 'register', 'detail']);  // emit 정의
const route = useRoute(); // 라우트

// 데이터 저장 변수
const cpOpinionList = ref([]); // CP 의견 리스트
const totalData = ref(0); // 전체 데이터 개수

// emit 함수
const closeModal = () => {
  emit('close');
};                   // 모달 닫기
const registerOpinion = () => {
  emit('register');
}               // 등록 페이지 이동
const navigateToOpinion = (cpOpinionSeq) => {
  emit('detail', cpOpinionSeq);
} // 의견 페이지 이동

// 데이터 가져오기 함수
async function fetchData() {
  console.log("fetchData 호출됨");
  console.log(props);
  if (props.cpOpinionLocationSeq !== -1) {
    try {
      let url = `cp/${route.params.cpVersionSeq}/cpOpinionLocation/${props.cpOpinionLocationSeq}?pageNum=${props.currentPage}`
      console.log(`url = ${url}`)
      const response = await axios.get(url);
      if (response.status === 200) {
        console.log("CP 의견 조회 성공");
        cpOpinionList.value = response.data.data; // 데이터 저장
        totalData.value = cpOpinionList.value.length;
        // console.log(cpOpinionList.value);
        // console.log(`response.data.totalCount = ${totalData.value}`);
      } else {
        console.log("CP 의견 조회 실패");
      }
    } catch (error) {
      console.error("예기치 못한 오류가 발생했습니다. 에러: ", error);
    }
  } else {
    cpOpinionList.value = ref([]);      // 빈 데이터로 변경
    totalData.value = 0;                      // 전체 데이터 개수 0으로 변경
  }
}

// 페이지 변경 이벤트 핸들러
const updatePage = (pageNum) => {
  currentPage.value = pageNum; // 현재 페이지 업데이트
  fetchData(pageNum); // 페이지에 맞는 데이터 가져오기
}

// Modal이 열릴 때 데이터 가져오기
watch(() => props.isVisible, async (newValue) => {
  if (newValue === true) {
    await fetchData();
  }
});
</script>

<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal-content">
      <div class="modal-header">
        <button class="close-button" @click="closeModal">×</button>
      </div>
      <div class="modal-body">
        <template v-if="cpOpinionList.length > 0">
          <div style="margin-top: 10px" v-for="cpOpinion in cpOpinionList" :key="cpOpinion.cpOpinionSeq">
            <CpOpinionLi :data="cpOpinion" @click="navigateToOpinion(cpOpinion.cpOpinionSeq)"/>
            <LineDivider/>
          </div>
          <Pagination
              :totalData="totalData"
              :limitPage="5"
              :page="currentPage"
              @updatePage="updatePage"
          />
        </template>
        <template v-else>
          <p>등록된 의견이 없습니다.</p>
        </template>
      </div>
      <div class="button-container">
        <Button @click="registerOpinion" :isDisabled="false">{{ '등록' }}</Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  width: 80%;
  max-width: 600px;
  height: 400px; /* 고정 높이 설정 */
  display: flex;
  flex-direction: column; /* 세로 방향으로 배치 */
}

.modal-header {
  display: flex;
  justify-content: flex-end; /* 오른쪽 정렬 */
}

.modal-body {
  flex: 1; /* 남은 공간을 차지하도록 설정 */
  max-height: calc(400px - 60px); /* 등록 버튼과 닫기 버튼을 고려한 최대 높이 */
  overflow-y: auto; /* 세로 스크롤 가능 */
}

.button-container {
  display: flex;
  justify-content: flex-end; /* 오른쪽 정렬 */
  margin-top: 10px; /* 버튼과 내용 사이에 간격 추가 */
}

.close-button {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
}

.close-button:hover {
  color: red; /* 마우스 오버 시 색상 변경 */
}
</style>