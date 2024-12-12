<script setup>
import CpTitleComponent from "@/components/cp/CpTitle.vue";
import SearchBox from "@/components/common/SearchBox.vue";
import LineDivider from "@/components/common/LineDivider.vue";
</script>

<template>
  <div class="container">
    <CpTitleComponent :cpName="'백혈병'" class="cp-title" />
    <SearchBox class="search-box" />
  </div>
  <LineDivider/>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  padding: 20px;
}

.cp-title {
  flex: 1;
}

.search-box {
  flex: 9;
}
</style>
