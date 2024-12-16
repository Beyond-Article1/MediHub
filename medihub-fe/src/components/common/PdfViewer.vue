<script setup>
// pdfjs-dist 관련 import 문 제거
import {ref} from "vue";

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});

const pdfUrl = props.data.cpUrl; // PDF 파일 URL
const viewerContainer = ref(null);

// PDF 뷰어 관련 코드 추가 (예: Vue3 PDF App 사용)
</script>

<template>
  <div id="pageContainer">
    <div id="viewer" class="pdfViewer"></div>
  </div>
</template>

<style scoped>
#pageContainer {
  margin: auto;
  width: 80%;
}

.pdfViewer {
  border: 1px solid #ccc; /* 뷰어 경계선 */
}
</style>
