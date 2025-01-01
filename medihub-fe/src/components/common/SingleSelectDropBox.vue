<script setup>
import { defineEmits, defineProps, ref, watch } from 'vue';

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
    type: String, // 단일 선택을 위한 String 타입
    default: ''
  },
  isOpen: { // 부모에서 전달받은 열림 상태
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'update:isOpen']);

// 드롭다운 토글 함수
const toggleDropdown = () => {
  emit('update:isOpen', !props.isOpen); // 부모에게 열림 상태 업데이트
};

// 선택된 옵션 처리
const selectOption = (option) => {
  emit('update:modelValue', option); // 선택된 값을 부모에게 전달
  emit('update:isOpen', false); // 드롭다운 닫기
};

// 선택된 상태 확인
const isSelected = (option) => {
  return props.modelValue === option; // 선택된 값 비교
};

// label을 reactive로 만들기 위한 ref
const labelValue = ref(props.label || '선택하세요');

// modelValue가 변경될 때 labelValue 업데이트
watch(() => props.modelValue, (newValue) => {
  labelValue.value = newValue || '선택하세요'; // 선택된 값이 없으면 기본 텍스트로 설정
});

// 초기 선택된 옵션을 반영
const initSelectedOption = () => {
  if (props.options.includes(props.modelValue)) {
    labelValue.value = props.modelValue; // 초기 선택된 옵션이 있다면 labelValue 업데이트
  }
};

// 컴포넌트가 처음 마운트될 때 초기 선택된 옵션을 설정
initSelectedOption();
</script>

<template>
  <div class="dropdown">
    <div
        class="dropdown-selected"
        @click="toggleDropdown"
        :class="{ 'active': isOpen }"
    >
      {{ labelValue }} <!-- 선택된 값 표시 -->
    </div>
    <div v-if="isOpen" class="dropdown-options">
      <div
          v-for="option in options"
          :key="option"
          class="dropdown-option"
          @click.stop="selectOption(option)"
      >
        <input
            type="radio"
            :checked="isSelected(option)"
            @change.stop="selectOption(option)"
        />
        {{ option }} <!-- 옵션 텍스트 -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.dropdown {
  margin-left: 20px;
  position: relative;
  width: 100%;
  cursor: pointer;
  margin-bottom: 10px; /* 드롭박스 간의 간격을 조정 */
}

.dropdown-selected {
  width: 100%;
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
