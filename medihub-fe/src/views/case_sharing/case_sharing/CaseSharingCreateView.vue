<template>
  <div class="case-sharing-create">
    <!-- 페이지 제목 및 저장 버튼 -->
    <div class="case-header">
      <div class="case-title">케이스 공유글 작성 - {{authStore.userInfo.partName}}</div>
      <div class="template-selector" @click="openTemplateModal">
        + 입력한 내용을 템플릿에 저장
      </div>
      <div class="case-actions">
        <CaseActionButtons
            @save="handleSave"
            @tempSave="handleTempSave"
            @openDraftModal="openDraftModal"
        />
        <DraftModal
            v-if="isDraftModalOpen"
            @close="closeDraftModal"
            @loadDraft="loadDraft"
        />
        <TemplateCreateModal v-if="isTemplateModalOpen" @close="closeTemplateModal" />
      </div>

    </div>

    <!-- 제목 입력 -->
    <input
        v-model="title"
        type="text"
        placeholder="제목을 입력하세요."
        class="title-input"
    />

    <!-- Editor.js 에디터 -->
    <div class="editor-wrapper">
      <CaseEditor ref="caseEditor" />
    </div>

    <!-- 키워드 입력 -->
    <div class="case-tags">
      <div class="tag-list">
        <!-- 생성된 키워드가 표시되는 부분 -->
        <CaseTagInput @update:keywords="updateKeywords" />
      </div>
    </div>

    <TemplateCreateModal
        v-if="isTemplateModalOpen"
        @close="closeTemplateModal"
        @save-template="handleTemplateSave"
    />
  </div>
</template>


<script setup>
import {onMounted, ref} from "vue";
import CaseEditor from "@/components/case_sharing/case_sharing/CaseSharingEditor.vue";
import CaseTagInput from "@/components/case_sharing/case_sharing/CaseTagInput.vue";
import CaseActionButtons from "@/components/case_sharing/case_sharing/CaseSharingSaveButton.vue";
import TemplateCreateModal from "@/components/case_sharing/template/TemplateCreateModal.vue";
import DraftModal from "@/components/case_sharing/case_sharing/DraftModal.vue";

import { useAuthStore } from '@/stores/authStore'; // Pinia 스토어 가져오기
import html2canvas from "html2canvas";
import axios from "axios";
import { useRoute } from "vue-router";
import router from "@/routers/index.js";

const authStore = useAuthStore();
const accessToken = authStore.accessToken; // accessToken 가져오기
const route = useRoute();

const title = ref(""); // 제목 상태
const keywords = ref([]); // 키워드 상태
const caseEditor = ref(null); // Editor.js 참조
const templateSeq =route.params.id;

const isDraftModalOpen = ref(false);
const isTemplateModalOpen = ref(false);   // 템플릿 모달 상태

// 임시 저장 모달 열기/닫기
const openDraftModal = () => {
  isDraftModalOpen.value = true;
};

const closeDraftModal = () => {
  isDraftModalOpen.value = false;
};

// 템플릿 모달 열기/닫기
const openTemplateModal = () => {
  isTemplateModalOpen.value = true;
};

const closeTemplateModal = () => {
  isTemplateModalOpen.value = false;
};



// FormData 생성
const formData = new FormData();

const updateKeywords = (newKeywords) => {
  keywords.value = newKeywords;
};
const fetchTemplateData = async () => {
  try {
    // API 호출
    const response = await axios.get(`/template/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = response.data;

    if (result.success) {
      const data = result.data;

      // 데이터 유효성 검사
      if (!data.templateTitle || !data.templateContent) {
        console.error("API에서 불완전한 데이터 반환:", data);
        return;
      }

      // 제목 설정
      title.value = data.templateTitle;

      // 내용 파싱 및 Editor.js 초기화
      const content = JSON.parse(data.templateContent);
      if (caseEditor.value) {
        await caseEditor.value.initializeEditor(content);
      }
    } else {
      console.error("데이터 불러오기 실패:", result.error);
    }
  } catch (error) {
    console.error("템플릿 데이터 불러오기 오류:", error);
  }
};


// 임시 저장된 글 로드
const loadDraft = async (draftData) => {
  try {

    // 제목 및 에디터 데이터 설정
    formData.value.title = draftData.caseSharingTitle || "제목 없음";
    const content = JSON.parse(draftData.caseSharingContent);
    keywords.value = draftData.keywords.map((keyword) => keyword.keywordName);

    if (caseEditor.value) {
      await caseEditor.value.initializeEditor(content);
    }

    // 임시 저장 데이터 로드 완료 알림
    alert("임시 저장 글이 로드되었습니다.");
    closeDraftModal();
  } catch (error) {
    alert("임시 저장 글 로드 중 오류가 발생했습니다.");
  }
};

const handleSave = async () => {
  try {
    // 1. Editor.js에서 데이터와 이미지 파일 가져오기
    const editorData = await caseEditor.value.getEditorData();
    const { content, images } = editorData;

    // 데이터 유효성 검사
    if (!title.value.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content || content.blocks.length === 0) {
      alert("본문 내용을 입력해주세요.");
      return;
    }
    // 데이터 직렬화 (content를 JSON 문자열로 변환)
    const data = {
      templateSeq: templateSeq, // 템플릿 선택값
      title: title.value,
      content: JSON.stringify(content), // content를 JSON 문자열로 변환
      keywords: keywords.value.length > 0 ? keywords.value : [], // 키워드 처리
    };

    // FormData에 데이터 추가
    formData.append("data", JSON.stringify(data));
    
    images.forEach((file, index) => {
      formData.append("images", file, `img-${index + 1}`);
    });


    // API 호출
    const response = await axios.post("/case_sharing", formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // 사용자 토큰 추가
        "Content-Type": "multipart/form-data", // FormData 사용 시 필요
      },
    });

    alert("저장이 완료되었습니다.");
    const createdCaseId = response.data.data
    // 상세 조회 페이지로 라우팅
    await router.push({name: "CaseSharingDetailView", params: {id: createdCaseId}});

  } catch (error) {
    console.error("Error saving data:", error);
    alert("저장 중 오류가 발생했습니다.");
  }
};

const handleTempSave = async () => {
  try {
    // 1. Editor.js에서 데이터와 이미지 파일 가져오기
    const editorData = await caseEditor.value.getEditorData();
    const { content, images } = editorData;

    // 데이터 유효성 검사
    if (!title.value.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content || content.blocks.length === 0) {
      alert("본문 내용을 입력해주세요.");
      return;
    }


    // 데이터 직렬화 (content를 JSON 문자열로 변환)
    const requestDTO  = {
      templateSeq: templateSeq, // 템플릿 선택값
      title: title.value,
      content: JSON.stringify(content), // content를 JSON 문자열로 변환
      keywords: keywords.value.length > 0 ? keywords.value : [], // 키워드 처리
    };

    // FormData에 데이터 추가
    formData.append("requestDTO", JSON.stringify(requestDTO));

    // 이미지 파일 추가
    images.forEach((file, index) => {
      formData.append("images", file, `img-${index + 1}`);
    });

    // API 호출
    const response = await axios.post("case_sharing/draft", formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // 사용자 토큰 추가
        "Content-Type": "multipart/form-data", // FormData 사용 시 필요
      },
    });

    alert("임시 저장이 완료되었습니다.");

  } catch (error) {
    alert("임시 저장 중 오류가 발생했습니다.");
  }
};

const handleTemplateSave = async ({ title: templateTitle, openScope }) => {
  try {
    const editorData = await caseEditor.value.getEditorData();
    const { content, images } = editorData;

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

    const templateData = {
      templateTitle: templateTitle.trim(),
      templateContent: JSON.stringify(content), // JSON 직렬화된 content
      openScope,
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(templateData));
    formData.append("previewImage", imageBlob, "template-preview.png");
    images.forEach((file, index) => {
      formData.append("images", file, `img-${index + 1}`);
    });

    // 서버로 전송
    await axios.post("/template", formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // 사용자 인증 토큰
        "Content-Type": "multipart/form-data", // FormData 전송
      },
    });
    alert("템플릿이 성공적으로 저장되었습니다.");
    closeTemplateModal();
  } catch (error) {
    console.error("Error saving template:", error);
    alert("템플릿 저장 중 오류가 발생했습니다.");
  }
};


onMounted(fetchTemplateData);
</script>

<style scoped>

.case-actions {
  display: flex;
  align-items: center;
  gap: 10px; /* 저장 버튼 간 간격 설정 */
}

.case-title {
  font-size: 1.2rem;
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

.template-selector {
  font-size: 1rem;
  color: #1a2f69;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap; /* 텍스트 줄바꿈 방지 */
  margin-left: auto;
  margin-top: 25px;
  margin-right: 20px;
}

.template-selector:hover {
  text-decoration: underline;
}

</style>
