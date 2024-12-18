<script setup>
import {defineProps} from "vue";
import LocalDateTimeFormat from "@/components/common/LocalDateTimeFormat.vue";

// vue 변수
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div>
    <div class="cp-opinion-top-container">
      <span style="font-weight: bold">{{ props.data.userName }}</span>
      <span>/</span>
      <template v-if="props.data.updatedAt !== null">
        <LocalDateTimeFormat :data="props.data.updatedAt"/>
      </template>
      <template v-else>
        <LocalDateTimeFormat :data="props.data.createdAt"/>
      </template>
    </div>
    <div class="cp-opinion-middle-container">
      <div>
        <i class="bi bi-hand-thumbs-up"></i>
        <span>{{ props.data.positiveVotes }}</span>
      </div>
      <div>
        <i class="bi bi-hand-thumbs-down"></i>
        <span>{{ props.data.negativeVotes }}</span>
      </div>
      <div style="margin-left: 2%">
        <span>{{ props.data.positiveRatio }}</span>
        <span>%</span>
      </div>
    </div>
    <div class="cp-opinion-bottom-class">
      <span class="opinion-content">{{ props.data.cpOpinionContent }}</span>
    </div>
  </div>
</template>

<style scoped>
.cp-opinion-top-container,
.cp-opinion-middle-container {
  display: flex;
  align-items: center; /* 세로 중앙 정렬 */
}

.cp-opinion-top-container {
  margin-bottom: 10px; /* 상단 여백 */
}

.cp-opinion-middle-container {
  margin-bottom: 10px; /* 중간 여백 */
}

.cp-opinion-bottom-class {
  display: flex;
  flex-wrap: wrap; /* 내용에 따라 자동 줄 바꿈 */
}

.opinion-content {
  max-height: 150px;
  overflow: hidden; /* 넘치는 내용 숨김 */
  text-overflow: ellipsis; /* 넘치는 내용에 ... 표시 */
}
</style>

