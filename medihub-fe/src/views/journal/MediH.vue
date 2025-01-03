<script setup>
import axios from "axios";
import send from '@/assets/images/send.png';
import {nextTick, onMounted, ref, watch} from "vue";
import {useRoute} from "vue-router";
import {DotLottieVue} from '@lottiefiles/dotlottie-vue'

// 화살표 표시 여부
const showScrollArrow = ref(false);
// 상태 관리
const chatMessages = ref([
  {sender: "bot", type: "text", text: "안녕하세요! 찾고 싶은 논문을 알려주세요."}
]);
const userInput = ref("");
const isLoading = ref(false); // 로딩 상태 관리
const articles = ref(); // 챗 데이터

const route = useRoute();
const journalData = ref([]);

// 최하단 스크롤을 위함
const chatWindow = ref(null);

onMounted(() => {
  if (route.query.journalData && sessionStorage.getItem('journalProcessed') === 'false') {
    journalData.value = JSON.parse(route.query.journalData);

    userInput.value = `${journalData.value.koreanTitle}에 대해 요약해줘`;

    chatMessages.value.push({ sender: "user", type: "text", text: userInput.value});
    userInput.value = "";
    journalInfo(journalData.value, 'move');

    sessionStorage.setItem('journalProcessed', 'true'); // journalData가 처리되었음을 기록
  }
});

// 메시지가 추가될 때마다 최하단으로 스크롤 이동
watch(isLoading, async () => {
  // DOM 업데이트가 완료된 후에 실행
  await nextTick(() => {
    if (chatWindow.value) {
      chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
    }
  });
});

// 스크롤 위치 체크
const checkScrollPosition = () => {
  console.log("scrollTop: ", chatWindow.value.scrollTop);
  console.log("scrollHeight: ", chatWindow.value.scrollHeight);
  console.log("clientHeight: ", chatWindow.value.clientHeight);
  if (chatWindow.value) {
    const isAtBottom = chatWindow.value.scrollHeight - chatWindow.value.scrollTop - 1 < chatWindow.value.clientHeight;
    showScrollArrow.value = !isAtBottom; // 최하단이 아니면 화살표 표시
  }
};

// 스크롤 이벤트 감지
const onScroll = () => {
  checkScrollPosition();
};

// 화살표 클릭 시 최하단으로 스크롤 이동
const scrollToBottom = () => {
  if (chatWindow.value) {
    chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
  }
};

// 메시지 전송 함수
const sendMessage = async () => {
  if (userInput.value.trim() !== "") {
    const inputText = userInput.value;

    // 사용자 메시지 추가
    chatMessages.value.push({ sender: "user", type: "text", text: inputText });
    userInput.value = "";
    isLoading.value = true;

    try {
      const response = await axios.get('/journal/chat', {
        params: { prompt: inputText },
      });
      if (response.status === 200) {
        console.log(response.data.data);
        articles.value = response.data.data.data;
      } else {
        console.error('예상한 값이 아님: ', response.status);
      }

      // 응답 메시지 추가
      const botResponses = formatPubmedResponse(articles.value);
      botResponses.forEach((response) =>
          chatMessages.value.push({ sender: "bot", ...response })
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      chatMessages.value.push({
        sender: "bot",
        type: "text",
        text: "죄송합니다. 데이터를 가져오는 데 실패했습니다.",
      });
    } finally {
      isLoading.value = false;
    }
  }
};


// Pubmed 데이터를 텍스트로 포맷
const formatPubmedResponse = (articles, type) => {
  if (!articles || articles.length === 0) {
    return [
      {
        type: "text", // 'info' 대신 'text'로 타입 변경
        text: "관련된 논문을 찾을 수 없습니다."
      }
    ];
  }

  if (type === 'info') {
    return [
      {
        type: "info", // 'info' 타입 그대로 사용
        title: articles.koreanTitle,
        details: {
          originalTitle: articles.title,
          journal: articles.source,
          authors: articles.authors?.join(", ") || "N/A",
          pubDate: articles.pubDate,
          size: articles.size,
          doi: articles.doi || "N/A",
          abstract: articles.info,
        },
      },
    ];
  } else {
    return articles.map((article, index) => ({
      type: "list",
      index: index + 1,
      pmid: article.pmid,
      title: article.koreanTitle,
      details: {
        originalTitle: article.title,
        journal: article.source,
        authors: article.authors?.join(", ") || "N/A",
        pubDate: article.pubDate,
        size: article.size,
        doi: article.doi || "N/A",
      },
    }));
  }
};


async function journalInfo(journal, move) {
  try {
    isLoading.value = true;

    if (move === 'move'){
      await axios.post(`/journal/${journal.pmid}`, {
        title: journal.title,
        koreanTitle: journal.koreanTitle,
        source: journal.source,
        pubDate: journal.pubData,
        size: journal.size,
        authors: journal.authors.join(', '),
        doi: journal.doi,
        pmid: journal.pmid
      })
          .then(res => {
            if (res.status === 200) {
              articles.value = res.data.data;
            } else {
              console.log('예상한 값이 아님: ', res.status);
            }
          })
          .catch(err => {
            console.error("논문 요약 중 오류 발생: ", err);
          });
    } else {
      await axios.post(`/journal/${journal.pmid}`, {
        title: journal.details.originalTitle,
        koreanTitle: journal.title,
        source: journal.details.journal,
        pubDate: journal.details.pubDate,
        size: journal.details.size,
        authors: journal.details.authors,
        doi: journal.details.doi,
        pmid: journal.pmid
      })
          .then(res => {
            if (res.status === 200) {
              console.log(res.data.data);
              articles.value = res.data.data;
            } else {
              console.log('예상한 값이 아님: ', res.status);
            }
          })
          .catch(err => {
            console.error("논문 요약 중 오류 발생: ", err);
          });
    }

    // info 타입에 대한 처리
    const botResponse = formatPubmedResponse(articles.value, 'info');
    botResponse.forEach((response) => {
      chatMessages.value.push({ sender: "bot", ...response });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    chatMessages.value.push({ sender: "bot", text: "죄송합니다. 데이터를 가져오는 데 실패했습니다." });
  } finally {
    isLoading.value = false;
  }
}

</script>

<template>
  <div class="chat-container">
    <!-- 채팅 메시지 출력 영역 -->
    <div class="chat-window" ref="chatWindow" @scroll="onScroll">
      <div
          v-for="(msg, index) in chatMessages"
          :key="index"
          :class="['message', msg.sender === 'user' ? 'user-message' : 'bot-message']"
      >
        <div v-if="msg.type === 'text'" v-html="msg.text.replace(/\n/g, '<br>')"></div>
        <div v-else-if="msg.type === 'list'">
          <div class="journal-list">
            <strong>{{ msg.index }}. {{ msg.title }}</strong>
            <div v-for="(key, value) in msg.details" :key="key">
              <template v-if="value === 'originalTitle'">원본명: {{ key }}</template>
              <template v-else-if="value === 'journal'">저널: {{ key }}</template>
              <template v-else-if="value === 'authors'">저자: {{ key }}</template>
              <template v-else-if="value === 'pubDate'">발간일: {{ key }}</template>
              <template v-else-if="value === 'size'">사이즈: {{ key }}</template>
              <template v-else-if="value === 'doi'">DOI: {{ key }}</template>
            </div>
            <div class="journal-ab-div">
              <button @click="journalInfo(msg)" class="journal-ab">요약보기</button>
            </div>
          </div>
        </div>
        <div v-else-if="msg.type === 'info'">
          <div>
            <b>{{ msg.title }}</b>
            <div v-for="(key, value) in msg.details" :key="key">
              <template v-if="value === 'originalTitle'">원본명: {{ key }}</template>
              <template v-else-if="value === 'journal'">저널: {{ key }}</template>
              <template v-else-if="value === 'authors'">저자: {{ key }}</template>
              <template v-else-if="value === 'pubDate'">발간일: {{ key }}</template>
              <template v-else-if="value === 'size'">사이즈: {{ key }}</template>
              <template v-else-if="value === 'doi'">DOI: {{ key }}</template>
              <template v-else-if="value === 'abstract'">{{ key }}</template>
              <a v-if="value === 'doi'" :href="'https://doi.org/' + key" target="_blank" rel="noopener noreferrer">
                논문 보러가기
              </a>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="loading">
        <div v-if="isLoading" class="loading">
            <DotLottieVue style="height: 500px; width: 500px" autoplay loop src="https://lottie.host/db37614c-7ba3-4159-a317-c6fc690f9efb/XN8xtbair8.lottie" />
        </div>

      </div>
    </div>

    <!-- 스크롤 화살표 -->
    <div v-if="showScrollArrow" class="scroll-arrow" @click="scrollToBottom">
      <span>↓</span>
    </div>
    <!-- 그라데이션 효과 (chat-window 내) -->
    <div v-if="showScrollArrow" class="scroll-gradient"></div>
    <!-- 사용자 입력 영역 -->
    <div class="input-container">
      <input
          v-model="userInput"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="MediH에게 물어보세요"
      />
      <button @click="sendMessage" class="send-btn">
        <img :src="send" />
      </button>
    </div>
    <div class="under-scroll"/>
  </div>
</template>


<style scoped>
.chat-container{
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 로딩 */
.loading {
  align-self: center;
  color: gray;
  font-style: italic;
}
/* === 채팅 내부 === */
.chat-window{
  width: 1000px;
  height: 450px;
  overflow-y: auto;
}

/* === 채팅 스크롤 바 === */
::-webkit-scrollbar-thumb {
  background: #e89a3e; /* 스크롤바 막대 색상 */
  border: 2px solid #9b6a2f; /* 스크롤바 막대 테두리 설정  */
  border-radius: 12px 12px 12px 12px;
}
::-webkit-scrollbar-thumb:hover{
  background-color:#a0a0a5;
}

/* 하단 입력 바 */
.input-container{
  margin-top: 15px;
  display: flex;
  flex-direction: row;
  width: 790px;
  border: 1px solid grey;
  border-radius: 15px;
  padding: 5px 15px 5px 15px;
}
.input-container input{
  width: 750px;
  height: 55px;
  border: none;
}
.message{
  margin-top: 20px;
}
.send-btn{
  height: 55px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: none;
  background-color: white;
}
.send-btn img{
  width: 20px;
  height: 20px;
}
.journal-list .journal-ab-div{
  text-align: center;
}
.journal-ab{
  margin-top: 10px;
  height: 40px;
  background-color: white;
  border: #d0eafd 2px solid;
  border-radius: 10px;
}
/* 봇 메세지 */
.bot-message{
  padding: 15px 10px 15px 10px;
  height: auto;
  max-height: 100%;
  max-width: 60%;
  width: auto;
  text-align: left;
  border-radius: 10px;
  background-color: #f8f8f8;
}
/* 사용자 메세지 */
.user-message{
  background-color: #8ec2ff;
  padding: 15px 10px 15px 10px;
  text-align: left;
  height: auto;
  max-height: 100%;
  width: 35%;
  margin-left: 65%;
  border-radius: 10px;
}
/* 화살표 */
.scroll-arrow {
  text-align: center;
  width: 44px;
  position: absolute;
  bottom: 20%;
  right: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
}

.scroll-arrow:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

/* 그라데이션 효과 */
/*.scroll-gradient {
  position: absolute;
  bottom: 14%;
  width: 1000px;
  height: 50px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
  pointer-events: none;
} */

</style>
