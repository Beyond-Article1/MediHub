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

    <!-- 오른쪽 콘텐츠: 사용자 목록 -->
    <div class="container mt-5 flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="fw-bold">
          {{ selectedDeptName || "전체 부서" }}
          {{ selectedPartName ? " > " + selectedPartName : "" }}
        </h3>
      </div>

      <LineDivider />

      <!-- 사용자 카드 -->
      <div class="row justify-content-start">
        <div
            class="col-md-6 col-lg-6 mb-4"
            v-for="user in paginatedUsers"
            :key="user.userSeq"
        >
          <div class="user-card position-relative">
            <div class="profile-image">
              <img :src="user.profileImage || defaultImage" alt="Profile" />
            </div>
            <div class="user-info">
              <!-- 이름 + 직급 표시 -->
              <h4>
                {{ user.userName }}
                <small class="text-muted">({{ user.rankingName }})</small>
              </h4>
              <p>{{ user.partName }}</p>
              <p>{{ user.userEmail }}</p>
              <p>{{ user.userPhone }}</p>
            </div>
            <!-- 북마크 버튼 -->
            <BookmarkButton
                :currentIsBookmark="user.isBookmarked"
                @updateBookmark="updateBookmark(user)"
                class="bookmark-button"
            />
          </div>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <Pagination
          :totalData="filteredUsers.length"
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
import BookmarkButton from "@/components/common/button/BookmarkButton.vue";
import axios from "axios";
import Pagination from "@/components/common/Pagination.vue";

const users = ref([]);
const departments = ref([]);
const parts = ref([]);
const currentPage = ref(1);
const itemsPerPage = 6;
const defaultImage = "https://via.placeholder.com/120";

const selectedDeptName = ref("");
const selectedPartName = ref("");
const selectedPartSeq = ref(null);
const openDept = ref(null);

const fetchDepartmentsAndParts = async () => {
  try {
    const [deptRes, partRes, userRes] = await Promise.all([
      axios.get("/api/v1/dept"),
      axios.get("/api/v1/part"),
      axios.get("/api/v1/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      }),
    ]);
    departments.value = deptRes.data;
    parts.value = partRes.data;
    users.value = userRes.data.data.map((user) => ({
      ...user,
      isBookmarked: false, // 초기 북마크 상태
    }));
  } catch (error) {
    console.error("데이터 불러오기 실패:", error);
  }
};

const toggleDept = (deptSeq, deptName) => {
  openDept.value = openDept.value === deptSeq ? null : deptSeq;
  selectedDeptName.value = deptName;
  selectedPartSeq.value = null;
  selectedPartName.value = "";
  currentPage.value = 1;
};

const selectPart = (partSeq, partName) => {
  selectedPartSeq.value = partSeq;
  selectedPartName.value = partName;
  currentPage.value = 1;
};

const updateBookmark = (user) => {
  user.isBookmarked = !user.isBookmarked;
};

const filteredParts = computed(() => {
  return parts.value.filter((part) => part.deptSeq === openDept.value);
});

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const matchesDept = !selectedDeptName.value || user.deptName === selectedDeptName.value;
    const matchesPart = !selectedPartSeq.value || user.partName === selectedPartName.value;
    return matchesDept && matchesPart;
  });
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredUsers.value.slice(start, start + itemsPerPage);
});

const changePage = (page) => {
  currentPage.value = page;
};

onMounted(fetchDepartmentsAndParts);
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

.dept-item {
  cursor: pointer;
  padding: 8px;
  font-weight: bold;
  border-radius: 4px;
}

.dept-item.active {
  background-color: #007bff;
  color: white;
}

.part-item {
  cursor: pointer;
  padding: 4px 8px;
  color: #555;
}

.part-item.active,
.part-item:hover {
  color: #007bff;
}

.container {
  max-width: 1000px;
  padding: 20px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.profile-image img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ccc;
}

.bookmark-button {
  position: absolute;
  top: 10px;
  right: 10px;
}

.user-info h4 {
  font-size: 1.5rem;
  color: #333;
}

.user-info p {
  font-size: 1.1rem;
  color: #555;
}
</style>
