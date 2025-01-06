<script setup>
import { ref } from "vue";

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

const getHeaderLevel = (level) => {
  const validLevels = [1, 2, 3, 4, 5, 6];
  return validLevels.includes(level) ? `h${level}` : "h2"; // 유효하지 않으면 기본 h2 사용
};

</script>

<template>
  <div class="case-content">
    <!-- JSON 데이터 블록별 렌더링 -->
    <div
        v-for="(block, index) in content.blocks"
        :key="index"
        :id="`block-${index}`"
        class="block"
        :class="{ clickable: isFocusMode, highlighted: highlightedBlock === block.id }"
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
        <img :src="block.data.file.url" :alt="block.data.caption"/>
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

</style>