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
const categories = [
  '내과', '응급의학과', '외과', '마취통증의학과', '소아청소년과',
  '비뇨의학과', '산부인과', '피부과', '재활의학과', '안과',
  '진단검사의학과', '이비인후과', '병리과', '치과',
  '영상의학과', '가정의학과', '정신건강의학과', '직업환경의학과'
];
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
