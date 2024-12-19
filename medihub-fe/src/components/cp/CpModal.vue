<script setup>
import {watch, defineEmits, ref} from 'vue';
import axios from "axios";
import {useRoute, useRouter} from "vue-router";
import Button from "@/components/common/button/Button.vue";
import CpOpinionLi from "@/components/cp/CpOpinionLi.vue";
import LineDivider from "@/components/common/LineDivider.vue";

// vue 설정 변수
const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  },
  x: {
    type: Number
  },
  y: {
    type: Number
  },
  cpOpinionLocationSeq: {
    type: Number,
    default: -1
  }
}); // props 정의
const emit = defineEmits(['close']);  // emit 정의
const router = useRouter(); // 라우터
const route = useRoute(); // 라우트

// 데이터 저장 변수
const cpOpinionList = ref([]); // CP 의견 리스트

// emit 함수
const closeModal = () => {
  emit('close');
};

// 데이터 가져오기 함수
async function fetchData() {
  if (props.cpOpinionLocationSeq !== -1) {
    try {
      const response = await axios.get(`cp/${route.params.cpVersionSeq}/cpOpinionLocation/${props.cpOpinionLocationSeq}`);

      if (response.status === 200) {
        console.log("CP 의견 조회 성공");
        cpOpinionList.value = response.data.data; // 데이터 저장
        console.log(cpOpinionList.value);
      } else {
        console.log("CP 의견 조회 실패");
      }
    } catch (error) {
      console.error("예기치 못한 오류가 발생했습니다. 에러: ", error);
    }
  }
}

// x와 y 프로퍼티 감시
watch(() => [props.x, props.y], async ([newX, newY]) => {
  console.log(`x: ${newX}, y: ${newY} 로 변경됨`);
  await fetchData(); // 데이터 가져오기
});

// 등록 함수
function registerOpinion() {
  const cpVersionSeq = route.params.cpVersionSeq; // route 변수 사용
  router.push(`/cp/${cpVersionSeq}/cpOpinionLocation/${props.cpOpinionLocationSeq}/cpOpinion`);
}

// CP 의견 조회 페이지 이동 함수
function navigateToOpinion(cpOpinionSeq) {
  console.log("CP 의견 화면으로 이동합니다.");
  router.push(`/cp/${route.params.cpVersionSeq}/cpOpinionLocation/${props.cpOpinionLocationSeq}/cpOpinion/${cpOpinionSeq}`);
}

// Modal이 열릴 때 데이터 가져오기
watch(() => props.isVisible, async (newValue) => {
  if (newValue) {
    await fetchData(); // Modal이 열리면 데이터 가져오기
  }
});
</script>

<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal-content">
      <button class="close-button" @click="closeModal">×</button>
      <div class="modal-body">
        <template v-if="cpOpinionList.length > 0">
          <div style="margin-top: 10px" v-for="cpOpinion in cpOpinionList" :key="cpOpinion.cpOpinionSeq">
            <!-- 찬성, 반대 투표 기능 만들어야 됨 -->
            <CpOpinionLi :data="cpOpinion" @click="navigateToOpinion(cpOpinion.cpOpinionSeq)"/>
            <LineDivider/>
          </div>
        </template>
        <template v-else>
          <p>등록된 의견이 없습니다.</p>
        </template>
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
  position: relative;
}

.modal-body {
  max-height: calc(400px - 60px); /* 등록 버튼과 닫기 버튼을 고려한 최대 높이 */
  overflow-y: auto; /* 세로 스크롤 가능 */
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
}
</style>
