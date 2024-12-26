<template>
  <div class="chatbot-window" v-if="isOpen">
    <!-- 헤더 -->
    <div class="chatbot-header">
      <h6 class="chatbot-title">MEDIBOT</h6>
      <button class="close-btn" @click="closeChatbot">✕</button>
    </div>

    <!-- 검색창 -->
    <div class="chat-search" v-if="!isNewChat">
      <input type="text" v-model="searchQuery" placeholder="채팅 기록 검색" />
      <button class="search-btn">
        <i class="fa fa-search"></i>
      </button>
    </div>

    <!-- 채팅 기록 -->
    <div class="chat-history" v-if="!isNewChat">
      <div class="chat-section">
        <h6>오늘</h6>
        <ul v-if="filteredTodaySessions.length > 0">
          <li
              v-for="(session, index) in filteredTodaySessions"
              :key="'today-' + index"
              @click="openSession(session)"
          >
            <span>{{ session.title || "Untitled Session" }}</span>
            <button
                class="delete-btn"
                @click.stop="deleteChat(session.id, index, 'today', true)"
            >
              <img src="@/assets/images/trash-can.png" alt="trash-can" class="trash-icon" />
            </button>
          </li>
        </ul>
        <p v-else class="empty-message">해당 기간 내 챗봇 세션이 없습니다</p>
      </div>

      <div class="chat-section">
        <h6>어제</h6>
        <ul v-if="filteredYesterdaySessions.length > 0">
          <li
              v-for="(session, index) in filteredYesterdaySessions"
              :key="'yesterday-' + index"
              @click="openSession(session)"
          >
            <span>{{ session.title || "Untitled Session" }}</span>
            <button
                class="delete-btn"
                @click.stop="deleteChat(session.id, index, 'yesterday', true)"
            >
              <img src="@/assets/images/trash-can.png" alt="trash-can" class="trash-icon" />
            </button>
          </li>
        </ul>
        <p v-else class="empty-message">해당 기간 내 챗봇 세션이 없습니다</p>
      </div>

      <div class="chat-section">
        <h6>지난 7일</h6>
        <ul v-if="filteredLast7DaysSessions.length > 0">
          <li
              v-for="(session, index) in filteredLast7DaysSessions"
              :key="'last7days-' + index"
              @click="openSession(session)"
          >
            <span>{{ session.title || "Untitled Session" }}</span>
            <button
                class="delete-btn"
                @click.stop="deleteChat(session.id, index, 'last7days', true)"
            >
              <img src="@/assets/images/trash-can.png" alt="trash-can" class="trash-icon" />
            </button>
          </li>
        </ul>
        <p v-else class="empty-message">해당 기간 내 챗봇 세션이 없습니다</p>
      </div>

      <div class="chat-section">
        <h6>지난 30일</h6>
        <ul v-if="filteredLast30DaysSessions.length > 0">
          <li
              v-for="(session, index) in filteredLast30DaysSessions"
              :key="'last30days-' + index"
              @click="openSession(session)"
          >
            <span>{{ session.title || "Untitled Session" }}</span>
            <button
                class="delete-btn"
                @click.stop="deleteChat(session.id, index, 'last30days', true)"
            >
              <img src="@/assets/images/trash-can.png" alt="trash-can" class="trash-icon" />
            </button>
          </li>
        </ul>
        <p v-else class="empty-message">해당 기간 내 챗봇 세션이 없습니다</p>
      </div>



    <!-- 새 채팅 버튼 -->
      <div class="new-chat-button" v-if="!isNewChat">
        <button @click="startNewChat">
          <i class="fa fa-plus">+</i>
          <span class="tooltip-text">새 챗봇 채팅 생성</span>
        </button>
      </div>
    </div>

    <!-- 새로운 채팅 창 -->
    <div class="chat-content" v-else>
      <div class="messages" ref="messageContainer">
        <!-- 기존 메시지 렌더링 -->
        <div
            v-for="(message, index) in chatMessages"
            :key="index"
            class="chat-message-wrapper"
        >
          <div
              v-if="message.sender === 'bot'"
              class="bot-message-container"
          >
            <img
                src="@/assets/images/chatbot/bot.png"
                alt="bot"
                class="bot-icon"
            />
            <div class="message-bubble bot-message">{{ message.content }}</div>
          </div>
          <div
              v-else
              class="user-message-container"
          >
            <div class="message-bubble user-message">{{ message.content }}</div>
          </div>
        </div>

        <!-- 로딩 중 스피너 -->
        <div v-if="isLoading" class="spinner-container">
          <div class="spinner"></div>
        </div>
      </div>
      <div class="chat-input-wrapper">
        <div class="chat-input">
          <input
              type="text"
              v-model="userInput"
              placeholder="내용을 입력해주세요"
              :disabled="isLoading"
              @keydown.enter="sendMessage"
          />
          <button @click="sendMessage" :disabled="isLoading">
            <img src="@/assets/images/send_white.png" alt="send" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const isOpen = ref(true); // 챗봇 창 열림 상태
const isNewChat = ref(false); // 새 채팅 여부 상태
const searchQuery = ref(""); // 검색어 상태
const chatSessions = ref([]); // 전체 채팅 세션
const chatMessages = ref([]); // 현재 채팅 메시지
const userInput = ref(""); // 사용자 입력
const isLoading = ref(false); // 로딩 상태
const authStore = useAuthStore();
const messageContainer = ref(null); // 메시지 스크롤 컨테이너
let sessionId = null;

// 챗봇 창 닫기
const closeChatbot = () => {
  isOpen.value = false;
};

// 새 채팅 시작
const startNewChat = async () => {
  try {
    const title = prompt("새 채팅의 제목을 입력하세요:");
    if (!title) return;

    const response = await axios.post("/chatbot/sessions", null, {
      params: { title },
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    });

    if (response.data.success) {
      // 새 세션 추가
      chatSessions.value.push({
        id: response.data.data,
        title,
        createdAt: new Date().toISOString(),
        lastMessageContent: null,
      });

      // 새로운 채팅 창으로 이동
      isNewChat.value = true;
      sessionId = response.data.data;
      console.log(sessionId);
      chatMessages.value = [
        {
          sender: "bot",
          content: "안녕하세요 무엇을 도와드릴까요?",
        },
      ];
      await nextTick(); // DOM 업데이트 후 스크롤링
      scrollToBottom();
    } else {
      alert("세션 생성에 실패했습니다.");
    }
  } catch (error) {
    console.error("새 채팅 생성 실패:", error);
    alert("새 채팅 세션 생성 중 오류가 발생했습니다.");
  }
  console.log(isNewChat.value);
};

const sendMessage = async () => {
  if (userInput.value.trim()&& !isLoading.value) {
    isLoading.value = true; // 로딩 시작
    // 사용자 메시지 추가
    const userMessage = { sender: "user", content: userInput.value };
    chatMessages.value.push(userMessage);

    // 사용자 입력 초기화
    const question = userInput.value;
    userInput.value = "";
    await nextTick(); // DOM 업데이트 후 스크롤 맨 아래로
    scrollToBottom();

    await saveMessageToSession(sessionId, userMessage);

    // Chatbot API 호출
    try {
      const response = await axios.post(
          "/chatbot/ask",
          { question }, // JSON 본문에 question 포함
          {
            headers: {
              "Content-Type": "application/json", // 명시적으로 Content-Type 설정
              Authorization: `Bearer ${authStore.accessToken}`, // 인증 헤더 설정
            },
          }
      );

      // Chatbot 응답 추가
      if (response.data) {
        const botMessage = { sender: "bot", content: response.data };
        chatMessages.value.push(botMessage);
        await saveMessageToSession(sessionId, botMessage);
      }
    } catch (error) {
      const errorMessage = {
        sender: "bot",
        content: "오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      };

      // 오류 메시지 추가
      chatMessages.value.push(errorMessage);

      // 오류 메시지도 세션에 저장
      await saveMessageToSession(sessionId, errorMessage);
    } finally {
      isLoading.value = false; // 로딩 종료
    }

    await nextTick(); // DOM 업데이트 후 스크롤 맨 아래로
    scrollToBottom();
  }
};

const saveMessageToSession = async (sessionId, message) => {
  try {
    await axios.post(
        `/chatbot/sessions/${sessionId}/messages`,
        null,
        {
          params: { sender: message.sender, content: message.content },
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        }
    );
    console.log("메시지가 세션에 저장되었습니다:", message);
  } catch (error) {
    console.error("메시지를 세션에 저장하는 데 실패했습니다:", error);
  }
};


// 세션 열기 및 메시지 불러오기
const openSession = async (session) => {
  isNewChat.value = true;
  chatMessages.value = []; // 기존 메시지 초기화

  try {
    const response = await axios.get(`/chatbot/sessions/${session.id}/messages`, {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    });

    sessionId = session.id;

    if (response.data.success) {
      chatMessages.value = response.data.data;
      await nextTick(); // DOM 업데이트 후 스크롤 맨 아래로
      scrollToBottom();
    }
  } catch (error) {
    console.error("메시지 가져오기 실패:", error);
    alert("메시지를 불러오는 중 오류가 발생했습니다.");
  }
};

// 스크롤 맨 아래로 이동
const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

// 필터링된 세션
const filteredTodaySessions = computed(() =>
    chatSessions.value.filter(
        (session) =>
            session.lastMessageAt && new Date(session.lastMessageAt).toDateString() === new Date().toDateString()
    )
);

const filteredYesterdaySessions = computed(() =>
    chatSessions.value.filter(
        (session) =>
            session.lastMessageAt &&
            new Date(session.lastMessageAt).toDateString() === new Date(Date.now() - 86400000).toDateString()
    )
);


const filteredLast7DaysSessions = computed(() =>
    chatSessions.value.filter(
        (session) => {
          const sessionDate = new Date(session.lastMessageAt);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return sessionDate >= sevenDaysAgo && sessionDate < new Date().setDate(new Date().getDate() - 1);
        }
    )
);

const filteredLast30DaysSessions = computed(() =>
    chatSessions.value.filter(
        (session) => {
          const sessionDate = new Date(session.lastMessageAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return sessionDate >= thirtyDaysAgo && sessionDate < new Date().setDate(new Date().getDate() - 7);
        }
    )
);

// 세션 삭제 API 호출
const deleteChat = async (sessionId, index, period, userTriggered = false) => {
  // 사용자에 의해 삭제가 트리거된 경우만 confirm 알림을 띄움
  if (userTriggered) {
    const confirmation = confirm(`정말 해당 채팅 세션을 삭제하시겠습니까?`);
    if (!confirmation) return;
  }

  try {
    await axios.delete(`/chatbot/sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    });

    // 성공적으로 삭제되면 목록에서 제거
    if (period === "today") {
      chatSessions.value = chatSessions.value.filter(
          (session) =>
              !(session.id === sessionId && new Date(session.lastMessageAt).toDateString() === new Date().toDateString())
      );
    } else if (period === "yesterday") {
      chatSessions.value = chatSessions.value.filter(
          (session) =>
              !(session.id === sessionId &&
                  new Date(session.lastMessageAt).toDateString() === new Date(Date.now() - 86400000).toDateString())
      );
    }
    if (userTriggered) {
      alert(`삭제되었습니다.`);
    }
  } catch (error) {
    console.error("세션 삭제 실패:", error);
    if (userTriggered) {
      alert("세션 삭제 중 오류가 발생했습니다.");
    }
  }
};

// `lastMessageAt`이 `null`인 세션 자동 삭제
const removeNullMessageSessions = async () => {
  for (let i = 0; i < chatSessions.value.length; i++) {
    const session = chatSessions.value[i];
    if (!session.lastMessageAt) {
      await deleteChat(session.id, i, null, false); // 자동 삭제는 userTriggered = false
    }
  }
};

// 세션 불러오기
onMounted(async () => {
  try {
    const response = await axios.get("/chatbot/sessions", {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    });
    chatSessions.value = response.data.data;

    // `lastMessageAt`이 null인 세션 제거
    await removeNullMessageSessions();
  } catch (error) {
    console.error("세션 가져오기 실패:", error);
  }
});
</script>



<style scoped>
.chatbot-window {
  position: fixed; /* 화면(viewport) 기준으로 위치 고정 */
  bottom: 20px; /* 화면 하단에서 20px */
  right: 20px; /* 화면 오른쪽에서 20px */
  width: 400px; /* 고정된 너비 */
  height: 600px; /* 고정된 높이 */
  max-width: 100%; /* 화면이 작을 경우 너비 제한 */
  max-height: 100%; /* 화면이 작을 경우 높이 제한 */
  background-color: #fff;
  border: 4px solid #1a2f69;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 1000; /* 다른 요소 위로 올림 */
}


.chatbot-header {
  background-color: #1a2f69;
  color: #fff;
  padding: 10px;
  text-align: center;
  font-weight: bold;
  position: relative;
}

.chatbot-title {
  margin: 0;
  font-size: 18px;
}

.chatbot-header .close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}

.chat-search {
  display: flex;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.chat-search input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.search-btn {
  background: none;
  border: none;
  color: #fbbd08;
  margin-left: 8px;
  cursor: pointer;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}
.chat-message-wrapper {
  display: flex;
  margin-bottom: 10px;
  font-size: 14px; /* 입력 글씨 크기 */
}
.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 5px;
  max-height: 600px;
  margin-bottom: 70px; /* 입력 바 높이를 고려한 하단 여백 */
  background-color: #f9f9f9;
}

.chat-section h4 {
  margin-bottom: 10px;
}

.chat-history ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.bot-message-container {
  display: flex;
  align-items: flex-start;
}
.bot-icon {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  background-color: #1A2F69;
  color: white;
  border-radius: 50%;
  font-size: 20px;
}

.message-bubble {
  max-width: 70%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #ccc;
}

.bot-message {
  background-color: #fff;
  border-color: #ddd;
}

.user-message-container {
  display: flex;
  justify-content: flex-end; /* 요소를 오른쪽 정렬 */
  align-items: flex-start; /* 수직 정렬 조정 */
  width: 100%; /* 컨테이너가 전체 너비를 차지하도록 설정 */
}

.user-message {
  background-color: #ffe599;
  color: #000;
  padding: 7px;
  border-radius: 10px;
  border: 1px solid #ccc;
  max-width: 70%;
  word-wrap: break-word;
  text-align: left; /* 텍스트 내부 정렬은 왼쪽 */
  margin-left: auto; /* 오른쪽 정렬을 유지하기 위해 추가 */
}


.chat-input-wrapper {
  position: absolute; /* 부모(.chatbot-window) 기준으로 배치 */
  bottom: 0; /* 부모 컨테이너 하단에 고정 */
  left: 0;
  width: 100%; /* 부모 너비에 맞춤 */
  background-color: #1a2f69;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
}

.chat-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-input input {
  flex: 1; /* 입력 필드가 가능한 공간을 차지하도록 설정 */
  padding: 10px;
  border: none;
  width: 320px;
  border-radius: 4px;
  color: #000;
  font-size: 14px; /* 입력 글씨 크기 */
}

.chat-input button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chat-input button img {
  width: 24px;
  height: 24px;
}

.chat-history li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 7px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  cursor: pointer;
  font-size: 14px;
}

.chat-history li:hover {
  background-color: #f1f1f1;
}


.new-chat-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
}

.new-chat-button button {
  background-color: #1a2f69;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease-in-out;
}

.new-chat-button .tooltip-text {
  visibility: hidden; /* 기본적으로 숨김 */
  opacity: 0;
  position: absolute;
  right: 60px; /* 버튼 오른쪽에 위치 */
  background-color: #1a2f69;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  white-space: nowrap;
  font-size: 14px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
}

.new-chat-button button:hover .tooltip-text {
  visibility: visible; /* hover 시 표시 */
  opacity: 1;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  position: relative; /* 스피너 위치 조정을 위한 기준 */
}

.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px; /* 스피너 영역의 높이 */
  width: 100%;
  position: sticky; /* 스크롤 시 고정 */
  bottom: 0; /* 메시지의 마지막 부분에 위치 */
}

.spinner {
  border: 4px solid #f3f3f3; /* 바깥 테두리 색 */
  border-top: 4px solid #1a2f69; /* 상단 테두리 색 */
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.delete-btn{
  border: none;
  background: none;
}
.trash-icon {
  width: 16px;
  height: 16px;
}
.empty-message {
  color: #666;
  font-size: 12px;
  text-align: center;
  margin-top: 15px;
  margin-bottom: 20px;
}
</style>
