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
          @click.stop="openCommentList(block, index)"
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
      <div v-else-if="block.type === 'list'" class="list-block">
        <!-- Unordered List -->
        <ul v-if="block.data.style === 'unordered'">
          <li v-for="(item, idx) in block.data.items" :key="idx">
            <!-- item.content로 텍스트 렌더링 -->
            <span v-html="item.content"></span>
          </li>
        </ul>
        <!-- Ordered List -->
        <ol v-else-if="block.data.style === 'ordered'">
          <li v-for="(item, idx) in block.data.items" :key="idx">
            <!-- item.content로 텍스트 렌더링 -->
            <span v-html="item.content"></span>
          </li>
        </ol>
      </div>



      <!-- 코드 블록 -->
      <pre v-else-if="block.type === 'code'" class="code-block">
        <code>{{ block.data.code }}</code>
      </pre>

      <!-- 테이블 블록 -->
      <table v-else-if="block.type === 'table'" class="table-block">
        <tr v-for="(row, rowIndex) in block.data.content" :key="rowIndex">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex" v-html="cell"></td>
        </tr>
      </table>

      <!-- 체크리스트 블록 -->
      <ul v-else-if="block.type === 'checklist'" class="checklist-block">
        <li
            v-for="(item, idx) in block.data.items"
            :key="idx"
            :class="{ checked: item.checked }"
        >
          <input type="checkbox" :checked="item.checked" disabled />
          <span v-html="item.text"></span>
        </li>
      </ul>

      <!-- 인용 블록 -->
      <blockquote v-else-if="block.type === 'quote'" class="quote-block">
        <p v-html="block.data.text"></p>
        <footer v-if="block.data.caption">- {{ block.data.caption }}</footer>
      </blockquote>

      <!-- 구분선 블록 -->
      <hr v-else-if="block.type === 'delimiter'" class="delimiter-block" />

      <!-- 임베드 블록 -->
      <div v-else-if="block.type === 'embed'" class="embed-block">
        <iframe
            :src="block.data.embed"
            :width="block.data.width"
            :height="block.data.height"
            frameborder="0"
            allowfullscreen
        ></iframe>
        <p v-if="block.data.caption">{{ block.data.caption }}</p>
      </div>

      <!-- 지원되지 않는 블록 -->
      <div v-else class="unsupported-block">
        <p>지원되지 않는 블록 타입: {{ block.type }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from "vue";
import axios from "axios";
import CommentModal from "@/components/case_sharing/case_sharing_comment/CommentModal.vue";
import CommentListModal from "@/components/case_sharing/case_sharing_comment/CommentListModal.vue"
import {useRoute, useRouter} from "vue-router";


const route = useRoute();
const router = useRouter();

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  isFocusMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["selectBlock"]);

const commentedBlocks = ref([]); // 댓글이 있는 블록 ID 목록
const highlightedBlock = ref(null); // 강조된 블록 ID
const commentList = ref([]); // 선택된 블록의 댓글 목록
const isCommentListModalVisible = ref(false); // 댓글 목록 모달 표시 여부

const selectedBlock = ref(null);
const selectedBlockPosition = ref({}); // 블록의 위치 정보

const getHeaderLevel = (level) => {
  const validLevels = [1, 2, 3, 4, 5, 6];
  return validLevels.includes(level) ? `h${level}` : "h2"; // 유효하지 않으면 기본 h2 사용
};

const fetchCommentedBlocks = async () => {
  try {
    const response = await axios.get(`/case_sharing_comment/${route.params.id}`);
    if (response.data.success) {
      commentedBlocks.value = response.data.data.map((item) => item.blockId); // blockId 목록 저장
    } else {
      console.error("댓글 여부 조회 실패:", response.data.error);
    }
  } catch (error) {
    console.error("댓글 여부 조회 중 오류 발생:", error);
  }
};

const handleBlockClick = (block, index) => {
  if (!props.isFocusMode) return;

  selectedBlock.value = {...block, index};

  // 블록 위치 계산
  const blockElement = document.getElementById(`block-${index}`);
  if (blockElement) {
    const rect = blockElement.getBoundingClientRect();
    selectedBlockPosition.value = {
      top: rect.bottom + window.scrollY - 250, // 블록 아래 위치
      left: rect.left + window.scrollX + 350,
    };
    emit("selectBlock", {
      block: selectedBlock.value,
      position: selectedBlockPosition.value,
    });
  } else {
    console.log("현재 DOM에 렌더링된 요소들:", document.querySelectorAll("[id^='block-']"));
  }
};


const closeCommentModal = () => {
  selectedBlock.value = null;
};

const saveComment = (commentData) => {
  console.log("댓글 저장:", {block: selectedBlock.value, comment: commentData});
  closeCommentModal();
};

const selectedBlockId = ref(null);

const openCommentList = async (block, index) => {
  highlightedBlock.value = block.id;
  selectedBlockId.value = block.id;
  const blockElement = document.getElementById(`block-${index}`);
  if (blockElement) {
    const rect = blockElement.getBoundingClientRect();
    selectedBlockPosition.value = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    };
  }

  try {
    const response = await axios.get(
        `/case_sharing_comment/${route.params.id}/comments/${block.id}`
    );
    if (response.data.success) {
      commentList.value = response.data.data; // 댓글 데이터 저장
      isCommentListModalVisible.value = true;
    } else {
      console.error("댓글 목록 조회 실패:", response.data.error);
    }
  } catch (error) {
    console.error("댓글 목록 조회 중 오류 발생:", error);
  }
};

const closeCommentListModal = () => {
  isCommentListModalVisible.value = false;
  highlightedBlock.value = null; // 강조 해제
};

onMounted(fetchCommentedBlocks);
</script>

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