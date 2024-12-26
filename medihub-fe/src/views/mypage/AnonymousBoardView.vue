<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import Sidebar from "@/components/user/MyPage.vue";

const posts = ref([]);
const filteredPosts = ref([]); // 필터링된 게시물 저장
const currentPage = ref(1);
const itemsPerPage = 5;
const currentFilter = ref("");

// 내가 쓴 게시물 가져오기
const fetchMyPosts = async () => {
  try {
    const response = await axios.get("anonymous-board/myPage\n", {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    });

    posts.value = response.data.data.map((post) => {
      const parsedContent = parseMedicalLifeContent(post.anonymousBoardContent);
      return {
        title: post.anonymousBoardTitle,
        content: parsedContent,
        author: post.userName,
        date: new Date(post.createdAt).toLocaleDateString(),
        bookmarked: post.bookmarked,
      };
    });

    filteredPosts.value = [...posts.value]; // 필터링된 게시물 초기화
  } catch (error) {
    console.error("내 익명게시판 불러오기 실패:", error);
  }
};

// 내가 북마크한 게시물 가져오기
const fetchBookmarkedPosts = async () => {
  try {
    const response = await axios.get("anonymous-board/myPage/bookmark", {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    });

    console.log("북마크 데이터 확인:", response.data.data); // 데이터 구조 확인

    posts.value = response.data.data.map((post) => {
      const parsedContent = parseMedicalLifeContent(post.anonymousBoardContent);
      return {
        title: post.anonymousBoardTitle,
        content: parsedContent,
        author: post.userName,
        date: new Date(post.createdAt).toLocaleDateString(),
        bookmarked: post.bookmarked,
      };
    });

    filteredPosts.value = [...posts.value]; // 필터링된 게시물 초기화
  } catch (error) {
    console.error("북마크된 게시물 불러오기 실패:", error);
  }
};

const parseMedicalLifeContent = (content) => {
  try {
    const parsedContent = JSON.parse(content);
    const textBlocks = parsedContent.blocks
        .filter((block) => block.type === "paragraph")
        .map((block) => block.data.text);
    return textBlocks.join(" ");
  } catch (error) {
    console.error("콘텐츠 파싱 실패:", error);
    return "내용 없음";
  }
};

// 페이지네이션 데이터
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredPosts.value.slice(start, start + itemsPerPage);
});

// 총 페이지 계산
const totalPages = computed(() => Math.ceil(filteredPosts.value.length / itemsPerPage));

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

const truncateText = (text, maxLength) => {
  if (!text) return "내용 없음";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// 초기 데이터 로드
onMounted(fetchMyPosts);
</script>

<template>
  <div class="d-flex">
    <!-- 사이드바 -->
    <Sidebar/>

    <!-- 메인 콘텐츠 -->
    <div class="content-container flex-grow-1">
      <h3 class="title">My AnonymousBoard</h3>

      <!-- 필터 및 북마크 버튼 -->
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
            <th>작성자</th>
            <th>작성일</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(post, index) in paginatedPosts" :key="index">
            <td :title="post.title">
              {{ truncateText(post.content, 5) }}
            </td>
            <td :content="post.content">
              {{ truncateText(post.content, 20) }}
            </td>
            <td>{{ post.author }}</td>
            <td>{{ post.date }}</td>
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
  font-size: 2rem;
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
  font-size: 1.2rem;
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
