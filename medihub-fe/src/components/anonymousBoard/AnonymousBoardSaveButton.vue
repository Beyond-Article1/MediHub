<template>
  <div class="action-buttons">
    <button @click="$emit('save')" class="save-btn">저장</button>
  </div>
</template>

<style scoped>
.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.save-btn{
  padding: 10px 15px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-size: 1em;
  color: white;
  background-color: #003366;
}
</style>
