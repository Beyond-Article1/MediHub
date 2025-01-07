<script setup>
import { defineProps, ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';

import router from "@/routers/index.js";
import LocalDateTimeFormat from '@/components/common/LocalDateTimeFormat.vue';
import Pagination from '@/components/common/Pagination.vue';
import beforeLike from '@/assets/images/like/before-like.png';
import afterLike from '@/assets/images/like/after-like.png';
import beforeBookmark from "@/assets/images/bookmark/before-bookmark.png";
import afterBookmark from "@/assets/images/bookmark/after-bookmark.png";

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

const boardList = ref([]);
const currentPage = ref(1);
// props에서 itemCount를 받아서 상태로 관리
const itemCount = ref(props.itemCount);

const fetchBoardList = async () => {

  try {

    const response = await axios.get('/anonymous-board');

    boardList.value = response.data.data.map(board => ({
      ...board,
      isLiked: false,
      isBookmark: false,
      keywordList: board.keywordList || []
    })) || [];
    totalBoards.value = boardList.value.length;

    // 각 익명 게시글의 좋아요 및 북마크 상태 업데이트
    await Promise.all(boardList.value.map(boardItem => {

      return Promise.all([updateLikeStatus(boardItem), updateBookmarkStatus(boardItem)]);
    }));
  } catch(error) {

    boardList.value = [];
  }
};

const sortedBoardList = computed(() => {

  // searchResult가 정의되지 않았거나 비어 있으면 boardList를 사용
  const boards = (Array.isArray(props.searchResult) && props.searchResult.length > 0) ?
      props.searchResult :
      boardList.value;

  return boards.sort((a, b) => {

    if(props.sortOption === '작성순') {

      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if(props.sortOption === '최신순') {

      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if(props.sortOption === '조회순') {

      return b.anonymousBoardViewCount - a.anonymousBoardViewCount;
    }

    return 0;
  });
});

const totalBoards = computed(() => {

  // searchResult가 정의되지 않았거나 비어 있으면 boardList의 길이를 반환
  return (Array.isArray(props.searchResult) && props.searchResult.length > 0) ?
      props.searchResult.length :
      boardList.value.length;
});

const paginatedBoards = computed(() => {

  const boardsToPaginate = sortedBoardList.value;
  const start = (currentPage.value - 1) * itemCount.value;
  // 유효한 페이지 범위 확인
  const end = start + itemCount.value;

  return boardsToPaginate.slice(start, end);
});

const changePage = (page) => {

  currentPage.value = page;
};

const goToDetail = (id) => {

  router.push({ name: 'AnonymousBoardDetail', params: { id } });
};

const toggleLike = async (boardItem) => {

  const anonymousBoardSeq = boardItem.anonymousBoardSeq;

  try {

    const response = await axios.patch(`/anonymous-board/${anonymousBoardSeq}/prefer`);

    boardItem.isLiked = response.data.data;

    alert(boardItem.isLiked ? '좋아요가 등록되었습니다.' : '좋아요가 취소되었습니다.');
  } catch(error) {

    alert('좋아요 처리에 실패했습니다.');
  }
};

const toggleBookmark = async (boardItem) => {

  const anonymousBoardSeq = boardItem.anonymousBoardSeq;

  try {

    const response = await axios.patch(`/anonymous-board/${anonymousBoardSeq}/bookmark`);

    boardItem.isBookmark = response.data.data;

    alert(boardItem.isBookmark ? '북마크가 등록되었습니다.' : '북마크가 해제되었습니다.');
  } catch(error) {

    alert('북마크 처리에 실패했습니다.');
  }
};

const updateLikeStatus = async (boardItem) => {

  try {

    const response = await axios.get(`/anonymous-board/${boardItem.anonymousBoardSeq}/prefer`);

    // 응답이 존재하고, 데이터가 있으면 좋아요 상태 설정
    boardItem.isLiked = response.data?.data ?? false;
  } catch(error) {

    // 404 에러가 발생할 경우, 기본 값 false 설정
    if(error.response && error.response.status === 404) {

      boardItem.isLiked = false;
    } else {

      boardItem.isLiked = false;
    }
  }
};

const updateBookmarkStatus = async (boardItem) => {

  try {

    const response = await axios.get(`/anonymous-board/${boardItem.anonymousBoardSeq}/bookmark`);

    // 응답이 존재하고, 데이터가 있으면 북마크 상태 설정
    boardItem.isBookmark = response.data?.data ?? false;
  } catch(error) {

    // 404 에러가 발생할 경우, 기본 값 false 설정
    if(error.response && error.response.status === 404) {

      boardItem.isBookmark = false;
    } else {

      boardItem.isBookmark = false;
    }
  }
};

// itemCount가 변경될 때마다 currentPage를 조정
// itemCount 변경 시 페이지를 1로 초기화
watch(() => props.itemCount, (newItemCount) => {

  itemCount.value = newItemCount;
  currentPage.value = 1;
});

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
                <span class="keyword"
                      v-for="(keyword, index) in (boardItem.keywordList && boardItem.keywordList.length > 0 ?
                      boardItem.keywordList.slice(0, 2) : [])"
                      :key="index"
                >
                  # {{ Array.isArray(props.searchResult) && props.searchResult.length > 0 ?
                    (keyword.length > 10 ? keyword.slice(0, 10) + '...' : keyword) :
                    (keyword.keywordName && keyword.keywordName.length > 10 ?
                        keyword.keywordName.slice(0, 10) + '...' : keyword.keywordName)
                  }}
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
  transition: background-color 0.3s ease;
}

th, td {
  padding: 8px;
  text-align: center; /* 텍스트 정렬 */
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
  justify-content: space-between; /* 버튼 간 간격을 균등하게 배치 */
  width: 100%; /* 전체 너비를 사용하여 버튼 간 간격을 조정 */
}

.like-btn,
.bookmark-btn {
  cursor: pointer;
  margin: 0 5px; /* 버튼 간 간격 추가 */
  flex: 1; /* 버튼들이 균등하게 공간을 차지하도록 설정 */
  text-align: center; /* 버튼 안의 이미지 중앙 정렬 */
}

.like-btn img,
.bookmark-btn img {
  width: 25px;
}
</style>