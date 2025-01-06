import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from "axios";

export const useChatStore = defineStore('chat', () => {
    const chatrooms = ref([]);          // 사용자가 참여 중인 전체 채팅방 목록
    const openedChatrooms = ref([]);    // 현재 창이 열려 있는 채팅방 목록

    // 채팅방 목록 가져오기
    const setChatrooms = (newChatrooms) => {
        chatrooms.value = newChatrooms;
    }

    // 새로운 채팅방 추가
    const addChatroom = async (chatroomSeq) => {
        try {
            // 채팅방 상세 정보 호출
            const response = await axios.get(`/chatroom/${chatroomSeq}`);
            const chatroom = response.data.data;

            // 전체 채팅방 목록에 추가
            if(!chatrooms.value.some((room) => room.chatroomSeq === chatroom.chatroomSeq)) {
                chatrooms.value.push(chatroom);
            }

            // 열린 채팅방 목록에 추가
            if(!openedChatrooms.value.some((room) => room.chatroomSeq === chatroom.chatroomSeq)) {
                openedChatrooms.value.push(chatroom);
            }
        } catch(error) {
            console.error(`채팅방 ${chatroomSeq} 정보를 불러오는 중 오류가 발생했습니다.`, error);
        }
    }

    // 대화상대 초대 후 해당 채팅방 데이터 업데이트
    const updateChatroomUsers = (updatedRoom) => {
        // 전체 채팅방 목록 업데이트
        const chatIndex = chatrooms.value.findIndex((room) => room.chatroomSeq === updatedRoom.chatroomSeq);
        if(chatIndex !== -1) {
            chatrooms.value[chatIndex] = {...chatrooms.value[chatIndex], ...updatedRoom};
            //console.log(`채팅방 ${updatedRoom.chatroomSeq}이 chatrooms에서 업데이트되었습니다:`, chatrooms.value[chatIndex]);
        }

        // 열린 채팅방 목록에서 업데이트
        const openedIndex = openedChatrooms.value.findIndex((room) => room.chatroomSeq === updatedRoom.chatroomSeq);
        if (openedIndex !== -1) {
            openedChatrooms.value[openedIndex] = { ...openedChatrooms.value[openedIndex], ...updatedRoom };
            //console.log(`채팅방 ${updatedRoom.chatroomSeq}이 openedChatrooms에서 업데이트되었습니다:`, openedChatrooms.value[openedIndex]);
        }
    };

    // 채팅방 삭제
    const removeChatroom = (chatroomSeq) => {
        chatrooms.value = chatrooms.value.filter((room) => room.chatroomSeq !== chatroomSeq);
    };

    // 메시지 수신 시, 마지막 메시지 업데이트 & 채팅방 목록 정렬
    const updateChatroomLastMessage = (chatroomSeq, lastMessage, lastMessageTime) => {
        const chatroom = chatrooms.value.find((room) => room.chatroomSeq === chatroomSeq);
        if(chatroom) {
            // 마지막 메시지와 시간 업데이트
            chatroom.lastMessage = lastMessage;
            chatroom.lastMessageTime = lastMessageTime;

            // 열린 채팅방에 포함되지 않은 경우에만 안 읽은 메시지 수 증가
            const isChatroomOpened = openedChatrooms.value.some((room) => room.chatroomSeq === chatroomSeq);
            //console.log(`Is chatroom ${chatroomSeq} opened?`, isChatroomOpened);

            if (!isChatroomOpened) {
                chatroom.unreadMessageCount = (chatroom.unreadMessageCount ?? 0) + 1;
                //console.log(`Updated unread message count for chatroom ${chatroomSeq}:`, chatroom.unreadMessageCount);
            }

            // 채팅방 목록 정렬
            if (lastMessageTime > chatrooms.value[0]?.lastMessageTime) {
                chatrooms.value.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
            }

        } else {
            console.error(`채팅방 ${chatroomSeq}를 찾을 수 없습니다.`);
        }
    };

    // 열린 채팅방 추가
    const openChatroom = async (room) => {
        if(!openedChatrooms.value.find((r) => r.chatroomSeq === room.chatroomSeq)) {
            openedChatrooms.value.push(room);
        }

        // lastVisitedAt 업데이트
        try {
            await axios.put(`/chatroom/${room.chatroomSeq}/visit`);
            //console.log(`채팅방 ${room.chatroomSeq}의 lastVisitedAt 업데이트 완료`);

            // 안 읽은 메시지 수를 0으로 갱신
            const chatroom = chatrooms.value.find((r) => r.chatroomSeq === room.chatroomSeq);
            if (chatroom) {
                chatroom.unreadMessageCount = 0; // 로컬 상태 업데이트
                //console.log(`채팅방 ${room.chatroomSeq}의 안 읽은 메시지 수를 0으로 갱신`);
            }
        } catch (error) {
            console.error(`채팅방 ${room.chatroomSeq}의 lastVisitedAt 업데이트 중 오류 발생: `, error);
        }
    };

    // 열린 채팅방 닫기
    const closeChatroom = async (chatroomSeq) => {
        openedChatrooms.value = openedChatrooms.value.filter((room) => room.chatroomSeq !== chatroomSeq);

        // lastVisitedAt 업데이트
        try {
            await axios.put(`/chatroom/${chatroomSeq}/visit`);
            //console.log(`채팅방 ${chatroomSeq}의 lastVisitedAt 업데이트 완료`);
        } catch (error) {
            console.error(`채팅방 ${chatroomSeq}의 lastVisitedAt 업데이트 중 오류 발생: `, error);
        }
    };

    return {
        chatrooms,
        openedChatrooms,
        setChatrooms,
        addChatroom,
        updateChatroomUsers,
        removeChatroom,
        updateChatroomLastMessage,
        openChatroom,
        closeChatroom,
    };
});