<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import Pagination from "@/components/common/Pagination.vue";
import router from "@/router/index.js";

const templates = ref([]); // 전체 템플릿 데이터
const searchQuery = ref(""); // 검색어
const currentPage = ref(1); // 현재 페이지
const itemsPerPage = 5; // 페이지당 아이템 수
const filterOption = ref(""); // 필터 옵션 (기본값: 전체)

// API 호출 함수
const fetchTemplates = async () => {
  try {
    let url = "/template"; // 기본 API 경로
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    };

    // 필터 옵션이 존재하면 /template/filter 호출
    if (filterOption.value) {
      url = "/template/filter";
      config.params = { filter: filterOption.value }; // 필터 파라미터 추가
    }

    const response = await axios.get(url, config);

    if (response.data.success) {
      // 추가된 필드 포함하여 데이터 처리
      templates.value = response.data.data.map((template) => ({
        templateSeq: template.templateSeq,
        templateTitle: template.templateTitle,
        templatePreviewImgUrl: template.templatePreviewImgUrl,
        userName: template.userName, // 작성자 이름
        authorRankName: template.authorRankName, // 작성자 직위명
        createdAt: new Date(template.createdAt).toLocaleDateString("ko-KR"), // 생성 날짜
      }));
    } else {
      console.error("API 오류:", response.data.error);
    }
  } catch (error) {
    console.error("Error fetching templates:", error);
    templates.value = [];
  }
};

const deleteTemplate = async (templateSeq) => {
  if (!confirm("정말로 이 템플릿을 삭제하시겠습니까?")) return;

  try {
    const response = await axios.delete(`/template/${templateSeq}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    });

    if (response.status === 200) {
      alert("템플릿이 삭제되었습니다.");
      await fetchTemplates(); // 삭제 후 목록 다시 불러오기
    }
  } catch (error) {
    console.error("템플릿 삭제 오류:", error);
    alert("템플릿 삭제에 실패했습니다.");
  }
};

// 템플릿 생성 페이지로 이동
const navigateToCreateTemplate = () => {
  router.push({ name: "createCaseSharing", params: null });
};
// 필터 변경 이벤트 핸들러
const updateFilter = () => {
  currentPage.value = 1; // 페이지 초기화
  fetchTemplates(); // API 다시 호출
};

// 검색 필터링
const filteredTemplates = computed(() => {
  return templates.value.filter((template) =>
      template.templateTitle.includes(searchQuery.value)
  );
});

// 페이지네이션 처리
const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTemplates.value.slice(start, end);
});

// 페이지 변경 이벤트 핸들러
const updatePage = (page) => {
  currentPage.value = page;
};

// 템플릿 선택 시 라우팅
const navigateToEditor = (templateSeq) => {
  router.push({ name: "CaseSharingCreate", params: { id: templateSeq } });
};

// 컴포넌트 마운트 시 기본 템플릿 조회
onMounted(fetchTemplates);
</script>

<template>
  <div class="template-list-view">
    <!-- 상단 타이틀 및 검색 -->
    <div class="header">
      <h2 class="title">템플릿 선택</h2>
      <div class="search-bar">
        <!-- 필터 드롭다운 -->
        <select v-model="filterOption" @change="updateFilter">
          <option value="">전체</option>
          <option value="my">내 템플릿</option>
          <option value="shared">부서 공유 템플릿</option>
          <option value="public">전체 공유 템플릿</option>
        </select>
        <!-- 검색 입력창 -->
        <input v-model="searchQuery" placeholder="사용하실 템플릿을 검색하세요." />
        <button class="search-button" @click="updateFilter">🔍</button>
      </div>
    </div>

    <!-- 템플릿 리스트 -->
    <div class="template-container">
      <div
          v-for="template in paginatedTemplates"
          :key="template.templateSeq"
          class="template-item"
          @click="navigateToEditor(template.templateSeq)"
      >
        <div class="template-image" style="position: relative;">
          <img
              v-if="template.templatePreviewImgUrl"
              :src="template.templatePreviewImgUrl"
              alt="템플릿 이미지"
          />
          <div v-else class="no-image">이미지 없음</div>

          <!-- 삭제 버튼 -->
          <button
              v-if="filterOption === 'my'"
              class="delete-button"
              @click.stop="deleteTemplate(template.templateSeq)"
          >
            ❌
          </button>
        </div>
        <div class="template-title">{{ template.templateTitle }}</div>
        <div class="template-meta">
          <div class="template-author">
            {{ template.userName }} {{ template.authorRankName || "직위 없음" }}
          </div>
          <div class="template-date">{{ template.createdAt }}</div>
        </div>
      </div>
    </div>

    <!-- 페이지네이션 -->
    <Pagination
        :totalData="filteredTemplates.length"
        :limitPage="itemsPerPage"
        :page="currentPage"
        @updatePage="updatePage"
    />

    <!-- 템플릿 생성 링크 -->
    <div class="template-create">
      원하는 템플릿이 없나요?
      <a href="#" class="create-link" @click.prevent="navigateToCreateTemplate">
        템플릿 생성
      </a>
    </div>
  </div>
</template>

<style scoped>
/* 전체 레이아웃 */
.template-list-view {
  width: 1400px;
  margin: 0 auto;
  padding: 30px;
}

/* 상단 타이틀과 검색 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 40px;
}

.title {
  font-size: 24px;
  font-weight: bold;
}

.search-bar {
  display: flex;
  align-items: center;
}

.search-bar input {
  width: 300px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px 0 0 5px;
}

.search-button {
  padding: 10px 15px;
  background-color: #ffa500;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 0 5px 5px 0;
}

.search-bar select {
  margin-right: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
}

/* 템플릿 리스트 */
.template-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-around;
  margin-top: 40px;
  margin-bottom: 40px;
}

.template-item {
  cursor: pointer;
  width: 250px;
  height: 450px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f8f8f8;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  overflow: hidden;
  transition: transform 0.2s;
}

.template-item:hover {
  transform: translateY(-5px);
}

.template-image {
  background-color: #f8f8f8;
  height: 350px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-image img {
  max-width: 100%;
  max-height: 100%;
}

.no-image {
  color: #aaa;
}

.template-title {
  font-size: 16px;
  background-color: #f8f8f8;
  font-weight: bold;
}

.template-create {
  text-align: center;
  margin-top: 20px;
}

.create-link {
  color: #ffa500;
  font-weight: bold;
  text-decoration: underline;
}
.delete-button {
  position: absolute; /* 이미지를 기준으로 위치 설정 */
  top: 8px; /* 상단 여백 */
  right: 8px; /* 오른쪽 여백 */
  background-color: white; /* 배경색 */
  color: red; /* X 아이콘 색상 */
  border: 2px solid red; /* 빨간색 테두리 */
  border-radius: 50%; /* 원형 버튼 */
  width: 24px;
  height: 24px;
  font-size: 14px;
  font-weight: bold;
  display: none; /* 기본적으로 숨김 */
  cursor: pointer;
  align-items: center;
  justify-content: center;
}

.template-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.template-item:hover .delete-button {
  display: flex;
  transform: translateY(-5px);
}

.template-author {
  font-size: 14px;
  color: #555;
  margin-top: 10px;
  margin-right: auto;
}

.template-date {
  font-size: 12px;
  color: #888;
  margin-top: auto;
  margin-left: auto;
}
</style>