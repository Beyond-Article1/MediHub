<script setup>
const props = defineProps({
  cpName: String
})
</script>

<template>
  <div id="CpTitle">
    <span>{{ props.cpName }}</span>
  </div>
</template>

<style scoped>
#CpTitle {
  font-size: 24px;
  font-weight: bold;
}
</style>