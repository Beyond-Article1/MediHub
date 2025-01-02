<script setup>
import { ref } from "vue";
import CommentModal from "@/components/case_sharing/case_sharing_comment/CommentModal.vue";
import CommentListModal from "@/components/case_sharing/case_sharing_comment/CommentListModal.vue";

// props 정의
const props = defineProps({
  content: {
    type: Object,
    required: true, // content는 필수 prop입니다.
  },
  isFocusMode: {
    type: Boolean,
    default: false, // 기본값은 false입니다.
  },
});

// 이벤트 정의
const emit = defineEmits(["selectBlock"]); // selectBlock 이벤트를 발생시킵니다.

// 반응형 변수 선언
const commentedBlocks = ref([]); // 댓글이 있는 블록 ID 목록
const highlightedBlock = ref(null); // 강조된 블록 ID
const commentList = ref([]); // 선택된 블록의 댓글 목록
const isCommentListModalVisible = ref(false); // 댓글 목록 모달 표시 여부

const selectedBlock = ref(null); // 선택된 블록
const selectedBlockPosition = ref({}); // 블록의 위치 정보

// 블록의 헤더 레벨을 반환하는 함수
const getHeaderLevel = (level) => {
  const validLevels = [1, 2, 3, 4, 5, 6]; // 유효한 헤더 레벨
  return validLevels.includes(level) ? `h${level}` : "h2"; // 유효하지 않으면 기본 h2 사용
};

// 블록 클릭 핸들러
const handleBlockClick = (block, index) => {
  if (!props.isFocusMode) return; // 포커스 모드가 아닐 경우 함수 종료

  selectedBlock.value = { ...block, index }; // 선택된 블록 정보 저장
  console.log("선택된 블록:", selectedBlock.value);

  // 블록 위치 계산
  const blockElement = document.getElementById(`block-${index}`); // 해당 블록 요소 찾기
  if (blockElement) {
    const rect = blockElement.getBoundingClientRect(); // 요소의 위치 정보 가져오기
    // 블록 아래 위치 계산
    selectedBlockPosition.value = {
      top: rect.bottom + window.scrollY - 250, // 블록 아래 위치 (상단 여백 고려)
      left: rect.left + window.scrollX + 350, // 블록 왼쪽 위치 (왼쪽 여백 고려)
    };
    emit("selectBlock", {
      block: selectedBlock.value, // 선택된 블록 정보
      position: selectedBlockPosition.value, // 블록의 위치 정보
    });
    console.log("계산된 블록 위치:", selectedBlockPosition.value);
  } else {
    // 블록 요소를 찾지 못했을 때 경고 메시지
    console.warn(`ID가 block-${index}인 요소를 찾을 수 없습니다.`);
    console.log("현재 DOM에 렌더링된 요소들:", document.querySelectorAll("[id^='block-']")); // 현재 DOM에 렌더링된 블록 요소들 로그
  }
};

// 댓글 모달 닫기 함수
const closeCommentModal = () => {
  selectedBlock.value = null; // 선택된 블록 초기화
};

// 댓글 저장 함수
const saveComment = (commentData) => {
  console.log("댓글 저장:", { block: selectedBlock.value, comment: commentData }); // 댓글 데이터 로그
  closeCommentModal(); // 댓글 모달 닫기
};

// 선택된 블록 ID
const selectedBlockId = ref(null);

// 댓글 목록 모달 닫기 함수
const closeCommentListModal = () => {
  isCommentListModalVisible.value = false; // 댓글 목록 모달 숨기기
  highlightedBlock.value = null; // 강조 해제
};
</script>

<template>
  <!-- 댓글 작성 모달 -->
  <CommentModal
      v-if="selectedBlock"
      :block="selectedBlock"
      :blockPosition="selectedBlockPosition"
      @close="closeCommentModal"
      @save="saveComment"
      case-sharing-seq=""/>
  <!-- 댓글 목록 모달 -->
  <CommentListModal
      v-if="isCommentListModalVisible"
      :visible="isCommentListModalVisible"
      :comments="commentList"
      :blockPosition="selectedBlockPosition"
      :blockId="selectedBlockId"
      @close="closeCommentListModal"
  />
  <div class="case-content">
    <!-- JSON 데이터 블록별 렌더링 -->
    <div
        v-for="(block, index) in content.blocks"
        :key="index"
        :id="`block-${index}`"
        class="block"
        :class="{ clickable: isFocusMode, highlighted: highlightedBlock === block.id }"
        @click="handleBlockClick(block, index)"
    >
      <div
          v-if="commentedBlocks.includes(block.id)"
          class="comment-icon"
      >
        💬
      </div>

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

<style scoped>
.case-content {
  line-height: 1.6;
  color: #333;
  position: relative;
}

.block {
  border: 1px solid transparent;
  position: relative; /* 댓글 아이콘 위치를 위한 기준 */
  transition: border 0.3s;
}

.block.clickable:hover {
  border: 1px solid #AAAAAA;
  background-color: #dddddd;
  cursor: pointer;
}

/* 블록 강조 스타일 */
.block.highlighted {
  background-color: #eeeeee; /* 연한 파란색 배경 */
  border: 2px solid lightgrey; /* 강조된 파란색 테두리 */
}

.header-block {
  margin-top: 10px;
  font-weight: bold;
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

.comment-icon {
  position: absolute;
  top: 80%;
  right: 10px;
  transform: translateY(-50%);
  font-size: 15px;
  color: #fff; /* 텍스트 색상 흰색 */
  background-color: #DDDDDD; /* 배경색 검정 */
  border-radius: 50%; /* 동그라미 모양 */
  width: 30px; /* 아이콘의 너비 */
  height: 27px; /* 아이콘의 높이 */
  display: flex; /* 가운데 정렬 */
  align-items: center; /* 수직 가운데 정렬 */
  justify-content: center; /* 수평 가운데 정렬 */
  border: 1px solid #fff; /* 흰색 테두리 추가 */
  cursor: pointer;
  transition: transform 0.2s, color 0.3s, background-color 0.3s; /* 애니메이션 추가 */
}

.comment-icon:hover {
  background-color: #333; /* hover 시 더 밝은 검정 */
  transform: scale(1.2); /* hover 시 확대 */
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