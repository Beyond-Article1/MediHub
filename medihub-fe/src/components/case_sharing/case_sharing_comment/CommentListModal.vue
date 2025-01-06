<template>
  <div class="modal" v-if="visible" :style="modalStyle">
    <div class="modal-header">
      <h5>댓글 목록</h5>
      <button class="close-button" @click="closeModal">✖</button>
    </div>
    <div class="modal-body">
      <div v-if="comments.length === 0" class="no-comments">댓글이 없습니다.</div>
      <div v-for="comment in comments" :key="comment.commentSeq" class="comment-item">
        <img :src="comment.userProfileURL" alt="프로필" class="profile-image" />
        <div class="comment-content">
          <p class="comment-author">{{ comment.userName }} ({{ comment.userRankName }})</p>
          <!-- 수정 중인 댓글인지 확인 -->
          <p v-if="editingCommentId !== comment.commentSeq" class="comment-text">{{ comment.content }}</p>
          <textarea
              v-else
              v-model="editingContent"
              class="edit-textarea"
          ></textarea>
          <p class="comment-date">{{ formatDate(comment.createdAt) }}</p>
          <div v-if="comment.userId === authStore.userInfo.userId || authStore.userRole ===`ADMIN`" class="comment-actions">
            <span
                v-if="editingCommentId !== comment.commentSeq"
                class="action-text"
                @click="startEditing(comment.commentSeq)"
            >
              수정
            </span>
            <span
                v-if="editingCommentId === comment.commentSeq"
                class="action-text"
                @click="saveEdit"
            >
              저장
            </span>
            <span class="action-text" @click="deleteComment(comment.commentSeq)">삭제</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  comments: {
    type: Array,
    required: true,
  },
  blockPosition: {
    type: Object,
    required: false,
  },
  blockId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const authStore = useAuthStore();

const editingCommentId = ref(null); // 수정 중인 댓글 ID
const editingContent = ref("");

const closeModal = () => {
  emit("close");
};

const modalStyle = computed(() => ({
  top: `${props.blockPosition?.top || 100}px`,
  left: `${props.blockPosition?.left + 400 || 200}px`,
  position: "absolute",
  transform: "translate(-50%, 0)",
}));

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date
      .getDate()
      .toString()
      .padStart(2, "0")} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
};

const startEditing = (commentSeq) => {
  const selectedComment = props.comments.find((comment) => comment.commentSeq === commentSeq);

  if (!selectedComment) {
    console.error("startEditing: Comment not found for commentSeq:", commentSeq);
    return;
  }

  editingCommentId.value = selectedComment.commentSeq;
  editingContent.value = selectedComment.content;

};

const saveEdit = async () => {
  try {
    if (!editingCommentId.value) {
      return;
    }

    // API 호출
    const response = await axios.put(`/case_sharing_comment/${editingCommentId.value}`, {
      content: editingContent.value,
      blockId: props.blockId,
    });

    if (response.status === 200) {

      // 수정한 내용을 comments에 반영
      const comment = props.comments.find((c) => c.commentSeq === editingCommentId.value);
      if (comment) {
        comment.content = editingContent.value;
      }

      alert("수정이 완료되었습니다.");

      // 수정 모드 종료
      editingCommentId.value = null;
      editingContent.value = "";
    }
  } catch (error) {
    console.error(error);
  }
  window.location.reload();
};

const deleteComment = async (commentSeq) => {
  try {
    // 사용자에게 확인 알림 표시
    const userConfirmed = window.confirm("정말로 이 댓글을 삭제하시겠습니까?");
    if (!userConfirmed) {
      return; // 사용자가 취소한 경우 삭제 로직 중단
    }

    // 삭제 API 호출
    const response = await axios.delete(`/case_sharing_comment/${commentSeq}`);

    // 삭제 성공 메시지 알림
    alert("댓글이 삭제되었습니다.");

    // 삭제된 댓글을 props.comments 배열에서 제거
    const index = props.comments.findIndex((comment) => comment.commentSeq === commentSeq);
    if (index !== -1) {
      props.comments.splice(index, 1);
    }
  } catch (error) {
    alert("댓글 삭제 중 오류가 발생했습니다. 다시 시도해주세요."); // 삭제 실패 시 알림
  }
  window.location.reload();
};


</script>

<style scoped>
.modal {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  padding: 20px;
  width: 700px;
  height: 200px;
  display: block;
  z-index: 1010;
  position: relative;
  overflow-y: auto; /* 스크롤 속성 추가 */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.close-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
}

.close-button:hover {
  color: red;
}

.modal-body {
  max-height: none; /* 높이 제한 제거 */
  overflow-y: visible; /* 스크롤링 방지 */
}

.comment-item {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
}

.comment-author {
  font-weight: bold;
  margin-bottom: 5px;
}

.comment-text {
  margin: 5px 0;
}

.comment-date {
  font-size: 12px;
  color: gray;
}

.comment-actions {
  margin-top: 5px;
}

.action-text {
  cursor: pointer;
  color: #007bff;
  margin-right: 10px;
}

.action-text:hover {
  text-decoration: underline;
  color: #0056b3;
}

.no-comments {
  text-align: center;
  font-size: 14px;
  color: gray;
}

.edit-textarea {
  width: 100%;
  height: 60px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  font-size: 14px;
}
</style>
