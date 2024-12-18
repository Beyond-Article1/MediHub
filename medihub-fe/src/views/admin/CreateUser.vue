<template>
  <div class="container mt-5">
    <!-- 제목 -->
    <h3 class="fw-bold mb-4 text-center">직원 등록</h3>
    <form @submit.prevent="submitForm" enctype="multipart/form-data">
      <!-- 이름 -->
      <div class="mb-3">
        <label for="userName" class="form-label">이름 *</label>
        <input type="text" class="form-control" id="userName" v-model="form.userName" required />
      </div>

      <!-- ID -->
      <div class="mb-3">
        <label for="userId" class="form-label">ID *</label>
        <input type="text" class="form-control" id="userId" v-model="form.userId" required />
      </div>

      <!-- 비밀번호 -->
      <div class="mb-3">
        <label for="password" class="form-label">비밀번호 *</label>
        <input type="password" class="form-control" id="password" v-model="form.userPassword" required />
      </div>

      <!-- 이메일 -->
      <div class="mb-3">
        <label for="email" class="form-label">이메일 *</label>
        <div class="input-group">
          <input type="text" class="form-control" v-model="form.userEmail" placeholder="이메일 입력" required />
          <span class="input-group-text">@medi.com</span>
        </div>
      </div>

      <!-- 연락처 -->
      <div class="mb-3">
        <label for="userPhone" class="form-label">연락처</label>
        <input type="text" class="form-control" id="userPhone" v-model="form.userPhone" />
      </div>

      <!-- 부서 선택 -->
      <div class="mb-3">
        <label for="deptSeq" class="form-label">부서</label>
        <select class="form-select" v-model="selectedDeptSeq" @change="filterParts" required>
          <option value="">부서를 선택해주세요</option>
          <option v-for="dept in depts" :key="dept.deptSeq" :value="dept.deptSeq">
            {{ dept.deptName }}
          </option>
        </select>
      </div>

      <!-- 과 선택 -->
      <div class="mb-3">
        <label for="partSeq" class="form-label">과</label>
        <select class="form-select" v-model="form.partSeq" required>
          <option value="">과를 선택해주세요</option>
          <option v-for="part in filteredParts" :key="part.partSeq" :value="part.partSeq">
            {{ part.partName }}
          </option>
        </select>
      </div>

      <!-- 직급 선택 -->
      <div class="mb-3">
        <label for="rankingSeq" class="form-label">직급</label>
        <select class="form-select" v-model="form.rankingSeq" required>
          <option value="">직급을 선택해주세요</option>
          <option v-for="rank in rankings" :key="rank.rankingSeq" :value="rank.rankingSeq">
            {{ rank.rankingName }}
          </option>
        </select>
      </div>

      <!-- 프로필 이미지 -->
      <div class="mb-3">
        <label for="profileImage" class="form-label">프로필 이미지</label>
        <input type="file" class="form-control" id="profileImage" @change="handleImageUpload" />
      </div>

      <!-- 제출 버튼 -->
      <div class="text-end">
        <button type="button" class="btn btn-secondary me-2" @click="resetForm">취소</button>
        <button type="submit" class="btn btn-primary">등록</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// 초기 상태
const form = ref({
  userName: "",
  userId: "",
  userPassword: "",
  userEmail: "",
  userPhone: "",
  partSeq: "",
  rankingSeq: "",
});

const selectedDeptSeq = ref(""); // 선택된 부서 ID
const depts = ref([]); // 부서 목록
const parts = ref([]); // 전체 과 목록
const filteredParts = ref([]); // 선택된 부서의 과 목록
const rankings = ref([]); // 직급 목록
const profileImage = ref(null);

// 프로필 이미지 핸들러
const handleImageUpload = (event) => {
  profileImage.value = event.target.files[0];
};

// API로 부서, 과, 직급 데이터 불러오기
const fetchMetadata = async () => {
  try {
    const [deptRes, partRes, rankRes] = await Promise.all([
      axios.get("/api/v1/dept"), // 부서 목록
      axios.get("/api/v1/part"), // 과 목록
      axios.get("/api/v1/ranking"), // 직급 목록
    ]);
    depts.value = deptRes.data; // 부서 데이터
    parts.value = partRes.data; // 과 데이터
    rankings.value = rankRes.data; // 직급 데이터
  } catch (error) {
    console.error("메타데이터 가져오기 실패:", error);
  }
};

// 선택된 부서에 따라 과 필터링
const filterParts = () => {
  filteredParts.value = parts.value.filter((part) => part.deptSeq == Number(selectedDeptSeq.value));
};

// 폼 제출
const submitForm = async () => {
  try {
    const formData = new FormData();
    formData.append(
        "userCreateDTO",
        new Blob([JSON.stringify(form.value)], { type: "application/json" })
    );
    if (profileImage.value) {
      formData.append("profileImage", profileImage.value);
    }

    await axios.post("/api/v1/admin/users", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("등록 성공!");
  } catch (error) {
    console.error("등록 실패:", error);
    alert("등록 실패! 다시 시도해주세요.");
  }
};

// 폼 초기화
const resetForm = () => {
  form.value = { userName: "", userId: "", userPassword: "", userEmail: "", userPhone: "", partSeq: "", rankingSeq: "" };
  profileImage.value = null;
  selectedDeptSeq.value = "";
  filteredParts.value = [];
};

onMounted(() => {
  fetchMetadata();
});
</script>

<style scoped>
.container {
  max-width: 700px;
}
.form-label {
  font-weight: bold;
}
</style>
