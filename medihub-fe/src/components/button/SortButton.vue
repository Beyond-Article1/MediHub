<script setup>
import {defineProps, defineEmits, ref} from 'vue';
import dropArrow from '@/assets/images/arrow/drop-arrow.png';
import upArrow from '@/assets/images/arrow/up-arrow.png';

// 부모 컴포넌트로부터 전달받는 props
const props = defineProps({
  currentSort: String, // 현재 정렬 조건 (bookmark or select)
  currentData: Array,    // 데이터 받기
});

// 정렬
const isSorted = ref(true);

// 이벤트를 발생시키기 위한 emit
const emit = defineEmits(["updateSort", "updateSortedData"]);

// 카운트순 조회
function sortedJournals(){
  const sorted = [...props.currentData].sort((a,b) => {
    return isSorted.value
        ? b.count - a.count // 내림차순
        : a.count - b.count; // 오름차순
  });

  // 정렬된 데이터와 정렬 조건을 부모 컴포넌트로 전달
  emit("updateSortedData", sorted);
}

// 정렬 조건 변경 함수
function changeSortCondition(condition) {
  isSorted.value = !isSorted.value; // 정렬 순서 토글
  emit("updateSort", condition); // 정렬 조건 전달
  sortedJournals(); // 정렬된 데이터 전달
}
</script>

<template>
  <div class="btn-box">
    <button
        class="top-btn"
        :class="{ 'click-top-btn': currentSort === 'bookmark' }"
        @click="changeSortCondition(currentData)"
    > {{currentSort}} <img :src="isSorted ? dropArrow : upArrow"/>
    </button>
  </div>
</template>

<style scoped>
.btn-box {
  display: flex;
  justify-content: space-around;
  width: 250px;
}

.top-btn {
  font-size: 14px;
  font-weight: bolder;
  width: 100px;
  height: 30px;
  background-color: #FFFFFF;
  border: solid 2px #20346D;
  color: black;
  border-radius: 5px;
}

.click-top-btn {
  background-color: #20346D;
  color: #FFFFFF;
}

.btn-box img{
  width: 14px;
}
</style>
