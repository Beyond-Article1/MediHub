<script setup>
import {ref, onMounted, computed} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useAuthStore} from "@/store/authStore.js";

import axios from "axios";

import KeywordList from "@/components/case_sharing/case_sharing/KeywordList.vue";
import CaseContent from "@/components/case_sharing/case_sharing/CaseSharingContent.vue";
import ContentTable from "@/components/case_sharing/case_sharing/ContentTable.vue";
import LocalDateTimeFormat from "@/components/common/LocalDateTimeFormat.vue";
import SvgIconButton from "@/components/common/button/svgIconButton.vue";

// vue 설정 변수
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// 데이터 저장 변수
const cpOpinion = ref([]);      // 조회된 CP 의견
const jsonCpOpinion = ref([]);  // JSON 형식으로 저장한 CP 의견

onMounted(() => {
  fetchData();
  console.log(`/cp/${route.params.cpVersionSeq}/cpOpinionLocation/${route.params.cpOpinionLocationSeq}/${route.params.cpOpinionSeq}/cpOpinionVote`);
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

  try {
    // 삭제 요청
    const response = await axios.delete(`/cp/${route.params.cpVersionSeq}/cpOpinionLocation/${route.params.cpOpinionLocationSeq}/${route.params.cpOpinionSeq}`);

    if (response.status === 200) {
      console.log("CP 의견이 삭제 되었습니다.");
      moveToCpPage();
      alert("CP 의견 삭제가 완료되었습니다.");
    } else {
      console.log("CP 의견 삭제에 실패하였습니다.");
    }
  } catch (error) {
    console.error("CP 의견 삭제 중 예기치 못한 에러가 발생했습니다.");
    console.error(error);
  }
}

// CP 화면으로 이동 함수
function moveToCpPage() {
  router.push({
    name: 'CpDetailPage',
    params: {
      cpVersionSeq: route.params.cpVersionSeq
    }
  });
}

// CP 의견 찬성 투표 함수
async function voteInFavor() {
  try {
    const response = await axios.post(`/cp/${route.params.cpVersionSeq}/cpOpinionLocation/${route.params.cpOpinionLocationSeq}/${route.params.cpOpinionSeq}/cpOpinionVote`,
        true,
        {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
            'Content-Type': 'application/json', // Content-Type 설정
          }
        }
    );

    if (response.status === 200 || response.status === 201) {
      console.log("찬성 투표를 완료하였습니다.");
    } else {
      throw new Error("찬성 투표 중 에러가 발생했습니다.");
    }
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

// CP 의견 반대 투표 함수
async function voteAgainst() {
  try {
    const response = await axios.post(`/cp/${route.params.cpVersionSeq}/cpOpinionLocation/${route.params.cpOpinionLocationSeq}/${route.params.cpOpinionSeq}/cpOpinionVote`,
        false,
        {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
            'Content-Type': 'application/json', // Content-Type 설정
          }
        }
    );

    if (response.status === 200 || response.status === 201) {
      console.log("찬성 투표를 완료하였습니다.");
    } else {
      throw new Error("찬성 투표 중 에러가 발생했습니다.");
    }
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
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
        <svg-icon-button
            @click="voteInFavor()"
            :svgIcon="`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-hand-thumbs-up-fill' viewBox='0 0 16 16'><path d='M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a10 10 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733q.086.18.138.363c.077.27.113.567.113.856s-.036.586-.113.856c-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.2 3.2 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.8 4.8 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z'/></svg>`"
            icon-color="var(--symbol-blue)"/>
        <svg-icon-button
            @click="voteAgainst()"
            :svgIcon="`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-hand-thumbs-down-fill' viewBox='0 0 16 16'><path d='M6.956 14.534c.065.936.952 1.659 1.908 1.42l.261-.065a1.38 1.38 0 0 0 1.012-.965c.22-.816.533-2.512.062-4.51q.205.03.443.051c.713.065 1.669.071 2.516-.211.518-.173.994-.68 1.2-1.272a1.9 1.9 0 0 0-.234-1.734c.058-.118.103-.242.138-.362.077-.27.113-.568.113-.856 0-.29-.036-.586-.113-.857a2 2 0 0 0-.16-.403c.169-.387.107-.82-.003-1.149a3.2 3.2 0 0 0-.488-.9c.054-.153.076-.313.076-.465a1.86 1.86 0 0 0-.253-.912C13.1.757 12.437.28 11.5.28H8c-.605 0-1.07.08-1.466.217a4.8 4.8 0 0 0-.97.485l-.048.029c-.504.308-.999.61-2.068.723C2.682 1.815 2 2.434 2 3.279v4c0 .851.685 1.433 1.357 1.616.849.232 1.574.787 2.132 1.41.56.626.914 1.28 1.039 1.638.199.575.356 1.54.428 2.591'/></svg>`"
            icon-color="var(--symbol-blue)"/>
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

.case-info p {
  margin: 5px 0;
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

.action-button {
  background-color: #f9f9f9; /* 기존 배경색 */
  border: 1px solid #ddd; /* 기존 테두리 */
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
}

.svg-icon-button {
  background-color: #f9f9f9; /* 일반 버튼과 동일한 배경색 */
  border: 1px solid #ddd; /* 테두리 색상 */
  border-radius: 4px; /* 둥글게 처리 */
  padding: 5px; /* 적절한 패딩 */
  cursor: pointer; /* 포인터 커서 */
  display: flex; /* Flexbox 사용 */
  justify-content: center; /* 중앙 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
  transition: background-color 0.3s; /* 배경색 변경 시 부드러운 전환 효과 */
}

.svg-icon-button:hover {
  background-color: #e0e0e0; /* 호버 시 배경색 변경 */
}

</style>
