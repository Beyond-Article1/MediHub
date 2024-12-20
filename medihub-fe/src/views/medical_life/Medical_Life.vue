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
          <!-- 과 목록 표시 -->
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

    <!-- 오른쪽 콘텐츠: 게시글 목록 -->
    <div class="container mt-5 flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="fw-bold">
          {{ selectedDeptName || "전체 부서" }}
          {{ selectedPartName ? " > " + selectedPartName : "" }}
        </h3>
      </div>

      <LineDivider />

      <!-- 게시글 목록 -->
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
          <tr>
            <th>등록 번호</th>
            <th>제목</th>
            <th>태그</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>조회수</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(post, index) in paginatedPosts" :key="post.medicalLifeSeq">
            <td>{{ index + 1 }}</td>
            <td>{{ post.medicalLifeTitle }}</td>
            <!-- 태그 영역 -->
            <td>
              <div class="tags">
                  <span v-for="(tag, idx) in post.tags" :key="idx" class="tag">
                    # {{ tag }}
                  </span>
              </div>
            </td>
            <td>{{ post.userName }}</td>
            <td>{{ formatDate(post.created_at) }}</td>
            <td>{{ post.medicalLifeViewCount }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
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
import Pagination from "@/components/common/Pagination.vue";
import LineDivider from "@/components/common/LineDivider.vue";
import axios from "axios";

// 상태 변수
const departments = ref([]);
const parts = ref([]);
const posts = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);

const openDept = ref(null);
const selectedDeptSeq = ref(null);
const selectedPartSeq = ref(null);
const selectedDeptName = ref("");
const selectedPartName = ref("");

// 날짜 포맷 함수
const formatDate = (date) => new Date(date).toLocaleDateString("ko-KR");

// 부서와 과 데이터 불러오기
const fetchDepartmentsAndParts = async () => {
  try {
    const [deptRes, partRes] = await Promise.all([
      axios.get("/api/v1/dept"),
      axios.get("/api/v1/part"),
    ]);
    departments.value = deptRes.data;
    parts.value = partRes.data;
  } catch (error) {
    console.error("부서와 과 데이터 불러오기 실패:", error);
  }
};

// 게시글 목록 불러오기
const fetchPosts = async () => {
  try {
    const params = {
      deptSeq: selectedDeptSeq.value,
      partSeq: selectedPartSeq.value,
    };
    const response = await axios.get("/medicalLife", {params});
    posts.value = response.data.data;
  } catch (error) {
    console.error("게시글 불러오기 실패:", error);
  }
};

// 부서 선택
const toggleDept = (deptSeq, deptName) => {
  openDept.value = openDept.value === deptSeq ? null : deptSeq;
  selectedDeptSeq.value = deptSeq;
  selectedDeptName.value = deptName;
  selectedPartSeq.value = null;
  selectedPartName.value = "";
  fetchPosts();
};

// 과 선택
const selectPart = (partSeq, partName) => {
  selectedPartSeq.value = partSeq;
  selectedPartName.value = partName;
  fetchPosts();
};

// 필터링된 과 목록
const filteredParts = computed(() => {
  return parts.value.filter((part) => part.deptSeq === openDept.value);
});

// 페이지네이션
const filteredPosts = computed(() => posts.value);
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredPosts.value.slice(start, start + itemsPerPage.value);
});

const changePage = (page) => {
  currentPage.value = page;
};

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

.table {
  font-size: 1rem;
}

.tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.tag {
  background-color: #fffbf2;
  color: #333;
  border: 1px solid #f1dca7;
  border-radius: 5px;
  padding: 2px 6px;
  font-size: 0.85rem;
  white-space: nowrap;
}
</style>
