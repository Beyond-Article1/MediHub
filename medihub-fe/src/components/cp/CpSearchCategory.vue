<script setup>
import axios from "axios";
import {onMounted} from "vue";
import DropBox from "@/components/common/DropBox.vue";

// const authStore = useAuthStore();
const authStore = eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMjM0NSIsInVzZXJTZXEiOjQsInVzZXJOYW1lIjoiMTIzNDUiLCJhdXRoIjpbIlVTRVIiXSwiZXhwIjoxNzMzOTkyODA3fQ
.2
IGlI1qQI5Tj - EK3tAlOf4KCQqkf4c9qfSmiwkkIAHJ_ao3AZeUMr3gbrXJcEwd9MatPpipSEYiSnkwCRhCKKg

const cpSearchCategoryList = ref([]);

onMounted(() => {
  fetchData();
})

async function fetchData() {
  try {
    const response = await axios.get("/cp/cpSearchCategory", {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      }
    });

    if (response.status === 200) {
      cpSearchCategoryList.value = response.data;
    } else {
      console.log("CP 검색 카테고리 조회 실패");
      console.log(`http status = ` + response.status);
    }

  } catch (error) {
    console.error("에기치 못한 오류가 발생했습니다. 에러: \n", error);
  }
}

</script>

<template v-for="cpSearchCategory in cpSearchCategoryList">
<!--  <DropBox options=""-->
</template>

<style scoped>

</style>