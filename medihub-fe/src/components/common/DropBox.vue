<script setup>
import {defineEmits, defineProps} from 'vue';

const props = defineProps({
  options: {
    type: Array,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  isOpen: { // 부모에서 전달받은 열림 상태
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'update:isOpen']);

const toggleDropdown = () => {
  emit('update:isOpen', !props.isOpen); // 부모에게 열림 상태 업데이트
};

const toggleOption = (option) => {
  const newValue = [...props.modelValue]; // 기존 값을 복사
  const index = newValue.indexOf(option.value);

  if (index === -1) {
    // 선택되지 않은 경우, 추가
    newValue.push(option.value);
  } else {
    // 이미 선택된 경우, 제거
    newValue.splice(index, 1);
  }

  // 중복 제거 후 새로운 배열을 부모에게 전달
  const uniqueValues = [...new Set(newValue)];
  emit('update:modelValue', uniqueValues);

};

const isSelected = (option) => {
  return props.modelValue.includes(option.value);
};
</script>

<template>
  <div class="dropdown">
    <div
        class="dropdown-selected"
        @click="toggleDropdown"
        :class="{ 'active': isOpen }"
    >
      {{ label }}
    </div>
    <div v-if="isOpen" class="dropdown-options">
      <div
          v-for="option in options"
          :key="option.value"
          class="dropdown-option"
          @click.stop="toggleOption(option)"
      >
        <input
            type="checkbox"
            :checked="isSelected(option)"
            @change.stop="toggleOption(option)"
        />
        {{ option.text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
  width: 100%;
  max-width: 300px; /* 최대 너비 설정 */
  cursor: pointer;
  margin-bottom: 10px; /* 드롭박스 간의 간격을 조정 */
}

.dropdown-selected {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  color: #000;
  transition: background-color 0.3s, color 0.3s;
}

.dropdown-selected.active {
  background-color: var(--symbol-blue);
  color: white;
}

.dropdown-options {
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  z-index: 1000;
}

.dropdown-option {
  padding: 12px;
  display: flex;
  align-items: center;
}

.dropdown-option input {
  margin-right: 8px; /* 체크박스와 텍스트 간의 간격 */
}

.dropdown-option:hover {
  background-color: #f0f0f0;
}
</style>
