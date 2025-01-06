<template>
  <div class="modal" :style="modalStyle">
    <button class="close-button" @click="$emit('close')">✖</button>
    <div class="modal-header">
      <img :src="authStore.userInfo.profileImage" alt="프로필" class="profile-image" />
      <textarea
          v-model="comment"
          placeholder="댓글을 입력하세요."
          class="comment-input"
      ></textarea>
      <button class="send-button" @click="saveComment">등록</button>
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from "vue";
import {useAuthStore} from "@/stores/authStore.js";
import axios from "axios";
import {useRoute, useRouter} from "vue-router"; // authStore import

const route = useRoute();
const router = useRouter();

const props = defineProps({
  block: {type: Object, required: true},
  blockPosition: {type: Object, required: true}, // 부모 컴포넌트에서 블록 위치 전달
  caseSharingSeq: {
    type: Number,
    required: true, // 필수로 설정
  },
});

const modalStyle = computed(() => ({
  top: `${props.blockPosition.top}px`,
  left: `${props.blockPosition.left}px`,
  transform: "translate(-50%, 0)", // 중앙 정렬
  position: "absolute",
}));

const emit = defineEmits(["close", "save"]);

// authStore 사용
const authStore = useAuthStore();

const comment = ref("");

const saveComment = async () => {
  if (!comment.value.trim()) {
    alert("댓글 내용을 입력해주세요.");
    return;
  }

  const requestBody = {
    content: comment.value,
    blockId: props.block.id,
  };

  try {
    // API 호출
    const response = await axios.post(
        `/case_sharing_comment/${route.params.id}`, // URL에 caseSharingSeq 포함
        requestBody
    );

    if (response.data.success) {
      alert("댓글이 성공적으로 저장되었습니다.");
      emit("commentSaved", response.data); // 저장된 댓글 데이터 emit
      emit("close"); // 모달 닫기
    } else {
      console.error("댓글 저장 실패:", response.data.message);
      alert("댓글 저장에 실패했습니다. 다시 시도해주세요.");
    }
  } catch (error) {
    console.error("댓글 저장 중 오류 발생:", error);
    alert("댓글 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
  window.location.reload();
};

</script>

<style scoped>
.modal {
  background: white;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  width: 700px;
  height: 120px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  display: block; /* 확실히 보이게 강제 */
  z-index: 1010;
  position: relative; /* close-button 위치를 위한 기준 */
}

.close-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  position: absolute;
  top: 10px;
  right: 10px; /* 오른쪽 상단 고정 */
}

.close-button:hover {
  color: red;
}

.modal-header {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: none;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-input {
  flex: 1;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 7px 15px;
  font-size: 14px;
  outline: none;
}

.comment-input:focus {
  border-color: #ffc107;
}

.send-button {
  background: #aaaaaa;
  color: white;
  border: none;
  border-radius: 10%;
  width: 50px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
}

.send-button:hover {
  background: #666666;
}
</style>
