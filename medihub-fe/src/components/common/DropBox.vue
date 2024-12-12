<script setup>
import { ref, defineProps, defineEmits } from 'vue';

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
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const selectedLabels = ref(props.modelValue.map(value =>
    props.options.find(option => option.value === value)?.text || ''
).filter(Boolean));

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const toggleOption = (option) => {
  const index = props.modelValue.indexOf(option.value);

  if (index === -1) {
    // 선택되지 않은 경우, 추가
    props.modelValue.push(option.value);
  } else {
    // 이미 선택된 경우, 제거
    props.modelValue.splice(index, 1);
  }

  emit('update:modelValue', props.modelValue);
  selectedLabels.value = props.modelValue.map(value =>
      props.options.find(opt => opt.value === value)?.text || ''
  ).filter(Boolean);
};

const isSelected = (option) => {
  return props.modelValue.includes(option.value);
};
</script>

<template>
  <div class="dropdown" @click="toggleDropdown">
    <div class="dropdown-selected" :class="{ 'selected': isOpen }">
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
}

.dropdown-selected {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff; /* 기본 배경색 */
  color: #000; /* 기본 폰트 색상 */
  transition: background-color 0.3s, color 0.3s; /* 부드러운 전환 효과 */
}

.dropdown-selected.selected {
  background-color: #1C306A; /* 드롭박스가 열렸을 때 배경색 */
  color: white; /* 드롭박스가 열렸을 때 폰트 색상 */
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  z-index: 1000;
}

.dropdown-option {
  padding: 12px;
  display: flex;
  align-items: center; /* 체크박스와 텍스트를 수직 정렬 */
}

.dropdown-option input {
  margin-right: 8px; /* 체크박스와 텍스트 간의 간격 */
}

.dropdown-option:hover {
  background-color: #f0f0f0; /* 옵션에 마우스를 올렸을 때 색상 변경 */
}
</style>
