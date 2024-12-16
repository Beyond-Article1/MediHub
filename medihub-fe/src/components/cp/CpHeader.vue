<script setup>
import axios from "axios";
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import CpTitleComponent from "@/components/cp/CpTitle.vue";
import SearchBox from "@/components/common/SearchBox.vue";
import LineDivider from "@/components/common/LineDivider.vue";

// 조회된 CP 정보
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

// 데이터 요청 함수
async function fetchData() {
  try {
    const route = useRoute();
    const cpVersionSeq = route.params.cpVersionSeq || null;

    if (cpVersionSeq) {
      const response = await axios.get(`cp/${cpVersionSeq}`);

      if (response.status === 200) {
        console.log("CP 조회 성공");
        cp.value = response.data.data;
        console.log(cp.value);
      } else {
        console.log("CP 조회 실패");
      }
    } else {
      cp.value.cpName = ''; // cpVersionSeq가 null인 경우 cpName 초기화
    }
  } catch (error) {
    console.error("예기치 못한 오류가 발생했습니다. 에러: ", error.response ? error.response.data : error.message);
  }
}

onMounted(() => {
  fetchData();
})
</script>

<template>
  <div class="container">
    <CpTitleComponent :cpName="cp.cpName" class="cp-title"/>
    <SearchBox class="search-box"/>
  </div>
  <LineDivider/>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  padding: 20px;
}

.cp-title {
  flex: 1;
}

.search-box {
  flex: 9;
}
</style>
