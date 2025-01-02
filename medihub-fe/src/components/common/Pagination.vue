<script setup>
import { computed } from "vue";

// 부모 컴포넌트로부터 전달받는 props
const props = defineProps({
  totalData: Number,   // 전체 데이터 개수
  limitPage: Number,   // 보여줄 데이터 개수
  page: Number         // 현재 페이지
});

// 부모 컴포넌트로 이벤트 전달
const emit = defineEmits(['updatePage']);

// 전체 페이지 수 계산
const totalPages = computed(() => {
  return Math.ceil(props.totalData / props.limitPage);
});

// 현재 블록 단위 계산 (5개 단위로 나눈 블록)
const currentBlock = computed(() => {
  return Math.ceil(props.page / 5);
});

// 페이지네이션 버튼 계산 (블록 단위로 페이지 번호 표시)
const pageNumbers = computed(() => {
  const pages = [];
  const startPage = (currentBlock.value - 1) * 5 + 1; // 블록의 첫 페이지
  const endPage = Math.min(startPage + 4, totalPages.value); // 블록의 마지막 페이지

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
});

// 페이지 변경 이벤트 핸들러
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    emit("updatePage", page);
  }
};
</script>

<template>
  <nav class="pagination-container">

    <button
        class="pagination-button"
        :disabled="currentBlock === 1"
        @click="changePage(1)"
    >
      처음
    </button>

    <!-- 이전 블록 버튼 -->
    <button
        class="pagination-button"
        :disabled="currentBlock === 1"
        @click="changePage((currentBlock - 1) * 5)"
    >
      이전
    </button>

    <!-- 페이지 숫자 버튼 -->
    <button
        v-for="pageNum in pageNumbers"
        :key="pageNum"
        class="pagination-number"
        :class="{ active: pageNum === page }"
        @click="changePage(pageNum)"
    >
      {{ pageNum }}
    </button>

    <!-- 다음 블록 버튼 -->
    <button
        class="pagination-button"
        :disabled="currentBlock * 5 >= totalPages"
        @click="changePage(currentBlock * 5 + 1)"
    >
      다음
    </button>

    <button
        class="pagination-button"
        :disabled="currentBlock * 5 >= totalPages"
        @click="changePage(totalPages)"
    >
      마지막
    </button>
  </nav>
</template>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.pagination-button {
  background-color: #f0f0f0;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
}

.pagination-number {
  background-color: white;
  border: 1px solid #ddd;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
}

.pagination-number.active {
  background-color: #007bff;
  color: white;
  border: none;
}

button:disabled{
  display: none;
}
</style>
