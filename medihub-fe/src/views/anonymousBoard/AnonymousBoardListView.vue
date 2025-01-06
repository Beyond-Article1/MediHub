<script setup>
import { ref } from 'vue';
import axios from "axios";

import router from "@/routers/index.js";
import SearchBox from '@/components/anonymousBoard/AnonymousBoardSearchBox.vue';
import BoardList from '@/components/anonymousBoard/AnonymousBoardList.vue';
import LineDivider from "@/components/anonymousBoard/AnonymousBoardLineDivider.vue";

const searchResult = ref([]);
const searchQuery = ref('');
const sortOption = ref('작성순');
const itemCount = ref(10);

const search = async (query) => {

  console.log(`Searching for: ${query}`);

  try {

    const response = await axios.get(`/find/anonymousBoard/${query}`);

    searchResult.value = response.data.data;
  } catch(error) {

    console.error('Error searching:', error);

    searchResult.value = [];
  }
};

const createBoard = () => {

  console.log("Create new board button clicked");

  router.push('/anonymous-board/create');
};
</script>

<template>
  <div class="anonymous-board-view">
    <div class="top">
      <h1 class="title">ANONYMOUS BOARD</h1>

      <!-- SearchBox 컴포넌트 사용 -->
      <SearchBox v-model="searchQuery" @search="search" />

      <div>
          <select class="sort-select" v-model="sortOption">
            <option value="작성순">작성순</option>

            <option value="최신순">최신순</option>

            <option value="조회순">조회순</option>
          </select>

          <select class="item-select" v-model.number="itemCount">
            <option value="10">10</option>

            <option value="20">20</option>

            <option value="50">50</option>

            <option value="100">100</option>
          </select>
      </div>

      <button class="new-board-button" @click="createBoard">글쓰기</button>
    </div>

    <LineDivider />

    <div class="main-content">
      <!-- sort-option, item-count, search-result 전달 -->
      <BoardList class="board-section" :sort-option="sortOption" :item-count="itemCount" :search-result="searchResult"/>
    </div>
  </div>
</template>

<style scoped>
.anonymous-board-view {
  padding: 30px;
}

.top {
  display: flex;
  justify-content: space-between; /* 양쪽 끝으로 정렬 */
  align-items: center; /* 세로 중앙 정렬 */
  margin-bottom: 10px; /* 제목과 메인 콘텐츠 사이 여백 */
}

.title {
  font-size: 30px;
  font-weight: bold;
  margin: 0;
}

.sort-select,
.item-select,
.new-board-button {
  background-color: #003366; /* 어두운 파란색 */
  color: white; /* 글자색 흰색 */
  border: none; /* 테두리 제거 */
  padding: 10px 15px; /* 패딩 추가 */
  border-radius: 7px; /* 둥글게 */
  cursor: pointer;
}

.sort-select,
.item-select {
  margin-left: 10px; /* 왼쪽 여백 추가 */
}

.main-content {
  display: flex;
}

.board-section {
  margin-top: 20px;
  flex: 1;
  margin-left: 20px;
}
</style>