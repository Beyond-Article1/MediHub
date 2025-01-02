<template>
  <div class="login-container d-flex justify-content-center align-items-center vh-100">
    <div class="card p-5 shadow-lg border-0">
      <div class="text-center mb-5">
        <h3 class="fw-bold text-nowrap">
          <em>MEDIHUB</em>에 오신 것을 환영합니다.
        </h3>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="input-group mb-4">
          <span class="input-group-text bg-light px-4">
            <i class="bi bi-person fs-4"></i>
          </span>
          <input
              type="text"
              class="form-control form-control-lg"
              v-model="formData.userId"
              placeholder="ID"
              required
          />
        </div>
        <div class="input-group mb-5">
          <span class="input-group-text bg-light px-4">
            <i class="bi bi-lock fs-4"></i>
          </span>
          <input
              type="password"
              class="form-control form-control-lg"
              v-model="formData.userPassword"
              placeholder="PASSWORD"
              required
          />
        </div>
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
import {reactive, ref} from "vue";
import axios from "axios";
import {useAuthStore} from "@/store/authStore";
import {useRouter} from "vue-router";
import {useWebSocketStore} from "@/store/webSocket.js";

const authStore = useAuthStore();
const router = useRouter();

// 로그인 폼 데이터
const formData = reactive({
  userId: "",
  userPassword: "",
});

const loading = ref(false);

// 로그인 요청 처리
const handleLogin = async () => {
  loading.value = true;

  try {
    console.log("로그인 요청:", formData);

    const response = await axios.post("/login", {
      userId: formData.userId,
      userPassword: formData.userPassword,
    });

    console.log("응답 전체:", response);

    // 헤더에서 Access Token과 Refresh Token 추출
    const accessToken = response.headers["access-token"];
    const refreshToken = response.headers["refresh-token"];

    if (accessToken && refreshToken) {
      authStore.login(accessToken, refreshToken);

      console.log("로그인 성공: AccessToken, RefreshToken 저장 완료");
      alert("로그인에 성공했습니다!");

      // 웹소켓 연결
      await useWebSocketStore().connectWebSocket();

      // 사용자 정보 저장
      await fetchUserInfo();

      // 메인 페이지로 이동
      router.push("/main");
    } else {
      throw new Error("로그인 성공했지만 토큰이 응답에 포함되지 않았습니다.");
    }
  } catch (error) {
    console.error("로그인 실패:", error.response?.data || error.message);
    alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
  } finally {
    loading.value = false;
  }
};

// 사용자 정보 가져오기
const fetchUserInfo = async () => {
  try {
    const response = await axios.get("/v1/users", {
      headers: {Authorization: `Bearer ${authStore.accessToken}`},
    });

    const userData = response.data.data;


    authStore.setUserInfo({
      userId: userData.userId,
      userName: userData.userName,
      userEmail: userData.userEmail,
      userPhone: userData.userPhone,
      rankingName: userData.rankingName,
      partName: userData.partName,
      profileImage: userData.profileImage || null,
    });

    console.log("사용자 정보 저장 완료:", authStore.userInfo);
  } catch (error) {
    console.error("사용자 정보 불러오기 실패:", error.response?.data || error.message);
  }
};


axios.interceptors.request.use(
    (config) => {
      const accessToken = authStore.accessToken;
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Access Token 만료 시 Refresh Token을 사용해 재발급 요청
        if (authStore.refreshToken) {
          try {
            const reissueResponse = await axios.post(
                "/v1/token/reissue",
                null,
                {
                  headers: {"Refresh-Token": authStore.refreshToken},
                }
            );

            const newAccessToken = reissueResponse.headers["access-token"];
            const newRefreshToken = reissueResponse.headers["refresh-token"];

            if (newAccessToken && newRefreshToken) {
              authStore.login(newAccessToken, newRefreshToken);

              localStorage.setItem("accessToken", newAccessToken);
              localStorage.setItem("refreshToken", newRefreshToken);

              // 원래 요청 재시도
              error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
              return axios.request(error.config);
            }
          } catch (reissueError) {
            console.error("토큰 재발급 실패:", reissueError);
            authStore.logout();
            router.push("/login");
          }
        } else {
          console.error("Refresh Token이 없습니다. 다시 로그인하세요.");
          authStore.logout();
          router.push("/login");
        }
      }
      return Promise.reject(error);
    }
);
</script>

<style scoped>
.login-container {
  background-color: #e9ecef;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.card {
  width: 100%;
  max-width: 500px;
  border-radius: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h3 {
  font-size: 1.5rem;
  color: #002b5b;
}

.input-group-text {
  border: none;
  font-size: 1.2rem;
  background-color: #f8f9fa;
}

.input-group .form-control {
  font-size: 1.2rem;
  padding: 1rem;
  border: 1px solid #ced4da;
  border-radius: 0.5rem;
}

.input-group .form-control:focus {
  border-color: #003366;
  box-shadow: 0 0 0 0.2rem rgba(0, 43, 91, 0.25);
}

.btn-primary {
  background-color: #002b5b;
  border: none;
  font-size: 1.3rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #003366;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.p-5 {
  padding: 3rem !important;
}

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
