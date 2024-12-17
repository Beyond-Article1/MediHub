<template>
  <div class="case-editor">
    <div id="editor"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import EditorJS from "@editorjs/editorjs";

// 플러그인 임포트
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Table from "@editorjs/table";
import CodeTool from "@editorjs/code";
import LinkTool from "@editorjs/link";
import Marker from "@editorjs/marker";
import Paragraph from "@editorjs/paragraph";
import ImageTool from "@editorjs/image";

let editorInstance;
const images = ref([]); // 업로드할 이미지 파일 저장

onMounted(() => {
  editorInstance = new EditorJS({
    holder: "editor",
    placeholder: "내용을 입력하세요.",
    tools: {
      paragraph: {
        class: Paragraph,
        inlineToolbar: true,
      },
      header: {
        class: Header,
        config: {
          placeholder: "제목을 입력하세요",
          levels: [2, 3, 4],
          defaultLevel: 3,
        },
      },
      list: {
        class: List,
        inlineToolbar: true,
      },
      table: Table, // 표
      code: CodeTool, // 코드 블록
      marker: Marker, // 형광펜
      link: LinkTool, // 링크 삽입
      image: {
        class: ImageTool,
        config: {
          uploader: {
            uploadByFile: async (file) => {
              // 이미지 업로드 처리
              const blobUrl = URL.createObjectURL(file);

              // 이미지 파일 저장
              images.value.push(file);

              // Editor.js에 미리보기 URL 반환
              return {
                success: 1,
                file: {
                  url: blobUrl, // Blob URL로 에디터에 표시
                },
              };
            },
          },
        },
      },
    },
  });
});

// 저장 시 데이터와 이미지 전송
const getFormData = async () => {
  const editorData = await editorInstance.save();
  const formData = new FormData();

  // 데이터 추가
  formData.append(
      "data",
      JSON.stringify({
        user: 1,
        title: "이미지 테스트 글",
        content: editorData.blocks
            .map((block) => block.data.text || "")
            .join("\n"),
        keywords: ["string"],
      })
  );

  // 이미지 파일 추가
  images.value.forEach((file, index) => {
    formData.append("images", file, `img-${index + 1}`);
  });

  return formData;
};

// 부모 컴포넌트에서 호출 가능하도록 노출
defineExpose({ getFormData });
</script>

<style scoped>
:deep(.ce-block__content) {
  max-width: 1000px !important; /* 최대 폭을 1000px로 고정 */
  margin: 0 auto; /* 내용 중앙 정렬 */
}

:deep(.ce-toolbar__content){
  max-width: 1000px !important; /* 최대 폭을 1000px로 고정 */
}
.case-editor {
  width: 100%; /* 전체 폭을 차지하도록 설정 */
  max-width: 1200px; /* 원하는 최대 너비 설정 */
  margin: 0 auto; /* 가운데 정렬 */
  padding: 20px;
  box-sizing: border-box;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

#editor {
  width: 100%; /* 에디터 너비를 부모 컨테이너에 맞춤 */
  min-height: 500px; /* 높이 설정 */
}
</style>
