<script setup>
import {computed, nextTick, ref} from 'vue';
import router from "@/router/index.js";
import {useAuthStore} from "@/store/authStore.js";

const store = useAuthStore();
const isLogIn = 123; // 디자인 확인을 위해 임시값
const isAdmin = computed(() => store.userRole === 'ADMIN');
const selectedItem = ref(''); // 선택된 아이템

const logout = async () => {
  await store.logout();
  deleteCookie('token');
  await nextTick();
  router.push('/');
};

function deleteCookie(name) {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
  if (document.domain) {
    document.cookie = `${name}=; Path=/; Domain=${document.domain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
  }
}

function moveToItem(move) {
  selectedItem.value = move; // 선택된 아이템 업데이트
  let item;
  switch (move) {
    case 'board':
      alert("개발중입니다.");
      item = '/';
      break;
    case 'cp':
      item = '/cp';
      break;
    case 'journal':
      alert("개발중입니다.");
      item = '/';
      break;
    case 'member':
      alert("개발중입니다.");
      item = '/';
      break;
    case 'admin':
      alert("개발중입니다.");
      item = '/';
      break;
    default:
      item = '/';
      break;
  }
  router.push(`${item}`);
}

// 로고 클릭 시 실행
function goToHome() {
  selectedItem.value = ''; // 선택 초기화
  router.push('/');
}
</script>

<template>
  <div class="header-content">
    <div class="logo" @click="goToHome">
      <img src="../../assets/images/MEDIHUB.png" width="158" alt="어라라...?">
    </div>

    <!-- 로그인 상태일 때만 메뉴 항목 표시 -->
    <div class="menu-list" v-if="isLogIn">
      <ul>
        <li
            v-for="menu in ['board', 'cp', 'journal', 'member', 'admin']"
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

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  background: linear-gradient(to bottom, #1A2F69, #3A4F89, #5A6FA9);
  align-items: center;
}

.logo {
  margin-left: 2%;
}

.menu-list {
  width: 40%;
  align-content: center;
}

ul {
  padding: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

li {
  margin: 0 auto;
  align-content: center;
  text-align: center;
  list-style: none;
  color: white;
  font-size: 1.2em;
  cursor: pointer;
}

li.active {
  margin: 0 auto;
  align-content: center;
  text-align: center;
  list-style: none;
  color: #FFC653;
  font-size: 1.2em;
  cursor: pointer;
}

.login-logout {
  margin-right: 2%;
  align-content: center;
  font-size: 1.2em;
  color: white;
}

.login-logout button {
  border: none;
  background-color: rgb(0, 0, 0, 0);
  font-size: 1.2em;
  font-weight: bold;
  color: white;
}
</style>