<template>
  <div class="case-sharing-create">
    <!-- 페이지 제목 및 저장 버튼 -->
    <div class="case-header">
      <div class="case-title">케이스 공유글 작성 - 외과</div>
      <div class="template-selector" @click="openModal">
        + 입력한 내용을 템플릿에 저장
      </div>
      <div class="case-actions">
        <CaseActionButtons @save="handleSave" @tempSave="handleTempSave" />
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

    <!-- 태그 입력 -->
    <div class="case-tags">
      <div class="tag-list">
        <!-- 생성된 태그가 표시되는 부분 -->
        <CaseTagInput @update:keywords="updateKeywords" />
      </div>
    </div>

    <TemplateCreateModal
        v-if="isModalOpen"
        @close="closeModal"
        @save-template="handleTemplateSave"
    />
  </div>
</template>


<script setup>
import { ref } from "vue";
import CaseEditor from "@/components/case_sharing/case_sharing/CaseSharingEditor.vue";
import CaseTagInput from "@/components/case_sharing/case_sharing/CaseTagInput.vue";
import CaseActionButtons from "@/components/case_sharing/case_sharing/CaseSharingSaveButton.vue";
import TemplateCreateModal from "@/components/case_sharing/modal/TemplateCreateModal.vue";
import { useAuthStore } from '@/store/authStore'; // Pinia 스토어 가져오기
import html2canvas from "html2canvas";
import axios from "axios";

const authStore = useAuthStore();
const accessToken = authStore.accessToken; // accessToken 가져오기

const title = ref(""); // 제목 상태
const keywords = ref([]); // 태그 상태
const caseEditor = ref(null); // Editor.js 참조

const updateKeywords = (newKeywords) => {
  keywords.value = newKeywords;
};

const handleSave = async () => {
  try {
    // Editor.js에서 데이터와 이미지 파일 가져오기
    const { content, images } = await caseEditor.value.getEditorData();

    // 데이터 유효성 검사
    if (!title.value.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content || content.blocks.length === 0) {
      alert("본문 내용을 입력해주세요.");
      return;
    }

    // FormData 생성
    const formData = new FormData();

    // 데이터 직렬화 (content를 JSON 문자열로 변환)
    const data = {
      templateSeq: 1, // 템플릿 선택값
      title: title.value,
      content: JSON.stringify(content), // content를 JSON 문자열로 변환
      keywords: keywords.value.length > 0 ? keywords.value : [], // 키워드 처리
    };

    // FormData에 데이터 추가
    formData.append("data", JSON.stringify(data));

    // 이미지 파일 추가
    images.forEach((file, index) => {
      formData.append("images", file, `img-${index + 1}`);
    });

    console.log("FormData 전송:", data, images);

    // API 호출
    const response = await axios.post("/case_sharing", formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // 사용자 토큰 추가
        "Content-Type": "multipart/form-data", // FormData 사용 시 필요
      },
    });

    // 성공 확인
    console.log("저장 완료:", response.data);
    alert("저장이 완료되었습니다.");
  } catch (error) {
    console.error("Error saving data:", error);
    alert("저장 중 오류가 발생했습니다.");
  }
};



const handleTempSave = () => {
  alert("임시 저장되었습니다.");
};

const isModalOpen = ref(false);

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleTemplateSave = async ({ title: templateTitle, openScope }) => {
  try {
    const { content } = await caseEditor.value.getEditorData();

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
  max-width: 1400px;
  margin-bottom: 10px;
}

.case-header h2 {
  font-size: 1.5em;
  margin-bottom: 10px;
  text-align: center;
}

.title-input {
  width: 80%;
  max-width: 1400px;
  padding: 15px;
  font-size: 1.1em;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  margin-bottom: 20px;
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

.template-selector {
  font-size: 1rem;
  color: #1a2f69;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap; /* 텍스트 줄바꿈 방지 */
  margin-left: 750px;
  margin-top: 25px;
  margin-right: 20px;
}

.template-selector:hover {
  text-decoration: underline;
}

</style>
