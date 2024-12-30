<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import Sidebar from "@/components/user/MyPage.vue";

const posts = ref([]);
const filteredPosts = ref([]); // 필터링된 게시물 저장
const currentPage = ref(1);
const itemsPerPage = 5;
const currentFilter = ref("myPosts");

// 내가 쓴 게시물 가져오기
const fetchMyPosts = async () => {
  try {
    const response = await axios.get("/anonymous-board/myPage"); // API 호출
    posts.value = response.data.data.map((post) => ({
      title: post.anonymousBoardTitle,
      content: post.anonymousBoardContent,
      viewCount: post.anonymousBoardViewCount,
      date: new Date(post.createdAt).toLocaleDateString("ko-KR"),
    }));
    filteredPosts.value = [...posts.value]; // 필터링 초기화
  } catch (error) {
    console.error("내 메디컬 라이프 불러오기 실패:", error);
  }
};

// 내가 북마크한 게시물 가져오기
const fetchBookmarkedPosts = async () => {
  try {
    const response = await axios.get("/anonymous-board/myPage/bookmark"); // API 호출
    posts.value = response.data.data.map((post) => ({
      title: post.anonymousBoardTitle,
      content: post.anonymousBoardContent,
      viewCount: post.anonymousBoardViewCount,
      date: new Date(post.createdAt).toLocaleDateString("ko-KR"),
    }));
    filteredPosts.value = [...posts.value]; // 필터링 초기화
  } catch (error) {
    console.error("북마크된 메디컬 라이프 가져오기 실패:", error);
  }
};

// 텍스트만 추출하는 함수
const extractText = (content) => {
  try {
    const parsedContent = JSON.parse(content);
    return parsedContent.blocks
        .filter((block) => block.type === "paragraph") // 'paragraph' 블록만 추출
        .map((block) => block.data.text) // 텍스트 데이터만 가져옴
        .join(" "); // 텍스트 합치기
  } catch (error) {
    console.error("내용 파싱 실패:", error);
    return "내용 없음";
  }
};

// 페이지네이션 데이터
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredPosts.value.slice(start, start + itemsPerPage);
});

// 총 페이지 계산
const totalPages = computed(() =>
    Math.ceil(filteredPosts.value.length / itemsPerPage)
);

// 페이지 변경
const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// 조회 버튼 클릭
const filterByMyPosts = () => {
  currentFilter.value = "myPosts";
  fetchMyPosts(); // 내가 쓴 게시물 API 호출
  currentPage.value = 1;
};

// 북마크 버튼 클릭
const filterByBookmarks = () => {
  currentFilter.value = "bookmarks";
  fetchBookmarkedPosts(); // 북마크된 게시물 API 호출
  currentPage.value = 1;
};

// 초기 데이터 로드
onMounted(fetchMyPosts);
</script>

<template>
  <div class="d-flex">
    <!-- 사이드바 -->
    <Sidebar />

    <!-- 메인 콘텐츠 -->
    <div class="content-container flex-grow-1">
      <h3 class="title">My Medical-Life</h3>

      <!-- 필터 버튼 -->
      <div class="filter-buttons">
        <button
            class="filter-btn"
            :class="{ active: currentFilter === 'myPosts' }"
            @click="filterByMyPosts"
        >
          내가 쓴 게시물
        </button>
        <button
            class="filter-btn"
            :class="{ active: currentFilter === 'bookmarks' }"
            @click="filterByBookmarks"
        >
          북마크된 게시물
        </button>
      </div>

      <!-- 테이블 -->
      <div class="table-container">
        <table class="custom-table">
          <thead>
          <tr>
            <th>제목</th>
            <th>내용</th>
            <th>작성일</th>
            <th>조회수</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(post, index) in paginatedPosts" :key="index">
            <td>{{ post.title }}</td>
            <td>{{ post.content }}</td>
            <td>{{ post.date }}</td>
            <td>{{ post.viewCount }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination-container">
        <nav>
          <ul class="pagination">
            <li
                class="page-item"
                :class="{ disabled: currentPage === 1 }"
                @click="changePage(currentPage - 1)"
            >
              <a href="#">◀</a>
            </li>
            <li
                class="page-item"
                v-for="page in totalPages"
                :key="page"
                :class="{ active: currentPage === page }"
                @click="changePage(page)"
            >
              <a href="#">{{ page }}</a>
            </li>
            <li
                class="page-item"
                :class="{ disabled: currentPage === totalPages }"
                @click="changePage(currentPage + 1)"
            >
              <a href="#">▶</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
.d-flex {
  display: flex;
}

.content-container {
  padding: 20px;
  background-color: #f4f6f9;
}

.title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 20px;
}

.filter-buttons {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.filter-btn {
  background-color: #e9ecef;
  color: #495057;
  border: none;
  padding: 10px 20px;
  font-size: 1.2rem;
  margin-left: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn.active {
  background-color: #0056b3;
  color: #fff;
}

.filter-btn:hover {
  background-color: #0056b3;
  color: #fff;
}

.table-container {
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 1.1rem;
}
.custom-table th,
.custom-table td {
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
  border-left: none;
  border-right: none;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-table thead th {
  background-color: #f8f9fa;
  font-weight: bold;
  border-bottom: 2px solid #dee2e6;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination {
  display: flex;
  list-style: none;
  padding: 0;
}

.page-item {
  margin: 0 5px;
}

.page-item a {
  display: block;
  padding: 8px 12px;
  text-decoration: none;
  color: #007bff;
  border-radius: 5px;
  transition: all 0.3s;
}

.page-item.disabled a {
  color: #6c757d;
  pointer-events: none;
}

.page-item.active a {
  background-color: #007bff;
  color: white;
}

.page-item a:hover {
  background-color: #0056b3;
  color: white;
}

.badge {
  background-color: #ffc107;
  color: #212529;
  border-radius: 3px;
  padding: 5px 10px;
  font-size: 1rem;
}

</style>
