<script setup>
import { ref, computed, onMounted, defineProps } from 'vue';

import axios from 'axios';
import LocalDateTimeFormat from '@/components/common/LocalDateTimeFormat.vue';
import beforeLike from '@/assets/images/like/before-like.png';
import afterLike from '@/assets/images/like/after-like.png';
import beforeBookmark from "@/assets/images/bookmark/before-bookmark.png";
import afterBookmark from "@/assets/images/bookmark/after-bookmark.png";
import Pagination from '@/components/common/Pagination.vue'; // Pagination 컴포넌트 임포트

const totalBoards = ref(0);
const boardList = ref([]); // 게시글 목록 상태
const currentPage = ref(1); // 현재 페이지 상태
const itemCount = ref(10); // 게시글 개수 상태 추가

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

// API 호출 함수
const fetchBoardList = async () => {
  try {
    // API 호출
    const response = await axios.get('/medical-life');

    boardList.value = response.data.data || []; // 데이터 구조에 맞게 수정
    totalBoards.value = boardList.value.length; // 총 게시글 수 계산
    // 각 게시글에 좋아요, 북마크 상태 추가
    boardList.value = boardList.value.map(board => ({
      ...board,
      isLiked: false,  // 기본값은 false
      isBookmark: false
    }));
  } catch (error) {
    console.error('Error fetching board list:', error);
    boardList.value = [];
  }
};

// 정렬된 게시글 목록
const sortedBoardList = computed(() => {
  return [...(props.searchResult.length > 0 ? props.searchResult : boardList.value)].sort((a, b) => {
    if (props.sortOption === '작성순') {
      return new Date(a.createdAt) - new Date(b.createdAt); // 오름차순 정렬
    } else if (props.sortOption === '최신순') {
      return new Date(b.createdAt) - new Date(a.createdAt); // 내림차순 정렬
    } else if (props.sortOption === '조회순') return b.medicalLifeViewCount - a.medicalLifeViewCount; // 내림차순 정렬
    return 0;
  });
});

// 현재 페이지에 맞는 게시물 리스트 계산
const paginatedBoards = computed(() => {
  const start = (currentPage.value - 1) * props.itemCount; // 시작 인덱스
  return sortedBoardList.value.slice(start, start + props.itemCount); // 10개씩 잘라서 반환
});

// 페이지 변경 핸들러
const changePage = (page) => {
  currentPage.value = page; // 현재 페이지 업데이트
};

// 좋아요 버튼 클릭 이벤트
const toggleLike = (boardItem) => {
  boardItem.isLiked = !boardItem.isLiked; // 좋아요 상태 전환
};

// 북마크 버튼 클릭 이벤트
const toggleBookmark = (boardItem) => {
  boardItem.isBookmark = !boardItem.isBookmark; // 북마크 상태 전환
};

// 컴포넌트가 마운트될 때 데이터 가져오기
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
      <tr v-for="(boardItem) in paginatedBoards" :key="boardItem.medicalLifeSeq">
        <td>{{ boardItem.medicalLifeSeq }}</td>
        <td>
          <router-link :to="`/medical-life/${boardItem.medicalLifeSeq}`">
            {{ boardItem.medicalLifeTitle }}
          </router-link>
        </td>
        <td>{{ boardItem.keywords ? boardItem.keywords.map(keyword => keyword.keywordName).join(', ') : '' }}</td>
        <td>{{ boardItem.userName }}</td>
        <td><LocalDateTimeFormat :data="boardItem.createdAt" /></td>
        <td>{{ boardItem.medicalLifeViewCount }}</td>
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

th, td {
  padding: 8px;
  text-align: left; /* 텍스트 정렬 */
}

tr {
  border-bottom: 1px solid #ddd;
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
