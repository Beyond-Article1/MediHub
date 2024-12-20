<script setup>
import { defineProps, defineEmits } from "vue";
import beforeLike from '@/assets/images/like/before-like.png';
import afterLike from '@/assets/images/like/after-like.png';

// 부모 컴포넌트로부터 전달받는 props
const props = defineProps({

  currentIsLike: Boolean // 현재 좋아요 유무 true, false
});

// 이벤트 전송 emit
const emit = defineEmits(["updateLike"]);

// 좋아요 버튼 클릭 이벤트
function onClickLike(event) {

  // 부모 이벤트 전파 방지
  event.stopPropagation();

  // 현재 좋아요 상태를 반대로 만들어 상위 컴포넌트에 전달
  emit("updateLike", !props.currentIsLike);
}
</script>

<template>
  <div class="like-btn align-mid" @click="onClickLike()">
    <img :src="currentIsLike ? afterLike : beforeLike" :alt="currentIsLike ? 'After' : 'Before'"/>
  </div>
</template>

<style scoped>
.like-btn {
  cursor: pointer;
}

.like-btn img {
  width: 25px;
}
</style>