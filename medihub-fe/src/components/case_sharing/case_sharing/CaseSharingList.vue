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
const {selectedCategory} = defineProps(["selectedCategory"]);

const totalCases = ref(0);
const caseList = ref([]);
const currentPage = ref(1); // 현재 페이지 번호
const selectedCategoryName = ref("");

// API 호출 함수
const fetchCaseList = async (categoryId) => {
  try {
    const url = categoryId
        ? `/case_sharing/part/${categoryId}`
        : `/case_sharing`;

    console.log("API Request URL:", url);

    const response = await axios.get(url);
    const { success, data } = response.data;

    if (success && Array.isArray(data)) {
      console.log("Fetched data:", data);

      // 데이터를 map으로 변환한 뒤 ID를 기준으로 내림차순 정렬
      caseList.value = data
          .map((item) => ({
            id: item.caseSharingSeq,
            title: item.caseSharingTitle,
            author: `${item.caseAuthor} (${item.caseAuthorRankName || "직급 없음"})`,
            date: new Date(item.regDate).toLocaleDateString("ko-KR"),
          }))
          .sort((a, b) => b.id - a.id); // ID 내림차순 정렬

      totalCases.value = caseList.value.length;
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



// 선택된 카테고리가 변경될 때 API 호출
watch(
    () => selectedCategory,
    (newCategory) => {
      if (newCategory && typeof newCategory === "object") {
        console.log("Selected Category ID:", newCategory.id); // 디버깅용
        console.log("Selected Category Name:", newCategory.name); // 디버깅용

        fetchCaseList(newCategory.id); // ID로 데이터 호출
        selectedCategoryName.value = newCategory.name; // 카테고리 이름 표시
      } else {
        console.log("Selected Category ID:", newCategory); // 단순 ID 디버깅용
        fetchCaseList(newCategory); // ID만 전달받은 경우
        selectedCategoryName.value = "전체"; // 기본값
      }
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