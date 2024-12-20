<script setup>
import axios from "axios";
import send from '@/assets/images/send.png';
import {ref} from "vue";

// 상태 관리
const chatMessages = ref([
  {sender: "bot", type: "text", text: "안녕하세요! 궁금한 내용을 알려주세요."}
]);
const userInput = ref("");
const isLoading = ref(false); // 로딩 상태 관리
const articles = ref(); // 챗 데이터

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


async function journalInfo(journal) {
  try {
    console.log(journal);

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
    <div class="chat-window">
      <div
          v-for="(msg, index) in chatMessages"
          :key="index"
          :class="['message', msg.sender === 'user' ? 'user-message' : 'bot-message']"
      >
        <div v-if="msg.type === 'text'" v-html="msg.text.replace(/\n/g, '<br>')"></div>
        <div v-else-if="msg.type === 'list'">
          <div>
            <strong>{{ msg.index }}. {{ msg.title }}</strong>
            <div v-for="(key, value) in msg.details" :key="key">
              <template v-if="value === 'originalTitle'">원본명: {{ key }}</template>
              <template v-else-if="value === 'journal'">저널: {{ key }}</template>
              <template v-else-if="value === 'authors'">저자: {{ key }}</template>
              <template v-else-if="value === 'pubDate'">발간일: {{ key }}</template>
              <template v-else-if="value === 'size'">사이즈: {{ key }}</template>
              <template v-else-if="value === 'doi'">DOI: {{ key }}</template>
            </div>
            <button @click="journalInfo(msg)">[초록요약]</button>
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
            </div>
          </div>
        </div>
      </div>
      <div v-if="isLoading" class="loading">검색 중...</div>
    </div>

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
  overflow: hidden;
}
.message{
  margin-top: 20px;
}
.send-btn img{
  width: 20px;
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

</style>
