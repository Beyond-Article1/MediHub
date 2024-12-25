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
            v-for="menu in ['cp']"
            :key="menu"
            :class="{ active: selectedItem === menu }"
            @click="moveToItem(menu)"
        >
          {{ menu.toUpperCase() }}
        </li>

        <li
            class="menu-item dropdown"
            @mouseover="showJournalDrop = true"
            @mouseleave="showJournalDrop = false"
        >
          JOURNAL
          <!-- 드롭다운 메뉴 -->
          <ul v-if="showJournalDrop" class="dropdown-menu">
            <li
                v-for="item in journalDropdownItems"
                :key="item.value"
                @click="moveToItem(item)"
            >
              {{ item.label }}
            </li>
          </ul>
        </li>

        <li
            v-for="menu in ['admin']"
            :key="menu"
            :class="{ active: selectedItem === menu }"
            @click="moveToItem(menu)"
        >
          {{ menu.toUpperCase() }}
        </li>

        <li
            class="menu-item dropdown"
            @mouseover="showMemberDrop = true"
            @mouseleave="showMemberDrop = false"
        >
          MEMBER
          <!-- 드롭다운 메뉴 -->
          <ul v-if="showMemberDrop" class="dropdown-menu">
            <li
                v-for="item in memberDropdownItems"
                :key="item.value"
                @click="moveToItem(item)"
            >
              {{ item.label }}
            </li>
          </ul>
        </li>

      </ul>
    </div>

    <div class="notify-div" @click="toggleModal">
      <img :src='BeforeNotify' alt="알림 없음" v-if="!hasNewNotification"/>
      <img :src='AfterNotify' alt="알림 있음" v-if="hasNewNotification"/>
    </div>
    <div class="modal-wrapper">
      <NotificationModal
        v-if="isNotifyModalOpen"
        :events="events"
        @close="toggleModal"
        :has-new-notification="hasNewNotification"
        @update-notifications="updateHasNewNotification"
        @update-read="markAsRead"
        @delete-notification="deleteNotification"
        @update-read-all="markAsReadAll"
        @delete-notification-all="deleteNotificationAll"
      />
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
import {ref, nextTick, onMounted, onBeforeUnmount} from 'vue';
import router from '@/router/index.js';
import { useAuthStore } from '@/store/authStore.js';
import { useWebSocketStore } from "@/store/webSocket.js";
import { EventSourcePolyfill } from "event-source-polyfill";
import NotificationModal from "@/components/NotificationModal.vue";

import BeforeNotify from '@/assets/images/before-notify.png';
import AfterNotify from '@/assets/images/after-notify.png';
import axios from "axios";

const store = useAuthStore();
const webSocketStore = useWebSocketStore();
const isLogIn = 123;
const selectedItem = ref('');
const showDropdown = ref(false);
const showJournalDrop = ref(false);
const showMemberDrop = ref(false);

// SSE와 Notify 관련
const isNotifyModalOpen = ref(false); // modal Open 상태
const eventSource = ref(null); // EventSource 객체
const events = ref([]);        // 수신된 이벤트 저장
const connected = ref(false);  // 연결 상태
const hasNewNotification = ref(false);  // 새로운 알림 유무
const baseUrl = "http://localhost:8088";

// 자식 컴포넌트에서 알림 업데이트 이벤트 처리
const updateHasNewNotification = (value) => {
  hasNewNotification.value = value;
};

const dropdownItems = [
  { label: 'CASE SHARING', value: 'case_sharing' },
  { label: 'MEDICAL LIFE', value: 'medical_life' },
  { label: 'ANONYMOUS BOARD', value: 'anonymous-board' },
];

const journalDropdownItems = [
  { label: 'BEST 100', value: 'best_journal'},
  { label: 'MediH', value: 'medi_h'},
];

const memberDropdownItems = [
  { label: '전체 회원 조회', value: 'allUser' },
  { label: '내 정보 수정', value: 'editProfile' },
  { label: '마이페이지', value: 'myPage'}
];

onMounted(() => {
  // 연결 유무에 따른 재연결
  connectSSE();
  // 초기 알림 불러오기
  getNotify();
});

// 컴포넌트 언마운트 시 연결 해제
onBeforeUnmount(() => {
  disconnectSSE();
});

const logout = async () => {
  await webSocketStore.disconnectWebSocket(); // 로그아웃 시, 웹소켓 연결 종료
  window.dispatchEvent(new Event('logout'));    // logout 이벤트 발생
  await store.logout();
  deleteCookie('token');
  await disconnectSSE();  // logout시 SSE 연결 종료
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
      route = '/medicallife';
      break;
    case 'anonymous-board':
      route = '/anonymous-board';
      break;
    case 'best_journal':
      route = '/journal/best';
      break;
    case 'medi_h':
      route = '/journal/medi-h';
      break;
    case 'cp':
      route = '/cp';
      break;
    case 'allUser': // 전체 회원 조회
      route = '/AllUser';
      break;
    case 'editProfile': // 내 정보 수정
      route = '/userDetail';
      break;
    case 'myPage':
      route = '/myPage/journal';
      break;
    case 'admin':
      route = '/admin/user';
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
  router.push(route);
}

function goToHome() {
  selectedItem.value = '';
  router.push('/main');
}

// SSE 연결 함수
const connectSSE = () => {
  if (eventSource.value) {
    eventSource.value.close(); // 기존 연결 종료
  }

  const accessToken = store.accessToken;
  // SSE 서버 URL
  const sseUrl = `${baseUrl}/notify/connect`; // 백엔드 SSE 엔드포인트

  eventSource.value = new EventSourcePolyfill(sseUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }, {withCredentials: true});

  eventSource.value.addEventListener("sse", (event) => {
    console.log("New event: ", event.data);
    const parsedData = JSON.parse(event.data);
    console.log("seq: ", parsedData.notiSeq);


    // parsedData가 String이거나 undefined인 경우 처리 중단
    if (typeof parsedData === "string" || typeof parsedData === "undefined") {
      console.warn("Invalid data type:", parsedData);
      return;
    }

    events.value.push(parsedData);
    hasNewNotification.value = true;
  });

  // 연결이 열렸을 때
  eventSource.value.onopen = () => {
    console.log("SSE 연결 성공");
    connected.value = true;
  };

  // 에러 발생 시
  eventSource.value.onerror = (error) => {
    console.error("SSE 연결 에러", error);
    eventSource.value.close();
    connected.value = false;
  };
};

// SSE 연결 해제 함수
const disconnectSSE = () => {
  if (eventSource.value) {
    eventSource.value.close();
    console.log("SSE 연결 해제");
    connected.value = false;
    eventSource.value = null;
  }
};

// 전체 알림 불러오기
const getNotify = async () => {
  await axios.get('/notify')
      .then(res => {
        console.log('전체 알림 불러오기: ', res.data.data);

        if (res.data.data.length > 0){
          res.data.data.forEach(noti => {
            events.value.push(noti)
          });
          checkNewNotifications();
        }

      })
      .catch(err => {
        console.error('불러오기 실패', err);
      });
}


// 알림 단일 읽음 처리
const markAsRead = (notiSeq) => {
  const noti = events.value.find((n) => n.notiSeq === notiSeq);
  if (noti) noti.read = true;
  checkNewNotifications();
};

// 알림 단일 삭제 처리
const deleteNotification = (notiSeq) => {
  events.value = events.value.filter((n) => n.notiSeq !== notiSeq);
  checkNewNotifications();
};

// 알림 전체 읽음 처리
const markAsReadAll = () => {
  events.value.forEach((noti) => {
    noti.read = true;
  });
};

// 알림 전체 삭제 처리
const deleteNotificationAll = () => {
  events.value = [];
};

// 새 알림 여부 체크
const checkNewNotifications = () => {
  hasNewNotification.value = events.value.some((noti) => !noti.read);
};

// 모달 열기/닫기
const toggleModal = () => {
  isNotifyModalOpen.value = !isNotifyModalOpen.value;
};
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
.notify-div{
  margin-left: 150px;
  margin-top: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.notify-div img{
  width: 35px;
}
.modal-wrapper{
  z-index: 999;
}
</style>