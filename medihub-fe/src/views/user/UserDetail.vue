<template>
  <div class="container mt-5 user-info-page">
    <h4 class="fw-bold mb-4">내 정보 조회</h4>
    <div class="row g-4 align-items-stretch">
      <!-- 프로필 카드 -->
      <div class="col-md-5 d-flex">
        <div class="profile-card text-center p-5 flex-fill">
          <div class="profile-image-container mx-auto mb-3">
            <!-- 프로필 이미지 클릭 시 파일 선택 창 열기 -->
            <img
                :src="user.profileImage || defaultImage"
                alt="Profile"
                class="profile-image"
                @click="triggerFileInput"
                style="cursor: pointer;"
            />
            <!-- 파일 선택 input (숨김 상태) -->
            <input
                type="file"
                ref="fileInput"
                style="display: none;"
                @change="handleImageUpload"
            />
          </div>
          <!-- 이름 + 랭킹 정보 -->
          <h5 class="fw-bold mt-4">
            {{ user.userName }}
            <span class="text-muted" v-if="user.rankingName">({{ user.rankingName }})</span>
          </h5>
          <!-- 연락처 수정 가능 필드 -->
          <div class="contact-edit mt-3">
            <label class="text-muted">연락처: </label>
            <input
                type="text"
                class="form-control text-center d-inline-block w-50"
                v-model="userPhone"
                placeholder="연락처를 입력하세요"
            />
          </div>
        </div>
      </div>

      <!-- 정보 수정 섹션 -->
      <div class="col-md-7 d-flex">
        <div class="info-card p-5 flex-fill">
          <!-- 아이디 -->
          <div class="row mb-4 align-items-center">
            <label class="col-3 fw-bold text-end">아이디</label>
            <div class="col-9">
              <p class="mb-0">{{ user.userId }}</p>
            </div>
          </div>

          <!-- 비밀번호 -->
          <div class="row mb-4 align-items-center">
            <label class="col-3 fw-bold text-end">비밀번호 변경</label>
            <div class="col-6">
              <input
                  type="password"
                  class="form-control"
                  v-model="userPassword"
                  placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>

          <!-- 이메일 -->
          <div class="row mb-4 align-items-center">
            <label class="col-3 fw-bold text-end">이메일</label>
            <div class="col-6">
              <input
                  type="email"
                  class="form-control"
                  v-model="userEmail"
                  placeholder="이메일을 입력하세요"
              />
            </div>
          </div>

          <!-- 부서 -->
          <div class="row mb-4 align-items-center">
            <label class="col-3 fw-bold text-end">부서</label>
            <div class="col-9">
              <p class="mb-0">{{ user.deptName || "N/A" }}</p>
            </div>
          </div>

          <!-- 과 -->
          <div class="row mb-4 align-items-center">
            <label class="col-3 fw-bold text-end">과</label>
            <div class="col-9">
              <p class="mb-0">{{ user.partName || "N/A" }}</p>
            </div>
          </div>

          <!-- 저장 버튼 -->
          <div class="text-end">
            <button class="btn btn-primary" @click="updateUserInfo">저장</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import response from "vue3-pdf-app"; // Vue Router 사용

const router = useRouter(); // 라우터 객체 생성
const defaultImage = "";

const user = ref({
  userId: "",
  userName: "",
  userEmail: "",
  userPhone: "",
  rankingName: "",
  partName: "",
  deptName: "",
  profileImage: "",
});

const userEmail = ref("");
const userPhone = ref("");
const userPassword = ref("");
const profileImageFile = ref(null);

const fileInput = ref(null);

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleImageUpload = (e) => {
  profileImageFile.value = e.target.files[0];
  if (profileImageFile.value) {
    user.value.profileImage = URL.createObjectURL(profileImageFile.value);
  }
};

const fetchUserInfo = async () => {
  try {
    const response = await axios.get("/api/v1/users", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    user.value = response.data.data;
    userEmail.value = user.value.userEmail;
    userPhone.value = user.value.userPhone;
  } catch (error) {
    console.error("사용자 정보 불러오기 실패:", error);
  }
};

// 사용자 정보 수정 및 메인 페이지로 이동
const updateUserInfo = async () => {
  const formData = new FormData();

  formData.append(
      "userUpdateRequestDTO",
      new Blob(
          [
            JSON.stringify({
              userEmail: userEmail.value || undefined,
              userPhone: userPhone.value || undefined,
              userPassword: userPassword.value || undefined,
            }),
          ],
          { type: "application/json" }
      )
  );

  if (profileImageFile.value) {
    formData.append("profileImage", profileImageFile.value);
  }

  try {
    await axios.put("/api/v1/users/userInfo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    const updatedProfileImageUrl = response?.data?.data?.profileImageUrl;

    if (updatedProfileImageUrl) {
      const timestampedUrl = `${updatedProfileImageUrl}?timestamp=${new Date().getTime()}`;
      console.log("프로필 이미지 업데이트 URL:", timestampedUrl);
      user.value.profileImage = timestampedUrl;
    } else {
      console.error("profileImageUrl이 백엔드 응답에 없습니다.");
    }

    alert("정보 수정이 완료되었습니다.");
    router.push("/main");
  } catch (error) {
    console.error("정보 수정 실패:", error);
    alert("정보 수정에 실패했습니다.");
  }
};

onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped>
.user-info-page {
  max-width: 1100px;
  margin: auto;
}

.profile-card,
.info-card {
  background-color: #f8f9fc;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.profile-image-container {
  width: 150px;
  height: 150px;
}

.profile-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}

.contact-edit label {
  margin-right: 10px;
}

.contact-edit input {
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 70%;
  height: 30px;
  display: inline-block;
  text-align: left;
}
</style>
