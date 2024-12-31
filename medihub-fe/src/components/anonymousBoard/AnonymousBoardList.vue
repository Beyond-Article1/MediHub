<script setup>
import { ref, onMounted, computed, defineProps } from 'vue';
import axios from 'axios';

import router from "@/router/index.js"; // Pinia 스토어 가져오기
import LocalDateTimeFormat from '@/components/common/LocalDateTimeFormat.vue';
import beforeLike from '@/assets/images/like/before-like.png';
import afterLike from '@/assets/images/like/after-like.png';
import beforeBookmark from "@/assets/images/bookmark/before-bookmark.png";
import afterBookmark from "@/assets/images/bookmark/after-bookmark.png";
import Pagination from '@/components/common/Pagination.vue'; // Pagination 컴포넌트 임포트

const props = defineProps({

  sortOption: {

    type: String,
    default: '작성순'
  },
  itemCount: {

    type: Number,
    default: 10
  },
  searchResult: {

    type: Array,
    default: () => []
  }
});

const totalBoards = ref(0);
const boardList = ref([]); // 게시글 목록 상태
const currentPage = ref(1); // 현재 페이지 상태
const itemCount = ref(10); // 게시글 개수 상태 추가

const fetchBoardList = async () => {

  try {

    const response = await axios.get('/anonymous-board');

    boardList.value = response.data.data.map(board => ({
      ...board,
      isLiked: false,
      isBookmark: false,
      keywordList: board.keywordList || []
    })) || [];
    // 총 익명 게시글 수 계산
    totalBoards.value = boardList.value.length;
  } catch(error) {

    console.error('Error fetching board list:', error);

    boardList.value = [];
  }
};

// 정렬된 익명 게시글 목록
const sortedBoardList = computed(() => {

  return [...(props.searchResult.length > 0 ? props.searchResult : boardList.value)].sort((a, b) => {

    if(props.sortOption === '작성순') {

      // 오름차순 정렬
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if(props.sortOption === '최신순') {

      // 내림차순 정렬
      return new Date(b.createdAt) - new Date(a.createdAt);
      // 내림차순 정렬
    } else if(props.sortOption === '조회순') return b.anonymousBoardViewCount - a.anonymousBoardViewCount;

    return 0;
  });
});

// 현재 페이지에 맞는 익명 게시물 리스트 계산
const paginatedBoards = computed(() => {

  // 시작 인덱스
  const start = (currentPage.value - 1) * props.itemCount;

  return sortedBoardList.value.slice(start, start + props.itemCount);
});

// 페이지 변경 핸들러
const changePage = (page) => {

  // 현재 페이지 업데이트
  currentPage.value = page;
};

// 좋아요 버튼 클릭 이벤트
const toggleLike = (boardItem) => {

  // 좋아요 상태 전환
  boardItem.isLiked = !boardItem.isLiked;
};

// 북마크 버튼 클릭 이벤트
const toggleBookmark = (boardItem) => {

  // 북마크 상태 전환
  boardItem.isBookmark = !boardItem.isBookmark;
};

const goToDetail = (id) => {

  router.push({ name: 'AnonymousBoardDetail', params: { id } });
};

onMounted(() => {

  fetchBoardList();
});
</script>

<template>
  <div class="board-list">
    <table>
      <thead>
      <tr class="header-row">
        <th>등록 번호</th>

        <th>제목</th>

        <th>키워드</th>

        <th>작성자</th>

        <th>작성일</th>

        <th>조회수</th>

        <th>총 {{ totalBoards }} 건</th>
      </tr>
      </thead>

      <tbody>
        <tr v-for="(boardItem) in paginatedBoards" :key="boardItem.anonymousBoardSeq">
          <td>{{ boardItem.anonymousBoardSeq }}</td>

          <td @click="goToDetail(boardItem.anonymousBoardSeq)" style="cursor: pointer;">
            {{ boardItem.anonymousBoardTitle }}
          </td>

          <td>
            <div class="keywordList">
              <span class="keyword" v-for="(keyword, index) in boardItem.keywordList" :key="index">
                # {{ keyword.keywordName }}
              </span>
            </div>
          </td>

  <!--        <td>{{ boardItem.userName }}</td>-->
          <td>익명</td>

          <td><LocalDateTimeFormat :data="boardItem.createdAt" /></td>

          <td>{{ boardItem.anonymousBoardViewCount }}</td>

          <td>
            <div class="actions"> <!-- 버튼들을 감싸는 div 추가 -->
              <div class="like-btn align-mid" @click.stop="toggleLike(boardItem)">
                <img :src="boardItem.isLiked ? afterLike : beforeLike" :alt="boardItem.isLiked ? 'After' : 'Before'"/>
              </div>

              <div class="bookmark-btn align-mid" @click.stop="toggleBookmark(boardItem)">
                <img
                    :src="boardItem.isBookmark ? afterBookmark : beforeBookmark"
                    :alt="boardItem.isBookmark ? 'After' : 'Before'"
                />
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <Pagination
        :totalData="totalBoards"
        :limitPage="itemCount"
        :page="currentPage"
        @updatePage="changePage"
    />
  </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

.header-row {
  border-bottom: 0 solid #ddd; /* 헤더 아래 테두리 */
}

tr {
  border-bottom: 1px solid #ddd;
  cursor: pointer; /* 클릭 가능한 마우스 커서 추가 */
  transition: background-color 0.3s ease;
}

tr:hover {
  background-color: #f9f9f9; /* 호버 시 배경 색상 변경 */
}

th, td {
  padding: 8px;
  text-align: left; /* 텍스트 정렬 */
}

.keywordList {
  display: flex; /* 가로 배치 */
  flex-wrap: wrap; /* 줄 바꿈 */
  gap: 10px; /* 버튼 간 간격 */
}

.keyword {
  background-color: #fff0d3; /* 배경색 */
  padding: 8px 12px; /* 상하, 좌우 패딩 */
}

.actions {
  display: flex; /* 플렉스 박스를 사용하여 버튼을 가로로 배치 */
  align-items: center; /* 수직 정렬 */
}

.like-btn,
.bookmark-btn {
  cursor: pointer;
  margin-left: 10px; /* 버튼 간 간격 추가 */
}

.like-btn img,
.bookmark-btn img {
  width: 25px;
}
</style>