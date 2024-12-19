<template>
  <div class="action-buttons">

    <button @click="$emit('save')" class="save-btn">저장</button>
    <div class="draft-btn-wrapper">
      <span @click="$emit('tempSave')" class="temp-save-text">임시저장</span>
      <span @click="$emit('openDraftModal')" class="draft-list">| 목록 </span>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['save', 'tempSave', 'openDraftModal']);

const openDraftModal = () => {
  emit('openDraftModal');
};
</script>

<style scoped>

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}
.draft-btn-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 5px;
  border-style: solid;
  border-width: 2px;
  border-color: gold;
  border-radius: 4px;
  padding: 6px;
  background-color: gold;
}

.temp-save-text {
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
}

.draft-btn-wrapper span:hover {
  text-decoration: underline;
}


.save-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  color: white;
  background-color: #28a745;
}

.save-btn {
  background-color: #28a745;
}

.draft-list {
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
}
</style>
