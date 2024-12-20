<template>
  <div class="hot-contents">
    <h4>HOT CONTENTS</h4>

    <!-- CASE SHARING -->
    <div class="section">
      <div class="section-header">
        <h5>CASE SHARING</h5>
        <button @click="goToCaseSharingList" class="more-button">+</button>
      </div>
      <div class="case-sharing">
        <div
            v-for="(caseItem, index) in caseList"
            :key="index"
            class="case-item"
            @click="goToCaseDetail(caseItem.caseSharingSeq)"
        >
          <img
              :src="caseItem.firstPictureUrl || defaultImage"
              alt="Case Thumbnail"
              class="case-image"
          />
          <p class="case-title">{{ truncateTitle(caseItem.caseSharingTitle) }}</p>
          <p class="case-author">
            작성자: {{ caseItem.caseAuthor }} ({{ caseItem.caseAuthorRankName }})
          </p>
          <p class="case-part"> {{ caseItem.partName }}</p>
          <p class="case-date">{{ formatDate(caseItem.createdAt) }}</p>
        </div>
      </div>
    </div>

    <!-- MEDICAL LIFE -->
    <div class="section">
      <h5>MEDICAL LIFE</h5>
      <ul class="detailed-list">
        <li v-for="(lifeItem, index) in medicalLifeList" :key="index">
          <div class="list-content">
            <h6 class="list-title">{{ truncateTitle(lifeItem.title) }}</h6>
            <div class="list-author-info">
              <span>{{ lifeItem.author }} ({{ lifeItem.rank }}) - {{ lifeItem.part }}</span>
              <span class="list-date">{{ formatDate(lifeItem.date) }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- ANONYMOUS BOARD -->
    <div class="section">
      <h5>ANONYMOUS BOARD</h5>
      <ul class="detailed-list">
        <li v-for="(anonymousItem, index) in anonymousBoardList" :key="index">
          <div class="list-content">
            <h6 class="list-title">{{ truncateTitle(anonymousItem.title) }}</h6>
            <span class="list-date">{{ formatDate(anonymousItem.date) }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const caseList = ref([]);
const router = useRouter();
const defaultImage = "https://via.placeholder.com/150";

// MEDICAL LIFE 더미 데이터
const medicalLifeList = ref([
  {
    title: "의학계 최신 연구 발표",
    author: "김현수",
    rank: "교수",
    part: "신경외과",
    date: "2023-12-20",
  },
  {
    title: "건강한 생활 습관 가이드",
    author: "이수진",
    rank: "전문의",
    part: "가정의학과",
    date: "2023-12-18",
  },
  {
    title: "유전자 치료의 미래",
    author: "박진호",
    rank: "전공의",
    part: "유전학과",
    date: "2023-12-15",
  },
]);

// ANONYMOUS BOARD 더미 데이터
const anonymousBoardList = ref([
  { title: "병원 인턴 생활, 어떻게 하면 좋을까요?", date: "2023-12-20" },
  { title: "전공의 시험 준비, 꿀팁 공유", date: "2023-12-18" },
  { title: "의사 커리어 고민 상담 부탁드립니다.", date: "2023-12-15" },
]);

const fetchCaseSharingTop3 = async () => {
  try {
    const response = await axios.get("/case_sharing/top3");
    if (response.data.success) {
      caseList.value = response.data.data;
    }
  } catch (error) {
    console.error("Error fetching top 3 cases:", error);
  }
};

const truncateTitle = (title) => {
  return title.length > 15 ? `${title.substring(0, 15)}...` : title;
};

const formatDate = (date) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("ko-KR", options);
};

const goToCaseDetail = (caseSharingSeq) => {
  router.push(`/case_sharing/${caseSharingSeq}`);
};

const goToCaseSharingList = () => {
  router.push("/case_sharing");
};

onMounted(fetchCaseSharingTop3);
</script>

<style scoped>
.hot-contents {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.section {
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.case-sharing {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.case-item {
  background: #ffffff;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.3s;
  cursor: pointer;
}

.case-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.case-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  margin-bottom: 10px;
}

.case-title {
  font-weight: bold;
  font-size: 1.1em;
}

.case-author,
.case-part,
.case-date {
  font-size: 0.9em;
  color: #666;
}

.detailed-list {
  list-style: none;
  padding: 0;
}

.detailed-list li {
  background: #ffffff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  display: flex;
  justify-content: space-between; /* 제목 왼쪽, 작성자 오른쪽 배치 */
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.detailed-list li:hover {
  background-color: #f1f1f1;
}

.list-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.list-title {
  font-weight: bold;
  font-size: 1.1em;
}

.list-author-info {
  text-align: right;
  font-size: 0.9em;
  color: #666;
}

.list-date {
  margin-left: 10px;
  font-size: 0.8em;
  color: #999;
  text-align: right;
}
</style>
