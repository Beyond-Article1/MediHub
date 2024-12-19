<template>
  <div class="modal" v-if="visible" :style="modalStyle">
    <div class="modal-header">
      <h5>댓글 목록</h5>
      <button class="close-button" @click="closeModal">✖</button>
    </div>
    <div class="modal-body">
      <div v-if="comments.length === 0" class="no-comments">댓글이 없습니다.</div>
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <img :src="comment.userProfileURL" alt="프로필" class="profile-image" />
        <div class="comment-content">
          <p class="comment-author">{{ comment.userName }} ({{ comment.userRankName }})</p>
          <p class="comment-text">{{ comment.content }}</p>
          <p class="comment-date">{{ formatDate(comment.createdAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

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
});

const emit = defineEmits(["close"]);

const closeModal = () => {
  emit("close");
};

const modalStyle = computed(() => ({
  top: `${props.blockPosition?.top || 100}px`,
  left: `${props.blockPosition?.left +400|| 200}px`,
  position: "absolute",
  transform: "translate(-50%, 0)",
}));

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
      .getDate()
      .toString()
      .padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
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
  display: block; /* 확실히 보이게 강제 */
  z-index: 1010;
  position: relative;

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
  max-height: 300px;
  overflow-y: auto;
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

.no-comments {
  text-align: center;
  font-size: 14px;
  color: gray;
}
</style>
