<template>
  <div class="news-section">
    <h4>NEWS</h4>
    <div class="news-items">
      <div
          v-for="(news, index) in newsList"
          :key="index"
          class="news-item"
      >
        <!-- 뉴스 이미지 -->
        <img :src="news.image" alt="News Image" class="news-image" />

        <!-- 뉴스 내용 -->
        <div class="news-content">
          <!-- 제목 -->
          <h5 class="news-title">{{ news.title }}</h5>

          <!-- 설명 -->
          <p class="news-description">{{ news.description }}</p>

          <!-- 작성자와 발행일 -->
          <p class="news-meta">
            작성자: {{ news.author }} | 발행일: {{ news.date }} | {{ news.publisher }}
          </p>

          <!-- 기사 링크 -->
          <a :href="news.link" target="_blank" class="news-link">기사 읽기</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const newsList = [
  {
    title: "[데이터뉴스]스마트 의료기기 시장 연평균 15% 성장",
    description: "최신 의료 기술 트렌드와 혁신 사례를 소개합니다.",
    author: "송혜영 기자",
    date: "2024-12-20",
    publisher: "전자신문",
    link: "https://n.news.naver.com/mnews/article/030/0003223999",
    image: "https://search.pstatic.net/common/?src=http%3A%2F%2Fimgnews.naver.net%2Fimage%2F030%2F2024%2F07%2F17%2F0003223999_001_20240718102716599.jpg&type=a340", // 뉴스 이미지
  },
  {
    title: "수면내시경 중 의식 잃은 40대, 끝내 사망…의료 과실 수사",
    description: "광주광역시의 한 병원에서 수면 내시경 검사를 받던 40대가 숨져 경찰이 수...",
    author: "이가영 기자",
    date: "2024-12-18",
    publisher: "조선일보",
    link: "https://www.chosun.com/national/national_general/2024/12/20/ZG6IBFQTOBD2VAF3I3ORPFWXV4/?utm_source=naver&utm_medium=referral&utm_campaign=naver-news",
    image: "https://www.chosun.com/resizer/v2/3JLCSGEL7ZFLTPVWTDFNQ675SM.png?auth=fbeed8ea48112ca4c487bf8c0f7f816fc7fff26617889f02491f5b0962b45207&width=616", // 뉴스 이미지
  },
  {
    title: "정부, 내년 보건의료 R&D 2조1047억 지원…올해보다 2723억↑",
    description: "박영주 기자 = 정부가 내년 보건의료 주요 연구개발(R&D)에 2조1047억원을 지원하기로 했다. 이는 올해보다 2723억 증액된",
    author: "박철수",
    date: "2024-12-15",
    publisher: "뉴시스",
    link: "https://www.newsis.com/view/NISX20241220_0003004981",
    image: "https://img1.newsis.com/2022/09/01/NISI20220901_0001075913_web.jpg?rnd=20220901144847", // 뉴스 이미지
  },
];
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