<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import Sidebar from "@/components/user/MyPage.vue";
import { useRouter } from "vue-router";

const router = useRouter();
// 필요한 CP 버전 및 의견 위치 시퀀스
const cpVersionSeq = 1;
const cpOpinionLocationSeq = 1;

const cpOpinions = ref([]);
const filteredOpinions = ref([]);
const currentPage = ref(1);
const itemsPerPage = 5;
const currentFilter = ref("myPosts");

const MAX_CONTENT_LENGTH = 50;

const goToOpinionDetail = (opinionId) => {
  router.push(`/cp/${opinionId}`);
};

// 내가 쓴 CP 의견 데이터 가져오기
const fetchMyCpOpinions = async () => {
  try {
    const response = await axios.get(
        `/cp/${cpVersionSeq}/cpOpinionLocation/myOpinion`
    );
    cpOpinions.value = response.data.data.map((opinion) => ({
      id: opinion.cpOpinionSeq, // 의견 ID 추가
      content: truncateText(extractText(opinion.cpOpinionContent), MAX_CONTENT_LENGTH),
      createdAt: new Date(opinion.createdAt).toLocaleDateString(),
      viewCount: opinion.cpOpinionViewCount,
      positiveRatio: opinion.positiveRatio.toFixed(2),
      negativeRatio: opinion.negativeRatio.toFixed(2),
    }));
    filteredOpinions.value = [...cpOpinions.value];
  } catch (error) {
    console.error("내가 쓴 CP 의견 데이터 가져오기 실패:", error);
  }
};

// 북마크된 CP 의견 데이터 가져오기
const fetchBookmarkedCpOpinions = async () => {
  try {
    const response = await axios.get(`/cp/mypage`);
    cpOpinions.value = response.data.data.map((cp) => ({
      id: cp.cpVersionSeq,
      cpName: cp.cpName,
      cpVersion: cp.cpVersion,
      userName: cp.userName,
      partName: cp.partName,
      viewCount: cp.cpViewCount,
    }));
    filteredOpinions.value = [...cpOpinions.value];
  } catch (error) {
    console.error("북마크된 CP 의견 데이터 가져오기 실패:", error);
  }
};

const truncateText = (text, maxLength) => {
  if (!text) return "내용 없음";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const extractText = (content) => {
  try {
    const parsedContent = JSON.parse(content);
    return parsedContent.blocks
        .filter((block) => block.type === "paragraph") // 'paragraph' 블록만 추출
        .map((block) => block.data.text) // 텍스트 데이터만 가져옴
        .join(" "); // 텍스트 합치기
  } catch (error) {
    console.error("내용 파싱 실패:", error);
    return "내용 없음";
  }
};

// 페이지네이션 데이터
const paginatedOpinions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredOpinions.value.slice(start, start + itemsPerPage);
});

// 총 페이지 계산
const totalPages = computed(() =>
    Math.ceil(filteredOpinions.value.length / itemsPerPage)
);

// 페이지 변경
const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// 조회 버튼 클릭
const filterByMyPosts = async () => {
  currentFilter.value = "myPosts";
  await fetchMyCpOpinions(); // 내가 쓴 CP 의견 데이터 가져오기
  currentPage.value = 1;
};

// 북마크 버튼 클릭
const filterByBookmarks = async () => {
  currentFilter.value = "bookmarks";
  console.log("북마크 보기");
  await fetchBookmarkedCpOpinions(); // 북마크된 CP 의견 데이터 가져오기
  currentPage.value = 1;
};

// 초기 데이터 로드
onMounted(fetchMyCpOpinions);
</script>

<template>
  <div class="d-flex">
    <!-- 사이드바 -->
    <Sidebar />

    <!-- 메인 콘텐츠 -->
    <div class="content-container flex-grow-1">
      <h3 class="title">My CP</h3>

      <!-- 필터 버튼 -->
      <div class="filter-buttons">
        <button
            class="filter-btn"
            :class="{ active: currentFilter === 'myPosts' }"
            @click="filterByMyPosts"
        >
          내가 쓴 CP
        </button>
        <button
            class="filter-btn"
            :class="{ active: currentFilter === 'bookmarks' }"
            @click="filterByBookmarks"
        >
          북마크된 CP
        </button>
      </div>

      <!-- 테이블 -->
      <div class="table-container">
        <table class="custom-table">
          <thead>
          <tr v-if="currentFilter === 'myPosts'">
            <th>내용</th>
            <th>작성일</th>
            <th>조회수</th>
            <th>찬성 비율</th>
            <th>반대 비율</th>
          </tr>
          <tr v-if="currentFilter === 'bookmarks'">
            <th>CP 이름</th>
            <th>버전</th>
            <th>작성자</th>
            <th>과</th>
            <th>조회수</th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="(opinion, index) in paginatedOpinions"
              :key="index"
              v-if="currentFilter === 'myPosts'"
              @click="goToOpinionDetail(opinion.id)"
          style="cursor: pointer;"
          >
          <td>{{ opinion.content }}</td>
          <td>{{ opinion.createdAt }}</td>
          <td>{{ opinion.viewCount }}</td>
          <td>{{ opinion.positiveRatio }}%</td>
          <td>{{ opinion.negativeRatio }}%</td>
          </tr>
          <tr
              v-for="(cp, index) in paginatedOpinions"
              :key="index"
              v-if="currentFilter === 'bookmarks'"
              @click="goToOpinionDetail(cp.id)"
          style="cursor: pointer;"
          >
          <td>{{ cp.cpName }}</td>
          <td>{{ cp.cpVersion }}</td>
          <td>{{ cp.userName }}</td>
          <td>{{ cp.partName }}</td>
          <td>{{ cp.viewCount }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination-container">
        <nav>
          <ul class="pagination">
            <li
                class="page-item"
                :class="{ disabled: currentPage === 1 }"
                @click="changePage(currentPage - 1)"
            >
              <a href="#">◀</a>
            </li>
            <li
                class="page-item"
                v-for="page in totalPages"
                :key="page"
                :class="{ active: currentPage === page }"
                @click="changePage(page)"
            >
              <a href="#">{{ page }}</a>
            </li>
            <li
                class="page-item"
                :class="{ disabled: currentPage === totalPages }"
                @click="changePage(currentPage + 1)"
            >
              <a href="#">▶</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>


<style scoped>
.d-flex {
  display: flex;
}

.content-container {
  padding: 20px;
  background-color: #f4f6f9;
}

.title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 20px;
}

.filter-buttons {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.filter-btn {
  background-color: #e9ecef;
  color: #495057;
  border: none;
  padding: 10px 20px;
  font-size: 1.2rem;
  margin-left: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn.active {
  background-color: #0056b3;
  color: #fff;
}

.filter-btn:hover {
  background-color: #0056b3;
  color: #fff;
}

.table-container {
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 1.1rem;
}

.custom-table th,
.custom-table td {
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.custom-table thead th {
  background-color: #f8f9fa;
  font-weight: bold;
  border-bottom: 2px solid #dee2e6;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination {
  display: flex;
  list-style: none;
  padding: 0;
}

.page-item {
  margin: 0 5px;
}

.page-item a {
  display: block;
  padding: 8px 12px;
  text-decoration: none;
  color: #007bff;
  border-radius: 5px;
  transition: all 0.3s;
}

.page-item.disabled a {
  color: #6c757d;
  pointer-events: none;
}

.page-item.active a {
  background-color: #007bff;
  color: white;
}

.page-item a:hover {
  background-color: #0056b3;
  color: white;
}
</style>
