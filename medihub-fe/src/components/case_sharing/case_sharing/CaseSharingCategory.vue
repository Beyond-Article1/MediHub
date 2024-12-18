<template>
  <div class="category-list">
    <div class = "title">카테고리 분류</div>
    <ul>
      <li v-for="(category, index) in categories" :key="index" class="category-item">
        <button class="category-button">{{ category }}</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from "axios";

const categories = ref([]); // 초기 빈 배열로 설정

// API 호출로 카테고리 리스트 가져오기
const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/v1/part/1');

    // axios 응답 객체에서 data를 바로 추출
    const data = response.data;

    // partName 값만 추출해 categories에 저장
    categories.value = data.map(item => item.partName);
  } catch (error) {
    console.error('Error fetching categories:', error);
    categories.value = ['불러오기 실패'];
  }
};


onMounted(() => {
  fetchCategories(); // 컴포넌트 마운트 시 API 호출
});
</script>

<style scoped>
.title{
  font-size: 22px;
  font-weight: bold;
  margin-top: 10px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-list h3 {
  margin-bottom: 0px;
  font-size: 18px;
  font-weight: bold;
}

ul {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap; /* 버튼들이 여러 줄에 걸쳐 표시됨 */
  gap: 10px; /* 버튼 사이 간격 */
  list-style: none;
  padding: 0;
}

.category-item {
  flex: 0 0 calc(50% - 10px); /* 버튼이 반반 나뉘도록 설정 (2열) */
  display: flex;
  justify-content: center;
}

.category-button {
  width: 100%; /* 버튼이 부모 요소를 꽉 채움 */
  padding: 6px 0;
  border: 2px solid #004080; /* 테두리 색상 */
  color: #004080; /* 글씨 색상 */
  background: #ffffff; /* 배경색 */
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.2s ease;
}

.category-button:hover {
  background-color: #004080; /* 배경색 변경 */
  color: #ffffff; /* 글씨색 변경 */
}
</style>
