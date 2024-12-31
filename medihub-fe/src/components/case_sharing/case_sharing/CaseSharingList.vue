<script setup>
import { ref, onMounted, computed, watch, defineProps } from "vue";
import axios from "axios";

import router from "@/router/index.js";
import LocalDateTimeFormat from '@/components/common/LocalDateTimeFormat.vue';
import Pagination from "@/components/common/Pagination.vue";

// Props로 선택된 카테고리 ID 전달 받기
const props = defineProps({

  selectedCategory: {

    type: [String, Object],
    required: true
  },
  sortOption: {

    type: String,
    default: '최신순'
  },
  searchResult: {

    type: Array,
    default: () => []
  }
});

const totalCases = ref(0);
const caseList = ref([]);
// 현재 페이지 번호
const currentPage = ref(1);
const selectedCategoryName = ref("");

// API 호출 함수
const fetchCaseList = async (categoryId) => {

  try {

    const url = categoryId ? `/case_sharing/part/${categoryId}` : `/case_sharing`;

    console.log("API Request URL:", url);

    const response = await axios.get(url);

    const { success, data } = response.data;

    if(success && Array.isArray(data)) {

      console.log("Fetched data:", data);

      caseList.value = data;
      if(categoryId) {

        // 카테고리별 게시글 수를 totalCases로 설정
        totalCases.value = caseList.value.length;
        // 검색된 게시글이 있으면 그 길이를, 아니면 카테고리별 게시글 길이를 사용
      } else totalCases.value = props.searchResult.length > 0 ? props.searchResult.length : caseList.value.length;
    } else {

      console.error("Unexpected response structure or unsuccessful request");

      caseList.value = [];

      totalCases.value = 0;
    }
  } catch(error) {

    console.error("Error fetching case list:", error);

    caseList.value = [];

    totalCases.value = 0;
  }
};

// 정렬된 케이스 공유 목록
const sortedCaseList = computed(() => {

  return [...(props.searchResult.length > 0 ? props.searchResult : caseList.value)].sort((a, b) => {

    if(props.sortOption === '최신순') {

      // 내림차순 정렬
      return new Date(b.regDate) - new Date(a.regDate);
      // 내림차순 정렬
    } else if(props.sortOption === '인기순') return b.caseSharingViewCount - a.caseSharingViewCount;

    return 0;
  });
});

// 페이지 당 데이터 계산
const paginatedCaseList = computed(() => {

  const startIndex = (currentPage.value - 1) * 12;
  const endIndex = startIndex + 12;

  return sortedCaseList.value.slice(startIndex, endIndex);
});

// 페이지 업데이트 이벤트 핸들러
const changePage = (page) => {

  currentPage.value = page;
};

const goToDetail = (id) => {

  router.push({name: "CaseSharingDetailView", params: { id }});
};

// 선택된 카테고리가 변경될 때 API 호출
watch(() => props.selectedCategory, (newCategory) => {

      if(newCategory && typeof newCategory === "object") {

        console.log("Selected Category ID:", newCategory.id);
        console.log("Selected Category Name:", newCategory.name);

        // 검색 결과 초기화
        props.searchResult = [];

        // ID로 데이터 호출
        fetchCaseList(newCategory.id);

        // 카테고리 이름 표시
        selectedCategoryName.value = newCategory.name;
      } else {

        console.log("Selected Category ID:", newCategory);

        // 검색 결과 초기화
        props.searchResult = [];

        // ID만 전달받은 경우
        fetchCaseList(newCategory);

        // 기본 값 설정
        selectedCategoryName.value = "전체";
      }
    },
    { immediate: true }
);

// 검색된 결과가 변경될 때마다 `totalCases`를 업데이트
watch(() => props.searchResult, () => {

  totalCases.value = props.searchResult.length;
},
 { immediate: true }
);

onMounted(() => {

  fetchCaseList();
});
</script>

<template>
  <div class="case-list">
    <div v-if="selectedCategoryName" class="selected-category-info">
      <strong>{{ selectedCategoryName }}</strong> 카테고리에 대한 케이스 공유 내역입니다.
    </div>

    <div class="case-header">
      <span>총 {{ totalCases }} 건</span>
    </div>

    <!-- 총 건수가 0이면 게시글 목록을 출력하지 않고 메시지를 표시 -->
    <div v-if="totalCases === 0">
      <p></p>
    </div>

    <table v-else>
      <tbody>
        <tr
            class="clickable-row"
            v-for="(caseItem) in paginatedCaseList"
            :key="caseItem.caseSharingSeq"
            @click="goToDetail(caseItem.caseSharingSeq)"
        >
          <td>{{ caseItem.caseSharingSeq }}</td>

          <td>{{ caseItem.caseSharingTitle }}</td>

          <td>{{ caseItem.caseAuthor }} ({{caseItem.caseAuthorRankName}})</td>

          <td><LocalDateTimeFormat :data="caseItem.regDate" /></td>

          <td>{{ caseItem.caseSharingViewCount }}</td>
        </tr>
      </tbody>
    </table>

    <Pagination
        :totalData="totalCases"
        :limitPage="12"
        :page="currentPage"
        @updatePage="changePage"
    />
  </div>
</template>

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
  text-align: left; /* 텍스트 정렬 */
}
</style>