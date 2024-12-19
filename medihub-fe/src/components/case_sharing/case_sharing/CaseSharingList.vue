<template>
  <div class="case-list">
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
import {ref, onMounted, computed} from 'vue';
import { useAuthStore } from '@/store/authStore';
import axios from "axios";
import router from "@/router/index.js"; // Pinia 스토어 가져오기
import PaginationComponent from "@/components/common/Pagenation.vue";

const authStore = useAuthStore();
const accessToken = authStore.accessToken; // accessToken 가져오기

const totalCases = ref(0);
const caseList = ref([]);
const currentPage = ref(1); // 현재 페이지 번호

// API 호출 함수
const fetchCaseList = async () => {
  try {
    // API 호출
    const response = await axios.get('/case_sharing');

    // axios 응답 객체에서 데이터 바로 사용
    const result = response.data;

    if (result.success && Array.isArray(result.data)) {
      // 데이터 가공
      caseList.value =  result.data
          .sort((a, b) => b.caseSharingSeq - a.caseSharingSeq) // 내림차순 정렬
          .map(item => ({
        id: item.caseSharingSeq,
        title: item.caseSharingTitle,
        author: `${item.caseAuthor} (${item.caseAuthorRankName || '직급 없음'})`,
        date: new Date(item.regDate).toLocaleDateString('ko-KR'),
      }));
      totalCases.value = result.data.length;
    } else {
      throw new Error('데이터 형식 오류');
    }
  } catch (error) {
    console.error('Error fetching case list:', error);
    caseList.value = [];
  }
};
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
  router.push({ name: 'CaseSharingDetailView', params: { id } });
};


// 컴포넌트 마운트 시 API 호출
onMounted(() => {
  console.log("[CaseList] Access Token 확인:", accessToken);

  if (accessToken) {
    console.log("[CaseList] Access Token 있음. API 호출 시작.");
    fetchCaseList();
  } else {
    console.error("[CaseList] Access Token 없음. 사용자 로그인 필요.");
  }
});

</script>


<style scoped>
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
