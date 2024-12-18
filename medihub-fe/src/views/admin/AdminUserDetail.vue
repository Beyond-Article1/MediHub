<template>
  <div class="container mt-5 position-relative">
    <!-- 제목 -->
    <h3 class="fw-bold mb-4 text-center">회원 정보 수정</h3>

    <!-- 비밀번호 초기화 버튼 -->
    <button class="btn btn-outline-primary reset-password-btn" @click="resetPassword">
      비밀번호 초기화
    </button>

    <form @submit.prevent="submitForm" enctype="multipart/form-data">
      <!-- 이름 -->
      <div class="mb-3">
        <label for="userName" class="form-label">이름</label>
        <input type="text" class="form-control" id="userName" v-model="form.userName" disabled />
      </div>

      <!-- ID -->
      <div class="mb-3">
        <label for="userId" class="form-label">ID</label>
        <input type="text" class="form-control" id="userId" v-model="form.userId" disabled />
      </div>

      <!-- 이메일 -->
      <div class="mb-3">
        <label for="userEmail" class="form-label">이메일</label>
        <input type="text" class="form-control" id="userEmail" v-model="form.userEmail" />
      </div>

      <!-- 연락처 -->
      <div class="mb-3">
        <label for="userPhone" class="form-label">연락처</label>
        <input type="text" class="form-control" id="userPhone" v-model="form.userPhone" />
      </div>

      <!-- 권한 및 상태 -->
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="userAuth" class="form-label">권한</label>
          <select class="form-select" v-model="form.userAuth">
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div class="col-md-6 mb-3">
          <label for="userStatus" class="form-label">상태</label>
          <select class="form-select" v-model="form.userStatus">
            <option value="ACTIVE">ACTIVE</option>
            <option value="LEAVE">LEAVE</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      </div>

      <!-- 부서 및 직급 -->
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="partSeq" class="form-label">과</label>
          <select class="form-select" v-model="form.partSeq">
            <option v-for="part in filteredParts" :key="part.partSeq" :value="part.partSeq">
              {{ part.partName }}
            </option>
          </select>
        </div>
        <div class="col-md-6 mb-3">
          <label for="rankingSeq" class="form-label">직급</label>
          <select class="form-select" v-model="form.rankingSeq">
            <option v-for="rank in rankings" :key="rank.rankingSeq" :value="rank.rankingSeq">
              {{ rank.rankingName }}
            </option>
          </select>
        </div>
      </div>

      <!-- 프로필 이미지 -->
      <div class="mb-3">
        <label for="profileImage" class="form-label">프로필 이미지</label>
        <input type="file" class="form-control" @change="handleImageUpload" />
        <img v-if="profilePreview" :src="profilePreview" alt="Profile Preview" class="mt-3 img-thumbnail" width="150" />
      </div>

      <!-- 버튼 -->
      <div class="text-end">
        <button type="button" class="btn btn-secondary me-2" @click="goBack">취소</button>
        <button type="submit" class="btn btn-primary">수정</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const userSeq = route.params.userSeq;

// 상태 변수
const form = ref({});
const parts = ref([]);
const rankings = ref([]);
const profileImage = ref(null);
const profilePreview = ref("");

// **과 필터링**: form.value.deptSeq에 맞는 과만 표시
const filteredParts = computed(() => {
  return parts.value.filter((part) => part.deptSeq === form.value.deptSeq);
});

// 프로필 이미지 업로드
const handleImageUpload = (event) => {
  profileImage.value = event.target.files[0];
  profilePreview.value = URL.createObjectURL(profileImage.value);
};

// 비밀번호 초기화 함수
const resetPassword = async () => {
  try {
    const confirmReset = confirm("비밀번호를 초기화하시겠습니까?");
    if (confirmReset) {
      await axios.patch(`/api/v1/admin/users/${userSeq}/reset-password`);
      alert("비밀번호가 초기화되었습니다. 새로운 비밀번호를 사용자에게 안내하세요.");
    }
    router.push({ name: "AdminUser" });
  } catch (error) {
    console.error("비밀번호 초기화 실패:", error);
    alert("비밀번호 초기화에 실패했습니다.");
  }
};

// 데이터 불러오기
const fetchData = async () => {
  try {
    const [userRes, partRes, rankRes] = await Promise.all([
      axios.get(`/api/v1/admin/users/${userSeq}`),
      axios.get("/api/v1/part"),
      axios.get("/api/v1/ranking"),
    ]);

    form.value = userRes.data.data;
    profilePreview.value = userRes.data.data.profileImage || "";
    parts.value = partRes.data; // 전체 파트 데이터
    rankings.value = rankRes.data; // 직급 데이터
  } catch (error) {
    console.error("데이터 불러오기 실패:", error);
    alert("회원 정보를 불러오는 데 실패했습니다.");
  }
};

// 폼 제출
const submitForm = async () => {
  const formData = new FormData();
  formData.append(
      "adminUpdateDTO",
      new Blob([JSON.stringify(form.value)], { type: "application/json" })
  );
  if (profileImage.value) {
    formData.append("profileImage", profileImage.value);
  }

  try {
    await axios.put(`/api/v1/admin/users/${userSeq}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("수정되었습니다.");
    router.push({ name: "AdminUser" }); // AdminUser 페이지로 이동
  } catch (error) {
    console.error("수정 실패:", error);
    alert("수정에 실패했습니다. 다시 시도해주세요.");
  }
};

// 뒤로 가기
const goBack = () => router.back();

onMounted(() => fetchData());
</script>

<style scoped>
.container {
  max-width: 700px;
  margin: auto;
}

.img-thumbnail {
  border: 1px solid #ddd;
}

.reset-password-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.9rem;
  padding: 6px 12px;
  border-radius: 4px;
  background-color: #f8f9f9;
}
</style>
