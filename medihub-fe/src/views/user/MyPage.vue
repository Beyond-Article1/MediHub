<template>
  <div class="d-flex">
    <!-- 사이드바 -->
    <Sidebar />

    <!-- 메인 콘텐츠 -->
    <div class="content-container flex-grow-1">
      <h3 class="title">나의 메디컬 라이프</h3>

      <!-- 필터 및 북마크 버튼 -->
      <div class="filter-buttons">
        <button
            class="filter-btn"
            :class="{ active: currentFilter === 'views' }"
            @click="filterByViews"
        >
          조회
        </button>
        <button
            class="filter-btn"
            :class="{ active: currentFilter === 'bookmarks' }"
            @click="filterByBookmarks"
        >
          북마크
        </button>
      </div>

      <!-- 테이블 -->
      <div class="table-container">
        <table class="custom-table">
          <thead>
          <tr>
            <th>제목</th>
            <th>내용</th>
            <th>키워드</th>
            <th>작성자</th>
            <th>작성일</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(post, index) in paginatedPosts" :key="index">
            <td>{{ post.title }}</td>
            <td>{{ post.content }}</td>
            <td>
                <span
                    v-for="tag in post.keywords"
                    :key="tag"
                    class="badge"
                >
                  #{{ tag }}
                </span>
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

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import Sidebar from "@/components/user/MyPage.vue"; // 사이드바 컴포넌트 추가

const posts = ref([]);
const currentPage = ref(1);
const itemsPerPage = 5;
const currentFilter = ref("");

const fetchMyPosts = async () => {
  try {
    const response = await axios.get("/medical-life/mypage", {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    });
    posts.value = response.data.data.map((post) => ({
      title: post.medicalLifeTitle,
      content: post.medicalLifeContent || "내용 없음",
      keywords: post.keywords || [],
      author: post.userName,
      date: new Date(post.createdAt).toLocaleDateString(),
      bookmarked: post.bookmarked,
      views: post.views,
    }));
  } catch (error) {
    console.error("내 메디컬 라이프 불러오기 실패:", error);
  }
};

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return posts.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => Math.ceil(posts.value.length / itemsPerPage));

const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const filterByViews = () => {
  currentFilter.value = "views";
  posts.value = [...posts.value].sort((a, b) => b.views - a.views);
};

const filterByBookmarks = () => {
  currentFilter.value = "bookmarks";
  posts.value = posts.value.filter((post) => post.bookmarked);
};

onMounted(fetchMyPosts);
</script>

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
  border: 1px solid #dee2e6;
}

.custom-table thead th {
  background-color: #f8f9fa;
  font-weight: bold;
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
