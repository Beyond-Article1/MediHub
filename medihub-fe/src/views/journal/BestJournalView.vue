<script setup>

import {computed, onMounted, ref} from "vue";
import axios from "axios";
import SortButtonGroup from "@/components/common/button/JournalSortButtonGroup.vue";
import BookmarkButton from "@/components/common/button/BookmarkButton.vue";
import Pagenation from "@/components/common/Pagenation.vue";

// 논문 데이터
const journalData = ref([]);

// 논문 검색 순서 (select or bookmark) 기본값 북마크
const sortByValue = ref("bookmark");

// 논문 내림차순(true), 오름차순(false)
const isSorted = ref(true);

// 페이지네이션 관련 데이터
const currentPage = ref(1); // 현재 페이지
const pageSize = 5; // 페이지당 데이터 개수

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

// 북마크 통신
const bookmarkMethod = async (journal) => {
  await axios.post(`/journal/bookmark/${journal.journalSeq}`)
      .then(res => {
        if (res.status === 200){

          journal.bookmark = !journal.bookmark;

          if (journal.bookmark) {
            journal.count += 1; // 북마크 추가
            alert('북마크 완료')
          } else {
            journal.count -= 1; // 북마크 삭제
            alert('북마크 해제');
          }
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

// 북마크 상태 업데이트 함수
function updateBookmark(journalSeq) {
  // journalSeq를 찾아 해당 항목의 isBookmark 상태를 업데이트
  const journal = journalData.value.find((j) => j.journalSeq === journalSeq);
  if (journal) {
    bookmarkMethod(journal);
  }
}

// 페이지 변경 핸들러
const handlePageChange = (page) => {
  currentPage.value = page;
  console.log("현재 페이지: ", page);
};

// 현재 페이지에 맞는 데이터 반환
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return journalData.value.slice(start, end);
});

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

    <!-- 페이지에 맞는 데이터 출력 -->
    <div
        class="journal-box"
        v-for="(journal, index) in paginatedData"
        :key="journal.journalSeq"
    >
      <div class="journal-rank align-mid">
        {{ ((currentPage - 1) * pageSize + index + 1).toString().padStart(2, '0') }}
      </div>
      <div class="journal-info align-mid">
        <div class="journal-title">{{journal.title}}</div>
        <div class="journal-detail">{{journal.authors.join(', ')}} | {{journal.source}} | {{journal.pubDate}} | {{journal.size}}</div>
      </div>
      <div class="journal-bookmark">
        <div class="bookmark-count align-mid">{{sortByValue === 'bookmark' ? '북마크수' : '조회수'}}: {{journal.count}}</div>

        <BookmarkButton
            :currentIsBookmark="journal.bookmark"
            @updateBookmark="() => updateBookmark(journal.journalSeq)"
        />

      </div>

    </div>

    <Pagenation
        :totalData=journalData.length
        :limitPage=pageSize
        :page="currentPage"
        @updatePage="handlePageChange"
    />
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
    border-bottom: 1px solid grey;
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
    margin-left: 15px;
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