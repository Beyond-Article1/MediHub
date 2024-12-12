<script setup>
import { ref, defineEmits } from 'vue';

const emit = defineEmits();

const searchQuery = ref('');

const onInput = () => {
  emit('update:search', searchQuery.value);
};

const submitSearch = () => {
  emit('search', searchQuery.value);
};
</script>

<template>
  <div class="search-box">
    <div class="search-input">
      <input
          type="text"
          v-model="searchQuery"
          @input="onInput"
          placeholder="검색어를 입력하세요"
      />
      <button @click="submitSearch">검색</button>
    </div>
  </div>
</template>

<style scoped>
.search-box {
  display: flex;
  justify-content: center;
  width: 100%;
}

.search-input {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 600px;
}

input {
  padding: 12px;
  margin-right: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex-grow: 1;
  font-size: 16px;
}

button {
  padding: 12px 16px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
</style>
