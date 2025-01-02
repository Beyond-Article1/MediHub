<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

import router from "@/router/index.js";
import BoardEditor from "@/components/anonymousBoard/AnonymousBoardEditor.vue";
import BoardActionButton from "@/components/anonymousBoard/AnonymousBoardSaveButton.vue";
import BoardKeywordInput from "@/components/anonymousBoard/BoardKeywordInput.vue";

const route = useRoute();

const formData = ref({

  anonymousBoardTitle: "",
  // Editor.js 인스턴스
  anonymousBoardContent: null
});
const keywordList = ref([]);
const boardEditor = ref(null);

// 기존 데이터를 불러오는 함수
const fetchBoardData = async () => {

  try {

    const response = await axios.get(`/anonymous-board/${route.params.id}`);

    const result = response.data;

    if(result.success) {

      const data = result.data;

      formData.value.anonymousBoardTitle = data.anonymousBoardTitle;

      const anonymousBoardContent = JSON.parse(data.anonymousBoardContent || '{}');

      if(!anonymousBoardContent.blocks) anonymousBoardContent.blocks = [];

      keywordList.value = data.keywordList.map((keyword) => keyword.keywordName);

      console.log("Fetched Keyword List:", keywordList.value);

      if(boardEditor.value) {

        await boardEditor.value.initializeEditor(anonymousBoardContent);
      }
    } else console.error("데이터 불러오기 실패:", result.error);
  } catch(error) {

    console.error("Error fetching data:", error);
  }
};

const saveChanges = async () => {

  try {

    // 1. Editor.js에서 데이터 가져오기
    const { anonymousBoardContent } = await boardEditor.value.getEditorData();

    if (!anonymousBoardContent || !anonymousBoardContent.blocks) {

      alert("잘못된 게시글 내용입니다.");

      return;
    }

    // 2. 새로운 데이터 객체 준비
    const anonymousBoardUpdateRequestDTO = {

      anonymousBoardTitle: formData.value.anonymousBoardTitle,
      anonymousBoardContent: JSON.stringify(anonymousBoardContent),
      keywordList: keywordList.value.length > 0 ? keywordList.value : []
    };

    console.log("Anonymous Board Update Request DTO:", anonymousBoardUpdateRequestDTO);

    // 3. FormData 생성 (이미지 포함)
    const formDataToSend = new FormData();

    formDataToSend.append(
        "anonymousBoardUpdateRequestDTO",
        new Blob([JSON.stringify(anonymousBoardUpdateRequestDTO)], { type: "application/json" })
    );

    // images 배열이 있다면 추가
    const { images } = await boardEditor.value.getEditorData();

    images.forEach((file, index) => { formDataToSend.append("images", file, `img-${index + 1}`); });

    // 4. 수정 API 호출
    const response = await axios.put(`/anonymous-board/${route.params.id}`, formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      }
    });

    // 5. 성공 처리
    if(response.data.success) {

      alert("수정이 완료되었습니다.");

      const updatedBoardId = response.data.data

      await router.push({ name: "AnonymousBoardDetail", params: { id:updatedBoardId } });
    } else {

      console.error("수정 실패:", response.data.error);

      alert("수정 중 문제가 발생했습니다.");
    }
  } catch (error) {

    console.error("Error saving changes:", error);

    alert("저장 중 오류가 발생했습니다.");
  }
};

const cancelEdit = () => {

  router.push({ name: "AnonymousBoardDetail", params: {} });
};

onMounted(() => {

  fetchBoardData();
});
</script>

<template>
  <div class="anonymous-board-update">
    <!-- 페이지 제목 및 저장 버튼 -->
    <div class="board-header">
      <div class="board-title">익명 게시글 수정</div>

      <div class="board-action">
        <BoardActionButton @save="saveChanges"/>
      </div>
    </div>

    <input
        class="title-input"
        v-model="formData.anonymousBoardTitle"
        type="text"
        placeholder="제목을 입력하세요."
    />

    <!-- Editor.js 에디터 -->
    <div class="editor-wrapper">
      <BoardEditor ref="boardEditor" :initialData="formData.anonymousBoardContent" />
    </div>

    <!-- 키워드 입력 -->
    <div class="board-keyword-list">
      <div class="keyword-list">
        <!-- 키워드 데이터를 BoardKeywordInput에 전달 -->
        <BoardKeywordInput v-model:keywordList="keywordList" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.anonymous-board-update {
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

.board-header h2 {
  font-size: 1.5em;
  margin-bottom: 10px;
  text-align: center;
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

.board-keyword-list {
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