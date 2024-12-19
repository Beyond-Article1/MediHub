<template>
  <div class="case-content">
    <!-- JSON 데이터 블록별 렌더링 -->
    <div v-for="(block, index) in content.blocks" :key="index">
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
import {nextTick, watch} from "vue";

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
});

const getHeaderLevel = (level) => {
  const validLevels = [1, 2, 3, 4, 5, 6];
  return validLevels.includes(level) ? `h${level}` : 'h2'; // 유효하지 않으면 기본 h2 사용
};

// 헤더 블록 ID가 렌더링되었는지 확인
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
    { immediate: true }
);
</script>

<style scoped>
.case-content {
  line-height: 1.6;
  color: #333;
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
