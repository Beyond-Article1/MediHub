<template>
  <div class="container mt-5">
    <!-- 제목 및 등록 버튼 -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold">부서 관리</h3>
      <button @click="openCreateModal" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i> 부서 등록
      </button>
    </div>

    <!-- 부서 리스트 -->
    <div class="row">
      <div class="col-md-4 mb-4" v-for="dept in departments" :key="dept.deptSeq">
        <div class="card custom-card shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">{{ dept.deptName }}</h5>
            <div>
              <button class="btn btn-outline-dark btn-sm me-2" @click="openEditModal(dept)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger btn-sm" @click="deleteDept(dept.deptSeq)">
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
        <h5 class="mb-3 fw-bold">부서 등록</h5>
        <input
            type="text"
            class="form-control mb-3"
            placeholder="부서명 입력"
            v-model="newDeptName"
        />
        <div class="d-flex justify-content-end">
          <button class="btn btn-outline-secondary me-2" @click="closeCreateModal">취소</button>
          <button class="btn btn-primary" @click="createDept">등록</button>
        </div>
      </div>
    </div>

    <!-- 수정 모달 -->
    <div v-if="showEditModal" class="modal-backdrop">
      <div class="modal-content p-4">
        <h5 class="mb-3 fw-bold">부서 수정</h5>
        <input
            type="text"
            class="form-control mb-3"
            placeholder="부서명 수정"
            v-model="editDeptName"
        />
        <div class="d-flex justify-content-end">
          <button class="btn btn-outline-secondary me-2" @click="closeEditModal">취소</button>
          <button class="btn btn-primary" @click="updateDept">수정</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const departments = ref([]); // 부서 데이터
const showCreateModal = ref(false);
const newDeptName = ref("");

const showEditModal = ref(false);
const editDeptName = ref("");
const editDeptSeq = ref(null);

// 부서 데이터 가져오기
const fetchDepartments = async () => {
  try {
    const response = await axios.get("/api/v1/dept");
    departments.value = response.data.data;
  } catch (error) {
    console.error("부서 데이터 가져오기 실패", error);
  }
};

// 등록 모달 열기/닫기
const openCreateModal = () => {
  showCreateModal.value = true;
};
const closeCreateModal = () => {
  showCreateModal.value = false;
  newDeptName.value = "";
};

// 수정 모달 열기/닫기
const openEditModal = (dept) => {
  editDeptSeq.value = dept.deptSeq;
  editDeptName.value = dept.deptName;
  showEditModal.value = true;
};
const closeEditModal = () => {
  showEditModal.value = false;
  editDeptName.value = "";
  editDeptSeq.value = null;
};

// 부서 등록
const createDept = async () => {
  if (!newDeptName.value.trim()) {
    alert("부서명을 입력해주세요.");
    return;
  }

  try {
    await axios.post("/api/v1/dept", { deptName: newDeptName.value });
    await fetchDepartments();
    closeCreateModal();
  } catch (error) {
    console.error("부서 등록 실패", error);
  }
};

// 부서 수정
const updateDept = async () => {
  if (!editDeptName.value.trim()) {
    alert("부서명을 입력해주세요.");
    return;
  }

  try {
    await axios.put(`/api/v1/dept/${editDeptSeq.value}`, { deptName: editDeptName.value });
    await fetchDepartments();
    closeEditModal();
  } catch (error) {
    console.error("부서 수정 실패", error);
  }
};

// 부서 삭제
const deleteDept = async (deptSeq) => {
  try {
    await axios.delete(`/api/v1/dept/${deptSeq}`);
    departments.value = departments.value.filter((dept) => dept.deptSeq !== deptSeq);
  } catch (error) {
    console.error("부서 삭제 실패", error);
  }
};

onMounted(fetchDepartments);
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
