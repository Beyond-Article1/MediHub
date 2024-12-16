<script setup>
import { defineEmits, defineProps } from "vue";
import { useAuthStore } from "@/store/authStore.js";
import LocalDateTimeFormat from "@/components/common/LocalDateTimeFormat.vue";
import BookmarkButton from "@/components/common/BookmarkButton.vue";
import axios from 'axios';

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

const useAuth = useAuthStore();

// 북마크 토글 처리 함수
async function updateBookmark(cpVersionSeq) {
  try {
    const response = await axios.post(`cp/bookmark/${cpVersionSeq}`, {}, {
      headers: {
        Authorization: `Bearer ${useAuth}`
      }
    });

    if (response.status === 200) {
      console.log("북마크 토글 성공");
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
      <LocalDateTimeFormat :data="data.createdAt" />
    </div>
    <div class="view-count">
      <span class="centered">{{ data.cpViewCount }}</span>
    </div>
    <div class="bookmark">
      <span class="centered">
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
  align-items: center;
  padding: 15px;
  margin: 10px 0;
  transition: background-color 0.3s;
  border-bottom: 1px solid var(--gray);
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:hover {
  background-color: var(--symbol-blue);
  color: white;
}

.version {
  flex: 0 0 100px; /* 고정 너비 100px */
  font-weight: bold;
  margin-right: 20px;
}

.name {
  flex: 1; /* 나머지 공간을 차지 */
  font-size: 16px;
  margin-right: 30px;
}

.date {
  flex: 0 0 150px; /* 고정 너비 150px */
  margin-right: 30px;
}

.view-count {
  flex: 0 0 80px; /* 고정 너비 80px */
  color: #555;
  font-size: 14px;
  margin-right: 20px;
  text-align: center; /* 가운데 정렬 */
}

.bookmark {
  flex: 0 0 50px; /* 고정 너비 50px */
}

.centered {
  display: flex;
  justify-content: center; /* 가운데 정렬 */
  width: 100%; /* 전체 너비 사용 */
}
</style>
