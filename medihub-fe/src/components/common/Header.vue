<template>
  <div class="header-content">
    <!-- 로고 -->
    <div class="logo" @click="goToHome">
      <img src="../../assets/images/medihub2.png" alt="Logo" />
    </div>

    <!-- 메뉴 리스트 -->
    <div class="menu-list" v-if="isLogIn">
      <ul>
        <!-- BOARDS 메뉴 -->
        <li
            class="menu-item dropdown"
            @mouseover="showDropdown = true"
            @mouseleave="showDropdown = false"
        >
          BOARDS
          <!-- 드롭다운 메뉴 -->
          <ul v-if="showDropdown" class="dropdown-menu">
            <li
                v-for="item in dropdownItems"
                :key="item.value"
                @click="moveToItem(item)"
            >
              {{ item.label }}
            </li>
          </ul>
        </li>

        <!-- 다른 메뉴 -->
        <li
            v-for="menu in ['cp', 'journal', 'member', 'admin']"
            :key="menu"
            :class="{ active: selectedItem === menu }"
            @click="moveToItem(menu)"
        >
          {{ menu.toUpperCase() }}
        </li>
      </ul>
    </div>

    <!-- 로그인/로그아웃 버튼 -->
    <div class="login-logout">
      <template v-if="isLogIn">
        <button @click="logout" class="logout-btn">LOGOUT</button>
      </template>
      <template v-else>
        <button @click="router.push('/login')" class="login-btn">LOGIN</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import router from '@/router/index.js';
import { useAuthStore } from '@/store/authStore.js';
import { useWebSocketStore } from "@/store/webSocket.js";

const store = useAuthStore();
const webSocketStore = useWebSocketStore();
const isLogIn = 123;
const selectedItem = ref('');
const showDropdown = ref(false);

const dropdownItems = [
  { label: 'CASE SHARING', value: 'case_sharing' },
  { label: 'MEDICAL LIFE', value: 'medical_life' },
  { label: 'ANONYMOUS', value: 'anonymous' },
];

const logout = async () => {
  await webSocketStore.disconnectWebSocket(); // 로그아웃 시, 웹소켓 연결 종료
  await store.logout();
  deleteCookie('token');
  await nextTick();
  router.push('/');
};

function deleteCookie(name) {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
}

function moveToItem(menu) {
  selectedItem.value = menu.value || menu;
  let route;
  switch (menu.value || menu) {
    case 'case_sharing':
      route = '/case_sharing';
      break;
    case 'medical_life':
      route = '/medical_life';
      break;
    case 'anonymous':
      route = '/anonymous';
      break;
    case 'cp':
      route = '/cp';
      break;
    case 'member':
      route = '/allUser';
      break;
    case 'admin':
      route = '/adminUser';
      break;
    default:
      route = '/';
      break;
  }
  if (route) {
    router.push(route).catch((err) => {
      if (err.name !== 'NavigationDuplicated') {
        console.error('Router push error:', err);
      }
    });
  }
 // router.push(route);
 // window.location.replace(route);
}

function goToHome() {
  selectedItem.value = '';
  router.push('/main');
}
</script>

<style scoped>
/* 헤더 컨테이너 스타일 */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to bottom, #1a2f69, #3a4f89, #5a6fa9);
  height: 100px;
  padding: 0 20px;
}

/* 로고 스타일 */
.logo img {
  cursor: pointer;
  height: 100px;
}

/* 메뉴 아이템 공통 스타일 */
.menu-item {
  position: relative;
  color: white;
  font-size: 1.4em;
  font-weight: bold;
  cursor: pointer;
}

.menu-item:hover {
  color: #ffc653;
}

/* 메뉴 리스트 스타일 */
.menu-list ul {
  display: flex; /* 가로 정렬 */
  gap: 150px; /* 메뉴 간격 조정 */
  margin: 0;
  padding: 0;
  list-style: none;
}

.menu-list li {
  color: white;
  font-size: 1.4em;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.2s ease;
}

.menu-list li.active {
  color: #ffc653;
}

.menu-list li:hover {
  color: #ffc653;
}

/* 로그인/로그아웃 버튼 스타일 */
.login-logout button {
  border: none;
  background-color: transparent;
  font-size: 1.2em;
  font-weight: bold;
  color: white;
  cursor: pointer;
}


/* 드롭다운 메뉴 스타일 강제 적용 - 임시방편...*/
.dropdown-menu {
  position: absolute !important;
  top: 100% !important;
  left: 50% !important;
  transform: translateX(-50%);
  display: block !important;
  width: 180px !important;
  background-color: white !important;
  border: 1px solid #ddd !important;
  border-radius: 4px !important;
  padding: 0 !important;
  margin-top: 0 !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
  list-style: none !important;
  z-index: 9999 !important;
}

.dropdown-menu li {
  display: block !important; /* 세로 정렬 */
  padding: 20px 0px !important;
  color: black !important;
  font-size: 1em !important;
  font-weight: normal !important;
  text-align: center !important;
  cursor: pointer !important;
  transition: background-color 0.2s ease, color 0.2s ease !important;
}

.dropdown-menu li:hover {
  background-color: #ffc653 !important; /* 호버 시 배경색 */
  color: black !important; /* 호버 시 글자색 */
  font-weight: bold !important;

}

</style>
