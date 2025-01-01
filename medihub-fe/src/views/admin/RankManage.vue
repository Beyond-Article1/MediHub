<template>
  <div class="container mt-5">
    <!-- 제목 및 등록 버튼 -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold">직급 관리</h3>
      <button @click="openCreateModal" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i> 직급 등록
      </button>
    </div>

    <!-- 직급 리스트 -->
    <div class="row">
      <div class="col-md-4 mb-4" v-for="ranking in rankings" :key="ranking.rankingSeq">
        <div class="card custom-card shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">{{ ranking.rankingName }}</h5>
            <div>
              <button class="btn btn-outline-dark btn-sm me-2" @click="openEditModal(ranking)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger btn-sm" @click="deleteRanking(ranking.rankingSeq)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 등록 모달 -->
    <div v-if="showCreateModal" class="modal-backdrop">
      <div class="modal-content p-4">
        <h5 class="mb-3 fw-bold">직급 등록</h5>
        <!-- 부서 선택 -->
        <select v-model="selectedDeptSeq" class="form-select mb-3">
          <option disabled value="">부서를 선택해주세요</option>
          <option v-for="dept in departments" :key="dept.deptSeq" :value="dept.deptSeq">
            {{ dept.deptName }}
          </option>
        </select>
        <!-- 직급명 입력 -->
        <input
            type="text"
            class="form-control mb-3"
            placeholder="직급명 입력"
            v-model="newRankingName"
        />
        <div class="d-flex justify-content-end">
          <button class="btn btn-outline-secondary me-2" @click="closeCreateModal">취소</button>
          <button class="btn btn-primary" @click="createRanking">등록</button>
        </div>
      </div>
    </div>

    <!-- 수정 모달 -->
    <div v-if="showEditModal" class="modal-backdrop">
      <div class="modal-content p-4">
        <h5 class="mb-3 fw-bold">직급 수정</h5>
        <!-- 부서 선택 -->
        <select v-model="editDeptSeq" class="form-select mb-3">
          <option disabled value="">부서를 선택해주세요</option>
          <option v-for="dept in departments" :key="dept.deptSeq" :value="dept.deptSeq">
            {{ dept.deptName }}
          </option>
        </select>
        <!-- 직급명 수정 -->
        <input
            type="text"
            class="form-control mb-3"
            placeholder="직급명 수정"
            v-model="editRankingName"
        />
        <div class="d-flex justify-content-end">
          <button class="btn btn-outline-secondary me-2" @click="closeEditModal">취소</button>
          <button class="btn btn-primary" @click="updateRanking">수정</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const rankings = ref([]);
const departments = ref([]);
const selectedDeptSeq = ref("");
const showCreateModal = ref(false);
const newRankingName = ref("");

const showEditModal = ref(false);
const editRankingName = ref("");
const editDeptSeq = ref("");
const editRankingSeq = ref(null);

// 데이터 로드
const fetchDepartmentsAndRankings = async () => {
  try {
    const [deptRes, rankingRes] = await Promise.all([
      axios.get("/api/v1/dept"),
      axios.get("/api/v1/ranking"),
    ]);
    departments.value = deptRes.data.data;
    rankings.value = rankingRes.data.data;
  } catch (error) {
    console.error("데이터 불러오기 실패:", error);
  }
};

// 등록 모달 열기/닫기
const openCreateModal = () => {
  showCreateModal.value = true;
};
const closeCreateModal = () => {
  showCreateModal.value = false;
  newRankingName.value = "";
  selectedDeptSeq.value = "";
};

// 수정 모달 열기/닫기
const openEditModal = (ranking) => {
  editRankingSeq.value = ranking.rankingSeq;
  editRankingName.value = ranking.rankingName;
  showEditModal.value = true;
};
const closeEditModal = () => {
  showEditModal.value = false;
  editRankingName.value = "";
  editRankingSeq.value = null;
};

// 직급 등록
const createRanking = async () => {
  if (!newRankingName.value.trim() || !selectedDeptSeq.value) {
    alert("부서와 직급명을 입력해주세요.");
    return;
  }

  try {
    await axios.post("/api/v1/ranking", {
      deptSeq: selectedDeptSeq.value,
      rankingName: newRankingName.value,
    });
    await fetchDepartmentsAndRankings();
    closeCreateModal();
  } catch (error) {
    console.error("직급 등록 실패", error);
  }
};

// 직급 수정
const updateRanking = async () => {
  if (!editRankingName.value.trim() || !editDeptSeq.value) {
    alert("부서와 직급명을 입력해주세요.");
    return;
  }

  try {
    await axios.put(`/api/v1/ranking/${editRankingSeq.value}`, {
      deptSeq: editDeptSeq.value,
      rankingName: editRankingName.value,
    });
    await fetchDepartmentsAndRankings();
    closeEditModal();
  } catch (error) {
    console.error("직급 수정 실패", error);
  }
};


// 직급 삭제
const deleteRanking = async (rankingSeq) => {
  try {
    await axios.delete(`/api/v1/ranking/${rankingSeq}`);
    rankings.value = rankings.value.filter((r) => r.rankingSeq !== rankingSeq);
  } catch (error) {
    console.error("직급 삭제 실패", error);
  }
};

onMounted(fetchDepartmentsAndRankings);

</script>

<style scoped>
h3 {
  font-size: 1.8rem;
  color: #333;
}

.custom-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}

.custom-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

button {
  transition: all 0.2s ease-in-out;
}

button:hover {
  transform: translateY(-2px);
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}
</style>
