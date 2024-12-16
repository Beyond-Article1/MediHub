<script setup>
import { defineEmits, defineProps } from "vue";
import LocalDateTimeFormat from "@/components/common/LocalDateTimeFormat.vue";

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});

const emit = defineEmits();

// 다운로드 함수
const downloadFile = () => {
  const link = document.createElement('a');
  link.href = props.data.cpUrl; // 데이터 파일의 URL
  link.download = props.data.cpName; // 다운로드할 때 사용할 파일 이름
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 북마크 토글 함수
const toggleBookmark = (event) => {
  event.stopPropagation(); // 부모 이벤트 전파 방지
  emit('toggle-bookmark', props.data.cpVersionSeq);
};
</script>

<template>
  <div class="list-item">
    <span class="version">{{ data.cpVersionSeq }}</span>
    <span class="name">
      {{ data.cpName }}
      <i class="bi bi-file-earmark-arrow-down" @click="downloadFile" style="cursor: pointer; margin-left: 5px;"></i>
    </span>
    <LocalDateTimeFormat :data="data.createdAt" class="date"/>
    <span class="view-count">{{ data.cpViewCount }}</span>
    <span v-if="data.bookmarked">
      <i class="bi bi-bookmark bookmark-icon" style="color: var(--yellow);" @click="toggleBookmark"></i>
    </span>
    <span v-else>
      <i class="bi bi-bookmark bookmark-icon" @click="toggleBookmark"></i>
    </span>
  </div>
</template>

<style scoped>
.list-item {
  display: flex;
  align-items: center; /* 수직 정렬 */
  padding: 15px; /* 내부 여백을 늘림 */
  margin: 10px 0; /* 항목 간 간격을 늘림 */
  transition: background-color 0.3s; /* 배경색 전환 효과 */
  border-bottom: 1px solid var(--gray); /* 하단 경계선 추가 */
}

.list-item:last-child {
  border-bottom: none; /* 마지막 항목은 밑줄 제거 */
}

.list-item:hover {
  background-color: var(--symbol-blue);
  color: white;
}

.version {
  font-weight: bold; /* 굵은 글씨 */
  margin-right: 20px; /* 오른쪽 여백을 늘림 */
}

.name {
  flex: 1; /* 이름이 가능한 공간을 모두 차지 */
  font-size: 16px; /* 글자 크기 */
  margin-right: 30px; /* 이름과 다음 요소 간의 여백 추가 */
}

.date {
  margin-right: 30px; /* 오른쪽 여백을 늘림 */
}

.view-count {
  color: #555; /* 색상 */
  font-size: 14px; /* 글자 크기 */
  margin-right: 20px; /* 조회수와 북마크 간의 여백 추가 */
}

.bookmark-icon {
  margin-left: 5px; /* 북마크 아이콘의 여백 */
  cursor: pointer; /* 클릭 가능함을 나타내는 커서 */
}
</style>