<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

import axios from 'axios';
import LocalDateTimeFormat from '@/components/common/LocalDateTimeFormat.vue';
import beforeLike from '@/assets/images/like/before-like.png';
import afterLike from '@/assets/images/like/after-like.png';
import beforeBookmark from "@/assets/images/bookmark/before-bookmark.png";
import afterBookmark from "@/assets/images/bookmark/after-bookmark.png";
import LineDivider from "@/components/anonymousBoard/AnonymousBoardLineDivider.vue";
import Pagination from '@/components/common/Pagination.vue';

const boardDetail = ref({});
const comment = ref([]); // 댓글 상태 추가
const commentCount = ref(0); // 댓글 개수 상태 추가
const currentCommentPage = ref(1); // 현재 댓글 페이지 상태
const commentItemCount = ref(10); // 댓글 한 페이지에 보여줄 개수 상태
const totalComment = ref(0); // 총 댓글 개수
const newCommentContent = ref(''); // 새 댓글 내용 상태 추가
const characterCount = ref(0);
const route = useRoute();

const fetchBoardDetail = async () => {

  const anonymousBoardSeq = route.params.id;

  try {

    const response = await axios.get(`/anonymous-board/${anonymousBoardSeq}`);

    boardDetail.value = response.data.data || {};
    boardDetail.value.isLiked = false;
    boardDetail.value.isBookmark = false;

    // 댓글 데이터 조회
    await fetchComment(anonymousBoardSeq);
  } catch(error) {

    console.error('Error fetching board detail:', error);
  }
};

const fetchComment = async (anonymousBoardSeq) => {

  try {

    const commentResponse = await axios.get(`/anonymous-board/${anonymousBoardSeq}/comment`);

    comment.value = commentResponse.data.data || []; // 댓글 데이터 저장
    commentCount.value = comment.value.length; // 댓글 개수 계산
    totalComment.value = commentCount.value; // 총 댓글 수 저장
  } catch(error) {

    console.error('Error fetching comments:', error);
  }
};

// 좋아요 버튼 클릭 이벤트
const toggleLike = (boardItem) => {
  boardItem.isLiked = !boardItem.isLiked; // 좋아요 상태 전환
};

// 북마크 버튼 클릭 이벤트
const toggleBookmark = (boardItem) => {
  boardItem.isBookmark = !boardItem.isBookmark; // 북마크 상태 전환
};

// 익명 게시글 내용 추출
const data = computed(() => {

  try {

    const anonymousBoardContent = JSON.parse(boardDetail.value.anonymousBoardContent);

    return anonymousBoardContent.blocks.map(block => block.data.text).join(' '); // 텍스트를 공백으로 연결
  } catch(error) {

    console.error('Error parsing board content:', error);

    return ''; // 파싱 실패 시 빈 문자열 반환
  }
});

// 댓글 페이징 처리
const paginatedComment = computed(() => {
  const start = (currentCommentPage.value - 1) * commentItemCount.value; // 시작 인덱스
  return comment.value.slice(start, start + commentItemCount.value); // 댓글을 잘라서 반환
});

// 페이지 변경 핸들러
const changePage = (page) => {

  currentCommentPage.value = page; // 현재 페이지 업데이트
};

// 댓글 작성 함수
const addComment = async () => {

  if(!newCommentContent.value.trim()) {

    alert('댓글 내용을 입력해 주세요.');

    return;
  }

  const anonymousBoardSeq = route.params.id;

  try {

    const createCommentResponse = await axios.post(`/anonymous-board/${anonymousBoardSeq}/comment`, {

      commentContent: newCommentContent.value // 댓글 내용을 객체 형태로 전송
    }, {
      headers: {

        'Content-Type': 'application/json' // JSON 형식으로 전송
      }
    });

    const commentSeq = createCommentResponse.data.data; // 댓글 ID를 가져옴
    // 새 댓글 객체 생성
    const newComment = {
      id: commentSeq,  // 서버에서 반환된 댓글 ID 추가
      commentContent: newCommentContent.value, // 새 댓글 내용
      createdAt: new Date().toISOString() // 현재 시간으로 createdAt 설정
    };

    // 댓글 작성 성공 후 상태 초기화 및 리스트 갱신
    newCommentContent.value = ''; // 입력 필드 초기화
    comment.value.push(newComment); // 새 댓글 추가
    totalComment.value++; // 총 댓글 수 증가
    commentCount.value = comment.value.length; // 댓글 개수 업데이트

    alert('댓글 등록이 완료되었습니다.');
  } catch(error) {

    console.error('Error adding comment:', error);
  }
};

// 글자 수 업데이트 함수
const updateCharacterCount = () => {

  characterCount.value = newCommentContent.value.length; // 현재 글자 수 계산
};

onMounted(() => {
  fetchBoardDetail(); // 페이지가 마운트될 때 게시글 세부 정보를 가져옴
});
</script>

<template>
  <div class="board-detail" v-if="boardDetail.userName">
    <h1 class="board-title">{{ boardDetail.anonymousBoardTitle }}</h1>
    <div class="board-info">
      <!-- 프로필 사진 추가 -->
      <img class="profile-pic" src="@/assets/images/anonymousBoard/empty-profile.png" alt="Profile Picture" />

      <!--      <p class="author">{{ boardDetail.userName }}</p>-->
      <p class="author">익명</p>
      <p class="date">
        <LocalDateTimeFormat :data="boardDetail.createdAt" />
      </p> <!-- 변환된 날짜 사용 -->
      <p class="view-count">조회수&nbsp : &nbsp{{ boardDetail.anonymousBoardViewCount }}</p>

      <div class="actions"> <!-- 버튼들을 감싸는 div 추가 -->
        <div class="like-btn align-mid" @click.stop="toggleLike(boardDetail)">
          <img :src="boardDetail.isLiked ? afterLike : beforeLike" :alt="boardDetail.isLiked ? 'After' : 'Before'"/>
        </div>
        <div class="bookmark-btn align-mid" @click.stop="toggleBookmark(boardDetail)">
          <img
              :src="boardDetail.isBookmark ? afterBookmark : beforeBookmark"
              :alt="boardDetail.isBookmark ? 'After' : 'Before'"
          />
        </div>
      </div>
    </div>

    <LineDivider />

    <div class="keyword-detail">
      <h2 class="keyword-title">Keyword</h2>

      <LineDivider />

      <div class="keyword-list">
        <div v-if="boardDetail.keywords">
          <div v-for="(keyword, index) in boardDetail.keywords" :key="index" class="keyword-item">
            # {{ keyword.keywordName }}
          </div>
        </div>
      </div>

      <LineDivider />

      <p class="content">{{ data }}</p>

      <div v-if="boardDetail.anonymousBoardPictureList && boardDetail.anonymousBoardPictureList.length">
        <div class="picture-list">
          <img
              v-for="(picture, index) in boardDetail.anonymousBoardPictureList"
              :key="index"
              :src="picture.pictureUrl"
              :alt="picture.pictureName"
          />
        </div>
      </div>
    </div>

    <div class="comment-section">
      <div class="comment-header">
        <h2 class="comment-title">Comment</h2>
        <span class="comment-count">댓글 &nbsp&nbsp&nbsp{{ commentCount }}개</span> <!-- 댓글 개수 추가 -->
      </div>

      <LineDivider />

      <div class="comment" v-for="(comment, index) in paginatedComment" :key="index">
        <div class="comment-content">
          <p class="comment-author">익명</p>
          <p class="comment-text">{{ comment.commentContent }}</p>
          <p class="comment-date" v-if="comment.createdAt">
            <LocalDateTimeFormat :data="comment.createdAt"/>
          </p>
        </div>
      </div>

      <Pagination
          :totalData="totalComment"
          :limitPage="commentItemCount"
          :page="currentCommentPage"
          @updatePage="changePage"
      />
    </div>

    <div class="comment-input">
      <span class="char-count">{{ characterCount }} / 1000</span> <!-- 글자 수 표시 -->
      <textarea
          v-model="newCommentContent"
          placeholder="불편함을 주는 댓글은 자제 부탁드리며, 따뜻한 댓글로 배려해 주세요."
          maxlength="1000"
          @input="updateCharacterCount"
      >
      </textarea>
      <button @click="addComment">댓글 달기</button>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>

<style scoped>
.board-detail {
  margin: 40px; /* 바깥 여백 추가 */
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid black; /* 테두리 추가 */
}

.board-title {
  font-size: 28px; /* 제목 크기 조정 */
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 5px; /* 제목과 선 간격 */
}

.board-info {
  display: flex; /* 가로로 배치 */
  align-items: center; /* 수직 중앙 정렬 */
  font-size: 14px;
  color: #666; /* 회색 텍스트 */
  margin-bottom: 20px;
}

.author-info {
  display: flex; /* 가로로 배치 */
  align-items: center; /* 수직 중앙 정렬 */
  margin-right: 20px; /* 작성자 정보와 다른 요소 간격 추가 */
}

.profile-pic {
  width: 50px; /* 프로필 사진 크기 조정 */
  height: 50px; /* 프로필 사진 크기 조정 */
  border-radius: 50%; /* 둥글게 만들기 */
  margin-right: 100px; /* 작성자 이름과 간격 추가 */
}

.author,
.date,
.view-count {
  font-size: 18px
}

.author {
  font-weight: bold;
  margin-top: 15px;
  margin-right: 100px; /* 작성자 이름과 날짜 간격 */
}

.date {
  margin-top: 15px;
  margin-right: 100px; /* 날짜와 조회수 간격 */
}

.view-count {
  margin-top: 15px;
}

.actions {
  margin-left: auto; /* 오른쪽으로 정렬 */
  display: flex; /* 버튼들을 가로로 배치 */
  align-items: center; /* 세로 중앙 정렬 */
}

.like-btn,
.bookmark-btn {
  cursor: pointer;
  margin-left: 10px; /* 버튼 간 간격 추가 */
}

.like-btn img,
.bookmark-btn img {
  width: 25px;
}

.keyword-detail {
  border-radius: 8px;
  border: 1px solid black; /* 테두리 추가 */
  padding: 20px; /* 패딩 추가 */
}

.keyword-detail {
  font-size: 25px;
  margin-top: 30px;
  margin-bottom: 30px;
  font-weight: bold;
}

.keyword-title,
.comment-title {
  font-size: 25px;
  font-weight: bold;
}

.comment-title {
  margin: 0; /* 기본 마진 제거 */
}

.comment-count {
  font-weight: bold; /* 볼드체 적용 */
}

.keyword-list {
  display: flex; /* 가로 배치 */
  flex-wrap: wrap; /* 줄 바꿈 */
  gap: 10px; /* 버튼 간 간격 */
}

.keyword-item {
  background-color: #fff0d3; /* 배경색 */
  padding: 8px 12px; /* 상하, 좌우 패딩 */
  font-size: 20px;
}

.content {
  margin-top: 25px;
  margin-bottom: 20px;
  font-size: 20px
}

.picture-list img {
  max-width: 100%;
  height: auto;
  margin: 10px 0;
  font-size: 20px
}

.comment-section {
  border-radius: 8px;
  border: 1px solid black; /* 테두리 추가 */
  padding: 20px; /* 패딩 추가 */
}

.comment-header {
  display: flex; /* 플렉스 박스를 사용하여 정렬 */
  justify-content: space-between; /* 양쪽 끝으로 정렬 */
  align-items: center; /* 수직 정렬 */
}

.comment {
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  display: flex; /* 플렉스 박스 사용 */
  justify-content: space-between; /* 자식 요소를 양쪽 끝으로 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
}

.comment-content {
  flex: 1; /* 기본적으로 공간을 차지하도록 설정 */
  display: flex; /* 플렉스 박스 사용 */
  align-items: center; /* 수직 중앙 정렬 */
  justify-content: space-between; /* 자식 요소를 양쪽 끝으로 정렬 */
}

.comment-author,
.comment-text,
.comment-date {
  font-size: 18px;
}

.comment-author {
  font-weight: bold; /* 작성자 이름을 볼드체로 */
  margin-right: 10px; /* 작성자와 내용 간의 간격 */
}

.comment-text {
  font-weight: bold; /* 댓글 내용을 볼드체로 */
}

.comment-date {
  font-weight: bold; /* 날짜를 볼드체로 */
  margin-left: 10px; /* 날짜와 내용 간의 간격 */
}

.comment-input {
  margin-top: 30px;
  position: relative; /* 부모 요소를 상대 위치로 설정 */
  width: 100%; /* 필요에 따라 너비 조정 */
}

.comment-input textarea {
  width: 100%;
  height: 200px;
  border: 1px solid black;
  border-radius: 4px;
  padding: 10px;
  resize: none;
}

.char-count {
  position: absolute; /* 절대 위치 설정 */
  top: 10px; /* 위에서 10px 위치 */
  right: 23px; /* 오른쪽에서 10px 위치 */
  font-size: 15px; /* 글자 수 표시 폰트 크기 */
  color: #666; /* 글자 수 표시 색상 */
}

.comment-input button {
  position: absolute; /* 절대 위치 설정 */
  bottom: 10px; /* 아래에서 10px 위치 */
  right: 10px; /* 오른쪽에서 10px 위치 */
  background-color: white;
  color: #003366;
  border: 1px solid #003366; /* 테두리 추가 */
  border-radius: 7px;
  cursor: pointer;
  font-weight: bold;
  width: 90px; /* 버튼의 가로 길이 조정 */
  height: 30px; /* 버튼의 세로 길이 조정 */
}
</style>