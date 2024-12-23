<template>
  <div class="sidebar p-3">
    <button
        v-for="item in menuItems"
        :key="item.name"
        class="sidebar-btn"
        :class="{ active: currentRoute === item.route }"
        @click="navigateTo(item.route)"
    >
      {{ item.name }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const menuItems = ref([
  { name: "JOURNAL", route: "/journal" },
  { name: "CASE SHAREING", route: "/case-shareing" },
  { name: "MEDICALLIFE", route: "/medical_life" },
  { name: "Anonymous Board", route: "/anonymous-board" },
  { name: "CP", route: "/cp" },
  { name: "FOLLOWMEMBER", route: "/followmember" },
]);

const currentRoute = ref("");

const navigateTo = (route) => {
  router.push(route);
};

onMounted(() => {
  currentRoute.value = route.path;
});
</script>

<style scoped>

.sidebar {
  display: flex;
  flex-direction: column;
  width: 300px;
  background-color: #f8f9fa;
  border-right: 1px solid #ddd;
  padding: 10px;
}

.sidebar-btn {
  background-color: white;
  border: 1px solid #007bff;
  color: #007bff;
  padding: 15px 15px;
  margin-bottom: 30px;
  text-align: center;
  font-size: 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.sidebar-btn.active {
  background-color: #ffc107;
  color: white;
  border-color: #ffc107;
}

.sidebar-btn:hover {
  background-color: #0056b3;
  color: white;
}
</style>
