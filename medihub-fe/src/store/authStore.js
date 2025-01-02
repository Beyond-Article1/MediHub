import {defineStore} from "pinia";
import {onMounted, onUnmounted, ref} from "vue";
import axios from "axios";

export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref(null);
    const refreshToken = ref(null);
    const userSeq = ref(null);
    const userRole = ref(null);
    const isLogined = ref(false);
    const userInfo = ref({
        userId: null,
        userName: null,
        rankingName: null,
        partName: null,
        userEmail: null,
        userPhone: null,
        profileImage: null,
    });

    const clearStorageOnUnload = () => {
        window.addEventListener("beforeunload", () => {
            console.log("[AuthStore] 브라우저 닫힘 또는 새로고침 이벤트 발생");
            localStorage.clear();
            console.log("[AuthStore] localStorage 초기화 완료");
        });
    };

    const removeUnloadListener = () => {
        window.removeEventListener("beforeunload", clearStorageOnUnload);
    };

    onMounted(async () => {
        clearStorageOnUnload();

        const access = localStorage.getItem('accessToken');
        const refresh = localStorage.getItem('refreshToken');

        if (access) accessToken.value = access;
        if (refresh) {
            refreshToken.value = refresh;

            if (refreshTokenExpired()) {
                console.warn("Refresh Token 만료. 로그아웃 처리.");
                await logout();
                return;
            }
        }

        if (access && decodeToken(access)?.exp * 1000 < Date.now()) {
            try {
                await reissueTokens(refresh);
            } catch (error) {
                console.error("토큰 재발급 실패:", error);
                await logout();
            }
        }
    });

    onUnmounted(() => {
        removeUnloadListener();
    });

    // JWT 토큰 디코딩 유틸리티 함수
    function decodeToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log("[AuthStore] Decoded payload: ", payload);
            return payload;
        } catch (error) {
            console.error("[AuthStore] 디코딩 에러: ", error);
            return null;
        }
    }

    // 로그인 처리
    function login(token, refresh) {
        console.log("[AuthStore] 로그인 처리 시작");
        console.log("[AuthStore] AccessToken:", token);
        console.log("[AuthStore] RefreshToken:", refresh);

        isLogined.value = true;
        accessToken.value = token;
        refreshToken.value = refresh;

        // 로컬 스토리지에 저장
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refresh);

        const payload = decodeToken(token);
        if (payload) {
            userRole.value = payload.auth;
            userSeq.value = payload.userSeq;
            console.log("[AuthStore] userRole:" , userRole.value);
            console.log("[AuthStore] userSeq:" , userSeq.value);
        }

        localStorage.setItem('userRole', userRole.value);
        localStorage.setItem('userSeq', userSeq.value);
    }

    function refreshTokenExpired() {
        const expirationTime = localStorage.getItem('refreshTokenExpiration');
        console.log("[AuthStore] Refresh Token 만료 시간:", expirationTime);
        return expirationTime && Date.now() > Number(expirationTime);
    }

    async function reissueTokens(refresh) {
        try {
            const response = await axios.post("/api/v1/token/reissue", null, {
                headers: { "Refresh-Token": refresh },
            });

            const newAccessToken = response.headers["access-token"];
            const newRefreshToken = response.headers["refresh-token"];
            const refreshTokenExpiration = response.headers["refresh-token-expiration"];

            if (newAccessToken && newRefreshToken && refreshTokenExpiration) {
                login(newAccessToken, newRefreshToken);
                localStorage.setItem('refreshTokenExpiration', refreshTokenExpiration);
            } else {
                throw new Error("토큰 재발급 실패");
            }
        } catch (error) {
            console.error("[AuthStore] 토큰 재발급 실패:", error);
            throw error;
        }
    }


    function setUserInfo(data) {
        userInfo.value = {
            userId: data.userId,
            userName: data.userName,
            rankingName: data.rankingName,
            partName: data.partName,
            userEmail: data.userEmail,
            userPhone: data.userPhone,
            profileImage: data.profileImage || null,
        };
        console.log("[AuthStore] 사용자 정보 저장:", userInfo.value);
    }

    // 로그아웃 처리
    async function logout() {
        console.log("[AuthStore] Logout 시작");

        try {
            if (accessToken.value) {
                // 로그아웃 API 호출
                await axios.post("/api/v1/token/logout", {}, {
                    headers: {
                        Authorization: `Bearer ${accessToken.value}`,
                    },
                });
                console.log("[AuthStore] 로그아웃 API 호출 성공");
            }
        } catch (error) {
            console.error("[AuthStore] 로그아웃 API 호출 실패:", error.response || error.message);
        }

        isLogined.value = false;
        accessToken.value = null;
        refreshToken.value = null;
        userSeq.value = null;
        userRole.value = null;
        userInfo.value = { userId: null, userName: null, rankingName: null, partName: null, userEmail: null, userPhone: null, profileImage: null };

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.clear();
    }

    // 권한 확인
    function isAuthorized(requiredRole) {
        console.log("[AuthStore] role: ", requiredRole);
        if (!userRole.value) return false;
        return userRole.value === requiredRole;
    }

    return {
        accessToken,
        refreshToken,
        userSeq,
        userRole,
        login,
        logout,
        isAuthorized,
        isLogined,
        userInfo,
        setUserInfo,
    };
})