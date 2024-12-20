<template>
  <div class="news-section">
    <h4>NEWS</h4>
    <div class="news-items">
      <div
          v-for="(news, index) in newsList"
          :key="index"
          class="news-item"
      >
        <p>{{ news.title }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const newsList = [
  { title: "의료 기술 최신 트렌드" },
  { title: "새로운 수술 방법 개발" },
  { title: "AI를 활용한 의료 혁신" },
];
</script>

<style scoped>
.news-section {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.news-items {
  display: flex;
  gap: 10px;
}

.news-item {
  background: white;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
