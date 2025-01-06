<template>
  <div class="category-list">
    <div class="title">카테고리 분류</div>
    <ul>
      <li
          v-for="(category, index) in categories"
          :key="index"
          class="category-item"
      >
        <button
            class="category-button"
            @click="selectCategory(category.id)"
        >
          {{ category.name }} <!-- 이름을 표시 -->
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const categories = ref([]); // 카테고리 목록

const emit = defineEmits(["category-selected"]);

// API 호출로 카테고리 목록 가져오기
const fetchCategories = async () => {
  try {
    const response = await axios.get("/v1/part/1");

    const { success, data } = response.data;

    if (success && Array.isArray(data)) {
      categories.value = data.map((item) => ({
        id: item.partSeq, // partId 매핑 (필드 이름 확인)
        name: item.partName, // partName 매핑
      }));
    } else {
      categories.value = ["불러오기 실패"];
    }
  } catch (error) {
    categories.value = ["불러오기 실패"];
  }
};

// 카테고리 선택 시 이벤트 emit
const selectCategory = (categoryId) => {
  const selectedCategory = categories.value.find((cat) => cat.id === categoryId);
  if (selectedCategory) {
    emit("category-selected", selectedCategory); // 카테고리 전체 객체 전달
  } else {
    console.error("Category 찾기 실패, ID:", categoryId);
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.title {
  font-size: 22px;
  font-weight: bold;
  margin-top: 10px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

ul {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  list-style: none;
  padding: 0;
}

.category-item {
  flex: 0 0 calc(50% - 10px);
  display: flex;
  justify-content: center;
}

.category-button {
  width: 100%;
  padding: 6px 0;
  border: 2px solid #004080;
  color: #004080;
  background: #ffffff;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.2s ease;
}

.category-button:hover {
  background-color: #004080;
  color: #ffffff;
}
</style>
