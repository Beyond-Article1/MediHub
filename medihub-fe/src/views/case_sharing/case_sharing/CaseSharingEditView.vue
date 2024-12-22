<template>
  <div class="case-sharing-create">
    <!-- 페이지 제목 및 저장 버튼 -->
    <div class="case-header">
      <div class="case-title">케이스 공유글 수정 - 외과</div>
      <div class="template-selector" @click="openTemplateModal">
        + 입력한 내용을 템플릿에 저장
      </div>
      <div class="case-actions">
        <CaseActionButtons
            @save="saveChanges"
            @tempSave="handleTempSave"
            @openDraftModal="openDraftModal"
        />
        <DraftModal v-if="isDraftModalOpen" @close="closeDraftModal" />
        <TemplateCreateModal v-if="isTemplateModalOpen" @close="closeTemplateModal" />
      </div>
    </div>

    <!-- 제목 입력 -->
    <input
        v-model="formData.title"
        type="text"
        placeholder="제목을 입력하세요."
        class="title-input"
    />

    <!-- Editor.js 에디터 -->
    <div class="editor-wrapper">
      <CaseEditor ref="caseEditor" :initialData="formData.content" />
    </div>

    <!-- 키워드 입력 -->
    <div class="case-tags">
      <div class="tag-list">
        <!-- 키워드 데이터를 CaseTagInput에 전달 -->
        <CaseTagInput v-model:keywords="keywords" />
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
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import CaseEditor from "@/components/case_sharing/case_sharing/CaseSharingEditor.vue";
import CaseActionButtons from "@/components/case_sharing/case_sharing/CaseSharingSaveButton.vue";
import CaseTagInput from "@/components/case_sharing/case_sharing/CaseTagInput.vue";
import DraftModal from "@/components/case_sharing/case_sharing/DraftModal.vue";
import TemplateCreateModal from "@/components/case_sharing/modal/TemplateCreateModal.vue";
import {useAuthStore} from "@/store/authStore.js";
import html2canvas from "html2canvas";

const route = useRoute();
const router = useRouter();
const caseEditor = ref(null); // Editor.js 인스턴스
const formData = ref({
  title: "",
  content: null, // 에디터 데이터
});
const title = ref(""); // 제목 상태
const keywords = ref([]); // 키워드 상태

const authStore = useAuthStore();
const accessToken = authStore.accessToken; // accessToken 가져오기
let templateSeq = null;

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

// 기존 데이터를 불러오는 함수
const fetchCaseData = async () => {
  try {
    const response = await axios.get(`/case_sharing/${route.params.id}`);
    const result = response.data;

    if (result.success) {
      const data = result.data;
      formData.value.title = data.caseSharingTitle;
      const content = JSON.parse(data.caseSharingContent);
      keywords.value = data.keywords.map((keyword) => keyword.keywordName);
      console.log("Fetched Keywords:", keywords.value); // 키워드 로그 출력
      templateSeq = data.templateSeq;

      if (caseEditor.value) {
        await caseEditor.value.initializeEditor(content);
      }
    } else {
      console.error("데이터 불러오기 실패:", result.error);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// 저장 버튼 클릭 시 호출
const saveChanges = async () => {
  try {
    // 1. Editor.js에서 데이터 가져오기
    const { content } = await caseEditor.value.getEditorData();

    // 2. 새로운 데이터 객체 준비
    const requestDTO = {
      title: formData.value.title,
      content: JSON.stringify(content), // JSON 직렬화
      keywords: keywords.value.length > 0 ? keywords.value : [], // 키워드 처리
    };
    console.log("Request DTO:", requestDTO); // 전송할 데이터 확인

    // 3. FormData 생성 (이미지 포함)
    const formDataToSend = new FormData();
    formDataToSend.append("requestDTO", new Blob([JSON.stringify(requestDTO)], { type: "application/json" }));

    // images 배열이 있다면 추가
    const { images } = await caseEditor.value.getEditorData();
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
      await router.push({name: "CaseSharingDetailView", params: {id:createdCaseId}}); // 상세 페이지로 이동
    } else {
      console.error("수정 실패:", response.data.error);
      alert("수정 중 문제가 발생했습니다.");
    }
  } catch (error) {
    console.error("Error saving changes:", error);
    alert("저장 중 오류가 발생했습니다.");
  }
};


const tempFormData = new FormData();

const handleTempSave = async () => {
  try {
    // 1. Editor.js에서 데이터와 이미지 파일 가져오기
    const editorData = await caseEditor.value.getEditorData();
    const { content, images } = editorData;

    // 데이터 유효성 검사
    if (!formData.value.title.trim()) {
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
      title: formData.value.title,
      content: JSON.stringify(content), // content를 JSON 문자열로 변환
      keywords: keywords.value.length > 0 ? keywords.value : [], // 키워드 처리
    };

    // FormData에 데이터 추가
    tempFormData.append("requestDTO", JSON.stringify(requestDTO));

    // 이미지 파일 추가
    images.forEach((file, index) => {
      tempFormData.append("images", file, `img-${index + 1}`);
    });

    console.log("FormData 전송:", requestDTO, images);

    // API 호출
    const response = await axios.post("case_sharing/draft", tempFormData, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // 사용자 토큰 추가
        "Content-Type": "multipart/form-data", // FormData 사용 시 필요
      },
    });

    // 성공 확인
    console.log("임시 저장 완료:", response.data.data);
    alert("임시 저장이 완료되었습니다.");
    const createdCaseId = response.data.data
    console.log("정보" + createdCaseId);

  } catch (error) {
    console.error("Error saving data:", error);
    alert("임시 저장 중 오류가 발생했습니다.");
  }
};

const handleTemplateSave = async ({ title: templateTitle, openScope }) => {
  try {
    const editorData = await caseEditor.value.getEditorData();
    const { content, images } = editorData;
    console.log(content)

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
    const response = await axios.post("/template", formData, {
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

const cancelEdit = () => {
  router.push({name: "CaseSharingDetailView", params: {}}); // 상세 페이지로 이동
};

onMounted(fetchCaseData);
</script>

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
}</style>
