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

    <!-- 오른쪽 컨텐츠: 사용자 목록 -->
    <div class="container mt-5 flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="fw-bold">
          {{ selectedDeptName || "전체 부서" }}
          {{ selectedPartName ? " > " + selectedPartName : "" }}
        </h3>
        <button class="btn btn-primary" @click="registerUser">
          <i class="bi bi-person-plus"></i> 회원 등록
        </button>
      </div>

      <LineDivider />

      <!-- 사용자 카드 -->
      <div class="row justify-content-start">
        <div
            class="col-md-6 col-lg-6 mb-4"
            v-for="user in paginatedUsers"
            :key="user.userSeq"
        >
          <div class="user-card" @click="goToDetail(user.userSeq)">
            <div class="profile-image">
              <img :src="user.profileImage || defaultImage" alt="Profile" />
            </div>
            <div class="user-info">
              <h4>{{ user.userName }}</h4>
              <p>{{ user.partName }}</p>
              <p>{{ user.userEmail }}</p>
              <p>{{ user.userPhone }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <Pagenation
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
import { useRouter } from "vue-router";
import Pagenation from "@/components/common/Pagenation.vue";
import LineDivider from "@/components/common/LineDivider.vue";
import axios from "axios";

const router = useRouter();
const users = ref([]); // 전체 사용자 목록
const departments = ref([]); // 부서 목록
const parts = ref([]); // 과 목록
const currentPage = ref(1);
const itemsPerPage = 6;
const defaultImage = "https://via.placeholder.com/120";

const selectedDeptName = ref(""); // 선택된 부서 이름
const selectedPartName = ref(""); // 선택된 과 이름
const selectedPartSeq = ref(null); // 선택된 과 Seq
const openDept = ref(null); // 현재 열린 부서 Seq

// 부서 및 과 데이터 가져오기
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
    users.value = userRes.data.data;
  } catch (error) {
    console.error("데이터 불러오기 실패:", error);
  }
};

// 부서 선택 (토글)
const toggleDept = (deptSeq, deptName) => {
  openDept.value = openDept.value === deptSeq ? null : deptSeq;
  selectedDeptName.value = deptName;
  selectedPartSeq.value = null;
  selectedPartName.value = "";
  currentPage.value = 1;
};

// 과 선택
const selectPart = (partSeq, partName) => {
  selectedPartSeq.value = partSeq;
  selectedPartName.value = partName;
  currentPage.value = 1;
};

// 과 필터링 (deptSeq 기준)
const filteredParts = computed(() => {
  return parts.value.filter((part) => part.deptSeq === openDept.value);
});

// 사용자 필터링
const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const matchesDept = !selectedDeptName.value || user.deptName === selectedDeptName.value;
    const matchesPart = !selectedPartSeq.value || user.partName === selectedPartName.value;
    return matchesDept && matchesPart;
  });
});

// 페이지네이션 데이터
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredUsers.value.slice(start, start + itemsPerPage);
});

const changePage = (page) => {
  currentPage.value = page;
};

const registerUser = () => router.push("/CreateUser");
const goToDetail = (userSeq) => router.push({ name: "AdminUserDetail", params: { userSeq } });

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

button.btn-primary {
  display: flex;
  align-items: center;
  font-size: 1rem;
  padding: 8px 16px;
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
  cursor: pointer;
  transition: transform 0.2s;
}

.user-card:hover {
  transform: scale(1.02);
}

.profile-image img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ccc;
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

