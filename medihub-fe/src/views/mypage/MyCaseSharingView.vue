<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import Sidebar from "@/components/user/MyPage.vue";

const caseSharingPosts = ref([]); // 전체 게시물 데이터 저장
const filteredPosts = ref([]); // 필터링된 게시물 저장
const currentPage = ref(1); // 현재 페이지
const itemsPerPage = 5; // 페이지당 항목 수
const currentFilter = ref("myPosts"); // 현재 필터 상태 ("myPosts" 또는 "bookmarks")

// 내가 작성한 케이스 공유 데이터 가져오기
const fetchMyPosts = async () => {
  try {
    const response = await axios.get("/case_sharing/my"); // API 호출
    caseSharingPosts.value = response.data.data.map((post) => ({
      title: post.caseSharingTitle, // 제목
      date: new Date(post.regDate).toLocaleDateString(), // 작성일자
      viewCount: post.caseSharingViewCount, // 조회수
    }));
    filteredPosts.value = [...caseSharingPosts.value]; // 필터링 초기화
  } catch (error) {
    console.error("내 케이스 공유 가져오기 실패:", error);
  }
};

// 내가 북마크한 케이스 공유 데이터 가져오기
const fetchBookmarkedPosts = async () => {
  try {
    const response = await axios.get("/case_sharing/my/bookmark"); // API 호출
    caseSharingPosts.value = response.data.data.map((post) => ({
      title: post.caseSharingTitle, // 제목
      author: post.caseAuthor, // 작성자
      authorRank: post.caseAuthorRankName, // 작성자 직위
      date: new Date(post.regDate).toLocaleDateString(), // 작성일자
      viewCount: post.caseSharingViewCount,
    }));
    filteredPosts.value = [...caseSharingPosts.value]; // 필터링 초기화
  } catch (error) {
    console.error("북마크된 케이스 공유 가져오기 실패:", error);
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

// 페이지네이션 데이터 계산
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredPosts.value.slice(start, start + itemsPerPage);
});

// 총 페이지 수 계산
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
const filterByMyPosts = async () => {
  currentFilter.value = "myPosts"; // 현재 필터 설정
  await fetchMyPosts(); // 내가 쓴 게시물 데이터 가져오기
  currentPage.value = 1; // 페이지 초기화
};

// 북마크 버튼 클릭
const filterByBookmarks = async () => {
  currentFilter.value = "bookmarks"; // 현재 필터 설정
  await fetchBookmarkedPosts(); // 북마크된 게시물 데이터 가져오기
  currentPage.value = 1; // 페이지 초기화
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
      <h3 class="title">MY CaseSharing</h3>

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
            <th v-if="currentFilter === 'bookmarks'">작성자</th>
            <th v-if="currentFilter === 'bookmarks'">직위</th>
            <th>작성일자</th>
            <th v-if="currentFilter === 'myPosts' || currentFilter === 'bookmarks'">조회수</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(post, index) in paginatedPosts" :key="index">
            <td>{{ post.title }}</td>
            <td v-if="currentFilter === 'bookmarks'">{{ post.author }}</td>
            <td v-if="currentFilter === 'bookmarks'">{{ post.authorRank }}</td>
            <td>{{ post.date }}</td>
            <td>{{ post.viewCount }}</td> <!-- 조회수는 항상 표시 -->
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
