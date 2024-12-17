<template>
  <div class="case-list">
    <div class="case-header">
      <span>총 {{ totalCases }} 건</span>
    </div>
    <table>
      <tbody>
      <tr v-for="(caseItem, index) in caseList" :key="index">
        <td>{{ caseItem.id }}</td>
        <td>{{ caseItem.title }}</td>
        <td>{{ caseItem.author }}</td>
        <td>{{ caseItem.date }}</td>
      </tr>
      </tbody>
    </table>
    <!-- Pagination -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/store/authStore'; // Pinia 스토어 가져오기

const authStore = useAuthStore();
const accessToken = authStore.accessToken; // accessToken 가져오기

const totalCases = ref(0);
const caseList = ref([]);

// API 호출 함수
const fetchCaseList = async () => {
  try {

    const response = await fetch('http://localhost:8088/case_sharing', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`, // 인증 헤더 추가
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('API 호출 실패');

    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      // 데이터 가공
      caseList.value = result.data.map(item => ({
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
}
tr {
  border-bottom: 1px solid #ddd;
}
td {
  padding: 8px;
}
.pagination {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
</style>
