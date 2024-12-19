<script setup>
import {ref, onMounted, computed} from "vue";
import {useRoute, useRouter} from "vue-router";

import axios from "axios";

import KeywordList from "@/components/case_sharing/case_sharing/KeywordList.vue";
import CaseContent from "@/components/case_sharing/case_sharing/CaseSharingContent.vue";
import ContentTable from "@/components/case_sharing/case_sharing/ContentTable.vue";
import LocalDateTimeFormat from "@/components/common/LocalDateTimeFormat.vue";

// vue 설정 변수
const route = useRoute();
const router = useRouter();

// 데이터 저장 변수
const cpOpinion = ref([]);      // 조회된 CP 의견
const jsonCpOpinion = ref([]);  // JSON 형식으로 저장한 CP 의견

onMounted(() => {
  fetchData();
})

// 데이터 호출 함수
async function fetchData() {
  try {
    const response = await axios.get(`/cp/${route.params.cpVersionSeq}/cpOpinionLocation/${route.params.cpOpinionLocationSeq}/${route.params.cpOpinionSeq}`);

    if (response.status === 200) {
      console.log("CP 의견 조회 성공");
      cpOpinion.value = response.data.data;
      jsonCpOpinion.value = JSON.parse(response.data.data.cpOpinionContent);
      console.log(cpOpinion.value);
      console.log("json 형태");
      console.log(jsonCpOpinion.value);
    } else {
      console.log("CP 의견 조회 실패");
    }
  } catch (error) {
    console.error("Error fetching case detail:", error);
  }
}

// 수정 페이지 이동 함수
function goToEditPage() {
  router.push({
    name: "CpOpinionUpdatePage",
    params: {
      cpVersionSeq: route.params.cpVersionSeq,
      cpOpinionLocationSeq: route.params.cpOpinionLocationSeq,
      cpOpinionSeq: route.params.cpOpinionSeq
    }
  });
}

// CP 의견 삭제 함수
async function deleteCase() {
  if (!window.confirm("CP 의견을 삭제하 시겠습니까?")) {
    return; // 사용자가 취소하면 종료
  }

  alert("미구현");
  return;

  try {
    // 삭제 요청
    const response = await axios.delete(`/case_sharing/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // 인증 토큰
      },
    });

    if (response.data.success) {
      alert("케이스가 성공적으로 삭제되었습니다.");
      await router.push({name: "CaseSharingList"}); // 목록 페이지로 이동
    } else {
      console.error("삭제 실패:", response.data.error);
      alert("삭제에 실패했습니다. 다시 시도해주세요.");
    }
  } catch (error) {
    console.error("Error deleting case:", error);
    alert("삭제 중 오류가 발생했습니다.");
  }

}
</script>

<template>
  <div class="case-detail-view" v-if="cpOpinion">
    <div class="top-section">
      <div class="author-info">
        <img :src="cpOpinion.profileUrl" alt="작성자 이미지" class="author-image"/>
        <div class="author-details">
          <p class="author-name">{{ cpOpinion.userName }} <span>({{ cpOpinion.partName }})</span></p>
          <LocalDateTimeFormat v-if="cpOpinion.updatedAt" :data="cpOpinion.updatedAt"/>
          <LocalDateTimeFormat v-else :data="cpOpinion.createdAt"/>
        </div>
      </div>
      <div class="button-group">
        <button class="action-button" @click="goToEditPage">수정</button>
        <button class="action-button" @click="deleteCase">삭제</button>
      </div>
    </div>
    <hr class="divider"/>
    <div class="content-wrapper">
      <div class="main-content">
        <KeywordList :keywords="cpOpinion.keywordList"/>
        <hr class="divider"/>
        <CaseContent v-if="cpOpinion.cpOpinionContent" :content="jsonCpOpinion"/>
      </div>
      <div class="sidebar">
        <div class="sticky-container">
          <ContentTable v-if="cpOpinion.cpOpinionContent" :content="jsonCpOpinion"
                        class="table-of-contents"/>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.case-detail-view {
  border: lightgray solid 1px;
  border-radius: 8px;
  padding: 20px;
  width: 1400px;
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
}

/* 상단 정보 영역 */
.top-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}


.author-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.author-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.author-details {
  font-weight: bold;
  font-size: 16px;
}

.author-name {
  margin-top: 10px;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 16px;
}

.author-details .case-date {
  color: gray;
  font-size: 12px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.action-button {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
}

.action-button:hover {
  background-color: #e0e0e0;
}

/* 구분선 */
.divider {
  margin: 10px 0;
  border: none;
  border-top: 1px solid grey;
}


.content-wrapper {
  display: flex; /* Flexbox 레이아웃 적용 */
  gap: 30px; /* 본문과 사이드바 간격 */
}

/* 왼쪽 본문 영역 */
.main-content {
  flex: 3; /* 메인 컨텐츠 비율 */
  padding: 15px;
  border-right: 1px solid #ddd; /* 테두리 선 추가 */
}

.sidebar {
  flex: 1;
}

/* 오른쪽 Table of Contents 영역 */
.sticky-container {
  position: sticky;
  top: 20px; /* 부모 컨테이너가 sticky로 고정되는 위치 */
  display: flex;
  flex-direction: column;
  gap: 20px; /* 두 컴포넌트 사이의 간격 */

}

.sidebar > * {
  margin-bottom: 20px; /* 각 컴포넌트 사이 여백 추가 */
}

.table-of-contents {
  width: 100%;
  top: 20px; /* 상단 여백 */
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 40px); /* 화면 높이에 맞춤 */
  overflow-y: auto; /* 내용이 길면 스크롤 */
}


.case-title {
  font-size: 28px;
  font-weight: bold;
}

.case-info p {
  margin: 5px 0;
}

.case-actions {
  text-align: center;
  margin-top: 20px;
}

.case-actions button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.case-actions button:hover {
  background-color: #0056b3;
}
</style>
