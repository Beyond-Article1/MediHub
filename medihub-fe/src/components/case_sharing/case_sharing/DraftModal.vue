<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h5>케이스 공유 - 임시 저장된 글</h5>
        <button @click="closeModal" class="close-btn">x</button>
      </div>
      <hr class="divider" />
      <p class="modal-description">
        임시 등록된 글은 30일 동안 최대 100개까지 저장 가능합니다.
      </p>
      <!-- 목록 -->
      <ul class="draft-list">
        <li v-for="draft in drafts" :key="draft.caseSharingSeq" class="draft-item">
          <!-- 제목 클릭 시 loadDraft 호출 -->
          <span
              class="draft-title"
              @click="loadDraft(draft.caseSharingSeq)"
          >
      {{ draft.caseSharingTitle || '제목 없음' }}
    </span>
          <!-- 등록 날짜 표시 -->
          <span class="draft-date">{{ formatDate(draft.regDate) }}</span>
          <!-- 삭제 버튼 -->
          <button
              @click.stop.prevent="deleteDraft(draft.caseSharingSeq)"
              class="delete-btn"
          >
            🗑
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import axios from 'axios';

const drafts = ref([]);
const emit = defineEmits(['close','loadDraft']);

// 모달 닫기 이벤트
const closeModal = () => {
  emit('close');
};

// 날짜 포맷 함수
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR')
};

// API 호출하여 임시 저장된 글 목록 불러오기
const fetchDrafts = async () => {
  try {
    const response = await axios.get('/case_sharing/drafts', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    drafts.value = response.data.data || [];
  } catch (error) {
    console.error('임시 저장 글 불러오기 오류:', error);
  }
};

// 임시 저장된 글 삭제
const deleteDraft = async (id) => {
  try {
    await axios.delete(`/case_sharing/drafts/${id}`);
    drafts.value = drafts.value.filter((draft) => draft.caseSharingSeq !== id);
    alert('임시 저장 글이 삭제되었습니다.');
  } catch (error) {
    console.error('삭제 오류:', error);
  }
};
// 임시 저장된 글 불러오기
const loadDraft = async (id) => {
  try {
    const response = await axios.get(`/case_sharing/drafts/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    const draftData = response.data.data;
    console.log('임시 저장 글 불러오기 성공:', draftData);

    // 부모 컴포넌트로 불러온 데이터를 전달
    emit('loadDraft', draftData);
    closeModal();
  } catch (error) {
    console.error('임시 저장 글 불러오기 오류:', error);
    alert('임시 저장 글을 불러오는데 실패했습니다.');
  }
};
onMounted(fetchDrafts);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.divider {
  margin: 10px 0;
  border: none;
  border-top: 1px solid grey;
}

.modal-content {
  background: white;
  width: 600px;
  height: 400px;
  padding: 20px;
  border-radius: 8px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  border: none;
  background: none;
  font-size: 1.2rem;
  cursor: pointer;
}

.modal-description {
  margin-left: 10px;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.draft-list {
  list-style: none;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
}

.draft-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #ddd;
}

.draft-date {
  font-size: 0.9rem;
  color: #888;
  margin-left:auto;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: red;
  font-size: 1rem;
  margin-left: 20px;
}
.draft-title {
  cursor: pointer;
  text-decoration: underline;
}

.draft-title:hover {
  color: #0056b3;
}

</style>
