<template>
  <div class="case-list">
    <div v-if="selectedCategoryName" class="selected-category-info">
      <strong>{{ selectedCategoryName }}</strong> 카테고리에 대한 케이스 공유 내역입니다.
    </div>
    <div class="case-header">
      <span>총 {{ totalCases }} 건</span>
    </div>
    <table>
      <tbody>
      <tr
          v-for="(caseItem, index) in paginatedCaseList"
          :key="index"
          @click="goToDetail(caseItem.id)"
          class="clickable-row"
      >
        <td>{{ caseItem.id }}</td>
        <td>{{ caseItem.title }}</td>
        <td>{{ caseItem.author }}</td>
        <td>{{ caseItem.date }}</td>
      </tr>
      </tbody>
    </table>
    <!-- Pagination -->
    <PaginationComponent
        :totalData="totalCases"
        :limitPage="12"
        :page="currentPage"
        @updatePage="updatePage"
    />
  </div>
</template>

<script setup>
import {ref, onMounted, computed, watch} from "vue";
import axios from "axios";
import router from "@/router/index.js";
import PaginationComponent from "@/components/common/Pagination.vue";

// Props로 선택된 카테고리 ID 전달받기
const { selectedCategory, sortOption } = defineProps({
  selectedCategory: { type: Object, default: null },
  sortOption: { type: String, default: "latest" },
});

const totalCases = ref(0);
const caseList = ref([]);
const currentPage = ref(1); // 현재 페이지 번호
const selectedCategoryName = ref("");

const fetchCaseList = async (categoryId) => {
  try {
    const url = categoryId
        ? `/case_sharing/part/${categoryId}`
        : `/case_sharing`;


    const response = await axios.get(url);
    const { success, data } = response.data;

    if (success && Array.isArray(data)) {

      // 데이터를 map으로 변환
      caseList.value = data.map((item) => ({
        id: item.caseSharingSeq,
        title: item.caseSharingTitle,
        author: `${item.caseAuthor} (${item.caseAuthorRankName || "직급 없음"})`,
        date: new Date(item.regDate).toLocaleDateString("ko-KR"),
        views: item.caseSharingViewCount, // 조회수 추가
      }));

      totalCases.value = caseList.value.length;

      // 정렬 적용
      applySort();
    } else {
      console.error("Unexpected response structure or unsuccessful request");
      caseList.value = [];
      totalCases.value = 0;
    }
  } catch (error) {
    console.error("Error fetching case list:", error);
    caseList.value = [];
    totalCases.value = 0;
  }
};


// 정렬 작업 함수
const applySort = () => {
  if (sortOption === "latest") {
    caseList.value.sort((a, b) => b.id - a.id); // 최신순
    console.log("정렬 옵션: 최신순 (latest)");
  } else if (sortOption === "views") {
    caseList.value.sort((a, b) => b.views - a.views); // 조회순
    console.log("정렬 옵션: 조회순 (views)");
  }

};

// 선택된 카테고리 및 정렬 옵션이 변경될 때 API 호출 및 정렬 처리
watch(
    () => selectedCategory,
    (newCategory) => {
      if (newCategory && typeof newCategory === "object") {

        fetchCaseList(newCategory.id);
        selectedCategoryName.value = newCategory.name;
      } else {
        fetchCaseList(newCategory);
        selectedCategoryName.value = "전체";
      }
 },
    { immediate: true }
);

// 정렬 옵션 변경 감지
watch(
    () => sortOption,
    (newSortOption) => {
      applySort(); // 정렬 강제 적용
    },
    { immediate: true }
);

// 페이지당 데이터 계산
const paginatedCaseList = computed(() => {
  const startIndex = (currentPage.value - 1) * 12;
  const endIndex = startIndex + 12;
  return caseList.value.slice(startIndex, endIndex);
});

// 페이지 업데이트 이벤트 핸들러
const updatePage = (page) => {
  currentPage.value = page;
};

const goToDetail = (id) => {
  router.push({name: "CaseSharingDetailView", params: {id}});
};
</script>

<style scoped>
.selected-category-info{
  padding-bottom: 5px;
}
.case-header {
  font-size: 14px;
  margin-bottom: 10px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
tr {
  border-bottom: 1px solid #ddd;
  cursor: pointer; /* 클릭 가능한 마우스 커서 추가 */
  transition: background-color 0.3s ease;
}

tr:hover {
  background-color: #f9f9f9; /* 호버 시 배경 색상 변경 */
}
td {
  padding: 8px;
}

</style>