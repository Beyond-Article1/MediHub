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
      <img src="../../assets/images/medihub2.png"  alt="어라라...?">
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
  justify-content: space-between; /* 양쪽 끝 정렬 */
  align-items: center; /* 세로 중앙 정렬 */
  background: linear-gradient(to bottom, #1A2F69, #3A4F89, #5A6FA9);
  height: 100px; /* 헤더 높이 */
  padding: 0 20px; /* 좌우 여백 */
}

/* 로고 스타일 */
.logo img {
  cursor: pointer;
  height: 100px; /* 로고 높이 */
}

/* 메뉴 리스트 */
.menu-list ul {
  display: flex;
  gap: 100px; /* 메뉴 간격 */
  margin: 0;
  padding: 0;
  list-style: none;
}

.menu-list li {
  color: white;
  font-size: 1.4em; /* 텍스트 크기 증가 */
  font-weight: bold;
  cursor: pointer;
  transition: color 0.2s ease;
}

.menu-list li.active {
  color: #FFC653; /* 활성 메뉴 색상 */
}

.menu-list li:hover {
  color: #FFC653; /* 호버 시 색상 변경 */
}

/* 로그인/로그아웃 버튼 */
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
