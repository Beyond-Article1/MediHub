<template>
  <div :class="{ 'focus-mode': isFocusMode }" class="case-detail-view">

    <!-- Focus 모드 헤더 -->
    <div v-if="isFocusMode && ! selectedBlock"  class="focus-mode-header">
      댓글을 작성할 문단을 입력해주세요
    </div>
    <!-- 상단 정보 영역 -->
    <div class="top-section">
      <div class="author-info">
        <img :src="caseData.authorImageUrl" alt="작성자 이미지" class="author-image" />
        <div class="author-details">
          <p class="author-name">{{ caseData.author }} <span>({{ caseData.rank }})</span></p>
          <p class="case-date">{{ formattedDate }}</p>
        </div>
      </div>
      <!-- 버튼 그룹 -->
      <!-- 버튼 그룹 -->
      <div class="button-group">
        <button
            class="action-button"
            @click="toggleFocusMode"
        >
          댓글 달기
        </button>
        <button
            v-if="isAuthorOrAdmin"
            class="action-button"
            @click="goToEditPage"
        >
          수정
        </button>
        <button
            v-if="isAuthorOrAdmin"
            class="action-button"
            @click="deleteCase"
        >
          삭제
        </button>
        <!-- 북마크 버튼 -->
        <div class="bookmark-container" @click="toggleBookmark">
          <img
              :src="
        isBookmarked
          ? '@/assets/images/bookmark/after-bookmark.png'
          : '@/assets/images/bookmark/before-bookmark.png'
      "
              alt="북마크"
              class="bookmark-icon"
          />
        </div>
      </div>
    </div>

    <!-- 구분선 -->
    <hr class="divider" />

    <!-- 전체 페이지 레이아웃 -->
    <div class="content-wrapper">
      <!-- Focus 모드 해제 버튼 -->
      <button
          v-if="isFocusMode"
          class="exit-focus-mode-button"
          @click="toggleFocusMode"
      >
        ⟲
      </button>
      <!-- 왼쪽 본문 영역 -->
      <div class="main-content">
        <!-- 제목 영역 -->
        <h1 class="case-title">{{ caseData.title }}</h1>

        <!-- 키워드 -->
        <KeywordList :keywords="caseData.keywords" />
        <hr class="divider" />
        <!-- 본문 -->
        <CaseContent
            :content="caseData.content"
            :isFocusMode="isFocusMode"
            @selectBlock="handleSelectBlock"
        />
      </div>

      <!-- 오른쪽 Table of Contents -->
      <div class ="sidebar">
        <div class="sticky-container">
          <ContentTable :content="caseData.content" class="table-of-contents" />
          <CaseSharingVersion />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, computed, watch} from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import KeywordList from "@/components/case_sharing/case_sharing/KeywordList.vue";
import CaseContent from "@/components/case_sharing/case_sharing/CaseSharingContent.vue";
import ContentTable from "@/components/case_sharing/case_sharing/ContentTable.vue";
import CaseSharingVersion from "@/components/case_sharing/case_sharing/CaseSharingVersion.vue";
import { useAuthStore } from "@/store/authStore";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const caseData = ref({
  title: "",
  author: "",
  rank: "",
  viewCount: 0,
  content: "",
  authorImageUrl: "",
  keywords: [],
  createdAt: "",
});

const isFocusMode = ref(false);
const selectedBlock = ref(null);

const isAuthorOrAdmin = computed(() => {
  return (
      caseData.value.authorId === authStore.userInfo.userId || // 작성자인지 확인
      authStore.userRole === "ADMIN" // 관리자인지 확인
  );
});

const toggleFocusMode = () => {
  isFocusMode.value = !isFocusMode.value;
  console.log("isFocusMode 상태:", isFocusMode.value);
};

const handleSelectBlock = ({ block, position }) => {
  selectedBlock.value = { block, position };
  console.log("selected 상태:", isFocusMode.value);
};

// API 호출
const fetchCaseDetail = async () => {
  try {
    const response = await axios.get(`/case_sharing/${route.params.id}`, {
      withCredentials: true, // 쿠키 허용 활성화
    });
    const result = response.data;

    if (result.success) {
      const data = result.data;
      caseData.value = {
        title: data.caseSharingTitle,
        author: data.caseAuthor,
        authorId: data.caseAuthorId,
        rank: data.caseAuthorRankName,
        viewCount: data.caseSharingViewCount,
        content: JSON.parse(data.caseSharingContent), // JSON 파싱
        authorImageUrl: data.caseAuthorUrl,
        keywords: data.keywords || [],
        createdAt: data.createdAt,
      };
    } else {
      console.error("API 응답 오류:", result.error);
    }
  } catch (error) {
    console.error("Error fetching case detail:", error);
  }
};

// 등록일자 포맷 (YYYY.MM.DD HH:mm)
const formattedDate = computed(() => {
  const date = new Date(caseData.value.createdAt);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
      date.getDate()
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
});

const goToEditPage = () => {
  router.push({
    name: "CaseSharingEditView", // 수정 페이지 라우트 이름
    params: { id: route.params.id }, // 현재 글 ID를 전달
  });
};

// 케이스 공유 삭제
const deleteCase = async () => {
  if (!window.confirm("정말로 이 케이스를 삭제하시겠습니까?")) {
    return; // 사용자가 취소하면 종료
  }

  try {
    // 삭제 요청 보내기
    const response = await axios.delete(`/case_sharing/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // 인증 토큰
      },
    });

    if (response.data.success) {
      alert("케이스가 성공적으로 삭제되었습니다.");
      await router.push({name: "CaseSharingList"}); // 목록 페이지로 이동
    } else {
      console.error("삭제 실패:", response.data.error);
      alert("삭제에 실패했습니다. 다시 시도해주세요.");
    }
  } catch (error) {
    console.error("Error deleting case:", error);
    alert("삭제 중 오류가 발생했습니다.");
  }
};

const isBookmarked = ref(false); // 북마크 상태

// 북마크 상태 확인
const fetchBookmarkState = async () => {
  try {
    const response = await axios.get(`/case_sharing/${route.params.id}/bookmark`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (response.data.success) {
      isBookmarked.value = response.data.data; // 북마크 상태 업데이트
    } else {
      console.error("북마크 상태 확인 실패:", response.data.error);
    }
  } catch (error) {
    console.error("북마크 상태 확인 오류:", error);
  }
};

const toggleBookmark = async () => {
  try {
    const response = await axios.patch(`/case_sharing/${route.params.id}/bookmark`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    if (response.data.success) {
      isBookmarked.value = response.data.data; // API 반환 데이터(true/false)로 북마크 상태 업데이트
      alert(isBookmarked.value ? "북마크가 등록되었습니다." : "북마크가 해제되었습니다.");
    } else {
      console.error("북마크 API 응답 오류:", response.data.error);
    }
  } catch (error) {
    console.error("북마크 처리 오류:", error);
    alert("북마크 처리 중 오류가 발생했습니다.");
  }
};


watch(
    () => selectedBlock.value,
    (newValue) => {
      console.log("selectedBlock 변경:", newValue);
    }
);
onMounted(fetchCaseDetail);
onMounted(fetchBookmarkState);
</script>

<style scoped>

.case-detail-view {
  border: lightgray solid 1px;
  border-radius: 8px;
  padding: 20px;
  width: 1400px;
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
}

/* 상단 정보 영역 */
.top-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}


.author-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.author-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.author-details{
  font-weight: bold;
  font-size: 16px;
}

.author-name{
  margin-top: 10px;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 16px;
}

.author-details .case-date {
  color: gray;
  font-size: 12px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.action-button {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
}

.action-button:hover {
  background-color: #e0e0e0;
}

/* 구분선 */
.divider {
  margin: 10px 0;
  border: none;
  border-top: 1px solid grey;
}

.focus-mode-header {
  position: fixed;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  padding: 15px 30px;
  border-radius: 8px;
  border: 1px solid lightgray;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  font-size: 18px;
  font-weight: bold;
  z-index: 2000;
  text-align: center;
}

.focus-mode {
  position: relative;
}

.focus-mode::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 어두운 배경 */
  z-index: 1;
}


.focus-mode .main-content {
  position: relative; /* 다른 레이어에 독립적으로 위치 */
  z-index: 2; /* focus-mode의 그림자 위에 표시 */
  background-color: white; /* 배경색 추가 */
}

/* Focus 모드 해제 버튼 */
.exit-focus-mode-button {
  position: fixed;
  top: 200px;
  left: 75%;
  transform: translateX(-50%);
  padding: 5px 10px;
  background-color: white;
  color:  #20346D;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  z-index: 2001;
}


.content-wrapper {
  display: flex; /* Flexbox 레이아웃 적용 */
  gap: 30px; /* 본문과 사이드바 간격 */
}

/* 왼쪽 본문 영역 */
.main-content {
  flex: 3; /* 메인 컨텐츠 비율 */
  padding: 15px;
  border-right: 1px solid #ddd; /* 테두리 선 추가 */
}

.sidebar{
  flex: 1;
}

/* 오른쪽 Table of Contents 영역 */
.sticky-container {
  position: sticky;
  top: 20px; /* 부모 컨테이너가 sticky로 고정되는 위치 */
  display: flex;
  flex-direction: column;
  gap: 20px; /* 두 컴포넌트 사이의 간격 */

}
.sidebar > * {
  margin-bottom: 20px; /* 각 컴포넌트 사이 여백 추가 */
}
.table-of-contents {
  width: 100%;
  top: 20px; /* 상단 여백 */
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 40px); /* 화면 높이에 맞춤 */
  overflow-y: auto; /* 내용이 길면 스크롤 */
}


.case-title {
  font-size: 28px;
  font-weight: bold;
}

.case-info p {
  margin: 5px 0;
}

.case-actions {
  text-align: center;
  margin-top: 20px;
}

.case-actions button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.case-actions button:hover {
  background-color: #0056b3;
}

body, html {
  overflow: visible; /* 혹시 hidden이면 visible로 변경 */
  position: static; /* 부모 요소가 relative일 경우 static으로 변경 */
}

.bookmark-container {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bookmark-icon {
  width: 24px;
  height: 24px;
}


</style>
