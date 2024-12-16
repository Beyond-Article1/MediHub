<script setup>
import { computed } from "vue";

// 부모 컴포넌트로부터 전달받는 props
const props = defineProps({
  totalData: Number,   // 전체 데이터 개수
  limitPage: Number,   // 보여줄 페이지 개수
  page: Number         // 현재 페이지
});

// 부모 컴포넌트로 이벤트 전달
const emit = defineEmits(['updatePage']);

// 전체 페이지 수 계산
const totalPages = computed(() => {
  return Math.ceil(props.totalData / props.limitPage);
});

// 페이지네이션 버튼 계산 (현재 페이지 기준으로 시작과 끝 조정)
const pageNumbers = computed(() => {
  const pages = [];
  const currentPage = props.page;
  const visiblePages = props.limitPage;

  let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
  let endPage = Math.min(totalPages.value, startPage + visiblePages - 1);

  if (endPage - startPage < visiblePages - 1) {
    startPage = Math.max(1, endPage - visiblePages + 1);
  }

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
    <!-- 이전 페이지 버튼 -->
    <button
        class="pagination-button"
        :disabled="page < 6"
        @click="changePage(page - 5)"
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

    <!-- 다음 페이지 버튼 -->
    <button
        class="pagination-button"
        :disabled="page === totalPages"
        @click="changePage(page + 5)"
    >
      다음
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

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
