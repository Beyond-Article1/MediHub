<template>
  <div class="login-container d-flex justify-content-center align-items-center vh-100">
    <div class="card p-5 shadow-lg border-0">
      <!-- 타이틀 -->
      <div class="text-center mb-5">
        <h3 class="fw-bold text-nowrap">
          <em>MEDIHUB</em>에 오신 것을 환영합니다.
        </h3>
      </div>

      <!-- 로그인 폼 -->
      <form @submit.prevent="handleLogin">
        <!-- ID 입력 -->
        <div class="input-group mb-4">
          <span class="input-group-text bg-light px-4">
            <i class="bi bi-person fs-4"></i>
          </span>
          <input
              type="text"
              class="form-control form-control-lg"
              v-model="formData.id"
              placeholder="ID"
              required
          />
        </div>

        <!-- PASSWORD 입력 -->
        <div class="input-group mb-5">
          <span class="input-group-text bg-light px-4">
            <i class="bi bi-lock fs-4"></i>
          </span>
          <input
              type="password"
              class="form-control form-control-lg"
              v-model="formData.password"
              placeholder="PASSWORD"
              required
          />
        </div>

        <!-- 로그인 버튼 -->
        <div class="d-grid">
          <button type="submit" class="btn btn-primary btn-lg fw-bold" :disabled="loading">
            {{ loading ? "처리 중..." : "LOGIN" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter(); // Router 인스턴스 사용

const formData = reactive({
  id: "",
  password: "",
});

const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;

  try {
    console.log("로그인 요청:", formData);

    const response = await axios.post("/api/v1/user/login", {
      userId: formData.id,
      userPassword: formData.password,
    });

    console.log("응답 전체:", response);
    console.log("응답 헤더:", response.headers);

    const authorizationHeader = response.headers["authorization"];
    const refreshToken = response.data.refreshToken;

    if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
      const accessToken = authorizationHeader.replace("Bearer ", "");

      // authStore에 토큰 저장
      authStore.login(accessToken, refreshToken);

      console.log("로그인 성공: AccessToken과 RefreshToken 저장 완료");
      alert("로그인에 성공했습니다!");

      // Main.vue로 이동
      router.push("/main");
    } else {
      throw new Error("Authorization 헤더에서 토큰을 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("로그인 실패:", error.response?.data || error.message);
    alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
  } finally {
    loading.value = false;
  }
};
</script>


<style scoped>
/* 전체 화면 배경 설정 */
.login-container {
  background-color: #e9ecef; /* 연한 회색 배경 */
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* 카드 스타일 */
.card {
  width: 100%;
  max-width: 500px; /* 카드 최대 너비 설정 */
  border-radius: 20px; /* 모서리를 둥글게 설정 */
  background-color: #ffffff; /* 흰색 배경 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 부드러운 그림자 */
}

/* 타이틀 스타일 */
h3 {
  font-size: 1.5rem;
  color: #002b5b; /* 진한 네이비 색상 */
}

/* 입력 그룹 스타일 */
.input-group-text {
  border: none;
  font-size: 1.2rem;
  background-color: #f8f9fa; /* 연한 회색 배경 */
}

.input-group .form-control {
  font-size: 1.2rem;
  padding: 1rem; /* 입력란 크기 확장 */
  border: 1px solid #ced4da;
  border-radius: 0.5rem;
}

.input-group .form-control:focus {
  border-color: #003366; /* 포커스 시 테두리 색상 */
  box-shadow: 0 0 0 0.2rem rgba(0, 43, 91, 0.25);
}

/* 버튼 스타일 */
.btn-primary {
  background-color: #002b5b; /* 진한 네이비 색상 */
  border: none;
  font-size: 1.3rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: background-color 0.3s ease; /* 부드러운 전환 효과 */
}

.btn-primary:hover {
  background-color: #003366; /* 어두운 네이비 색상 */
}

.btn-primary:disabled {
  background-color: #6c757d; /* 비활성화 시 회색 */
  cursor: not-allowed;
}

/* 카드 안 여백 설정 */
.p-5 {
  padding: 3rem !important; /* 내부 여백 설정 */
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  h3 {
    font-size: 1.2rem;
  }
  .card {
    padding: 2rem !important;
  }
  .input-group .form-control {
    font-size: 1rem;
    padding: 0.8rem;
  }
  .btn-primary {
    font-size: 1.1rem;
    padding: 0.6rem;
  }
}
</style>
