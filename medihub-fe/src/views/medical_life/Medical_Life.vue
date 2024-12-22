<template>
  <div class="d-flex">
    <!-- 왼쪽 사이드바: 부서와 과 -->
    <div class="sidebar p-3">
      <h5 class="fw-bold mb-3">부서 현황</h5>
      <ul class="list-unstyled">
        <li v-for="dept in departments" :key="dept.deptSeq">
          <div
              @click="toggleDept(dept.deptSeq, dept.deptName)"
              class="dept-item"
              :class="{ active: dept.deptSeq === openDept }"
          >
            <i
                :class="{
                'bi bi-chevron-down': dept.deptSeq === openDept,
                'bi bi-chevron-right': dept.deptSeq !== openDept,
              }"
            ></i>
            {{ dept.deptName }}
          </div>
          <ul v-if="dept.deptSeq === openDept" class="ms-3 list-unstyled">
            <li
                v-for="part in filteredParts"
                :key="part.partSeq"
                @click.stop="selectPart(part.partSeq, part.partName)"
                class="part-item"
                :class="{ active: part.partSeq === selectedPartSeq }"
            >
              {{ part.partName }}
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <!-- 오른쪽 콘텐츠 -->
    <div class="container mt-4 flex-grow-1">
      <!-- 상단 타이틀, 검색창, 글쓰기 버튼 -->
      <div class="row mb-3 align-items-center">
        <div class="col-auto">
          <h4 class="fw-bold mb-0">Medical Life</h4>
        </div>
        <div class="col d-flex justify-content-center">
          <SearchBox @update:search="updateSearch" />
        </div>
        <div class="col-auto text-end">
          <button class="btn custom-btn">글쓰기</button>
        </div>
      </div>

      <!-- 정렬 옵션 -->
      <div class="d-flex justify-content-end mb-2">
        <div class="d-flex align-items-center">
          <!-- 정렬 옵션 -->
          <select v-model="sortOption" class="form-select form-select-sm custom-select" style="width: auto;">
            <option value="createdAt">작성순</option>
            <option value="views">조회순</option>
            <option value="latest">최신순</option>
          </select>
          <!-- 페이지네이션 옵션 -->
          <select v-model.number="itemsPerPage" class="form-select form-select-sm custom-select ms-2" style="width: auto;">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <!-- 게시판 테이블 -->
      <LineDivider />
      <div class="table-responsive">
        <table class="table table-hover align-middle text-center">
          <thead class="table-light">
          <tr>
            <th scope="col">등록 번호</th>
            <th scope="col">제목</th>
            <th scope="col">키워드</th>
            <th scope="col">작성자</th>
            <th scope="col">작성일</th>
            <th scope="col">조회수</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(post, index) in paginatedPosts" :key="index">
            <td>{{ post.id }}</td>
            <td class="text-start">{{ post.title }}</td>
            <td>
                <span v-for="(tag, tIndex) in post.tags" :key="tIndex" class="badge bg-warning text-dark me-1">
                  # {{ tag }}
                </span>
            </td>
            <td>{{ post.author }}</td>
            <td>{{ post.date }}</td>
            <td>{{ post.views }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <LineDivider />
      <Pagination
          :totalData="filteredPosts.length"
          :limitPage="itemsPerPage"
          :page="currentPage"
          @updatePage="changePage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import LineDivider from "@/components/common/LineDivider.vue";
import Pagination from "@/components/common/Pagination.vue";
import SearchBox from "@/components/common/SearchBox.vue";
import axios from "axios";

// 상태 변수
const posts = ref([]);
const departments = ref([]);
const parts = ref([]);

const openDept = ref(null);
const selectedDeptSeq = ref(null);
const selectedPartSeq = ref(null);
const selectedDeptName = ref("");
const selectedPartName = ref("");

const searchQuery = ref("");
const sortOption = ref("latest");
const itemsPerPage = ref(5);
const currentPage = ref(1);

// API 데이터 가져오기
const fetchDepartmentsAndParts = async () => {
  try {
    const [deptRes, partRes] = await Promise.all([axios.get("/api/v1/dept"), axios.get("/api/v1/part")]);
    departments.value = deptRes.data;
    parts.value = partRes.data;
  } catch (error) {
    console.error("부서/과 데이터 가져오기 실패:", error);
  }
};

const fetchPosts = async () => {
  try {
    const response = await axios.get("/medical-life");
    posts.value = response.data.data.map((item) => ({
      id: item.medicalLifeSeq,
      title: item.medicalLifeTitle,
      tags: item.keywords || [], // 키워드 리스트
      author: `${item.userName} (${item.rankingName})`, // 작성자와 랭킹 이름
      date: new Date(item.createdAt).toLocaleDateString(), // 작성일 포맷
      views: item.medicalLifeViewCount, // 조회수
    }));
  } catch (error) {
    console.error("게시글 데이터 가져오기 실패:", error);
  }
};

// 컴퓨티드
const filteredParts = computed(() => parts.value.filter((part) => part.deptSeq === openDept.value));
const filteredPosts = computed(() =>
    posts.value.filter((post) =>
        post.title.includes(searchQuery.value) || post.tags.some((tag) => tag.includes(searchQuery.value))
    )
);
// 정렬 로직 수정
const sortedPosts = computed(() => {
  switch (sortOption.value) {
    case "views":
      return [...filteredPosts.value].sort((a, b) => b.views - a.views); // 조회순
    case "latest":
      return [...filteredPosts.value].sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신순
    case "createdAt":
    default:
      return [...filteredPosts.value]; // 작성순 (기본)
  }
});
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return sortedPosts.value.slice(start, start + itemsPerPage.value);
});

// 함수
const toggleDept = (deptSeq, deptName) => {
  openDept.value = openDept.value === deptSeq ? null : deptSeq;
  selectedDeptSeq.value = deptSeq;
  selectedDeptName.value = deptName;
  selectedPartSeq.value = null;
  selectedPartName.value = "";
  fetchPosts();
};

const selectPart = (partSeq, partName) => {
  selectedPartSeq.value = partSeq;
  selectedPartName.value = partName;
  fetchPosts();
};

const updateSearch = (query) => {
  searchQuery.value = query;
  currentPage.value = 1;
};

const changePage = (page) => {
  currentPage.value = page;
};

// 컴포넌트 초기화
onMounted(() => {
  fetchDepartmentsAndParts();
  fetchPosts();
});
</script>

<style scoped>
.d-flex {
  display: flex;
}

.sidebar {
  width: 240px;
  background-color: #f8f9fa;
  border-right: 1px solid #ddd;
  min-height: 100vh;
}

.dept-item,
.part-item {
  cursor: pointer;
  padding: 8px;
  font-weight: bold;
}

.dept-item.active,
.part-item.active {
  background-color: #007bff;
  color: white;
}

.custom-btn,
.custom-select {
  background-color: #003366;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  margin-left: 10px;
  font-size: 0.9rem;
  cursor: pointer;
}

.custom-select {
  appearance: none;
}

.custom-btn:hover,
.custom-select:hover {
  background-color: #002244;
}

.table th,
.table td {
  vertical-align: middle;
  padding: 12px 8px;
}

.table-responsive {
  margin-top: 1rem;
}
</style>
