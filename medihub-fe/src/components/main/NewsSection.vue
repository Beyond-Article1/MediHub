<template>
  <div class="news-section">
    <h4>NEWS</h4>
    <div class="news-items">
      <div
          v-for="(news, index) in articles"
          :key="index"
          class="news-item"
      >
        <!-- 뉴스 이미지 -->
        <img :src="news.urlToImage" alt="News Image" class="news-image" />

        <!-- 뉴스 내용 -->
        <div class="news-content">
          <!-- 제목 -->
          <h5 class="news-title">{{ news.title }}</h5>

          <!-- 설명 -->
          <p class="news-description">{{ news.description }}</p>

          <!-- 작성자와 발행일 -->
          <p class="news-meta">
            작성자: {{ news.author }} | 발행일: {{ formatDate(news.publishedAt) }}
          </p>

          <!-- 기사 링크 -->
          <a :href="news.url" target="_blank" class="news-link">기사 읽기</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from "axios";

const articles = ref([]);
const getNewsArticles = async () => {
  try {
    const response = await axios.get(`/news/top3`);
    articles.value = response.data.data;
    console.log('뉴스 목록 조회 성공', articles.value);
  } catch(error) {
    console.error('뉴스 목록을 불러오는 중 오류 발생: ', error);
  }
}

onMounted(getNewsArticles);

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
</script>

<style scoped>
.news-section {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #dddddd;
}

.news-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.news-item {
  display: flex;
  gap: 15px;
  background: white;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}


.news-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.news-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.news-title {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 5px;
}

.news-description {
  font-size: 0.95em;
  color: #666;
  margin-bottom: 10px;
}

.news-meta {
  font-size: 0.85em;
  color: #999;
  margin-bottom: 10px;
}

.news-link {
  font-size: 0.9em;
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
  align-self: flex-start;
}

</style>