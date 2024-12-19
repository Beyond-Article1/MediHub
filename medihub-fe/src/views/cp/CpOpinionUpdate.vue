<script setup>
import {onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";

import axios from "axios";

import CaseEditor from "@/components/case_sharing/case_sharing/CaseSharingEditor.vue";
import CaseTagInput from "@/components/case_sharing/case_sharing/CaseTagInput.vue";
import IconButton from "@/components/common/button/IconButton.vue";

// vue 설정 변수
const route = useRoute();
const router = useRouter();

// 데이터 저장 변수
const caseEditor = ref(null);   // Editor.js 인스턴스
const keywords = ref([]);       // 키워드 상태
const cpOpinion = ref([]);      // CP 의견 정보
const jsonCpOpinion = ref([]);  // JSON 형식 CP 의견 정보

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
      keywords.value = response.data.data.keywordList.map((keyword) => keyword.keywordName);
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

async function saveChanges() {
  try {
    const { content } = await caseEditor.value.getEditorData();

    if (!content || content.blocks.length === 0) {
      alert("본문 내용을 입력해주세요.");
      return;
    }

    const requestBody = new FormData();
    const requestDto = {
      cpOpinionContent: JSON.stringify(content),
      keywordList: keywords.value.length > 0 ? keywords.value : [],
    };

    // JSON 문자열을 직접 FormData에 추가
    requestBody.append("data", JSON.stringify(requestDto));

    const response = await axios.put(
        `/cp/${route.params.cpVersionSeq}/cpOpinionLocation/${route.params.cpOpinionLocationSeq}/${route.params.cpOpinionSeq}`,
        requestBody
    );

    if (response.status === 200) {
      alert("CP 의견 수정이 완료되었습니다.");
    } else {
      alert("CP 의견 수정 중 문제가 발생했습니다.");
    }
  } catch (error) {
    console.error("CP 의견 수정 중 예기치 못한 에러가 발생했습니다.");
    console.error(error);
    alert("저장 중 오류가 발생했습니다.");
  }
}


// 수정 취소 함수
function cancelEdit() {
  router.push({
    name: "CpOpinionPage",
    params: {
      cpVersionSeq: route.params.cpVersionSeq,
      cpOpinionLocationSeq: route.params.cpOpinionLocationSeq,
      cpOpinionSeq: route.params.cpOpinionSeq
    }
  });
}
</script>

<template>
  <div class="case-sharing-create">
    <!-- 페이지 제목 및 저장 버튼 -->
    <div class="case-header">
      <div class="case-title">CP 의견 수정</div>
      <div class="case-actions">
        <IconButton @click="saveChanges()" icon-class="bi bi-floppy"/>
        <IconButton @click="cancelEdit()" icon-class="bi bi-x-circle"/>
      </div>
    </div>
    <!-- Editor.js 에디터 -->
    <div class="editor-wrapper">
      <CaseEditor ref="caseEditor" :initialData="jsonCpOpinion"/>
    </div>

    <!-- 키워드 입력 -->
    <div class="case-tags">
      <div class="tag-list">
        <!-- 키워드 데이터를 CaseTagInput에 전달 -->
        <CaseTagInput v-model:keywords="keywords"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.case-actions {
  display: flex;
  align-items: center;
  gap: 10px; /* 저장 버튼 간 간격 설정 */
}

.case-title {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: left;
  margin-bottom: 10px;
}

.case-sharing-create {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f9f9f9;
}

.case-header {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 10px;
  justify-content: space-between;
}

.case-header h2 {
  font-size: 1.5em;
  margin-bottom: 10px;
  text-align: center;
}

.title-input {
  width: 1200px;
  padding: 15px;
  font-size: 1.1em;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  margin-bottom: 20px;
}

.editor-wrapper {
  width: 100%;
  max-width: 1200px;
  height: 650px;
  margin-bottom: 20px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.case-tags {
  width: 100%;
  max-width: 1200px;
  margin-top: 100px; /* 본문과의 간격 */
  margin-bottom: 20px; /* 키워드 입력 아래 여백 */
  text-align: left; /* 키워드 입력 왼쪽 정렬 */
  box-sizing: border-box;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px; /* 키워드와 입력창 사이 간격 */
}
</style>
