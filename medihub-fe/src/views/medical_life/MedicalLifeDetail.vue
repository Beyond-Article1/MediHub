<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

import axios from 'axios';
import LocalDateTimeFormat from '@/components/common/LocalDateTimeFormat.vue';
import beforeLike from '@/assets/images/like/before-like.png';
import afterLike from '@/assets/images/like/after-like.png';
import beforeBookmark from "@/assets/images/bookmark/before-bookmark.png";
import afterBookmark from "@/assets/images/bookmark/after-bookmark.png";
import LineDivider from "@/components/medicallife/MedicalLifeLineDivider.vue";
import Pagination from '@/components/common/Pagination.vue';

const boardDetail = ref({});
const comment = ref([]);
const commentCount = ref(0);
const currentCommentPage = ref(1);
const commentItemCount = ref(10);
const totalComment = ref(0);
const newCommentContent = ref('');
const characterCount = ref(0);
const route = useRoute();

const fetchBoardDetail = async () => {
  const medicalLifeSeq = route.params.id;

  try {
    const response = await axios.get(`/medical-life/detail/${medicalLifeSeq}`);
    boardDetail.value = response.data.data || {};
    boardDetail.value.isLiked = false;
    boardDetail.value.isBookmark = false;

    await fetchComment(medicalLifeSeq);
  } catch (error) {
    console.error('Error fetching board detail:', error);
  }
};

const fetchComment = async (medicalLifeSeq) => {
  try {
    const response = await axios.get(`/medical-life/${medicalLifeSeq}/comments`);
    comment.value = response.data.data || [];
    commentCount.value = comment.value.length;
    totalComment.value = commentCount.value;
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
};

const toggleLike = () => {
  boardDetail.value.isLiked = !boardDetail.value.isLiked;
};

const toggleBookmark = () => {
  boardDetail.value.isBookmark = !boardDetail.value.isBookmark;
};

const data = computed(() => {
  try {
    const medicalLifeContent = JSON.parse(boardDetail.value.medicalLifeContent);
    return medicalLifeContent.blocks.map(block => block.data.text).join(' ');
  } catch (error) {
    console.error('Error parsing board content:', error);
    return '';
  }
});

const paginatedComment = computed(() => {
  const start = (currentCommentPage.value - 1) * commentItemCount.value;
  return comment.value.slice(start, start + commentItemCount.value);
});

const changePage = (page) => {
  currentCommentPage.value = page;
};

const addComment = async () => {
  if (!newCommentContent.value.trim()) {
    alert('댓글 내용을 입력해 주세요.');
    return;
  }

  const medicalLifeSeq = route.params.id;

  try {
    const response = await axios.post(`/medical-life/${medicalLifeSeq}/comments`, {
      commentContent: newCommentContent.value
    }, {
      headers: { 'Content-Type': 'application/json' },
    });

    const commentSeq = response.data.data;
    comment.value.push({
      id: commentSeq,
      commentContent: newCommentContent.value,
      createdAt: new Date().toISOString(),
    });
    newCommentContent.value = '';
    totalComment.value++;
    commentCount.value = comment.value.length;

    alert('댓글 등록이 완료되었습니다.');
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};

const updateCharacterCount = () => {
  characterCount.value = newCommentContent.value.length;
};

onMounted(() => {
  fetchBoardDetail();
});
</script>

<template>
  <div class="board-detail" v-if="boardDetail.userName">
    <h1 class="board-title">{{ boardDetail.medicalLifeTitle }}</h1>
    <div class="board-info">
      <img class="profile-pic" src="@/assets/images/anonymousBoard/empty-profile.png" alt="Profile Picture" />
      <p class="author">{{ boardDetail.userName }} ({{ boardDetail.rankingName || '정보 없음' }})</p>
      <p class="date"><LocalDateTimeFormat :data="boardDetail.createdAt" /></p>
      <p class="view-count">조회수: {{ boardDetail.medicalLifeViewCount }}</p>
      <div class="actions">
        <div class="like-btn align-mid" @click="toggleLike">
          <img :src="boardDetail.isLiked ? afterLike : beforeLike" alt="좋아요" />
        </div>
        <div class="bookmark-btn align-mid" @click="toggleBookmark">
          <img :src="boardDetail.isBookmark ? afterBookmark : beforeBookmark" alt="북마크" />
        </div>
      </div>
    </div>

    <LineDivider />

    <div v-if="boardDetail.keywords && boardDetail.keywords.length">
      <h2 class="keyword-title">Keywords</h2>
      <div class="keyword-list">
        <span v-for="(keyword, index) in boardDetail.keywords" :key="index" class="keyword-item">
          # {{ keyword.keywordName }}
        </span>
      </div>
    </div>

    <LineDivider />
    <p class="content">{{ data }}</p>

    <div class="comment-section">
      <h2>댓글 ({{ commentCount }})</h2>
      <div v-for="(commentItem, index) in paginatedComment" :key="index" class="comment">
        <p class="comment-author">{{ commentItem.userName || '익명' }}</p>
        <p class="comment-content">{{ commentItem.commentContent }}</p>
        <p class="comment-date"><LocalDateTimeFormat :data="commentItem.createdAt" /></p>
      </div>
      <Pagination
          :totalData="totalComment"
          :limitPage="commentItemCount"
          :page="currentCommentPage"
          @updatePage="changePage"
      />
    </div>

    <div class="comment-input">
      <span class="char-count">{{ characterCount }} / 1000</span>
      <textarea
          v-model="newCommentContent"
          placeholder="댓글을 입력하세요."
          maxlength="1000"
          @input="updateCharacterCount"
      ></textarea>
      <button @click="addComment">댓글 달기</button>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>

<style scoped>
.board-detail {
  margin: 40px;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid black;
}

.board-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 5px;
}

.board-info {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.author-info {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.profile-pic {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 100px;
}

.author,
.date,
.view-count {
  font-size: 18px
}

.author {
  font-weight: bold;
  margin-top: 15px;
  margin-right: 100px;
}

.date {
  margin-top: 15px;
  margin-right: 100px;
}

.view-count {
  margin-top: 15px;
}

.actions {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.like-btn,
.bookmark-btn {
  cursor: pointer;
  margin-left: 10px;
}

.like-btn img,
.bookmark-btn img {
  width: 25px;
}

.keyword-detail {
  border-radius: 8px;
  border: 1px solid black;
  padding: 20px;
}

.keyword-detail {
  font-size: 25px;
  margin-top: 30px;
  margin-bottom: 30px;
  font-weight: bold;
}

.keyword-title,
.comment-title {
  font-size: 25px;
  font-weight: bold;
}

.comment-title {
  margin: 0;
}

.comment-count {
  font-weight: bold;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.keyword-item {
  background-color: #fff0d3;
  padding: 8px 12px;
  font-size: 20px;
}

.content {
  margin-top: 25px;
  margin-bottom: 20px;
  font-size: 20px
}

.picture-list img {
  max-width: 100%;
  height: auto;
  margin: 10px 0;
  font-size: 20px
}

.comment-section {
  border-radius: 8px;
  border: 1px solid black;
  padding: 20px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment {
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment-author,
.comment-text,
.comment-date {
  font-size: 18px;
}

.comment-author {
  font-weight: bold;
  margin-right: 10px;
}

.comment-text {
  font-weight: bold;
}

.comment-date {
  font-weight: bold;
  margin-left: 10px;
}

.comment-input {
  margin-top: 30px;
  position: relative;
  width: 100%;
}

.comment-input textarea {
  width: 100%;
  height: 200px;
  border: 1px solid black;
  border-radius: 4px;
  padding: 10px;
  resize: none;
}

.char-count {
  position: absolute;
  top: 10px;
  right: 23px;
  font-size: 15px;
  color: #666;
}

.comment-input button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: white;
  color: #003366;
  border: 1px solid #003366;
  border-radius: 7px;
  cursor: pointer;
  font-weight: bold;
  width: 90px;
  height: 30px;
}
</style>
