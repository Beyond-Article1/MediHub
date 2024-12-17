<script setup>
import { defineProps, defineEmits } from 'vue';

// 부모 컴포넌트로부터 전달받는 props
const props = defineProps({
  currentSort: String, // 현재 정렬 조건 (bookmark or select)
});

// 이벤트를 발생시키기 위한 emit
const emit = defineEmits(['updateSort']);

// 버튼 클릭 시 부모로 이벤트 전달
const changeSortCondition = (condition) => {
  emit('updateSort', condition);
};
</script>

<template>
  <div class="btn-box">
    <button
        class="top-btn"
        :class="{ 'click-top-btn': currentSort === 'bookmark' }"
        @click="changeSortCondition('bookmark')"
    >
      북마크순
    </button>
    <button
        class="top-btn"
        :class="{ 'click-top-btn': currentSort === 'select' }"
        @click="changeSortCondition('select')"
    >
      조회순
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
</style>
