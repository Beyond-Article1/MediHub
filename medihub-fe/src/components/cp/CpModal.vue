<script setup>
import { watch, defineEmits, ref } from 'vue';
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import Button from "@/components/common/button/Button.vue";

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  cpOpinionLocationSeq: {
    type: Number,
    default: -1
  }
});

const emit = defineEmits(['close']);
const cpOpinionList = ref([]); // 데이터 저장용 ref
const router = useRouter(); // useRouter 호출
const route = useRoute(); // useRoute 호출

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
</script>

<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal-content">
      <button class="close-button" @click="closeModal">×</button>
      <div class="modal-body">
        <div v-if="cpOpinionList.length > 0">
          <h3>조회된 의견</h3>
          <ul>
            <li v-for="(opinion, index) in cpOpinionList" :key="index">{{ opinion }}</li>
          </ul>
        </div>
        <div v-else>
          <p>조회된 의견이 없습니다.</p>
        </div>
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
  position: relative;
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
