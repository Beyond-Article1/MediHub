<script setup>
</script>

<template>
  <div class="cp-li-info">
    <div class="info-header">
      <div class="version">
        <span class="version-header">번호</span>
      </div>
      <div class="name">
        <span class="name-header">CP 명</span>
      </div>
      <div class="date">
        <span class="date-header">수정일</span>
      </div>
      <div class="view-count">
        <span class="view-count-header">조회수</span>
      </div>
      <div class="empty-div">
        <span class="empty-header"></span> <!-- 빈 헤더 -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.cp-li-info {
  margin-bottom: 20px; /* 리스트 항목 사이의 여백 설정 */
}

.info-header {
  display: flex; /* 플렉스 박스를 사용하여 가로 배치 */
  font-weight: bold;
  border-bottom: 1px solid var(--gray); /* 하단 경계선 */
  padding: 10px 0; /* 여백 조정 */
}

.version {
  flex: 0 0 10%; /* 1/10 비율 */
  text-align: center; /* 텍스트 가운데 정렬 */
}

.name {
  flex: 0 0 40%; /* 3/10 비율 */
  text-align: center; /* 텍스트 가운데 정렬 */
}

.date {
  flex: 0 0 30%; /* 2/10 비율 */
  text-align: center; /* 텍스트 가운데 정렬 */
}

.view-count {
  flex: 0 0 10%; /* 1/10 비율 */
  text-align: center; /* 텍스트 가운데 정렬 */
}

.empty-div {
  flex: 0 0 10%; /* 1/10 비율 */
  text-align: left; /* 좌측 정렬 */
}
</style>

