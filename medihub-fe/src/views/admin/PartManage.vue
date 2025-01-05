<template>
  <div class="container mt-5">
    <!-- 제목 및 등록 버튼 -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold">부서별 파트 관리</h3>
      <button @click="openCreateModal" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i> 파트 등록
      </button>
    </div>

    <!-- 부서 선택 드롭다운 -->
    <div class="custom-form-group mb-4">
      <label for="dept-select" class="form-label fw-bold">부서 선택</label>
      <select
          id="dept-select"
          class="form-select form-select-sm custom-dropdown"
          v-model="selectedDeptSeq"
          @change="fetchPartsByDept"
      >
        <option value="" disabled>부서를 선택해주세요</option>
        <option v-for="dept in departments" :key="dept.deptSeq" :value="dept.deptSeq">
          {{ dept.deptName }}
        </option>
      </select>
    </div>

    <!-- 파트 리스트 카드 -->
    <div class="row">
      <div class="col-md-4 mb-4" v-for="part in filteredParts" :key="part.partSeq">
        <div class="card custom-card shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">{{ part.partName }}</h5>
            <div>
              <button class="btn btn-outline-dark btn-sm me-2" @click="openEditModal(part)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger btn-sm" @click="deletePart(part.partSeq)">
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
        <h5 class="mb-3 fw-bold">파트 등록</h5>
        <select v-model="newPartDeptSeq" class="form-select mb-3">
          <option value="" disabled>부서를 선택해주세요</option>
          <option v-for="dept in departments" :key="dept.deptSeq" :value="dept.deptSeq">
            {{ dept.deptName }}
          </option>
        </select>
        <input
            type="text"
            class="form-control mb-3"
            placeholder="파트명 입력"
            v-model="newPartName"
        />
        <div class="d-flex justify-content-end">
          <button class="btn btn-outline-secondary me-2" @click="closeCreateModal">취소</button>
          <button class="btn btn-primary" @click="createPart">등록</button>
        </div>
      </div>
    </div>

    <!-- 수정 모달 -->
    <div v-if="showEditModal" class="modal-backdrop">
      <div class="modal-content p-4">
        <h5 class="mb-3 fw-bold">파트 수정</h5>
        <select v-model="editPartDeptSeq" class="form-select mb-3">
          <option value="" disabled>부서를 선택해주세요</option>
          <option v-for="dept in departments" :key="dept.deptSeq" :value="dept.deptSeq">
            {{ dept.deptName }}
          </option>
        </select>
        <input
            type="text"
            class="form-control mb-3"
            placeholder="파트명 수정"
            v-model="editPartName"
        />
        <div class="d-flex justify-content-end">
          <button class="btn btn-outline-secondary me-2" @click="closeEditModal">취소</button>
          <button class="btn btn-primary" @click="updatePart">수정</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";

const departments = ref([]); // 부서 데이터
const parts = ref([]); // 전체 파트 데이터
const selectedDeptSeq = ref(""); // 선택된 부서
const filteredParts = computed(() =>
    parts.value.filter((part) => part.deptSeq === selectedDeptSeq.value)
);

const showCreateModal = ref(false);
const newPartName = ref("");
const newPartDeptSeq = ref("");

const showEditModal = ref(false);
const editPartName = ref("");
const editPartDeptSeq = ref("");
const editPartSeq = ref(null);

// 부서 데이터 가져오기
const fetchDepartments = async () => {
  try {
    const response = await axios.get("/v1/dept");
    departments.value = response.data.data;
  } catch (error) {
    console.error("부서 데이터 가져오기 실패", error);
  }
};

const fetchPartsByDept = async () => {
  if (!selectedDeptSeq.value) return;

  try {
    const response = await axios.get(`/v1/part?deptSeq=${selectedDeptSeq.value}`);
    parts.value = response.data.data;
  } catch (error) {
    console.error("파트 데이터 가져오기 실패", error);
  }
};

// 등록 모달 열기/닫기
const openCreateModal = () => {
  newPartDeptSeq.value = selectedDeptSeq.value || "";
  showCreateModal.value = true;
};
const closeCreateModal = () => {
  showCreateModal.value = false;
  newPartName.value = "";
  newPartDeptSeq.value = "";
};

// 수정 모달 열기/닫기
const openEditModal = (part) => {
  editPartSeq.value = part.partSeq;
  editPartDeptSeq.value = part.deptSeq;
  editPartName.value = part.partName;
  showEditModal.value = true;
};
const closeEditModal = () => {
  showEditModal.value = false;
  editPartName.value = "";
  editPartDeptSeq.value = "";
  editPartSeq.value = null;
};

// 파트 등록
const createPart = async () => {
  if (!newPartName.value.trim() || !newPartDeptSeq.value) {
    alert("부서와 파트명을 입력해주세요.");
    return;
  }

  try {
    await axios.post("/v1/part", {
      deptSeq: newPartDeptSeq.value,
      partName: newPartName.value,
    });
    await fetchPartsByDept();
    closeCreateModal();
  } catch (error) {
    console.error("파트 등록 실패", error);
  }
};

// 파트 수정
const updatePart = async () => {
  try {
    await axios.put(`/v1/part/${editPartSeq.value}`, {
      partSeq: editPartSeq.value,
      deptSeq: editPartDeptSeq.value,
      partName: editPartName.value,
    });
    await fetchPartsByDept();
    closeEditModal();
  } catch (error) {
    console.error("파트 수정 실패", error);
  }
};

// 파트 삭제
const deletePart = async (partSeq) => {
  try {
    await axios.delete(`/v1/part/${partSeq}`);
    parts.value = parts.value.filter((p) => p.partSeq !== partSeq);
  } catch (error) {
    console.error("삭제 실패", error);
  }
};

onMounted(() => {
  fetchDepartments();
});
</script>

<style scoped>
h3 {
  font-size: 1.8rem;
  color: #333;
}

.custom-form-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
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

.custom-dropdown {
  width: 250px;
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
