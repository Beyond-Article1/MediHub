<template>
  <div class="search-bar">
    <input
        type="text"
        v-model="searchQuery"
        placeholder="검색어를 입력해주세요."
    />
    <button class="search-button" @click="search">
      🔍
    </button>

    <!-- 신규 등록 버튼: isDoctor가 true일 때만 표시 -->
    <button
        class="new-post-button"
        v-if="isDoctor"
        @click="goToTemplateListView"
    >
      신규 등록
    </button>

    <select class="sort-select" @change="updateSortOption">
      <option value="latest">최신순</option>
      <option value="views">조회순</option>
    </select>


  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import router from "@/routers/index.js";
import axios from 'axios';

const searchQuery = ref('');
const isDoctor = ref(false); // 의사 여부를 저장할 변수
const store = useAuthStore();
const sortOption = ref("latest"); // 기본 정렬 옵션

const emit = defineEmits(["sort-changed"]);
// 검색 버튼 기능
const search = () => {
  console.log(`Searching for: ${searchQuery.value}`);
};

// 신규 등록 화면 이동
const goToTemplateListView = () => {
  router.push('/case_sharing/template');
};

// isDoctor 값 가져오기
const fetchIsDoctor = async () => {
  try {
    const response = await axios.get('/v1/users/isDoctor', {
      headers: {
        Authorization: `Bearer ${store.accessToken}`, // 인증 토큰 추가
      },
    });
    const { success, data } = response.data;

    if (success) {
      isDoctor.value = data; // true/false 값 저장
    } else {
      console.error('doctor 여부 fetch 실패');
    }
  } catch (error) {
    console.error('doctor 여부 fetch 실패:', error);
  }
};

const updateSortOption = (event) => {
  // 이벤트 객체에서 값 추출
  const selectedOption = event.target.value; // 선택된 옵션 값

  // 부모 컴포넌트로 정렬 옵션 전달
  emit("sort-changed", selectedOption);
};


// 컴포넌트 로드 시 isDoctor 값 가져오기
onMounted(() => {
  fetchIsDoctor();
});
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  width: 100%;
  height: 50px;
}

input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 2px solid #ffbf00;
  border-radius: 5px;
  outline: none;
  font-weight: bold;
  margin-right: 10px;
}

.search-button {
  background-color: #ffbf00;
  color: white;
  padding: 8px 15px;
  cursor: pointer;
  border: 2px solid #ffbf00;
  border-radius: 5px;
  font-size: 16px;
  margin-right: 70px;
}

.sort-select {
  padding: 8px 15px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.new-post-button {
  background-color: #ffbf00;
  margin-right: 20px;
  color: white;
  border: none;
  padding: 8px 15px;
  cursor: pointer;
  border-radius: 5px;
  font-size: 16px;
}
</style>
