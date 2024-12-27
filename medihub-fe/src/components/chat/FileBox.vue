<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from "axios";

const files = ref([]);
const searchTerm = ref(''); // 검색어

const getFiles = async () => {
  try {
    const response = await axios.get(`/chat/files`);
    if(response.data.success) {
      files.value = response.data.data;
    }
  } catch(error) {
    console.error('파일 목록을 불러오는 중 오류 발생: ', error);
  }
}

onMounted(getFiles);

// 검색된 파일 필터링
const filteredFiles = computed (() =>
    files.value.filter((file) =>
        file.attachment.originName.toLowerCase().includes(searchTerm.value.toLowerCase())
        || file.senderUserName.toLowerCase().includes(searchTerm.value.toLowerCase())
        || file.createdAt.includes(searchTerm.value)
    )
);
</script>

<template>
  <div class="file-container">
    <!-- 헤더 -->
    <div class="chat-header-column">
      <div class="chat-header">
        <h2>파일함</h2>
      </div>
  
      <!-- 검색창 -->
      <div class="search-bar">
        <input
            type="text"
            v-model="searchTerm"
            placeholder="이름/파일/날짜 검색"
            class="search-input"
        />
      </div>
    </div>

    <!-- 파일 테이블 -->
    <div class="file-content">
      <table class="file-table">
        <thead>
          <tr>
            <th>구분</th>
            <th>파일명</th>
            <th>보낸 사람</th>
            <th>날짜</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="file in filteredFiles" :key="file.messageSeq">
            <td>{{ file.type === 'image' ? '사진' : '문서' }}</td>
            <td>
              <a :href="file.attachment.url" target="_blank" rel="noopener noreferrer">
                {{ file.attachment.originName }}
              </a>
            </td>
            <td>{{ `${file.senderUserName} ${file.rankingName}` }}</td>
            <td>{{ file.createdAt }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* 전체 컨테이너 */
.file-container {
  position: absolute;
  padding: 20px;
  height: 600px;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.chat-header-column {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 5px 0;
}

.chat-header h2 {
  margin: 0;
}

/* 검색창 */
.search-bar {
  padding: 10px 0px;
  margin-top: 10px;
}

.search-input {
  width: 90%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* 테이블 */
.file-content {
  overflow-y: auto;
}

.file-table {
  width: 100%;
  border-collapse: collapse;
}

.file-table th,
.file-table td {
  padding:8px;
  text-align: left;
}

.file-table th {
  background-color: #D9D9D9;
  white-space: nowrap; /* 텍스트를 한 줄로 강제 표시 */
  font-size: 15px;
  position: sticky;
  top: -1px;
}

.file-table td {
  font-size: 14px;
}

.file-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.file-table tr:hover {
  background-color: #f1f1f1;
}

.file-table a {
  color: #333;
  text-decoration: none;
}

.file-table a:hover {
  text-decoration: underline;
}
</style>