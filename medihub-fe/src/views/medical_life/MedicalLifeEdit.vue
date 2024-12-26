<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import BoardEditor from "@/components/medicallife/MedicalLifeEditor.vue";
import BoardKeywordInput from "@/components/medicallife/MedicalLifeKeywordinput.vue";
import BoardActionButton from "@/components/medicallife/MedicalLifeSaveButtion.vue";
import axios from "axios";

const medicalLifeTitle = ref("");
const keywords = ref([]);
const boardEditor = ref(null);
const route = useRoute();
const router = useRouter();

const fetchExistingData = async () => {
  const medicalLifeSeq = route.params.id;

  try {
    const response = await axios.get(`/medical-life/detail/${medicalLifeSeq}`);
    const data = response.data.data;

    medicalLifeTitle.value = data.medicalLifeTitle;
    keywords.value = data.keywords.map((keyword) => keyword.keywordName);

    // Editor.js 데이터를 설정
    await boardEditor.value.setEditorData(JSON.parse(data.medicalLifeContent));
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("기존 데이터를 불러오는 중 오류가 발생했습니다.");
  }
};

const updateKeywords = (newKeywords) => {
  keywords.value = newKeywords;
};

const handleSave = async () => {
  try {
    const { medicalLifeContent, images } = await boardEditor.value.getEditorData();

    if (!medicalLifeTitle.value.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!medicalLifeContent || medicalLifeContent.blocks.length === 0) {
      alert("본문 내용을 입력해주세요.");
      return;
    }

    const formData = new FormData();

    const data = {
      medicalLifeTitle: medicalLifeTitle.value,
      medicalLifeContent: JSON.stringify(medicalLifeContent),
      keywords: keywords.value.length > 0 ? keywords.value : [],
    };

    formData.append("data", JSON.stringify(data));

    images.forEach((file, index) => {
      formData.append("pictures", file, `img-${index + 1}`);
    });

    console.log("FormData 전송:", data, images);

    const medicalLifeSeq = route.params.id;

    // API 호출
    const response = await axios.put(`/medical-life/${medicalLifeSeq}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("수정 완료:", response.data);

    alert("수정이 완료되었습니다.");
    router.push(`/medicalLife/${medicalLifeSeq}`);
  } catch (error) {
    console.error("Error updating data:", error);
    alert("수정 중 오류가 발생했습니다.");
  }
};

onMounted(() => {
  fetchExistingData();
});
</script>

<template>
  <div class="medical-life-edit">
    <!-- 페이지 제목 및 저장 버튼 -->
    <div class="board-header">
      <div class="board-title">메디컬 라이프 게시글 수정</div>
      <div class="board-action">
        <BoardActionButton @save="handleSave" />
      </div>
    </div>

    <!-- 제목 입력 -->
    <input
        class="title-input"
        v-model="medicalLifeTitle"
        type="text"
        placeholder="제목을 입력하세요."
    />

    <!-- Editor.js 에디터 -->
    <div class="editor-wrapper">
      <BoardEditor ref="boardEditor" />
    </div>

    <!-- 키워드 입력 -->
    <div class="board-keywords">
      <div class="keyword-list">
        <BoardKeywordInput @update:keywords="updateKeywords" :initialKeywords="keywords" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1400px;
  margin-bottom: 10px;
}

.board-action {
  display: flex;
  align-items: center;
  transform: translateY(-10px);
}

.board-title {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: left;
  margin-bottom: 10px;
}

.medical-life-edit {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f9f9f9;
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

.board-keywords {
  width: 100%;
  max-width: 1400px;
  margin-top: 100px;
  margin-bottom: 20px;
  text-align: left;
  box-sizing: border-box;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}
</style>
