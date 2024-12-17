<template>
  <div class="case-sharing-create">
    <!-- 페이지 제목 및 제목 입력 -->
    <div class="case-header">
      <div class="case-title">케이스 공유글 작성 - 외과</div>
      <input
          v-model="title"
          type="text"
          placeholder="제목을 입력하세요."
          class="title-input"
      />
    </div>

    <!-- Editor.js 에디터 -->
    <div class="editor-wrapper">
      <CaseEditor ref="caseEditor" />
    </div>

    <!-- 태그 입력 -->
    <CaseTagInput @update:keywords="updateKeywords" />

    <!-- 저장 및 임시 저장 버튼 -->
    <CaseActionButtons @save="handleSave" @tempSave="handleTempSave" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import CaseEditor from "@/components/case_sharing/case_sharing/CaseSharingEditor.vue";
import CaseTagInput from "@/components/case_sharing/case_sharing/CaseTagInput.vue";
import CaseActionButtons from "@/components/case_sharing/case_sharing/CaseSharingSaveButton.vue";

const title = ref(""); // 제목 상태
const keywords = ref([]); // 태그 상태
const caseEditor = ref(null); // Editor.js 참조

const updateKeywords = (newKeywords) => {
  keywords.value = newKeywords;
};

const handleSave = async () => {
  try {
    // Editor.js에서 content와 이미지 파일을 가져옴
    const {content, images} = await caseEditor.value.getEditorData();

    // FormData 생성
    const formData = new FormData();
    formData.append("data", JSON.stringify({
      user: 1,
      title: title.value,
      content: content,
      keywords: keywords.value,
    }));
    images.forEach((file, index) => {
      formData.append("images", file, `img-${index + 1}`);
    });

    // API 호출
    const response = await fetch("http://localhost:8088/api/case_sharing", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("API 호출 실패");

    alert("저장되었습니다.");
  } catch (error) {
    console.error("Error saving data:", error);
    alert("저장 중 오류가 발생했습니다.");
  }
};

const handleTempSave = () => {
  alert("임시 저장되었습니다.");
};
</script>

<style scoped>
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
  width: 100%;
  max-width: 1200px;
  margin-bottom: 20px;
}

.case-header h2 {
  font-size: 1.5em;
  margin-bottom: 10px;
  text-align: center;
}

.title-input {
  width: 100%;
  padding: 15px;
  font-size: 1.1em;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.editor-wrapper {
  width: 100%;
  max-width: 1200px;
  height: 500px;
  margin-bottom: 20px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
