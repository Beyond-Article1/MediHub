<template>
  <div class="tag-input">
    <div v-for="(keyword, index) in localKeywords" :key="index" class="tag">
      {{ keyword }}
      <button @click="removeKeyword(index)">x</button>
    </div>
    <input
        v-model="keywordInput"
        @keydown.enter.prevent="addKeyword"
        placeholder="#키워드를 입력해주세요 (최대 10개)"
    />
    <span v-for="(keyword, index) in keywords" :key="index" class="tag">
      {{ keyword }}
      <button @click="removeKeyword(index)">x</button>
    </span>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps, watch } from "vue";

const props = defineProps({
  keywords: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:keywords"]);

const keywords = ref([]);
const localKeywords = ref([...props.keywords]); // 로컬 상태 관리


const keywordInput = ref("");

const addKeyword = () => {
  if (keywordInput.value.trim() && localKeywords.value.length < 10) {
    localKeywords.value.push(keywordInput.value.trim());
    keywordInput.value = "";
    emit("update:keywords", localKeywords.value); // 부모 컴포넌트에 업데이트
  }
};

const removeKeyword = (index) => {
  keywords.value.splice(index, 1);
  emit("update:keywords", keywords.value);
};

watch(
    () => props.keywords,
    (newVal) => {
      localKeywords.value = [...newVal];
    }
);
</script>

<style scoped>
.tag-input {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.tag {
  background-color: #007bff;
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  display: flex;
  align-items: center;
}

.tag button {
  background: none;
  border: none;
  color: white;
  margin-left: 5px;
  cursor: pointer;
}
</style>
