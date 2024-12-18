<template>
  <div class="container mt-4">
    <!-- 상단 타이틀, 검색창, 글쓰기 버튼 -->
    <div class="row mb-3 align-items-center">
      <!-- 타이틀 -->
      <div class="col-auto">
        <h4 class="fw-bold mb-0">Medical Life</h4>
      </div>
      <!-- 검색창 -->
      <div class="col d-flex justify-content-center">
        <SearchBox @update:search="updateSearch" />
      </div>
      <!-- 글쓰기 버튼 -->
      <div class="col-auto text-end">
        <button class="btn btn-primary">글쓰기</button>
      </div>
    </div>

    <!-- 정렬 옵션 -->
    <div class="d-flex justify-content-end mb-2">
      <div class="d-flex align-items-center">
        <select v-model="sortOption" class="form-select form-select-sm" style="width: auto;">
          <option value="latest">작성순</option>
          <option value="views">조회순</option>
        </select>
        <select v-model="itemsPerPage" class="form-select form-select-sm ms-2" style="width: auto;">
          <option v-for="count in [5, 10, 15]" :key="count" :value="count">{{ count }}</option>
        </select>
      </div>
    </div>

    <!-- 구분선 -->
    <LineDivider />

    <!-- 게시판 테이블 -->
    <table class="table table-hover align-middle text-center">
      <thead class="table-light">
      <tr>
        <th scope="col">등록 번호</th>
        <th scope="col">제목</th>
        <th scope="col">태그</th>
        <th scope="col">작성자</th>
        <th scope="col">작성일</th>
        <th scope="col">조회수</th>
        <th scope="col" class="text-end pe-4">총 {{ totalViews }} 건</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(post, index) in paginatedPosts" :key="index">
        <td>{{ post.id }}</td>
        <td class="text-start">{{ post.title }}</td>
        <td>
          <span
              v-for="(tag, tIndex) in post.tags"
              :key="tIndex"
              class="badge bg-warning text-dark me-1"
          >
            # {{ tag }}
          </span>
        </td>
        <td>{{ post.author }}</td>
        <td>{{ post.date }}</td>
        <td>{{ post.views }}</td>
        <!-- 좋아요 및 북마크 컴포넌트 추가 -->
        <td class="text-end pe-4">
          <div class="d-flex justify-content-end gap-2">
            <LikeButton
                :currentIsLike="post.liked"
                @updateLike="toggleLike(post)"
            />
            <BookmarkButton
                :currentIsBookmark="post.bookmarked"
                @updateBookmark="toggleBookmark(post)"
            />
          </div>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- 구분선 -->
    <LineDivider />

    <!-- 페이지네이션 -->
    <Pagenation
        :totalData="filteredPosts.length"
        :limitPage="itemsPerPage"
        :page="currentPage"
        @updatePage="changePage"
    />
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from "vue";
import axios from "axios";
import SearchBox from "@/components/common/SearchBox.vue";
import Pagenation from "@/components/common/Pagenation.vue";
import LineDivider from "@/components/common/LineDivider.vue";
import BookmarkButton from "@/components/common/button/BookmarkButton.vue";
import LikeButton from "@/components/common/button/HeartButton.vue";

// 게시판 데이터
const posts = ref([]);

// 검색 및 상태
const searchQuery = ref("");
const sortOption = ref("latest");
const itemsPerPage = ref(5);
const currentPage = ref(1);

// 게시글 목록 API 호출
const fetchPosts = async () => {
  try {
    const response = await axios.get("/medicalLife", {
      params: {
        deptSeq: null,
        partSeq: null,
      },
    });

    // 응답 데이터 매핑
    posts.value = response.data.data.map((item) => ({
      id: item.medicalLifeSeq,
      title: item.medicalLifeTitle,
      tags: item.partName ? [item.partName] : [],
      author: item.userName,
      date: new Date().toISOString().split("T")[0], // 날짜 포맷 (수정 필요)
      views: item.medicalLifeViewCount,
      liked: false,
      bookmarked: false,
    }));
  } catch (error) {
    console.error("게시글 불러오기 실패:", error);
  }
};

// 페이지 로딩 시 API 호출
onMounted(() => {
  fetchPosts();
});

// 필터링된 게시물
const filteredPosts = computed(() => {
  return posts.value.filter((post) =>
      post.title.includes(searchQuery.value) || post.tags.some((tag) => tag.includes(searchQuery.value))
  );
});

// 정렬된 게시물
const sortedPosts = computed(() => {
  const filtered = filteredPosts.value;
  if (sortOption.value === "views") {
    return [...filtered].sort((a, b) => b.views - a.views);
  }
  return filtered;
});

// 페이지네이션된 게시물
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return sortedPosts.value.slice(start, start + itemsPerPage.value);
});

const totalViews = computed(() => posts.value.reduce((sum, post) => sum + post.views, 0));

const updateSearch = (query) => {
  searchQuery.value = query;
  currentPage.value = 1; // 검색 시 첫 페이지로 이동
};

const changePage = (page) => {
  if (page >= 1 && page <= Math.ceil(filteredPosts.value.length / itemsPerPage.value)) {
    currentPage.value = page;
  }
};

// 좋아요 토글
const toggleLike = (post) => {
  post.liked = !post.liked;
};

// 북마크 토글
const toggleBookmark = (post) => {
  post.bookmarked = !post.bookmarked;
};
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
  padding: 12px 8px;
}

.badge {
  font-size: 0.8rem;
}

.btn i {
  font-size: 1.2rem;
}

.pagination .active .page-link {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}
</style>
