<script setup>
import { computed, defineProps } from 'vue';

const props = defineProps({
  data: {
    type: String,
    default: '',
    required: true
  }
});

// 날짜 형식 변환 로직
const formattedDate = computed(() => {
  const dateStr = props.data; // props.data에서 날짜 문자열 가져오기
  if (!dateStr) return ''; // 날짜 문자열이 없으면 빈 문자열 반환

  const dateObject = new Date(dateStr); // 문자열을 Date 객체로 변환

  // 날짜 구성 요소 추출
  const year = dateObject.getFullYear();
  const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작
  const day = String(dateObject.getDate()).padStart(2, '0');
  const hours = String(dateObject.getHours()).padStart(2, '0');
  const minutes = String(dateObject.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`; // 최종 형식 반환
});
</script>

<template>
  <span>
    {{ formattedDate }}
  </span>
</template>

<style scoped>
</style>
