<!-- components/CaseList.vue -->
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
const totalCases = 14219;
const caseList = [
  { id: 1, title: '골절성부전증 환자의 총 무릎 교체: 사례 보고 및 문헌 검토', author: '임서연 전문의', date: '2024.11.24' },
  { id: 23, title: '20대 남자 스마트암 라식', author: '임채훈 교수', date: '2024.11.24' },
  { id: 55, title: '10대 남자 무릎 골절', author: '임정택 전문의', date: '2024.11.24' },
  { id: 77, title: '60대 여자 임플란트', author: '윤지영 조교수', date: '2024.11.24' },
  // 추가 항목들
];
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
