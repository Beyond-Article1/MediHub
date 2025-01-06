<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

import router from "@/router/index.js";

const caseList = ref([]);
const medicalLifeList = ref([]);
const boardList = ref([]);
const defaultImage = "https://via.placeholder.com/150";

const fetchCaseSharingTop3 = async () => {
  try {
    const response = await axios.get("/case_sharing/top3");
    if (response.data.success) {
      caseList.value = response.data.data;
      console.log(response.data.data);
    }
  } catch (error) {
    console.error("Error fetching top 3 cases:", error);
  }
};

const fetchTop3MedicalLife = async () => {
  try {
    const response = await axios.get("/medical-life/top3", {
    });

    medicalLifeList.value = response.data.data.map((item) => ({
      id: item.medicalLifeSeq,
      title: item.medicalLifeTitle,
      author: item.userName,
      rank: item.rankingName,
      part: item.partName,
      date: new Date(item.createdAt).toLocaleDateString("ko-KR"), // 작성일
    }));
  } catch (error) {
    console.error("Error fetching Top 3 Medical Life:", error);
  }
};

const fetchAnonymousBoardTop3 = async () => {

  try {

    const response = await axios.get("/anonymous-board/top3");

    boardList.value = response.data.data.map((item) => ({

      id: item.anonymousBoardSeq,
      title: item.anonymousBoardTitle,
      date: new Date(item.createdAt).toLocaleDateString("ko-KR")
    }));
  } catch(error) {

    boardList.value = [];
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

const goToMedicalLifeDetail = (medicalLifeSeq) => {
  router.push(`/medicalLife/${medicalLifeSeq}`);
};

const goToMedicalLifeList = () => {
  router.push("/medicallife");
};

const goToBoardDetail = (anonymousBoardSeq) => {

  router.push(`/anonymous-board/${anonymousBoardSeq}`);
};

const goToAnonymousBoardList = () => {

  router.push("/anonymous-board");
};

onMounted(() => {
  fetchCaseSharingTop3();
  fetchTop3MedicalLife();
  fetchAnonymousBoardTop3();
});
</script>

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
          <div class="case-info">
            <span class="case-author">
              {{ caseItem.caseAuthor }} ({{ caseItem.caseAuthorRankName }})
            </span>
            <span class="case-part"> - {{ caseItem.partName }} </span>
          </div>
        </div>
      </div>
    </div>

    <!-- MEDICAL LIFE Section -->
    <div class="section">
      <div class="section-header">
        <h5>MEDICAL LIFE</h5>
        <button @click="goToMedicalLifeList" class="more-button">+</button>
      </div>
      <ul class="detailed-list">
        <li
            v-for="(lifeItem, index) in medicalLifeList"
            :key="index"
            @click="goToMedicalLifeDetail(lifeItem.id)">
        <div class="list-content">
          <h6 class="list-title">{{ truncateTitle(lifeItem.title) }}</h6>
          <div class="list-author-info">
          <span>
            {{ lifeItem.author }} ({{ lifeItem.rank }}) - {{ lifeItem.part }}
          </span>
            <span class="list-date">{{ lifeItem.date }}</span>
          </div>
        </div>
        </li>
      </ul>
    </div>

    <!-- ANONYMOUS BOARD -->
    <div class="section">
      <div class="section-header">
        <h5>ANONYMOUS BOARD</h5>

        <button class="more-button" @click="goToAnonymousBoardList">+</button>
      </div>

      <ul class="detailed-board">
        <li
            v-for="(boardItem, index) in boardList"
            :key="index"
            @click="goToBoardDetail(boardItem.id)">
          <div class="board-content">
            <h6 class="board-title">{{ truncateTitle(boardItem.title) }}</h6>

            <div class="board-user-info">
              <span>익명</span>

              <span class="board-date">{{ boardItem.date }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.hot-contents {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #dddddd;
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

.more-button {
  border: none;
  background-color: #f9f9f9;
  font-size: 1.5em;
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

.case-info {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  gap: 10px;
  font-size: 0.9em;
  color: #666;
}

.case-author,
.case-part {
  font-size: 0.9em;
  color: #666;
}

.detailed-list,
.detailed-board {
  list-style: none;
  padding: 0;
}

.detailed-list li,
.detailed-board li {
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

.detailed-list li:hover,
.detailed-board li:hover {
  background-color: #f1f1f1;
}

.list-content,
.board-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.list-title,
.board-title {
  font-weight: bold;
  font-size: 1.1em;
}

.list-author-info,
.board-user-info {
  text-align: right;
  font-size: 0.9em;
  color: #666;
}

.list-date,
.board-date {
  margin-left: 10px;
  font-size: 0.8em;
  color: #999;
  text-align: right;
}
</style>