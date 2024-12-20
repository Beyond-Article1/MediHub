<script setup>
import { ref, defineEmits } from "vue";

const keywords = ref([]);
const keywordInput = ref("");
const emit = defineEmits(["update:keywords"]);

const addKeyword = () => {

  if(keywordInput.value.trim() && keywords.value.length < 10) {

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

<template>
  <div class="keyword-input">
    <input v-model="keywordInput" @keydown.enter.prevent="addKeyword" placeholder="# 키워드를 입력해 주세요. (최대 10개)"/>

    <span class="keyword" v-for="(keyword, index) in keywords" :key="index">
      # {{ keyword }}

      <button @click="removeKeyword(index)">X</button>
    </span>
  </div>
</template>

<style scoped>
.keyword-input {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.keyword-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.keyword {
  background-color: #003366;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 7px;
  display: flex;
  align-items: center;
}

.keyword button {
  background: none;
  border: none;
  color: white;
  margin-left: 5px;
  cursor: pointer;
}
</style>
