<script setup>
import {defineEmits, defineProps} from "vue";
import {useAuthStore} from "@/stores/authStore.js";
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
const downloadFile = async (event) => {
  event.stopPropagation(); // 이벤트 전파 방지
  try {
    const response = await axios.get(props.data.cpUrl, {
      responseType: 'blob', // Blob 형식으로 응답을 받기 위해 설정
    });

    if (response.status !== 200) throw new Error('다운로드 실패');

    const blob = response.data; // 파일 데이터를 Blob으로 변환
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = props.data.cpName + '_' + props.data.cpVersion;
    document.body.appendChild(link); // 링크를 DOM에 추가
    link.click(); // 다운로드 시작
    document.body.removeChild(link); // 링크 제거
    URL.revokeObjectURL(downloadUrl); // URL 해제
  } catch (error) {
    console.error('이미지 다운로드 실패:', error);
    alert('이미지 다운로드에 실패했습니다.');
  }
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
