<script setup>
import html2canvas from "html2canvas";
import axios from "axios";

import {onMounted, ref} from "vue";
import {useAuthStore} from '@/store/authStore.js';
import {useRoute, useRouter} from "vue-router";

import Button from "@/components/common/button/Button.vue";
import CaseEditor from "@/components/case_sharing/case_sharing/CaseSharingEditor.vue";
import CaseTagInput from "@/components/case_sharing/case_sharing/CaseTagInput.vue";
import TemplateCreateModal from "@/components/case_sharing/template/TemplateCreateModal.vue";

// Vue 설정 변수
const authStore = useAuthStore();
const accessToken = authStore.accessToken;
const router = useRouter();
const route = useRoute();

// 데이터 저장 번수
const keywords = ref([]); // 태그 상태
const caseEditor = ref(null); // Editor.js 참조
const cpOpinionSeq = ref();   // 데이터 생성 후 시퀀스값 저장
let cpOpinionLocationSeq = parseInt(route.params.cpOpinionLocationSeq, 10);     // CP 의견 위치 시퀀스

// 키워드 업데이트 함수
const updateKeywords = (newKeywords) => {
  keywords.value = newKeywords;
};

// onMounted(() => {
//   console.log(`전달받은 x = ${newPositionX.value}`);
//   console.log(`전달받은 y = ${newPositionY.value}`);
// })

// 데이터 저장 함수
const handleSave = async () => {
  try {
    // Editor.js에서 데이터와 이미지 파일 가져오기
    const {content} = await caseEditor.value.getEditorData();

    if (!content || content.blocks.length === 0) {
      alert("본문 내용을 입력해주세요.");
      return;
    }

    // FormData 생성
    const formData = new FormData();

    // 데이터 직렬화 (content를 JSON 문자열로 변환)
    const data = {
      cpOpinionContent: JSON.stringify(content), // content를 JSON 문자열로 변환
      keywordList: keywords.value.length > 0 ? keywords.value : [], // 키워드 처리
    };

    // FormData에 데이터 추가
    formData.append("data", JSON.stringify(data));

    console.log("FormData 전송:", data);
    await sendData(formData);
    alert("저장이 완료되었습니다.");
  } catch (error) {
    alert("저장 중 오류가 발생했습니다.");
  }
};

// 새로운 위치 생성 함수
async function createNewLocation() {
  const cpOpinionLocationPageNum = parseInt(route.query.pageNum); // 쿼리에서 페이지 번호 가져오기
  const newPositionX = parseFloat(route.query.x);                 // 쿼리에서 x 좌표 가져오기
  const newPositionY = parseFloat(route.query.y);                 // 쿼리에서 y 좌표 가져오기

  try {
    // 데이터 전송
    const response = await axios.post(`cp/${route.params.cpVersionSeq}/cpOpinionLocation`, {
      cpOpinionLocationX: newPositionX,
      cpOpinionLocationY: newPositionY,
      cpOpinionLocationPageNum: cpOpinionLocationPageNum
    });

    if (response.status === 200 || response.status === 201) {
      console.log("새로운 CP 의견 위치 생성에 성공하였습니다.");
      console.log(response.data.data.cpOpinionLocationSeq);
      cpOpinionLocationSeq = response.data.data.cpOpinionLocationSeq;

      return cpOpinionLocationSeq;
    } else {
      console.error("새로운 CP 의견 위치 생성에 실패하였습니다:", response.data);
    }
  } catch (error) {
    console.error("위치를 생성하는 중 예기치 못한 에러가 발생했습니다.");
    console.error(error.response ? error.response.data : error.message);
  }
}

async function deleteLocation() {
  try {
    if (cpOpinionLocationSeq === -1) {
      const response = await axios.delete(`cp/${route.params.cpVersionSeq}/cpOpinionLocation/${cpOpinionLocationSeq}`);

      if (response.status === 200) {
        console.log("CP 의견 위치를 삭제 했습니다.");
      } else {
        throw new Error("CP 의견 위치 삭제에 실패했습니다.");
      }
    }
  } catch (error) {
    console.error(error);
  }
}

// 데이터 전송 함수
async function sendData(formData) {
  try {
    // 신규 위치에 의견을 작성하는 경우
    // console.log("check");
    // console.log(cpOpinionLocationSeq === -1);
    if (cpOpinionLocationSeq === -1) {
      console.log("cpOpinionLocationSeq === -1");
      cpOpinionLocationSeq = await createNewLocation(); // await를 사용하여 비동기 처리
    }

    const response = await axios.post(`cp/${route.params.cpVersionSeq}/cpOpinionLocation/${cpOpinionLocationSeq}`, formData);

    // console.log(`상태코드: ${response.status}`);
    if (response.status === 200 || response.status === 201) {
      console.log("새로운 CP 의견 생성에 성공하였습니다.");
      cpOpinionSeq.value = response.data.data.cpOpinionSeq;
      redirectPage();
    } else {
      console.log("새로운 CP 의견 생성에 실패하였습니다.");
      console.log(response.status);
      console.log("CP 의견 위치를 삭제합니다.");
      deleteLocation();
      throw new Error("Failed to register opinion.");
    }
  } catch (error) {
    console.error("새로운 CP 의견 생성 시, 예상치 못한 에러가 발생했습니다.");
    console.error(error);
  }
}

function redirectPage() {
  router.push({
    name: 'CpOpinionPage',
    params: {
      cpVersionSeq: route.params.cpVersionSeq,
      cpOpinionLocationSeq: cpOpinionLocationSeq,
      cpOpinionSeq: parseInt(cpOpinionSeq.value, 10)
    }
  })
}

const isModalOpen = ref(false);

const closeModal = () => {
  isModalOpen.value = false;
};

const handleTemplateSave = async ({title: templateTitle, openScope}) => {
  try {
    const {content} = await caseEditor.value.getEditorData();

    if (!templateTitle.trim()) {
      alert("템플릿 제목을 입력해주세요.");
      return;
    }

    // 에디터의 실제 내용이 있는 요소 선택
    const editorContent = document.querySelector(".codex-editor__redactor");

    if (!editorContent) {
      alert("캡처할 컨텐츠를 찾을 수 없습니다.");
      return;
    }

    // 툴바 숨기기
    const toolbar = document.querySelector(".toolbar");
    if (toolbar) toolbar.style.display = "none";

    // 여백 제거 및 스크롤 확장
    const originalStyle = editorContent.style.cssText;
    editorContent.style.margin = "0";
    editorContent.style.padding = "0";
    editorContent.style.height = "auto";
    editorContent.style.overflow = "visible";

    // html2canvas 캡처
    const canvas = await html2canvas(editorContent, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#FFFFFF", // 배경색을 흰색으로 지정
      windowWidth: editorContent.scrollWidth,
      windowHeight: editorContent.scrollHeight,
    });

    // 원래 스타일 복구
    if (toolbar) toolbar.style.display = "flex";
    editorContent.style.cssText = originalStyle;

    // 이미지 Blob 변환
    const imageBlob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
    );

    // FormData 생성
    const formData = new FormData();
    formData.append(
        "data",
        JSON.stringify({
          templateTitle,
          templateContent: JSON.stringify(content),
          openScope,
        })
    );
    formData.append("previewImage", imageBlob, "template-preview.png");

    // 서버로 전송
    const response = await fetch("/template", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error("템플릿 저장 실패");

    alert("템플릿이 성공적으로 저장되었습니다.");
    closeModal();
  } catch (error) {
    console.error("Error saving template:", error);
    alert("템플릿 저장 중 오류가 발생했습니다.");
  }
};
</script>

<template>
  <div class="op-opinion-create">
    <!-- 페이지 제목 및 저장 버튼 -->
    <div class="cp-opinion-header">
      <div class="cp-opinion-title">CP 의견 등록</div>
      <div class="case-actions">
        <Button class="save-button" @click="handleSave" :is-disabled="false">{{ `저장` }}</Button>
      </div>
    </div>
    <!-- Editor.js 에디터 -->
    <div class="editor-wrapper">
      <CaseEditor ref="caseEditor"/>
    </div>
    <!-- 태그 입력 -->
    <div class="case-tags">
      <div class="tag-list">
        <!-- 생성된 태그가 표시되는 부분 -->
        <CaseTagInput @update:keywords="updateKeywords"/>
      </div>
    </div>

    <TemplateCreateModal
        v-if="isModalOpen"
        @close="closeModal"
        @save-template="handleTemplateSave"
    />
  </div>
</template>

<style scoped>

.cp-opinion-title {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: left;
  margin-bottom: 10px;
}

.op-opinion-create {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f9f9f9;
}

.cp-opinion-header {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin-bottom: 10px;
  justify-content: space-between;
}

.cp-opinion-header h2 {
  font-size: 1.5em;
  margin-bottom: 10px;
  text-align: center;
}

.editor-wrapper {
  width: 100%;
  max-width: 1400px;
  height: 650px;
  margin-bottom: 20px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.case-tags {
  width: 100%;
  max-width: 1400px;
  margin-top: 100px; /* 본문과의 간격 */
  margin-bottom: 20px; /* 태그 입력 아래 여백 */
  text-align: left; /* 태그 입력 왼쪽 정렬 */
  box-sizing: border-box;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px; /* 태그와 입력창 사이 간격 */
}
</style>
