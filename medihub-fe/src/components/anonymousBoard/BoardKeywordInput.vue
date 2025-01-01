<script setup>
import { ref, defineEmits, defineProps, watch } from "vue";

const props = defineProps({

  keywordList: {

    type: Array,
    default: () => []
  }
});
const emit = defineEmits(["update:keywordList"]);

// 로컬 상태 관리
const localKeywordList = ref([...props.keywordList]);
const keywordInput = ref("");

const addKeyword = () => {

  if(keywordInput.value.trim() && localKeywordList.value.length < 10) {

    localKeywordList.value.push(keywordInput.value.trim());
    keywordInput.value = "";

    // 부모 컴포넌트에 업데이트
    emit("update:keywordList", localKeywordList.value);
  }
};

const removeKeyword = (index) => {

  localKeywordList.value.splice(index, 1);

  emit("update:keywordList", localKeywordList.value);
};

watch(() => props.keywordList, (newVal) => { localKeywordList.value = [...newVal]; });
</script>

<template>
  <div class="keyword-input">
    <input
        v-model="keywordInput"
        @keydown.enter.prevent="addKeyword"
        placeholder="# 키워드를 입력해 주세요. (최대 10개)"
    />

    <div class="keyword" v-for="(keyword, index) in localKeywordList" :key="index">
      # {{ keyword }}

      <button @click="removeKeyword(index)">X</button>
    </div>
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