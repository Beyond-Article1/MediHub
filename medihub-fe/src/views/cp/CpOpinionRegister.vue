<script setup>
import html2canvas from "html2canvas";
import axios from "axios";

import {ref} from "vue";
import {useAuthStore} from '@/store/authStore';
import {useRoute, useRouter} from "vue-router";

import Button from "@/components/common/button/Button.vue";
import CaseEditor from "@/components/case_sharing/case_sharing/CaseSharingEditor.vue";
import CaseTagInput from "@/components/case_sharing/case_sharing/CaseTagInput.vue";
import TemplateCreateModal from "@/components/case_sharing/modal/TemplateCreateModal.vue";

// Vue 설정 변수
const authStore = useAuthStore();
const accessToken = authStore.accessToken; // accessToken 가져오기
const router = useRouter();
const route = useRoute();

// 데이터 저장 번수
const keywords = ref([]); // 태그 상태
const caseEditor = ref(null); // Editor.js 참조

// 키워드 업데이트 함수
const updateKeywords = (newKeywords) => {
  keywords.value = newKeywords;
};

// 데이터 저장 함수
const handleSave = async () => {
  try {
    // Editor.js에서 데이터와 이미지 파일 가져오기
    const {content, images} = await caseEditor.value.getEditorData();

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

    // 이미지 파일 추가
    images.forEach((file, index) => {
      formData.append("images", file, `img-${index + 1}`);
    });

    console.log("FormData 전송:", data, images);
    await sendData(formData);
    alert("저장이 완료되었습니다.");
  } catch (error) {
    alert("저장 중 오류가 발생했습니다.");
  }
};

// 데이터 전송 함수
async function sendData(formData) {
  try {
    const response = await axios.post(`cp/${route.params.cpVersionSeq}/cpOpinionLocation/${route.params.cpOpinionLocationSeq}`, formData
        // , {
        //   headers: {
        //     Authorization: `Bearer ${accessToken}`, // 사용자 토큰 추가
        //     "Content-Type": "multipart/form-data", // FormData 사용 시 필요
        //   }
        // }
    );

    if (response.status === 201) {
      console.log("새로운 CP 의견 생성에 성공하였습니다.");
    } else {
      console.log("새로운 CP 의견 생성에 실패하였습니다.");
      throw error;
    }
  } catch (error) {
    console.error("새로운 CP 의견 생성 시, 예상치 못한 에러가 발생했습니다.");
    console.error(error);
  }
}

// 데이터 조회 함수
// async function fetchData() {
//   try {
//     // 등록한 CP 의견 조회해야함~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//     const response = await axios.get(`cp/${route.params.cpVersion}/cpOpinionLocation/${route.params.cpOpinionLocationSeq}/`);
//
//     if (response.status === 200) {
//       console.log("북마크 토글 성공");
//       emit('update'); // 데이터 새로고침을 위한 이벤트 발생
//     } else {
//       console.log("북마크 토글 실패");
//     }
//   } catch (error) {
//     console.error("북마크 요청 중 오류 발생: ", error);
//   }
// }

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
    const response = await fetch("http://localhost:8088/template", {
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
