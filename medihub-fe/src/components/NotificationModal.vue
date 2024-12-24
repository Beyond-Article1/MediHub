<script setup>
import check from '@/assets/images/check.png';
import x from '@/assets/images/x.png';

import {useAuthStore} from "@/store/authStore.js";
import axios from "axios";

const authStore = useAuthStore();

const props = defineProps({
  events: Array,
  hasNewNotification: Boolean,
});
const emit = defineEmits(["close", "update-notifications", "update-read", "delete-notification", "update-read-all", "delete-notification-all"]);

const closeModal = () => {
  emit("close");
};

// 읽음처리
async function readNoti(event, index) {

  console.log('읽음 처리', event.notiSeq);
  const notiSeq = BigInt(event.notiSeq);

  await axios.get(`/notify/read`, {
    params: {
      notiSeq: notiSeq,
    },
  })
      .then(res => {
        if (res.status === 200 || res.data.data === 'OK') {
          emit("update-read", event.notiSeq);
          event.read = true;
        }
      })
      .catch(err => {
        console.error('단일 읽음처리중 에러 발생: ', err);
      });
}

// 삭제처리
async function deleteNoti(event, index) {
  const notiSeq = BigInt(event.notiSeq);
  await axios.delete(`/notify`, {
    params: {
      notiSeq: notiSeq,
    }
  })
      .then(res => {
        if (res.status === 200 || res.data.data === 'OK') {
          emit("delete-notification", event.notiSeq);
        }
      })
      .catch(err => {
        console.error('단일 삭제 처리중 에러 발생: ', err);
      });
}

// 전체 읽음
async function allReadNoti() {
  await axios.get('/notify/read-all')
      .then(res => {
        if (res.status === 200 || res.data.data === 'OK') {
          emit("update-read-all");
        }
      })
      .catch(err => {
        console.error('전체 읽음 처리중 에러 발생: ', err);
      });
}

// 전체 삭제
async function allDeleteNoti() {
  await axios.delete('/notify/delete-all')
      .then(res => {
        if (res.status === 200 || res.data.data === 'OK') {
          emit("delete-notification-all");
        }
      })
      .catch(err => {
        console.error('전체 읽음 처리중 에러 발생: ', err);
      });
}

// notiurl로 이동
const moveTo = (event) => {
  readNoti(event);
  route.push(event.url);
}
</script>

<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="noti-all">
      <div class="noti-all-items">
        <span class="all-read all-item" @click="allReadNoti">전체 읽음</span>
        <span class="all-delete all-item" @click="allDeleteNoti">전체 삭제</span>
      </div>
      <div class="noti-content"
           :class="event.read ? 'is-read' : 'not-read'"
           v-for="(event, index) in events" :key="event.notiSeq">
        <div class="noti-left-box">
          <span class="part-name">{{ event.partName }}</span>
          <div class="noti-info" @click="moveTo(event)">
            <span class="sender">{{ event.senderName }}</span> <span class="content">{{ event.content }}</span>
          </div>
        </div>

        <div class="noti-right-box">
          <div class="right-top">
            <div class="read btn-item" @click="readNoti(event, index)"><img :src="check" alt="단일 읽음"/>읽음</div>
            <div class="delete btn-item" @click="deleteNoti(event, index)"><img :src="x" alt="단일 삭제"/>삭제</div>
          </div>
          <div class="right-bottom">{{ event.createdAt }}</div>
        </div>
      </div>
      <button class="close-btn" @click="closeModal">닫기</button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: absolute;
  top: 0;
  left: 60%;
  right: 0;
  bottom: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
}
button {
  margin: 5px;
  padding: 10px;
  font-size: 12px;
}
::-webkit-scrollbar{
  display: none;
}
.noti-all {
  width: 360px;
  height: 450px;
  overflow: auto;
  justify-items: center;
  background-color: white;
  border-radius: 15px;
  border: grey 1px solid;
  box-shadow: 2px 2px 2px #bababa;
}

.noti-all-items {
  text-align: right;
  width: 330px;
}

.noti-all-items span {
  padding-right: 10px;
}

/* 알림 박스 디자인 */
.noti-content {
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

.noti-left-box {
  align-content: center;
}

.part-name {
  font-size: 10px;
}

.noti-info .sender {
  font-size: 14px;
  font-weight: bolder;
}

.noti-info .content {
  font-size: 14px;
}

.noti-right-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.right-top {
  padding-top: 5px;
  display: flex;
  justify-content: space-evenly;
  font-size: 12px;
  font-weight: bolder;
}

.btn-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-item img {
  width: 15px;
}

.read img {
  height: 15px;
}

.right-bottom {
  font-size: 12px;
}

.not-read {
  background-color: #FFC8C8;
}

.is-read {

}
.btn-item:hover{
  cursor: pointer;
  scale: 120%;
}
.close-btn{
  height: 25px;
  line-height: 3px;
  border: none;
  background-color: lightskyblue;
  border-radius: 5px;
}
.noti-all-items span{
  font-size: 12px;
}
.noti-all-items span:hover{
  cursor: pointer;
}
</style>