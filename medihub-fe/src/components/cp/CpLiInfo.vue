<script setup>
</script>

<template>
  <div class="cp-li-info">
    <div class="info-header">
      <div class="version">
        <span class="version-header">버전</span>
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
      <div class="bookmark">
        <span class="bookmark-header">북마크</span>
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
  padding-bottom: 10px; /* 하단 여백 */
}

.version {
  flex: 0 0 100px; /* 고정 너비 100px */
  text-align: left; /* 왼쪽 정렬 */
  margin-right: 20px; /* 오른쪽 여백 */
}

.name {
  flex: 1; /* 나머지 공간을 차지 */
  text-align: left; /* 왼쪽 정렬 */
  margin-right: 30px; /* 오른쪽 여백 */
}

.date {
  flex: 0 0 150px; /* 고정 너비 150px */
  text-align: left; /* 왼쪽 정렬 */
  margin-right: 30px; /* 오른쪽 여백 */
}

.view-count {
  flex: 0 0 80px; /* 고정 너비 80px */
  text-align: left; /* 왼쪽 정렬 */
  margin-right: 20px; /* 오른쪽 여백 */
}

.bookmark {
  flex: 0 0 50px; /* 고정 너비 50px */
  text-align: left; /* 왼쪽 정렬 */
}
</style>
