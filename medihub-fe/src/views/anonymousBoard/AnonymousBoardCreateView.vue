<script setup>
import { ref } from "vue";

import BoardEditor from "@/components/anonymousBoard/AnonymousBoardEditor.vue";
import BoardKeywordInput from "@/components/anonymousBoard/BoardKeywordInput.vue";
import BoardActionButton from "@/components/anonymousBoard/AnonymousBoardSaveButton.vue";
import axios from "axios";
import router from "@/router/index.js";

const anonymousBoardTitle = ref(""); // 제목 상태
const keywords = ref([]); // 키워드 상태
const boardEditor = ref(null); // Editor.js 참조

const updateKeywords = (newKeywords) => {

  keywords.value = newKeywords;
};

const handleSave = async () => {

  try {

    // Editor.js에서 데이터와 이미지 파일 가져오기
    const { anonymousBoardContent, images } = await boardEditor.value.getEditorData();

    // 데이터 유효성 검사
    if(!anonymousBoardTitle.value.trim()) {

      alert("제목을 입력해주세요.");

      return;
    }
    if(!anonymousBoardContent || anonymousBoardContent.blocks.length === 0) {

      alert("본문 내용을 입력해주세요.");

      return;
    }

    // FormData 생성
    const formData = new FormData();

    // 데이터 직렬화 (anonymousBoardContent를 JSON 문자열로 변환)
    const data = {

      anonymousBoardTitle: anonymousBoardTitle.value,
      anonymousBoardContent: JSON.stringify(anonymousBoardContent),  // anonymousBoardContent를 JSON 문자열로 변환
      keywords: keywords.value.length > 0 ? keywords.value : [] // 키워드 처리
    };

    // FormData에 데이터 추가
    formData.append("data", JSON.stringify(data));

    // 이미지 파일 추가
    images.forEach((file, index) => {

      formData.append("images", file, `img-${index + 1}`);
    });

    console.log("FormData 전송:", data, images);

    // API 호출
    const response = await axios.post("/anonymous-board", formData, {

      headers: {

        "Content-Type": "multipart/form-data" // FormData 사용 시 필요
      }
    });

    // 성공 확인
    console.log("저장 완료:", response.data);

    alert("저장이 완료되었습니다.");

    // 게시글 목록으로 리다이렉트
    await router.push("/anonymous-board");
  } catch (error) {

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
    <div class="board-keywords">
      <div class="keyword-list">
        <!-- 생성된 키워드가 표시되는 부분 -->
        <BoardKeywordInput @update:keywords="updateKeywords" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.board-header {
  display: flex;
  align-items: center; /* 수직 중앙 정렬 */
  justify-content: space-between; /* 제목과 버튼을 양쪽 끝으로 정렬 */
  width: 100%;
  max-width: 1400px;
  margin-bottom: 10px;
}

.board-action {
  display: flex;
  align-items: center;
  transform: translateY(-10px); /* 버튼을 위로 올리기 위해 변환 적용 */
}

.board-title {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: left;
  margin-bottom: 10px;
}

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
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin-bottom: 10px;
}

.board-header h2 {
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

.board-keywords {
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
  margin-bottom: 10px; /* 키워와 입력창 사이 간격 */
}
</style>