<script setup>

import {onMounted, ref} from "vue";
import axios from "axios";
import afterBookmark from '@/assets/images/after-bookmark.png';
import beforeBookmark from '@/assets/images/before-bookmark.png';
import SortButtonGroup from "@/components/JournalSortButtonGroup.vue";
import SortButton from '@/components/SortButton.vue';

// 논문 데이터
const journalData = ref([]);

// 논문 검색 순서 (select or bookmark) 기본값 북마크
const sortByValue = ref("bookmark");

// 논문 내림차순(true), 오름차순(false)
const isSorted = ref(true);

onMounted(() => {
  check(sortByValue.value);
})

// 조회 조건에 따른 조회
async function check(sortValue){
  await axios.get('/journal',
      {
        params: {
          sortBy: sortValue,
        },
      })
      .then(res => {
        if (res.status === 200){
          journalData.value = res.data.data;
          console.log(journalData.value);
        } else {
          console.log('예상한 값이 아님: ', res.status);
        }
      })
      .catch(err => {
        console.error('에러 발생: ', err);
      })
}

// 북마크 해제 또는 취소
function onClickBookmark(journal){

  journal.isBookmark = !journal.isBookmark;

  bookmarkMethod(journal);
}

// 북마크 통신
const bookmarkMethod = async (journal) => {
  await axios.post(`/journal/bookmark/${journal.journalSeq}`)
      .then(res => {
        if (res.status === 200){
          journal.isBookmark ? alert('북마크 완료') : alert('북마크 해제');
        } else {
          console.log('성공 코드와 다름', res.data);
        }
      })
      .catch(err => {
        if (err.status === 404){
          alert('로그인이 필요한 서비스 입니다.');
          journal.isBookmark = false;
        }
        console.error('북마크 로직 중 에러 발생: ', err);
      })
}

// 카운트순 조회
function sortedJournals(){
  const sorted = [...journalData.value].sort((a,b) => {
    return isSorted.value
        ? b.count - a.count // 내림차순
        : a.count - b.count; // 오름차순
  });
}

// 조회 조건 변경
function changeCondition(condition){

  if (condition === sortByValue.value){
    sortedJournals();
  } else {
    sortByValue.value = condition;
    check(sortByValue.value);
  }
}

// 조회순 조회
</script>

<template>
  <div class="journal-content">
    <div class="journal-top">
      <div class="text">
        <span>논문 BEST 100</span>
      </div>

      <SortButtonGroup
          :currentSort="sortByValue"
          @updateSort="changeCondition"
      />

    </div>

    <div class="journal-box" v-for="(journal, index) in journalData" :key="journal.journalSeq">
      <div class="journal-rank align-mid">{{ index + 1}}</div>
      <div class="journal-info align-mid">
        <div class="journal-title">{{journal.title}}</div>
        <div class="journal-detail">{{journal.authors.join(', ')}} | {{journal.source}} | {{journal.pubDate}} | {{journal.size}}</div>
      </div>
      <div class="journal-bookmark">
        <div class="bookmark-count align-mid">{{sortByValue === 'bookmark' ? '북마크순' : '조회순'}}: {{journal.count}}</div>
        <div class="bookmark-btn align-mid" @click="onClickBookmark(journal)">
          <img :src="journal.isBookmark ? afterBookmark : beforeBookmark"
               :alt="journal.isBookmark ? 'After' : 'Before'" />
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
  .journal-content{
    display: flex;
    flex-direction: column;
    width: 1000px;
    height: 600px;
    margin: 0 auto;
    padding-top: 25px;
    padding-left: 50px;
    padding-right: 50px;
    border: 1px solid #999999;
    border-radius: 5px;
    overflow: scroll;
  }

  /* == BEST 100, 북마크 순, 조회 순 == */
  .journal-top{
    display: flex;
    justify-content: space-between;
    height: 60px;
    border-bottom: black 3px solid;
    align-items: center;
  }
  .journal-top .text span{
    font-weight: bolder;
    font-size: 20px;
  }
  .journal-top .btn-box{
    display: flex;
    justify-content: space-around;
    width: 250px;
  }
  .top-btn{
    font-size: 14px;
    font-weight: bolder;
    width: 100px;
    height: 30px;
    background-color: #FFFFFF;
    border: solid 2px #20346D;
    color: black;
    border-radius: 5px;
  }
  .click-top-btn{
    background-color: #20346D;
    color: #FFFFFF;
  }

  /* ======= 논문 박스 ======== */
  .journal-box{
    display: flex;
    justify-content: space-between;
    height: 70px;
  }

  /* == 논문 순위 == */
  .journal-rank{
    font-size: 40px;
    font-weight: bolder;
    color: #1A2F69;
  }

  /* == 논문 정보들 == */
  .journal-info{
    width: 700px;
  }
  .journal-title{
    font-size: 24px;
    font-weight: bold;
  }
  .journal-detail{
    font-size: 13px;
  }

  /* == 북마크 칸 == */
  .journal-bookmark{
    display: flex;
    width: 200px;
    justify-content: space-around;
  }
  .bookmark-count{
    font-weight: bolder;
  }
  .bookmark-btn img{
    width: 25px;
  }

  /* == 공용 == */
  .align-mid{
    align-content: center;
  }
</style>