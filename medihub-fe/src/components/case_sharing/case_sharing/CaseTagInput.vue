<template>
  <div class="tag-input">
    <input
        v-model="keywordInput"
        @keydown.enter.prevent="addKeyword"
        placeholder="#태그를 입력해주세요 (최대 10개)"
    />
    <span v-for="(keyword, index) in keywords" :key="index" class="tag">
      {{ keyword }}
      <button @click="removeKeyword(index)">x</button>
    </span>
  </div>
</template>

<script setup>
import { ref, defineEmits } from "vue";

const keywords = ref([]);
const keywordInput = ref("");
const emit = defineEmits(["update:keywords"]);

const addKeyword = () => {
  if (keywordInput.value.trim() && keywords.value.length < 10) {
    keywords.value.push(keywordInput.value.trim());
    keywordInput.value = "";
    emit("update:keywords", keywords.value);
  }
};

const removeKeyword = (index) => {
  keywords.value.splice(index, 1);
  emit("update:keywords", keywords.value);
};
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
