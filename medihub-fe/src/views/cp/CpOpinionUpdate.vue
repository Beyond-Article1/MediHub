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

// 저장 버튼 클릭 시 호출
async function saveChanges() {
  try {
    // 1. Editor.js에서 데이터 가져오기
    const {content} = await caseEditor.value.getEditorData();

    // 2. 새로운 데이터 객체 준비
    const requestDTO = {
      content: JSON.stringify(content), // JSON 직렬화
      keywords: keywords.value.length > 0 ? keywords.value : [], // 키워드 처리
    };
    console.log("Request DTO:", requestDTO); // 전송할 데이터 확인

    // 3. FormData 생성 (이미지 포함)
    const formDataToSend = new FormData();
    formDataToSend.append("requestDTO", new Blob([JSON.stringify(requestDTO)], {type: "application/json"}));

    // images 배열이 있다면 추가
    const {images} = await caseEditor.value.getEditorData();
    images.forEach((file, index) => {
      formDataToSend.append("images", file, `img-${index + 1}`);
    });

    // 4. 새 버전 생성 API 호출
    const response = await axios.post(
        `/case_sharing/${route.params.id}/versions`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
    );
    // 5. 성공 처리
    if (response.data.success) {
      alert("수정이 완료되었습니다. 새 버전이 생성되었습니다.");
      const createdCaseId = response.data.data
      await router.push({name: "CaseSharingDetailView", params: {id: createdCaseId}}); // 상세 페이지로 이동
    } else {
      console.error("수정 실패:", response.data.error);
      alert("수정 중 문제가 발생했습니다.");
    }
  } catch (error) {
    console.error("Error saving changes:", error);
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
        <IconButton icon-class="bi bi-floppy"/>
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
