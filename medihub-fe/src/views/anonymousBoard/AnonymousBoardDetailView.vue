<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

import { useAuthStore } from "@/store/authStore.js";
import router from "@/router/index.js";
import LocalDateTimeFormat from '@/components/common/LocalDateTimeFormat.vue';
import beforeLike from '@/assets/images/like/before-like.png';
import afterLike from '@/assets/images/like/after-like.png';
import beforeBookmark from "@/assets/images/bookmark/before-bookmark.png";
import afterBookmark from "@/assets/images/bookmark/after-bookmark.png";
import LineDivider from "@/components/anonymousBoard/AnonymousBoardLineDivider.vue";
import AnonymousBoardKeywordList from "@/components/anonymousBoard/AnonymousBoardKeywordList.vue";
import Pagination from '@/components/common/Pagination.vue';

const authStore = useAuthStore();
const route = useRoute();

const boardData = ref({

  userName: "",
  anonymousBoardTitle: "",
  anonymousBoardContent: "",
  anonymousBoardViewCount: 0,
  createdAt: "",
  keywordList: []
});
const comment = ref([]);
const commentCount = ref(0);
const totalComment = ref(0);
const isDropdownOpen = ref({});
const currentCommentPage = ref(1);
const commentItemCount = ref(10);
const newCommentContent = ref('');
const characterCount = ref(0);
// 현재 수정 중인 댓글 ID를 저장하기 위한 ref 추가
const currentEditingCommentSeq = ref(null);

const userSeq = authStore.userSeq;

const fetchBoardDetail = async () => {

  const anonymousBoardSeq = route.params.id;

  try {

    // 쿠키 허용 활성화
    const response = await axios.get(`/anonymous-board/${anonymousBoardSeq}`, { withCredentials: true });

    const result = response.data;

    if(result.success) {

      const data = result.data;

      boardData.value = {

        userName: data.userName,
        anonymousBoardTitle: data.anonymousBoardTitle,
        anonymousBoardContent: data.anonymousBoardContent ? JSON.parse(data.anonymousBoardContent) : { blocks: [] },
        anonymousBoardViewCount: data.anonymousBoardViewCount,
        createdAt: data.createdAt,
        keywordList: data.keywordList || []
      };
      // 좋아요와 북마크 상태 초기화
      boardData.value.isLiked = false;
      boardData.value.isBookmark = false;

      await Promise.all([updateLikeStatus(anonymousBoardSeq), updateBookmarkStatus(anonymousBoardSeq)]);
    } else boardData.value = {};

    await fetchComment(anonymousBoardSeq);
  } catch(error) {

    boardData.value = {};
  }
};

// 본문 내용을 렌더링 할 때, 이미지를 포함하는 HTML 반환
const data = computed(() => {

  try {

    const anonymousBoardContent = boardData.value.anonymousBoardContent;

    if(!anonymousBoardContent || !anonymousBoardContent.blocks) return '';

    return anonymousBoardContent.blocks.map(block => {

      if(block.type === 'paragraph') {

        // 텍스트 블록은 <p>로 감쌈
        return `<p>${block.data.text}</p>`;
      } else if(block.type === 'image') {

        // 이미지 블록은 <img> 태그로 반환
        return `<img src="${block.data.file.url}" alt="${block.data.caption || 'Image'}" />`;
      }

      // 텍스트와 이미지 외의 블록은 무시
      return '';
      // 모든 블록을 하나의 문자열로 결합
    }).join('');
  } catch(error) {

    return '';
  }
});

const toggleLike = async () => {

  const anonymousBoardSeq = route.params.id;

  try {

    const response = await axios.patch(`/anonymous-board/${anonymousBoardSeq}/prefer`);

    boardData.value.isLiked = response.data.data;

    alert(boardData.value.isLiked ? '좋아요가 등록되었습니다.' : '좋아요가 취소되었습니다.');
  } catch(error) {

    alert('좋아요 처리에 실패했습니다.');
  }
};

const toggleBookmark = async () => {

  const anonymousBoardSeq = route.params.id;

  try {

    const response = await axios.patch(`/anonymous-board/${anonymousBoardSeq}/bookmark`);

    boardData.value.isBookmark = response.data.data;

    alert(boardData.value.isBookmark ? '북마크가 등록되었습니다.' : '북마크가 해제되었습니다.');
  } catch(error) {

    alert('북마크 처리에 실패했습니다.');
  }
};

const updateLikeStatus = async (anonymousBoardSeq) => {

  try {

    const response = await axios.get(`/anonymous-board/${anonymousBoardSeq}/prefer`);

    // 서버에서 반환된 좋아요 상태
    boardData.value.isLiked = response.data.data;
  } catch(error) {

    boardData.value.isLiked = false;
  }
};

const updateBookmarkStatus = async (anonymousBoardSeq) => {

  try {

    const response = await axios.get(`/anonymous-board/${anonymousBoardSeq}/bookmark`);

    // 서버에서 반환된 북마크 상태
    boardData.value.isBookmark = response.data.data;
  } catch(error) {

    boardData.value.isBookmark = false;
  }
};

const goToEditPage = () => {

  if(confirm("수정 페이지로 이동하시겠습니까?")) router.push({name: "AnonymousBoardEdit", params: {id: route.params.id}});
};

// 익명 게시글 삭제
const deleteBoard = async () => {

  if(!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;

  try {

    const response = await axios.delete(`/anonymous-board/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      }
    });

    // 응답 상태에 따라 처리
    // 204 No Content일 경우
    if(response.status === 204) {

      alert("게시글이 성공적으로 삭제되었습니다.");

      // 목록 페이지로 이동
      await router.push({name: "AnonymousBoardList"});
    } else alert("삭제에 실패했습니다. 다시 시도해주세요.");
  } catch(error) {

    alert("삭제 중 오류가 발생했습니다.");
  }
};

const fetchComment = async (anonymousBoardSeq) => {

  try {

    const commentResponse = await axios.get(`/anonymous-board/${anonymousBoardSeq}/comment`);

    comment.value = commentResponse.data.data || [];

    commentCount.value = comment.value.length;
    totalComment.value = commentCount.value;
    comment.value = comment.value.map((c) => ({
      ...c,
      // commentSeq를 id로 설정
      commentSeq: c.commentSeq,
      // 내 댓글 여부 추가
      isMyComment: c.userSeq === userSeq
    }));
  } catch(error) {

    comment.value = [];
  }
};

// 드롭다운 토글 함수
const toggleDropdown = (index) => {

  // 클릭 한 댓글의 드롭다운 상태 토글
  isDropdownOpen.value[index] = !isDropdownOpen.value[index];
};

// 드롭다운 외부 클릭 감지 함수
const handleClickOutside = (event) => {

  const dropdownKeys = Object.keys(isDropdownOpen.value);

  dropdownKeys.forEach(key => {

    if(isDropdownOpen.value[key] && !event.target.closest(`.dropdown-${key}`)) {

      // 드롭다운 닫기
      isDropdownOpen.value[key] = false;
    }
  });
};

// 댓글 페이징 처리
const paginatedComment = computed(() => {

  // 시작 인덱스
  const start = (currentCommentPage.value - 1) * commentItemCount.value;

  // 댓글을 잘라서 반환
  return comment.value.slice(start, start + commentItemCount.value);
});

// 페이지 변경 핸들러
const changePage = (page) => {

  // 현재 페이지 업데이트
  currentCommentPage.value = page;
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
      // 댓글 내용을 객체 형태로 전송
      commentContent: newCommentContent.value
    }, {
      headers: {
        // JSON 형식으로 전송
        'Content-Type': 'application/json'
      }
    });

    const commentSeq = createCommentResponse.data.data;

    // 새 댓글 객체 생성
    const newComment = {

      // 서버에서 반환된 댓글 ID 추가
      commentSeq: commentSeq,
      // 작성자 ID 추가
      userSeq: userSeq,
      // 새 댓글 내용
      commentContent: newCommentContent.value,
      // 현재 시간으로 createdAt 설정
      createdAt: new Date().toISOString(),
      // 현재 사용자가 작성한 댓글로 설정
      isMyComment: true
    };

    // 댓글 작성 성공 후, 상태 초기화 및 리스트 갱신
    // 입력 필드 초기화
    newCommentContent.value = '';
    // 새 댓글 추가
    comment.value.push(newComment);
    // 총 댓글 수 증가
    totalComment.value++;
    // 댓글 개수 업데이트
    commentCount.value = comment.value.length;

    alert('댓글 등록이 완료되었습니다.');
  } catch(error) {

    alert("댓글 등록 중 오류가 발생했습니다.");
  }
};

// 글자 수 업데이트 함수
const updateCharacterCount = () => {

  // 현재 글자 수 계산
  characterCount.value = newCommentContent.value.length;
};

const editComment = async (comment) => {

  // 수정 확인 대화 상자 추가
  if(!confirm("댓글을 수정하시겠습니까?")) return;

  // 수정할 댓글 내용을 입력 필드에 설정
  newCommentContent.value = comment.commentContent;
  // 나중에 수정 요청에 사용할 수 있도록 댓글 ID를 저장
  currentEditingCommentSeq.value = comment.commentSeq;
};

// 댓글 수정 함수
const updateComment = async () => {

  if(!currentEditingCommentSeq.value) {

    alert("수정할 댓글을 선택해 주세요.");

    return;
  }

  if(!newCommentContent.value.trim()) {

    alert("댓글 내용을 입력해 주세요.");

    return;
  }

  const anonymousBoardSeq = route.params.id;

  try {

    const response = await axios.put(
        `/anonymous-board/${anonymousBoardSeq}/comment/${currentEditingCommentSeq.value}`,
        {
          // 수정된 댓글 내용
          commentContent: newCommentContent.value
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
    );

    // 수정 성공 시, 댓글 내용을 업데이트
    const updatedCommentSeq = response.data.data;
    // 댓글 목록에서 수정된 댓글을 찾아서 내용 업데이트
    const index = comment.value.findIndex(c => c.commentSeq === updatedCommentSeq);

    // 수정된 내용으로 업데이트
    if(index !== -1) comment.value[index].commentContent = newCommentContent.value;

    alert("댓글이 수정되었습니다.");

    // 입력 필드 초기화
    newCommentContent.value = '';
    // 수정 ID 초기화
    currentEditingCommentSeq.value = null;
  } catch(error) {

    alert("댓글 수정 중 오류가 발생했습니다.");
  }
};

// 댓글 삭제 함수
const deleteComment = async (commentSeq) => {

  if(!commentSeq) {

    alert("댓글 ID가 정의되지 않았습니다.");

    return;
  }

  if(confirm("정말로 이 댓글을 삭제하시겠습니까?")) {

    try {

      const anonymousBoardSeq = route.params.id;

      await axios.delete(`/anonymous-board/${anonymousBoardSeq}/comment/${commentSeq}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      // 댓글 삭제 후, 상태 업데이트
      comment.value = comment.value.filter(c => c.commentSeq !== commentSeq);
      totalComment.value--;
      commentCount.value = comment.value.length;

      alert("댓글이 삭제되었습니다.");
    } catch(error) {

      alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  }
};

onMounted(() => {

  // 클릭 이벤트 추가
  document.addEventListener('click', handleClickOutside);

  fetchBoardDetail();
});

onBeforeUnmount(() => {

  // 클릭 이벤트 제거
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="board-detail" v-if="boardData.userName">
    <h1 class="board-title">{{ boardData.anonymousBoardTitle }}</h1>

    <div class="board-info">
      <!-- 프로필 사진 추가 -->
      <img class="profile-pic" src="@/assets/images/anonymousBoard/empty-profile.png" alt="Profile Picture"/>

      <!--      <p class="author">{{ boardData.userName }}</p>-->
      <p class="author">익명</p>

      <p class="date">
        <LocalDateTimeFormat :data="boardData.createdAt"/>
      </p>

      <p class="view-count">조회수&nbsp : &nbsp{{ boardData.anonymousBoardViewCount }}</p>

      <div class="button-group">
        <button class="action-button" @click="goToEditPage">수정</button>

        <button class="action-button" @click="deleteBoard">삭제</button>
      </div>

      <div class="actions">
        <div class="like-btn align-mid" @click.stop="toggleLike">
          <img :src="boardData.isLiked ? afterLike : beforeLike" alt="좋아요"/>
        </div>

        <div class="bookmark-btn align-mid" @click.stop="toggleBookmark">
          <img :src="boardData.isBookmark ? afterBookmark : beforeBookmark" alt="북마크"/>
        </div>
      </div>
    </div>

    <LineDivider/>

    <div class="keyword-detail">
      <h2 class="keyword-title">Keyword</h2>

      <LineDivider/>

      <AnonymousBoardKeywordList :keywordList="boardData.keywordList"/>

      <LineDivider/>

      <!-- 텍스트와 이미지 URL을 분리하여 표시 -->
      <p class="content" v-html="data"></p>
    </div>

    <div class="comment-section">
      <div class="comment-header">
        <h2 class="comment-title">Comment</h2>

        <span class="comment-count">댓글 &nbsp&nbsp&nbsp{{ commentCount }}개</span>
      </div>

      <LineDivider/>

      <div class="comment" v-for="(comment, index) in paginatedComment" :key="index">
        <div class="comment-content dropdown-${index}">
          <p class="comment-author">익명 <span v-if="comment.isMyComment">(내댓글)</span></p>

          <p class="comment-text">{{ comment.commentContent }}</p>

          <div class="dropdown" v-if="comment.isMyComment">
            <button @click.stop="toggleDropdown(index)">...</button>

            <div class="dropdown-menu" v-if="isDropdownOpen[index]">
              <button @click="editComment(comment)">수정</button>

              <button @click="deleteComment(comment.commentSeq)">삭제</button>
            </div>
          </div>

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
      <span class="char-count">{{ characterCount }} / 1000</span>

      <textarea
          v-model="newCommentContent"
          placeholder="불편함을 주는 댓글은 자제 부탁드리며, 따뜻한 댓글로 배려해 주세요."
          maxlength="1000"
          @input="updateCharacterCount"
      >
      </textarea>

      <button @click="currentEditingCommentSeq ? updateComment() : addComment()">
        {{ currentEditingCommentSeq ? '수정' : '댓글 달기' }}
      </button>
    </div>
  </div>
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

.button-group {
  display: flex;
  gap: 10px;
}

.action-button {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
}

.action-button:hover {
  background-color: #e0e0e0;
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
  font-size: 25px;
  margin-top: 30px;
  margin-bottom: 30px;
  font-weight: bold;
}

.keyword-detail img {
  max-width: 100%; /* 부모 요소의 너비를 넘지 않도록 설정 */
  height: auto; /* 비율을 유지하며 높이를 조정 */
}

.keyword-title{
  font-size: 25px;
  font-weight: bold;
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

.comment-title {
  font-size: 25px;
  font-weight: bold;
  margin: 0; /* 기본 마진 제거 */
}

.comment-count {
  font-weight: bold; /* 볼드체 적용 */
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

.dropdown {
  position: relative; /* 드롭다운 위치 설정 */
}

.dropdown-menu {
  position: absolute;
  right: 0; /* 오른쪽 정렬 */
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000; /* 드롭다운 메뉴가 다른 요소 위에 보이도록 설정 */
  display: block; /* 기본적으로 표시되도록 설정 */
}

.dropdown-menu button {
  padding: 10px;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
}

.dropdown-menu button:hover {
  background-color: #f0f0f0; /* 호버 시 배경색 변경 */
}

.comment-input {
  margin-top: 30px;
  position: relative; /* 부모 요소를 상대 위치로 설정 */
  width: 100%; /* 필요에 따라 너비 조정 */
}

.char-count {
  position: absolute; /* 절대 위치 설정 */
  top: 10px; /* 위에서 10px 위치 */
  right: 23px; /* 오른쪽에서 10px 위치 */
  font-size: 15px; /* 글자 수 표시 폰트 크기 */
  color: #666; /* 글자 수 표시 색상 */
}

.comment-input textarea {
  width: 100%;
  height: 200px;
  border: 1px solid black;
  border-radius: 4px;
  padding: 10px;
  resize: none;
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