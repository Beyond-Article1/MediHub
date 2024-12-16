<script setup>
import axios from "axios";
import {onMounted, ref} from "vue";

const authStore = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMjM0NSIsInVzZXJTZXEiOjQsInVzZXJOYW1lIjoiMTIzNDUiLCJhdXRoIjpbIlVTRVIiXSwiZXhwIjoxNzM0MDAxMzc0fQ.SApTOTHaBDihNtQ9N7mJovnq4u6p3kHekX48gKi2TQfR7BOI9AT4B9BP3o0boE5AxDz3tmKYEDUziOtPLxShJQ";

const cpList = ref([]);

async function fetchData() {
  try {
    const response = await axios.get("cp", {
      headers: {
        Authorization: `Bearer ${authStore}`
      }
    });

    if (response.status === 200) {
      console.log("CP 리스트 조회 성공");
      console.log(response.data);
      cpList.value = response.data;
    } else {
      console.log("CP 조회 실패");
      console.log(`http status = ` + response.status);
    }
  } catch (error) {
    console.error("예기치 못한 오류가 발생했습니다. 에러: \n", error);
  }
}

onMounted(() => {
  fetchData();
})

</script>

<template>
  
</template>

<style scoped>

</style>