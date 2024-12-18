<template>
  <div class="container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold"></h3>
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

    <Pagenation
        :totalData="totalUsers"
        :limitPage="itemsPerPage"
        :page="currentPage"
        @updatePage="changePage"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Pagenation from "@/components/common/Pagenation.vue";
import LineDivider from "@/components/common/LineDivider.vue";
import axios from "axios";

const router = useRouter();
const users = ref([]);
const currentPage = ref(1);
const itemsPerPage = 6;
const totalUsers = ref(0);
const defaultImage = "https://via.placeholder.com/120";

const fetchUsers = async () => {
  try {
    const response = await axios.get("/api/v1/admin/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    });
    users.value = response.data.data;
    totalUsers.value = users.value.length;
  } catch (error) {
    console.error("데이터 불러오기 실패:", error);
  }
};

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return users.value.slice(start, end);
});

const changePage = (page) => {
  currentPage.value = page;
};

const registerUser = () => {
  router.push("/CreateUser");
};

const goToDetail = (userSeq) => {
  router.push({ name: "AdminUserDetail", params: { userSeq } });
};

onMounted(fetchUsers);
</script>

<style scoped>
.container {
  max-width: 1000px;
}

button.btn-primary {
  display: flex;
  align-items: center;
  font-size: 1rem;
  padding: 8px 16px;
}

button.btn-primary .material-icons {
  font-size: 1.2rem;
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
  height: 170px;
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
  background-color: #eaeaea;
  border: 2px solid #ccc;
}

.user-info {
  flex-grow: 1;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info h4 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 10px;
}

.user-info p {
  margin: 0;
  font-size: 1.1rem;
  color: #555;
}

.row {
  margin-left: 0;
  margin-right: 0;
}
</style>
