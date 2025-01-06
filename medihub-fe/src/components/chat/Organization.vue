<script setup>
import { onMounted, ref, computed } from 'vue';
import axios from 'axios';
import { useWebSocketStore } from "@/store/webSocket.js";
import { useChatStore } from "@/store/chatStore.js";

const webSocketStore = useWebSocketStore();
const chatStore = useChatStore();

const departments = ref([]);  //  부서 목록
const parts = ref([]);  // 과 목록
const users = ref([]);  // 전체 직원 목록

const selectedDepts = ref([]); // 선택된 부서 Seq 배열
const selectedPart = ref(null); // 선택된 과 Seq
const isPartView = ref(false);  // 화면 전환 상태 (true -> 직원 목록 화면)

// 데이터 가져오기
const getUserData = async () => {
  console.log('조직도 API 호출 시작');
  try {
    const [deptRes, partRes, userRes] = await Promise.all([
      axios.get("/v1/dept"),
      axios.get("/v1/part"),
      axios.get("/v1/users/allUser"),
    ]);

    // 부서 및 과 데이터 저장
    departments.value = deptRes.data.data;
    parts.value = partRes.data.data;

    // 부서명 매핑을 위한 맵 생성 (deptSeq -> deptName)
    const deptMap = departments.value.reduce((map, dept) => {
      map[dept.deptSeq] = dept.deptName;
      return map;
    }, {});

    // 과명과 부서명을 users 데이터에 매핑
    const partMap = parts.value.reduce((map, part) => {
      map[part.partName] = deptMap[part.deptSeq]; // partName -> deptName 매핑
      return map;
    }, {});

    // 유저 데이터에 부서명 추가
    users.value = userRes.data.data.map((user) => ({
      ...user,
      deptName: partMap[user.partName] || "부서 없음", // 과명에 해당하는 부서명 추가
    }));

    //console.info("user 매핑 결과: ", users.value);

  } catch (error) {
    console.error("데이터 불러오기 실패:", error);
  }
};

const toggleDept = (deptSeq) => {
  if (selectedDepts.value.includes(deptSeq)) {
    selectedDepts.value = selectedDepts.value.filter((id) => id !== deptSeq);
  } else {
    selectedDepts.value.push(deptSeq); // 열기
  }
};

const selectPart = (partSeq) => {
  selectedPart.value = partSeq;
  isPartView.value = true; // 직원 목록 화면으로 전환
};

// 필터링된 과 목록 (선택된 부서 기준)
const filteredParts = computed(() => {
  return parts.value.filter((part) => selectedDepts.value.includes(part.deptSeq));
});

// 필터링된 직원 목록 (선택된 과 기준)
const filteredUsers = computed(() => {
  return users.value.filter((user) => user.partName === parts.value.find((p) => p.partSeq === selectedPart.value)?.partName);
});

// 부서별 직원 수 계산
const deptEmployeeCounts = computed(() => {
  return departments.value.map((dept) => ({
    deptSeq: dept.deptSeq,
    count: users.value.filter((user) =>
        parts.value.some((part) => part.deptSeq === dept.deptSeq && part.partName === user.partName)
    ).length,
  }));
});

// 과별 직원 수 계산
const partEmployeeCounts = computed(() => {
  return parts.value.map((part) => ({
    partSeq: part.partSeq,
    count: users.value.filter((user) => user.partName === part.partName).length,
  }));
});

// 이전 화면으로 돌아가기
const goBackToDeptView = () => {
  isPartView.value = false;
};

onMounted(getUserData);

// 검색 기능
const searchQuery = ref('');  // 검색어 상태

// 검색어로 필터링된 전체 직원 목록
const filteredUsersBySearchQuery = computed(() => {
  if (!searchQuery.value.trim()) return [];

  const query = searchQuery.value.toLowerCase();

  return users.value.filter(
      (user) =>
          user.userName.toLowerCase().includes(query) ||  // 이름 검색
          user.deptName.toLowerCase().includes(query) ||  // 부서 검색
          user.partName?.toLowerCase().includes(query)    // 과 검색
  );
});

// 1:1 채팅방 생성
const createChatroom = async (userSeq) => {
  try {
    //console.log('1:1 채팅방 생성 버튼 클릭됨, 선택된 사용자: ', userSeq)
    const response = await axios.post('/chatroom', { users : [userSeq] });
    const chatroomSeq = response.data.data;
    console.log('생성된 1:1 채팅방 Seq 확인: ', chatroomSeq);

    await webSocketStore.subscribeChatroom(chatroomSeq);
    await chatStore.addChatroom(chatroomSeq);
  } catch(error) {
    console.error('1:1 채팅방 생성 실패: ', error);
    alert('1:1 채팅방 생성 중 오류가 발생하였습니다.');
  }
}
</script>

<template>
  <div class="organization-container">
    <!-- 첫 번째 화면: 조직도 -->
    <div v-if="!isPartView">
      <div class="chat-header">
        <h2>조직도</h2>
      </div>

      <!-- 검색창 -->
      <div class="search-bar">
        <input
            type="text"
            v-model="searchQuery"
            placeholder="부서명/과명/이름 검색"
            class="search-input"
        />
      </div>

      <!-- 검색 결과가 있을 경우 -->
      <div v-if="searchQuery.trim()">
        <div v-if="filteredUsersBySearchQuery.length > 0" class="user-list-container">
          <div
              v-for="user in filteredUsersBySearchQuery"
              :key="user.userSeq"
              class="user-item"
              @dblclick="createChatroom(user.userSeq)"
          >
            <img :src="user.profileImage || '/assets/default-profile.png'" alt="Profile" />
            <div class="user-info">
              <p class="user-name">{{ user.userName }} {{ user.rankingName }}</p>
              <p class="user-details">{{ user.deptName }} | {{ user.partName }} | {{ user.userPhone }}</p>
            </div>
          </div>
        </div>
        <!-- 검색 결과가 없을 경우 -->
        <p v-else>검색 결과가 없습니다.</p>
      </div>

      <!-- 첫 번째 화면: 전체 조직도 -->
      <div v-else class="organization-content">
        <ul class="organization-list list-unstyled">
          <!-- 부서 목록 -->
          <li v-for="dept in departments" :key="dept.deptSeq">
            <div @click="toggleDept(dept.deptSeq)" class="dept-item">
              <span>
                <span v-if="selectedDepts.includes(dept.deptSeq)">
                  <img src="@/assets/images/chat/Vector-Down.png" alt="Down"/>
                </span>
                <span v-else>
                  <img src="@/assets/images/chat/Vector-Right.png" alt="Right"/>
                </span>
              </span>
              {{ dept.deptName }}
              <span class="employee-count">
                 {{ deptEmployeeCounts.find((d) => d.deptSeq === dept.deptSeq)?.count || 0 }}
              </span>
            </div>

            <!-- 과 목록 -->
            <ul v-if="selectedDepts.includes(dept.deptSeq)" class="dept-list ms-3 list-unstyled">
              <li
                  v-for="part in filteredParts.filter((p) => p.deptSeq === dept.deptSeq)"
                  :key="part.partSeq"
                  @dblclick="selectPart(part.partSeq)"
                  class="part-item"
              >
                {{ part.partName }}
                <span class="employee-count">
                  {{ partEmployeeCounts.find((p) => p.partSeq === part.partSeq)?.count || 0 }}
                </span>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <!-- 두 번째 화면: 직원 목록 -->
    <div v-else class="user-list">
      <div class="chat-header part-info">
        <button @click="goBackToDeptView">
          <img src="@/assets/images/chat/Back.png"/>
        </button>
        <span class="part-name">&nbsp&nbsp{{ parts.find((p) => p.partSeq === selectedPart)?.partName }}</span>
      </div>

      <!-- 직원 목록 -->
      <div v-if="filteredUsers.length > 0" class="user-list-container">
        <div
            v-for="user in filteredUsers"
            :key="user.userSeq"
            class="user-item"
            @dblclick="createChatroom(user.userSeq)">
          <img :src="user.profileImage || '/chat/profile.png'" alt="Profile" />
          <div class="user-info">
            <p class="user-name">{{ user.userName }} {{ user.rankingName }}</p>
            <p class="user-details">{{ user.deptName }} | {{ user.partName }} | {{ user.userPhone }}</p>
          </div>
        </div>
      </div>
      <p v-else>선택된 과에 소속된 직원이 없습니다.</p>
    </div>
  </div>
</template>

<style scoped>
.organization-container {
  position: absolute;
  padding: 20px;
  width: 88%;
  height: 600px;
  background-color: #fff;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.chat-header {
  background-color: #fff;
  position: sticky;
  top: 0;
}

.search-bar {
  padding: 10px 0px;
  margin: 10px 0px;
}

.search-input {
  width: 90%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.organization-content {
  overflow-y: auto;
  min-width: 400px;
  max-height: 450px;
}

.user-list-container {
  overflow-y: auto;
  min-width: 400px;
  max-height: 450px;
}

.organization-list .dept-item {
  cursor: pointer;
  padding: 10px;
  font-size: 17px;
  font-weight: bold;
}

.organization-list .dept-item img[alt="Down"] {
  height: 8px;
  width: 13px;
}

.organization-list .dept-item img[alt="Right"] {
  height: 13px;
  width: 8px;
}

.organization-list .dept-item .employee-count {
  font-size: 13px;
  font-weight: lighter;
  color: #555555;
}

.organization-list .part-item {
  cursor: pointer;
  padding: 5px;
  font-size: 16px;
  margin-left: 15px;
}

.organization-list .part-item .employee-count {
  font-size: 13px;
  font-weight: lighter;
  color: #555555;
}

button {
  all: unset;
  cursor: pointer;
}

button img {
  width: 20px;
  height: auto;
}

.part-info {
  padding-bottom: 30px;
}

.part-name {
  font-size: 18px;
  color: #333;
  font-family: 'Arial', sans-serif;
  font-weight: bold;
}

.user-list-container {
  display: flex;
  flex-direction: column;
}

.user-item {
  display: flex;
  align-items: center;
  border-bottom: solid #ddd;
  margin-bottom: 10px;
}

.user-info {
  margin-left: 15px; /* 프로필 사진과 텍스트 간격 */
}

.user-name {
  font-size: 17px;
  color: #333;
  font-family: 'Arial', sans-serif;
  font-weight: bold;
  margin-bottom: 5px;
}

.user-details {
  font-size: 14px;
  color: #555;
  font-family: 'Verdana', sans-serif;
  margin-top: 0;
}

.user-item img {
  height: 50px;
  width: 50px;
  border-radius: 50%;
}
</style>