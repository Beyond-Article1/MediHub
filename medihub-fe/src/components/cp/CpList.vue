<script setup>
import axios from "axios";
import {onMounted, ref} from "vue";
import CpLi from "@/components/cp/CpLi.vue";

const authStore = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMjM0NSIsInVzZXJTZXEiOjQsInVzZXJOYW1lIjoiMTIzNDUiLCJhdXRoIjpbIlVTRVIiXSwiZXhwIjoxNzM0MDAxMzc0fQ.SApTOTHaBDihNtQ9N7mJovnq4u6p3kHekX48gKi2TQfR7BOI9AT4B9BP3o0boE5AxDz3tmKYEDUziOtPLxShJQ";

const cpList = ref([]);

// 데이터 호출 함수
async function fetchData() {
  try {
    const response = await axios.get("cp", {
      headers: {
        Authorization: `Bearer ${authStore}`
      }
    });

    if (response.status === 200) {
      console.log("CP 리스트 조회 성공");
      cpList.value = response.data.data;
      console.log(cpList.value);
    } else {
      console.log("CP 조회 실패");
      console.log(`http status = ` + response.status);
    }
  } catch (error) {
    console.error("예기치 못한 오류가 발생했습니다. 에러: \n", error);
  }
}

// 북마크 요청 함수
async function toggleBookmark(cpVersionSeq) {
  try {
    const response = await axios.post(`cp/bookmark/${cpVersionSeq}`, {}, {
      headers: {
        Authorization: `Bearer ${authStore}`
      }
    });

    if (response.status === 200) {
      console.log("북마크 토글 성공");
      // 여기에서 cpList를 업데이트하여 UI에 반영할 수 있습니다.
      await fetchData(); // 다시 데이터를 가져와서 업데이트
    } else {
      console.log("북마크 토글 실패");
      console.log(`http status = ` + response.status);
    }
  } catch (error) {
    console.error("북마크 요청 중 오류 발생: ", error);
  }
}


onMounted(() => {
  fetchData();
})

</script>

<template>
  <div>
    <div>
      <CpLi
          v-for="cp in cpList"
          :key="cp.cpVersionSeq"
          :data="cp"
          @click="toggleBookmark(cp.cpVersionSeq)"
      />
    </div>
  </div>
</template>

<style scoped>

</style>