<template>
  <div class="action-buttons">

    <button @click="$emit('save')" class="save-btn">저장</button>
    <button @click="$emit('tempSave')" class="temp-save-btn">임시 저장</button>
  </div>
</template>

<style scoped>
.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.save-btn,
.temp-save-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  color: white;
}

.save-btn {
  background-color: #28a745;
}

.temp-save-btn {
  background-color: #ffc107;
}
</style>
