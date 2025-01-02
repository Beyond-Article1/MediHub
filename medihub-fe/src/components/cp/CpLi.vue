<script setup>
import {defineEmits, defineProps} from "vue";
import {useAuthStore} from "@/store/authStore.js";
import LocalDateTimeFormat from "@/components/common/LocalDateTimeFormat.vue";
import BookmarkButton from "@/components/common/button/BookmarkButton.vue";
import axios from 'axios';

// vue 관련 변수
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});
const emit = defineEmits('update');

// 파일 다운로드 함수
const downloadFile = (event) => {
  event.stopPropagation(); // 이벤트 전파 방지
  console.log(`다운로드할 URL: ${props.data.cpUrl}`);
  const link = document.createElement('a');
  link.href = props.data.cpUrl; // 데이터 파일의 URL
  link.download = props.data.cpName; // 다운로드할 때 사용할 파일 이름
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 북마크 토글 처리 함수
async function updateBookmark(cpVersionSeq) {
  try {
    const response = await axios.post(`cp/bookmark/${cpVersionSeq}`, {});

    if (response.status === 200) {
      // console.log("북마크 토글 성공");
      if (props.data.bookmarked === true) {
        alert("북마크 해제되었습니다.");
      } else {
        alert("북마크 설정되었습니다.");
      }
      emit('update'); // 데이터 새로고침을 위한 이벤트 발생
    } else {
      console.log("북마크 토글 실패");
    }
  } catch (error) {
    console.error("북마크 요청 중 오류 발생: ", error);
  }
}

// 페이지 이동 이벤트를 부모에게 전달하는 함수
const handleMovePage = () => {
  emit('move', props.data.cpVersionSeq); // 이벤트 발생
};
</script>

<template>
  <div class="list-item" @click="handleMovePage">
    <div class="version">
      <span>{{ data.cpVersionSeq }}</span>
    </div>
    <div class="name">
      <span>
        {{ data.cpName }}
        <i class="bi bi-file-earmark-arrow-down" @click="downloadFile" style="cursor: pointer; margin-left: 5px;"></i>
      </span>
    </div>
    <div class="date">
      <LocalDateTimeFormat :data="data.createdAt"/>
    </div>
    <div class="view-count">
      <span>{{ data.cpViewCount }}</span>
    </div>
    <div class="bookmark">
      <span>
        <BookmarkButton
            :current-is-bookmark="data.bookmarked"
            @updateBookmark="updateBookmark(data.cpVersionSeq)"
        />
      </span>
    </div>
  </div>
</template>

<style scoped>
.list-item {
  display: flex;
  align-items: center; /* 아이템을 수직으로 정렬 */
  padding: 15px 0; /* 위아래 패딩만 설정하여 여백 조정 */
  margin: 10px 0; /* 항목 사이의 여백 */
  border-bottom: 1px solid var(--gray);
  transition: background-color 0.3s, color 0.3s; /* 부드러운 전환 효과 */
}

.list-item:hover {
  background-color: var(--symbol-blue); /* hover 시 배경색 변경 */
  color: white; /* hover 시 텍스트 색상 변경 */
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

.bookmark {
  flex: 0 0 10%; /* 1/10 비율 */
  text-align: center; /* 텍스트 가운데 정렬 */
}
</style>
