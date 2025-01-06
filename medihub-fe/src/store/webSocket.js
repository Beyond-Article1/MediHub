import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import axios from "axios";

export const useWebSocketStore = defineStore('webSocket', ws => {
    const stompClient = ref(null);  // WebSocket Client 상태
    const isConnected = ref(false); // 연결 여부
    const subscriptions = ref({});  // 채팅방 구독 상태 저장
    const receivedMessages = ref([]);   // 수신된 메시지 목록
    const chatStore = useChatStore();

    // WebSocket 연결 서버 URL
    const socketUrl = window.location.protocol === 'https:'
        ? 'https://api.medihub.info/api/ws'
        : 'http://api.medihub.info/api/ws';

    /* 1. WebSocket 연결 함수 */
    function connectWebSocket() {
        console.log('WebSocket 연결 시도 중...');

        const authStore = useAuthStore();
        const token = authStore.accessToken;

        if (!token) {
            console.error('Access token is missing');
            return;
        }

        // STOMP Client 설정
        stompClient.value = new Client({
            webSocketFactory: () => new SockJS(socketUrl), // WebSocket 팩토리 함수
            connectHeaders: {
                Authorization: `Bearer ${token}`, // 인증 헤더
            },
            reconnectDelay: 5000, // 재연결 간격 (5초)
            heartbeatIncoming: 4000, // 서버에서 클라이언트로의 heartbeat (4초)
            heartbeatOutgoing: 4000, // 클라이언트에서 서버로의 heartbeat (4초)
        });

        // 연결 성공 시 콜백
        stompClient.value.onConnect = (frame) => {
            console.log('WebSocket 연결 성공:', frame);
            isConnected.value = true;

            // WebSocket 연결 후 사용자 채팅방 구독 요청
            getUserChatrooms();
        };

        // 연결 실패 또는 종료 시 콜백
        stompClient.value.onDisconnect = () => {
            console.log('WebSocket 연결 종료');
            isConnected.value = false;
        };

        stompClient.value.onStompError = (frame) => {
            console.error('STOMP 에러:', frame.headers['message']);
            console.error('추가 정보:', frame.body);
            alert('WebSocket 연결 중 문제가 발생했습니다.');
        };

        stompClient.value.activate(); // WebSocket 연결 활성화
    }

    // 사용자가 참여하고 있는 채팅방 조회 후 구독 요청
    const getUserChatrooms = async () => {
        try {
            const authStore = useAuthStore();
            const response = await axios.get("/chatroom", {
                headers: {
                    'Authorization': `Bearer ${authStore.accessToken}`,
                }
            });

            const userChatrooms = response.data.data;  // 사용자 채팅방 리스트 받아오기
            //console.log("사용자가 참여한 채팅방 리스트:", userChatrooms);

            userChatrooms.forEach((chatroom) => {
                const chatroomSeq = chatroom.chatroomSeq;
                subscribeChatroom(chatroomSeq);     // 채팅방 구독 요청
            });

            userChatrooms.sort((a,b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
            chatStore.setChatrooms(userChatrooms);
        } catch (error) {
            console.error("채팅방 목록을 가져오는 데 실패했습니다:", error);
            alert("채팅방 목록을 가져오는 데 실패했습니다. 다시 시도해주세요.");
        }
    };

    /* 2. WebSocket 연결 종료 함수 */
    function disconnectWebSocket() {
        if (stompClient.value) {
            console.log('모든 구독 정보 해제 및 초기화 중...');
            Object.keys(subscriptions.value).forEach((chatroomSeq) => {
                unsubscribeChatroom(chatroomSeq);
            });
            subscriptions.value = {};   // 구독 정보 초기화

            // WebSocket 비활성화
            stompClient.value.deactivate();
            isConnected.value = false;

            console.log('웹소켓 연결 종료');
        }
    }

    /* 3. 채팅방 구독 함수 */
    function subscribeChatroom(chatroomSeq) {
        if(!stompClient.value || !isConnected.value) {
            console.error('WebSocket이 연결되지 않았습니다.');
            return;
        }

        if (subscriptions.value[chatroomSeq]) {
            // console.log(`채팅방 ${chatroomSeq}은 이미 구독 중입니다.`);
            return;
        }

        try {
            const subscription = stompClient.value.subscribe(
                `/subscribe/${chatroomSeq}`,
                (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    receivedMessages.value.push(receivedMessage);

                    // 오래된 메시지 제거 (최대 100개 유지)
                    if (receivedMessages.value.length > 100) {
                        receivedMessages.value.shift();
                    }
                    console.log(`채팅방 ${chatroomSeq}의 새 메시지: `, receivedMessage);

                    // 채팅방 목록 화면 업데이트
                    if (receivedMessage.type !== 'delete') {
                        chatStore.updateChatroomLastMessage(
                            chatroomSeq,
                            receivedMessage.message,
                            receivedMessage.createdAt
                        )
                    }
                }
            );

            subscriptions.value[chatroomSeq] = subscription; // 구독 객체 저장
            // console.log(`채팅방 ${chatroomSeq}을 구독했습니다.`);
        } catch(error) {
            console.error(`채팅방 ${chatroomSeq} 구독 중 오류 발생: `, error);
        }
    }

    /* 4. 채팅방 구독 해제 함수 */
    function unsubscribeChatroom(chatroomSeq) {
        if (subscriptions.value[chatroomSeq]) {
            subscriptions.value[chatroomSeq].unsubscribe(); // 구독 해제
            delete subscriptions.value[chatroomSeq]; // 구독 객체에서 삭제
            console.log(`채팅방 ${chatroomSeq}의 구독을 해제했습니다.`);
        } else {
            console.error(`채팅방 ${chatroomSeq}에 대한 구독 정보가 존재하지 않습니다.`);
        }
    }

    return {
        stompClient,
        isConnected,
        receivedMessages,
        getUserChatrooms,
        connectWebSocket,
        disconnectWebSocket,
        subscribeChatroom,
        unsubscribeChatroom
    };
});
