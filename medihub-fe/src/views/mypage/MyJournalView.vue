<script setup>
import { ref, computed, onMounted } from "vue";
import Sidebar from "@/components/user/MyPage.vue";
import axios from "axios";

const posts = ref([]);
const filteredPosts = ref([]);
const currentPage = ref(1);
const itemsPerPage = 5;
const currentFilter = ref("select");

// API 요청: 내가 조회한 논문
const fetchMyPosts = async () => {
  try {
    const response = await axios.get("/journal/mypage", {
      params: { sortBy: "select" },
    });

    // 데이터 매핑
    posts.value = response.data.data.map((post) => ({
      date: new Date(post.createdAt).toLocaleDateString(), // 날짜
      title: post.title || post.koreanTitle, // 논문 제목 (영문/한글 중 하나)
      journal: post.source, // 저널명
      authors: post.authors.join(", "), // 저자 (콤마로 구분)
      doi: post.doi || "-", // DOI (없으면 "-")
    }));

    filteredPosts.value = [...posts.value]; // 필터링 데이터 초기화
  } catch (error) {
    console.error("조회 데이터 불러오기 실패:", error);
  }
};

// API 요청: 내가 북마크한 논문
const fetchBookmarkedPosts = async () => {
  try {
    const response = await axios.get("/journal/mypage", {
      params: { sortBy: "bookmark" },
    });

    // 데이터 매핑
    posts.value = response.data.data.map((post) => ({
      date: new Date(post.createdAt).toLocaleDateString(),
      title: post.title || post.koreanTitle,
      journal: post.source,
      authors: post.authors.join(", "),
      doi: post.doi || "-",
    }));

    filteredPosts.value = [...posts.value]; // 필터링 데이터 초기화
  } catch (error) {
    console.error("북마크 데이터 불러오기 실패:", error);
  }
};

// 페이지네이션 계산
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredPosts.value.slice(start, start + itemsPerPage);
});

// 총 페이지 수 계산
const totalPages = computed(() => Math.ceil(filteredPosts.value.length / itemsPerPage));

// 페이지 변경 함수
const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// 필터 버튼: 내가 조회한 논문
const filterByMyPosts = () => {
  currentFilter.value = "select";
  fetchMyPosts(); // API 호출
  currentPage.value = 1;
};

// 필터 버튼: 내가 북마크한 논문
const filterByBookmarks = () => {
  currentFilter.value = "bookmark";
  fetchBookmarkedPosts(); // API 호출
  currentPage.value = 1;
};

// 컴포넌트 마운트 시 기본 데이터 로드
onMounted(fetchMyPosts);
</script>

<template>
  <div class="d-flex">
    <!-- 사이드바 -->
    <Sidebar />

    <!-- 메인 콘텐츠 -->
    <div class="content-container flex-grow-1">
      <h3 class="title">내가 조회한 논문</h3>

      <!-- 필터 버튼 -->
      <div class="filter-buttons">
        <button
            class="filter-btn"
            :class="{ active: currentFilter === 'select' }"
            @click="filterByMyPosts"
        >
          조회
        </button>
        <button
            class="filter-btn"
            :class="{ active: currentFilter === 'bookmark' }"
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
            <th>날짜</th>
            <th>논문 내용</th>
            <th>저널</th>
            <th>저자</th>
            <th>DOI</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(post, index) in paginatedPosts" :key="index">
            <td>{{ post.date }}</td>
            <td>{{ post.title }}</td>
            <td>{{ post.journal }}</td>
            <td>{{ post.authors }}</td>
            <td>
              <a :href="`https://doi.org/${post.doi}`" target="_blank">{{ post.doi }}</a>
            </td>
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
