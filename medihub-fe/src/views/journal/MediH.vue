<script setup>
import axios from "axios";
import send from '@/assets/images/send.png';
import {ref} from "vue";

// 상태 관리
const chatMessages = ref([
  {sender: "bot", text: "안녕하세요! 궁금한 내용을 알려주세요."}
]);
const userInput = ref("");
const isLoading = ref(false); // 로딩 상태 관리
const articles = ref(); // 챗 데이터

// 메시지 전송 함수
const sendMessage = async () => {
  if (userInput.value.trim() !== "") {
    const inputText = userInput.value;

    // 사용자 메시지 추가
    chatMessages.value.push({sender: "user", text: inputText});
    userInput.value = "";
    isLoading.value = true;

    console.log("inputText type: ", typeof inputText);
    try {
      // 백엔드 호출
      // const response =
          await axios.get('/journal/chat',
          {
            params: {
              prompt: inputText,
            },
          })
              .then(res => {
                if (res.status === 200){
                  console.log(res.data.data.data);
                  articles.value = res.data.data.data;
                } else {
                  console.log('예상한 값이 아님: ', res.status);
                }
              })
              .catch(err => {
                console.error("논문 채팅 중 오류 발생: ", err);
              });
      // const articles = response.data;

      // 응답 메시지 추가
      const botResponse = formatPubmedResponse(articles.value);
      chatMessages.value.push({sender: "bot", text: botResponse});
    } catch (error) {
      console.error("Error fetching data:", error);
      chatMessages.value.push({sender: "bot", text: "죄송합니다. 데이터를 가져오는 데 실패했습니다."});
    } finally {
      isLoading.value = false;
    }
  }
};

// Pubmed 데이터를 텍스트로 포맷
const formatPubmedResponse = (articles) => {
  if (!articles || articles.length === 0) {
    console.log('관련된 논문 어쩌구')
    return "관련된 논문을 찾을 수 없습니다.";
  }

  let responseText = "관련 논문을 찾았습니다:\n\n";

  console.log(articles);
  try {
      articles.forEach((article, index) => {
        responseText += `${index + 1}. ${article.title} (${article.pubDate})\n저자: ${article.authors?.join(", ") || "N/A"}\nDOI: ${article.doi || "N/A"}\n\n`;
      });
  } catch (err){
    if (err instanceof TypeError){
      return articles;
    }
  }

  return responseText;
};
</script>

<template>
  <div class="chat-container">
    <!-- 채팅 메시지 출력 영역 -->
    <div class="chat-window">
      <div v-for="(msg, index) in chatMessages" :key="index"
           :class="['message', msg.sender === 'user' ? 'user-message' : 'bot-message']">
        {{ msg.text }}
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
      <button @click="sendMessage"><img :src="send"></button>
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
