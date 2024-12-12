<script setup>
import axios from "axios";
import {onMounted, ref} from "vue";
import DropBox from "@/components/common/DropBox.vue";

// const authStore = useAuthStore();
const authStore = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMjM0NSIsInVzZXJTZXEiOjQsInVzZXJOYW1lIjoiMTIzNDUiLCJhdXRoIjpbIlVTRVIiXSwiZXhwIjoxNzM0MDAxMzc0fQ.SApTOTHaBDihNtQ9N7mJovnq4u6p3kHekX48gKi2TQfR7BOI9AT4B9BP3o0boE5AxDz3tmKYEDUziOtPLxShJQ";
const cpSearchCategoryList = ref([]);
const selectedDataList = ref([]); // 선택된 옵션을 저장할 배열
const openDropdown = ref(null); // 현재 펼쳐진 드롭박스의 인덱스를 저장

async function fetchData() {
  try {
    const response = await axios.get("http://localhost:8088/cp/cpSearchCategory/cpSearchCategoryData", {
      headers: {
        // Authorization: `Bearer ${authStore.accessToken}`
        Authorization: `Bearer ${authStore}`
      }
    });

    if (response.status === 200) {
      console.log("CP 검색 카테고리 조회 성공");
      cpSearchCategoryList.value = response.data.data;
    } else {
      console.log("CP 검색 카테고리 조회 실패");
      console.log(`http status = ` + response.status);
    }

  } catch (error) {
    console.error("예기치 못한 오류가 발생했습니다. 에러: \n", error);
  }
}

const getDropOptions = (category) => {
  return category.cpSearchCategoryDataDtoList.map(data => ({
    value: data.cpSearchCategoryDataSeq,
    text: data.cpSearchCategoryDataName
  }));
};

const toggleDropdown = (index) => {
  openDropdown.value = openDropdown.value === index ? null : index; // 클릭한 드롭박스의 인덱스 토글
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div v-for="(category, index) in cpSearchCategoryList" :key="category.cpSearchCategorySeq">
      <DropBox
          :options="getDropOptions(category)"
          :label="category.cpSearchCategoryName"
          v-model="selectedDataList[category.cpSearchCategorySeq]"
          @update:isOpen="toggleDropdown(index)"
          :isOpen="openDropdown === index"
      />
    </div>
    <p>선택된 옵션: {{ selectedDataList }}</p>
  </div>
</template>

<style scoped>
.dropdown-container {
  margin-bottom: 10px; /* 드롭박스 간의 간격을 조정 */
}

.dropdown-content {
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 5px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */
{
  opacity: 0;
}
</style>
