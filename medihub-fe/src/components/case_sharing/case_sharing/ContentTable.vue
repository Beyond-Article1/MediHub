<template>
  <div class="table-of-contents">
    <ul>
      <li
          v-for="(header, index) in headers"
          :key="index"
          @click="scrollToSection(header.id)"
          :class="{ active: activeHeader === header.id }"
      >
        {{ header.text }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
});

const headers = ref([]); // 헤더 목록
const activeHeader = ref(null); // 현재 활성화된 헤더

// 헤더 블록만 추출
const extractHeaders = () => {
  if (!props.content || !Array.isArray(props.content.blocks)) {
    console.warn("Invalid content data:", props.content);
    headers.value = [];
    return;
  }

  headers.value = props.content.blocks
      .filter(block => block.type === 'header' && block.data && block.data.text) // 조건 강화
      .map((block, index) => {
        const id = `header-${index}`;
        // 헤더 요소에 ID 동적으로 추가
        nextTick(() => {
          const headerElement = document.querySelectorAll(`h${block.data.level}`)[index];
          if (headerElement) {
            headerElement.setAttribute('id', id);
          }
        });
        return {
          id,
          text: block.data.text,
          level: block.data.level || 2, // 기본 레벨 추가
        };
      });
};

// 스크롤 위치로 이동
const scrollToSection = (id) => {
  nextTick(() => { // DOM 업데이트 후 스크롤 실행
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.warn(`Element with ID ${id} not found`);
    }
  });
};

// 현재 활성화된 헤더 감지
const observeHeaders = () => {
  const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            activeHeader.value = entry.target.id;
          }
        });
      },
      {threshold: 0.3} // 감지 민감도 설정
  );

  headers.value.forEach(header => {
    const target = document.getElementById(header.id);
    if (target) observer.observe(target);
  });
};

// 데이터 변경 시 감지
watch(() => props.content, () => {
  extractHeaders();
  nextTick(() => observeHeaders());
}, {immediate: true});

// 컴포넌트 마운트 시 헤더 추출 및 감지 시작
onMounted(() => {
  extractHeaders();
  nextTick(() => observeHeaders());
});
</script>

<style scoped>
.table-of-contents {

  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  width: 100%;
  background-color: #fafafa;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 12px;
  cursor: pointer;
  color: #555;
  font-size: 14px;
}

li.active {
  font-weight: bold;
  color: #007bff;
}
</style>
