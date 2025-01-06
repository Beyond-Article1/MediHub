<script setup>
import { ref } from "vue";
import axios from "axios";

import router from "@/routers/index.js";
import BoardEditor from "@/components/anonymousBoard/AnonymousBoardEditor.vue";
import BoardKeywordInput from "@/components/anonymousBoard/BoardKeywordInput.vue";
import BoardActionButton from "@/components/anonymousBoard/AnonymousBoardSaveButton.vue";

const keywordList = ref([]);
const boardEditor = ref(null);
const anonymousBoardTitle = ref("");

const formData = new FormData();

const updateKeywordList = (newKeywordList) => {

  keywordList.value = newKeywordList;
};

const handleSave = async () => {

  try {

    // Editor.js에서 데이터와 이미지 파일 가져오기
    const editorData = await boardEditor.value.getEditorData();
    const { anonymousBoardContent, images } = editorData;

    // 데이터 유효성 검사
    if(!anonymousBoardTitle.value.trim()) {

      alert("제목을 입력해주세요.");

      return;
    }
    if(!anonymousBoardContent || anonymousBoardContent.blocks.length === 0) {

      alert("본문 내용을 입력해주세요.");

      return;
    }

    // 데이터 직렬화 (anonymousBoardContent를 JSON 문자열로 변환)
    const data = {

      anonymousBoardTitle: anonymousBoardTitle.value,
      anonymousBoardContent: JSON.stringify(anonymousBoardContent),
      keywordList: keywordList.value.length > 0 ? keywordList.value : []
    };

    // FormData에 데이터 추가
    formData.append("data", JSON.stringify(data));

    // 이미지 파일 추가
    images.forEach((file, index) => {

      formData.append("images", file, `img-${index + 1}`);
    });

    console.log("FormData 전송:", data, images);

    const response = await axios.post("/anonymous-board", formData, {
      headers: { "Content-Type": "multipart/form-data" } // FormData 사용 시 필요
    });

    console.log("저장 완료:", response.data);

    alert("저장이 완료되었습니다.");

    const createdBoardId = response.data.data

    // 상세 조회 페이지로 라우팅
    await router.push({ name: "AnonymousBoardDetail", params: { id: createdBoardId } });
  } catch(error) {

    console.error("Error saving data:", error);

    alert("저장 중 오류가 발생했습니다.");
  }
};
</script>

<template>
  <div class="anonymous-board-create">
    <!-- 페이지 제목 및 저장 버튼 -->
    <div class="board-header">
      <div class="board-title">익명 게시글 작성</div>

      <div class="board-action">
        <BoardActionButton @save="handleSave"/>
      </div>
    </div>

    <!-- 제목 입력 -->
    <input class="title-input" v-model="anonymousBoardTitle" type="text" placeholder="제목을 입력하세요."/>

    <!-- Editor.js 에디터 -->
    <div class="editor-wrapper">
      <BoardEditor ref="boardEditor"/>
    </div>

    <!-- 키워드 입력 -->
    <div class="board-keywordList">
      <div class="keyword-list">
        <!-- 생성된 키워드가 표시되는 부분 -->
        <BoardKeywordInput @update:keywordList="updateKeywordList" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.anonymous-board-create {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f9f9f9;
}

.board-header {
  display: flex;
  align-items: center; /* 수직 중앙 정렬 */
  justify-content: space-between; /* 제목과 버튼을 양쪽 끝으로 정렬 */
  width: 100%;
  max-width: 1400px;
  margin-bottom: 10px;
}

.board-title {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: left;
  margin-bottom: 10px;
}

.board-action {
  display: flex;
  align-items: center;
  transform: translateY(-10px); /* 버튼을 위로 올리기 위해 변환 적용 */
}

.board-header h2 {
  font-size: 1.5em;
  margin-bottom: 10px;
  text-align: center;
}

.title-input {
  width: 1400px;
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

.board-keywordList {
  width: 100%;
  max-width: 1400px;
  margin-top: 100px; /* 본문과의 간격 */
  margin-bottom: 20px; /* 키워드 입력 아래 여백 */
  text-align: left; /* 키워드 입력 왼쪽 정렬 */
  box-sizing: border-box;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px; /* 키워드와 입력창 사이 간격 */
}
</style>