<script setup>
import check from '@/assets/images/check.png';
import x from '@/assets/images/x.png';

import {ref, onBeforeUnmount, onMounted} from "vue";
import { useAuthStore } from "@/store/authStore.js";
import { EventSourcePolyfill } from "event-source-polyfill";
import axios from "axios";

const eventSource = ref(null); // EventSource 객체
const events = ref([]);        // 수신된 이벤트 저장
const connected = ref(false);  // 연결 상태
const authStore = useAuthStore();

onMounted(() => {
  getNotify();
})

const getNotify = async () => {
  await axios.get('/notify')
      .then(res => {
        console.log('전체 알림 불러오기: ', res.data.data);

        if (res.data.data.length > 0){
          res.data.data.forEach(noti => {
            events.value.push(noti)
          });
        }

      })
      .catch(err => {
        console.error('불러오기 실패', err);
      });
}

// SSE 연결 함수
const connectSSE = () => {
  if (eventSource.value) {
    eventSource.value.close(); // 기존 연결 종료
  }

  const accessToken = authStore.accessToken;
  // SSE 서버 URL
  const sseUrl = "http://localhost:8088/notify/connect"; // 백엔드 SSE 엔드포인트

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

// 읽음처리
async function readNoti(event, index){
  const notiSeq = BigInt(event.notiSeq);
  await axios.get(`/notify/${notiSeq}`)
      .then(res => {
        if (res.status === 200 || res.data.data === 'OK'){
          event.isRead = !event.isRead;
        }
      })
      .catch(err => {
        console.error('단일 읽음처리중 에러 발생: ', err);
      });
}

// 삭제처리
async function deleteNoti(event, index){
  const notiSeq = BigInt(event.notiSeq);
  await axios.delete(`/notify/${notiSeq}`)
      .then(res => {
        if (res.status === 200 || res.data.data === 'OK') {
          events.value.splice(index, 1);
        }
      })
      .catch(err => {
        console.error('단일 삭제 처리중 에러 발생: ', err);
      });
}

// 전체 읽음
async function allReadNoti(){
  await axios.get('/notify/read')
      .then(res => {
        if (res.status === 200 || res.data.data === 'OK') {
          events.value.forEach(event => event.isRead = true);
        }
      })
      .catch(err => {
        console.error('전체 삭제 처리중 에러 발생: ', err);
      });
}

// 전체 삭제
async function allDeleteNoti(){
  await axios.delete('/notify')
      .then(res => {
        if (res.status === 200 || res.data.data === 'OK') {
          events.value = [];
        }
      })
      .catch(err => {
        console.error('전체 읽음 처리중 에러 발생: ', err);
      });
}

// 컴포넌트 언마운트 시 연결 해제
onBeforeUnmount(() => {
  disconnectSSE();
});
</script>

<template>
  <div>
    <h2>SSE 연결</h2>
    <button @click="connectSSE" v-if="!connected">SSE 연결</button>
    <button @click="disconnectSSE" v-else>SSE 연결 해제</button>
    <div class="noti-all">
      <div class="noti-all-items">
        <span class="all-read all-item" @click="allReadNoti">전체 읽음</span>
        <span class="all-delete all-item" @click="allDeleteNoti">전체 삭제</span>
      </div>
      <div class="noti-content"
           :class="event.isRead ? 'is-read' : 'not-read'"
           v-for="(event, index) in events" :key="event.notiSeq">
        <div class="noti-left-box">
          <span class="part-name">{{event.partName}}</span>
          <div class="noti-info">
            <span class="sender">{{event.senderName}}</span> <span class="content">{{event.content}}</span>
          </div>
        </div>

        <div class="noti-right-box">
          <div class="right-top">
            <div class="read btn-item" @click="readNoti(event, index)"><img :src="check" alt="단일 읽음"/>읽음</div>
            <div class="delete btn-item" @click="deleteNoti(event, index)"><img :src="x" alt="단일 삭제"/>삭제</div>
          </div>
          <div class="right-bottom">{{event.createdAt}}</div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
h2 {
  margin-bottom: 10px;
}

button {
  margin: 5px;
  padding: 10px;
  font-size: 12px;
}
.noti-all{
  width: 350px;
  max-height: 450px;
  overflow: auto;
}
.noti-all-items{
  text-align: right;
  width: 330px;
}
.noti-all-items span{
  padding-right: 10px;
}
/* 알림 박스 디자인 */
.noti-content{
  padding: 10px;
  width: 330px;
  height: 80px;
  border: 1px solid black;
  border-radius: 10px;
  box-shadow: 1px 2px 1px #bababa;
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.noti-left-box{
  align-content: center;
}
.part-name{
  font-size: 10px;
}
.noti-info .sender{
  font-size: 14px;
  font-weight: bolder;
}
.noti-info .content{
  font-size: 14px;
}
.noti-right-box{
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.right-top{
  padding-top: 5px;
  display: flex;
  justify-content: space-evenly;
  font-size: 12px;
  font-weight: bolder;
}
.btn-item{
  display: flex;
  flex-direction: column;
  align-items: center;
}
.btn-item img{
  width: 15px;
}
.read img{
  height: 15px;
}
.right-bottom{
  font-size: 12px;
}
.not-read{
  background-color: #FFC8C8;
}
.is-read{

}
</style>
