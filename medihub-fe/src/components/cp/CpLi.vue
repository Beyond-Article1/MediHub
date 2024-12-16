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
  <div class="list-item" @click="handleMovePage"> <!-- CpLi 전체 클릭 시 페이지 이동 -->
    <span class="version">{{ data.cpVersionSeq }}</span>
    <span class="name">
      {{ data.cpName }}
      <i class="bi bi-file-earmark-arrow-down" @click="downloadFile" style="cursor: pointer; margin-left: 5px;"></i>
    </span>
    <LocalDateTimeFormat :data="data.createdAt" class="date"/>
    <span class="view-count">{{ data.cpViewCount }}</span>
    <span>
      <BookmarkButton
          :current-is-bookmark="data.bookmarked"
          @updateBookmark="updateBookmark(data.cpVersionSeq)"
      />
    </span>
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
  font-weight: bold;
  margin-right: 20px;
}

.name {
  flex: 1;
  font-size: 16px;
  margin-right: 30px;
}

.date {
  margin-right: 30px;
}

.view-count {
  color: #555;
  font-size: 14px;
  margin-right: 20px;
}

.bookmark-icon {
  margin-left: 5px;
  cursor: pointer;
}
</style>
