<template>
  <p>현재 모달 상태: {{ selectedBlock ? '열림' : '닫힘' }}</p>
  <!-- 댓글 작성 모달 -->
  <CommentModal
      v-if="selectedBlock"
      :block="selectedBlock"
      :blockPosition="selectedBlockPosition"
      @close="closeCommentModal"
      @save="saveComment"
  />

  <div class="case-content">
    <!-- JSON 데이터 블록별 렌더링 -->
    <div
        v-for="(block, index) in content.blocks"
        :key="index"
        :id="`block-${index}`"
        class="block"
        :class="{ clickable: isFocusMode }"
        @click="handleBlockClick(block, index)"
    >

      <!-- 헤더 블록 -->
      <component
          :is="getHeaderLevel(block.data.level)"
          v-if="block.type === 'header'"
          :id="`header-${index}`"
          class="header-block"
      >
        {{ block.data.text }}
      </component>

      <!-- 이미지 블록 -->
      <div v-else-if="block.type === 'image'" class="image-block">
        <img :src="block.data.file.url" :alt="block.data.caption" />
        <p v-if="block.data.caption">{{ block.data.caption }}</p>
      </div>

      <!-- 단락 블록 -->
      <p v-else-if="block.type === 'paragraph'" v-html="block.data.text"></p>

      <!-- 리스트 블록 -->
      <ul v-else-if="block.type === 'list' && block.data.style === 'unordered'">
        <li v-for="(item, idx) in block.data.items" :key="idx" v-html="item"></li>
      </ul>
      <ol v-else-if="block.type === 'list' && block.data.style === 'ordered'">
        <li v-for="(item, idx) in block.data.items" :key="idx" v-html="item"></li>
      </ol>

      <!-- 기타 블록 -->
      <div v-else>
        <p>지원되지 않는 블록 타입: {{ block.type }}</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, nextTick, watch } from "vue";
import CommentModal from "@/components/case_sharing/case_sharing_comment/CommentModal.vue";

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  isFocusMode: {
    type: Boolean,
    default: false,
  },
  caseSharingSeq: {
    type: Number,
    required: true, // 필수로 설정
  },
});

const emit = defineEmits(["selectBlock"]);

const selectedBlock = ref(null);
const selectedBlockPosition = ref({}); // 블록의 위치 정보

const getHeaderLevel = (level) => {
  const validLevels = [1, 2, 3, 4, 5, 6];
  return validLevels.includes(level) ? `h${level}` : "h2"; // 유효하지 않으면 기본 h2 사용
};

const handleBlockClick = (block, index) => {
  if (!props.isFocusMode) return;

  selectedBlock.value = { ...block, index };
  console.log("선택된 블록:", selectedBlock.value);

  // 블록 위치 계산
  const blockElement = document.getElementById(`block-${index}`);
  if (blockElement) {
    const rect = blockElement.getBoundingClientRect();
    selectedBlockPosition.value = {
      top: rect.bottom + window.scrollY - 250 , // 블록 아래 위치
      left: rect.left + window.scrollX + 350,
    };
    emit("selectBlock", {
      block: selectedBlock.value,
      position: selectedBlockPosition.value,
    });
    console.log("계산된 블록 위치:", selectedBlockPosition.value);
  } else {
    console.warn(`ID가 block-${index}인 요소를 찾을 수 없습니다.`);
    console.log("현재 DOM에 렌더링된 요소들:", document.querySelectorAll("[id^='block-']"));
  }
};


const closeCommentModal = () => {
  selectedBlock.value = null;
};

const saveComment = (commentData) => {
  console.log("댓글 저장:", { block: selectedBlock.value, comment: commentData });
  closeCommentModal();
};

/*// 헤더 블록 ID가 렌더링되었는지 확인
watch(
    () => props.content,
    () => {
      nextTick(() => {
        props.content.blocks.forEach((block, index) => {
          if (block.type === "header") {
            const headerElement = document.getElementById(`header-${index}`);
            if (!headerElement) {
              console.warn(`Header ID 'header-${index}' not found.`);
            }
          }
        });
      });
    },
    {immediate: true}
);*/
</script>

<style scoped>
.case-content {
  line-height: 1.6;
  color: #333;
  position: relative;
}

.block {
  padding: 10px;
  border: 1px solid transparent;
  transition: border 0.3s;
}

.block.clickable:hover {
  border: 1px solid #007bff;
  cursor: pointer;
}

.header-block {
  margin: 20px 0 10px;
  font-weight: bold;
  color: #002b5b;
}

h1 {
  font-size: 2em;
}

h2 {
  font-size: 1.8em;
}

h3 {
  font-size: 1.6em;
}

h4 {
  font-size: 1.4em;
}

h5 {
  font-size: 1.2em;
}

h6 {
  font-size: 1em;
}

p {
  margin: 10px 0;
}

.image-block {
  text-align: center;
  margin: 20px 0;
}

.image-block img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.image-caption {
  font-size: 12px;
  color: #666;
}

.unsupported-block {
  color: #dc3545;
  font-style: italic;
}
</style>