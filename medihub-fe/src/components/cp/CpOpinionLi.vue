<script setup>
import { defineProps } from "vue";
import LocalDateTimeFormat from "@/components/common/LocalDateTimeFormat.vue";

// vue 변수
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});

// JSON에서 텍스트만 추출하는 함수
function extractTextFromContent(content) {
  try {
    const parsedContent = JSON.parse(content);
    let text = '';

    parsedContent.blocks.forEach(block => {
      // 블록의 텍스트를 추가
      if (block.data && block.data.text) {
        text += stripHtml(block.data.text) + '\n'; // HTML 태그 제거 후 텍스트 추가
      }

      // 리스트 블록의 경우
      if (block.type === 'list' && block.data.items) {
        block.data.items.forEach(item => {
          text += stripHtml(item) + '\n'; // 리스트 항목의 HTML 태그 제거
        });
      }

      // 체크리스트 블록의 경우
      if (block.type === 'checklist' && block.data.items) {
        block.data.items.forEach(item => {
          text += `${item.checked ? '[x]' : '[ ]'} ${stripHtml(item.text)}\n`; // 체크리스트 항목의 HTML 태그 제거
        });
      }

      // 인용 블록의 경우
      if (block.type === 'quote' && block.data.text) {
        text += stripHtml(block.data.text) + '\n'; // 인용 텍스트의 HTML 태그 제거
      }
    });

    return text.trim(); // 최종 텍스트 반환
  } catch (error) {
    console.error("JSON 파싱 오류:", error);
    return ''; // 오류 발생 시 빈 문자열 반환
  }
}

// HTML 태그를 제거하는 함수
function stripHtml(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.innerText || tempDiv.textContent || "";
}

</script>

<template>
  <div>
    <div class="cp-opinion-top-container">
      <span style="font-weight: bold">{{ props.data.userName }}</span>
      <span>/</span>
      <template v-if="props.data.updatedAt !== null">
        <LocalDateTimeFormat :data="props.data.updatedAt"/>
      </template>
      <template v-else>
        <LocalDateTimeFormat :data="props.data.createdAt"/>
      </template>
    </div>
    <div class="cp-opinion-middle-container">
      <div>
        <i class="bi bi-hand-thumbs-up"></i>
        <span>{{ props.data.positiveVotes }}</span>
      </div>
      <div>
        <i class="bi bi-hand-thumbs-down"></i>
        <span>{{ props.data.negativeVotes }}</span>
      </div>
      <div style="margin-left: 2%">
        <span>{{ props.data.positiveRatio }}</span>
        <span>%</span>
      </div>
    </div>
    <div class="cp-opinion-bottom-class">
      <span class="opinion-content">{{ extractTextFromContent(props.data.cpOpinionContent) }}</span>
    </div>
  </div>
</template>

<style scoped>
.cp-opinion-top-container,
.cp-opinion-middle-container {
  display: flex;
  align-items: center; /* 세로 중앙 정렬 */
}

.cp-opinion-top-container {
  margin-bottom: 10px; /* 상단 여백 */
}

.cp-opinion-middle-container {
  margin-bottom: 10px; /* 중간 여백 */
}

.cp-opinion-bottom-class {
  display: flex;
  flex-wrap: wrap; /* 내용에 따라 자동 줄 바꿈 */
}

.opinion-content {
  max-height: 150px;
  overflow: hidden; /* 넘치는 내용 숨김 */
  text-overflow: ellipsis; /* 넘치는 내용에 ... 표시 */
}
</style>
