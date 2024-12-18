<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <!-- 모달 제목 -->
      <h2 class="modal-title">템플릿 저장하기</h2>
      <p class="modal-description">
        현재 케이스 공유 글의 작성된 내용을 템플릿으로 저장합니다. <br />
        기존 템플릿 제목과 동일하면 덮어쓰기 됩니다.
      </p>

      <!-- 입력 필드 -->
      <div class="input-field">
        <div class="template-name">저장할 템플릿 제목</div>
        <input
            id="template-name"
            v-model="templateTitle"
            type="text"
            placeholder="템플릿 제목을 입력해주세요"
        />
      </div>

      <!-- 체크박스 선택 -->
      <div class="checkbox-group">
        <p>공개 범위를 선택해 주세요</p>

        <label>
          <input type="radio" v-model="openScope" value="PRIVATE" />
          나만 보기
          <span class="checkbox-description">저장된 템플릿은 나에게만 조회됩니다.</span>
        </label>

        <label>
          <input type="radio" v-model="openScope" value="SHARED" />
          부서 공유
          <span class="checkbox-description">저장된 템플릿이 같은 부서 사용자들에 공유됩니다.</span>
        </label>

        <label>
          <input type="radio" v-model="openScope" value="PUBLIC" />
          전체 공유
          <span class="checkbox-description">저장된 템플릿이 전체 사용자들에 공개됩니다.</span>
        </label>
      </div>

      <!-- 모달 버튼 -->
      <div class="modal-actions">
        <button @click="$emit('close')" class="cancel-btn">취소</button>
        <button @click="saveTemplate" class="save-btn">저장</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const templateTitle = ref(''); // 템플릿 제목 상태
const openScope = ref('PRIVATE'); // 기본값: 나만 보기

const emit = defineEmits(["close", "save-template"]);

// 저장 버튼 클릭 이벤트
const saveTemplate = async () => {if (!templateTitle.value.trim()) {
  alert("템플릿 제목을 입력해주세요.");
  return;
}
  emit("save-template", { title: templateTitle.value, openScope: openScope.value });
};
</script>

<style scoped>
/* 오버레이 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 모달 컨테이너 */
.modal-container {
  background-color: white;
  width: 800px;
  height: 530px;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.modal-title {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 10px;
}

.modal-description {
  font-size: 1em;
  color: #666;
  margin-left: 10px;
  margin-bottom: 20px;
}

.template-name {
  font-size: 1em;
  font-weight: bold;
  margin-bottom: 10px;
}

.input-field input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 1em;
}

.checkbox-group p {
  font-weight: bold;
  margin-bottom: 10px;
}

.checkbox-group label {
  margin-left: 10px;
  display: block;
  margin-bottom: 10px;
  font-size: 1em;
  cursor: pointer;
}

.checkbox-description {
  display: block;
  font-size: 0.8em;
  color: #666;
  margin-top: 3px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn,
.save-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}

.cancel-btn {
  background-color: #ddd;
}

.save-btn {
  background-color: #1a2f69;
  color: white;
}
</style>
