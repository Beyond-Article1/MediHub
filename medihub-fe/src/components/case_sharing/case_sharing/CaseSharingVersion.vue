<template>
  <div class="version-history">
    <h3 class="version-title">버전 내역</h3>
    <ul class="version-list">
      <li
          v-for="version in versionHistory"
          :key="version.caseSharingSeq"
          class="version-item"
          :class="{ 'active-version': version.caseSharingSeq === Number(route.params.id) }"
          @click="goToVersionDetail(version.caseSharingSeq)"
      >  <div class="version-info">
          <span class="version-order">{{ version.caseSharingSeq }}</span>
          <span class="version-name">{{ version.caseSharingTitle }}</span>
          <span class="view-count">조회수: {{ version.caseSharingViewCount }}</span>
        </div>
        <div class="version-date">
          <LocalDateTimeFormat :data="version.regDate" />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import LocalDateTimeFormat from "@/components/common/LocalDateTimeFormat.vue";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const versionHistory = ref([]);

// 버전 내역 조회 API 호출
const fetchVersionHistory = async () => {
  try {
    const response = await axios.get(`/case_sharing/versions/${route.params.id}`);
    if (response.data.success) {
      versionHistory.value = response.data.data;
    } else {
      console.error("버전 내역 불러오기 실패:", response.data.error);
    }
  } catch (error) {
    console.error("Error fetching version history:", error);
  }
};

// 해당 버전의 상세 페이지로 이동
const goToVersionDetail = (versionId) => {
  router.push({ name: "CaseSharingDetailView", params: { id: versionId } });
};

onMounted(fetchVersionHistory);
</script>

<style scoped>
.version-history {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 40px); /* 화면에 맞추어 최대 높이 설정 */
  overflow-y: auto;
}

.version-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 15px;
}

.version-name {
  font-size: 0.9rem;
  max-width: 160px; /* 제목의 최대 너비 설정 */
  white-space: nowrap; /* 줄바꿈 방지 */
  overflow: hidden; /* 넘치는 내용 숨김 */
  text-overflow: ellipsis; /* 넘치는 텍스트를 '...'으로 표시 */
}

.version-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.version-item {
  display: flex;
  flex-direction: column; /* 세로 정렬 */
  justify-content: space-between;
  padding: 8px 10px;
  margin-bottom: 5px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.active-version {
  background-color: #EBEBEB; /* 강조 배경색 */
  border-color: lightgrey; /* 강조 테두리 색상 */
  pointer-events: none;
}

.version-item:hover {
  background-color: #f0f8ff;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.version-order {
  font-weight: bold;
  color: #007bff;
}

.version-name {
  font-size: 0.9rem;
}

.view-count {
  margin-left: auto;
  font-size: 0.8rem;
  color: gray;
}
.version-date {
  margin-top: 5px;
  font-size: 0.8rem;
  color: #666;
  margin-left: auto;
  text-align: right; /* 날짜를 오른쪽 정렬 */
}


</style>
