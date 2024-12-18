<template>
  <div class="template-list-view">
    <!-- 상단 검색 및 타이틀 영역 -->
    <div class="header">
      <h2 class="title">템플릿 선택</h2>
      <div class="search-bar">
        <input v-model="searchQuery" placeholder="사용하실 템플릿을 검색하세요." />
        <button class="search-button" @click="search">🔍</button>
      </div>
    </div>

    <!-- 템플릿 리스트 -->
    <div class="template-container">
      <div
          v-for="template in paginatedTemplates"
          :key="template.templateSeq"
          class="template-item"
      >
        <div class="template-image">
          <img
              v-if="template.templatePreviewImgUrl"
              :src="template.templatePreviewImgUrl"
              alt="템플릿 이미지"
          />
          <div v-else class="no-image">이미지 없음</div>
        </div>
        <div class="template-title">{{ template.templateTitle }}</div>
      </div>
    </div>

    <!-- 페이지네이션 컴포넌트 -->
    <Pagination
        :totalData="filteredTemplates.length"
        :limitPage="itemsPerPage"
        :page="currentPage"
        @updatePage="updatePage"
    />

    <!-- 템플릿 생성 링크 -->
    <div class="template-create">
      원하는 템플릿이 없나요? <a href="#" class="create-link">템플릿 생성</a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import Pagination from '@/components/common/Pagenation.vue'; // 페이지네이션 컴포넌트 import

const templates = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 5; // 한 페이지당 표시할 데이터 수

// API 호출
const fetchTemplates = async () => {
  try {
    const response = await axios.get('/template', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (response.data.success) {
      templates.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching templates:', error);
  }
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

// 페이지 업데이트 이벤트 핸들러
const updatePage = (page) => {
  currentPage.value = page;
};

// 컴포넌트 마운트 시 API 호출
onMounted(fetchTemplates);
</script>

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

/* 템플릿 리스트 */
.template-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-around;
  margin-top: 40px;
  margin-bottom: 80px;
}

.template-item {
  width: 250px;
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 10px;
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
  padding: 10px 0;
  background-color: #fafafa;
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
</style>
