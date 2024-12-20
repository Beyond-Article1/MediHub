<script setup>
import {ref, defineEmits} from 'vue';
import {useSearchStore} from '@/store/searchStore.js'; // Pinia 스토어 경로에 맞게 수정

const emit = defineEmits(); // emit 정의
const searchStore = useSearchStore(); // Pinia 스토어 인스턴스 가져오기

const searchQuery = ref('');

const onInput = () => {
  searchStore.setSearchText(searchQuery.value); // 입력 시 검색어를 Pinia 스토어에 저장
};

const submitSearch = () => {
  searchStore.setSearchText(searchQuery.value); // 검색어를 스토어에 저장
  emit('search', searchQuery.value); // 부모 컴포넌트에 검색어 전달
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
  background-color: var(--symbol-blue);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
</style>
