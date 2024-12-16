<script setup>
import axios from "axios";
import {onMounted, ref} from "vue";
import {useAuthStore} from "@/store/authStore.js";
import {useRoute} from "vue-router";

const cp = ref({
  cpName: '',
  cpDescription: '',
  cpViewCount: '',
  cpVersion: '',
  cpVersionDescription: '',
  createdAt: '',
  cpUrl: '',
  userName: '',
  userId: '',
  partName: '',
  isBookmarked: ''
});

const authStore = useAuthStore();
const route = useRoute();

// 데이터 호출 함수
async function fetchData() {
  try {
    const cpVersionSeq = route.params.cpVersionSeq;
    const response = await axios.get(`cp/${cpVersionSeq}`, {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      }
    });

    if (response.status === 200) {
      console.log("CP 조회 성공");
      cp.value = response.data.data;
    } else {
      console.log("CP 조회 실패");
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
  <h1>CP Detail Page</h1>
</template>

<style scoped>

</style>