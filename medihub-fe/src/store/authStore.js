import {defineStore} from "pinia";
import {onMounted, ref} from "vue";
import axios from "axios";

export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref(null);
    const refreshToken = ref(null);
    const userSeq = ref(null);
    const userRole = ref(null);
    const isLogined = ref(false);
    const userInfo = ref(
        JSON.parse(localStorage.getItem('userInfo')) || {
            userId: null,
            userName: null,
            rankingName: null,
            partName: null,
            userEmail: null,
            userPhone: null,
            profileImage: null,
        }
    );

    onMounted(async () => {

        const access = localStorage.getItem('accessToken');
        const refresh = localStorage.getItem('refreshToken');

        if (access) {
            accessToken.value = access;
            isLogined.value = true;
        }
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

        if (access) {
            await fetchUserInfo(); // API를 통해 사용자 정보 불러오기
        }
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
    async function login(token, refresh) {
        console.log("[AuthStore] 로그인 처리 시작");

        isLogined.value = true;
        accessToken.value = token;
        refreshToken.value = refresh;

        // 로컬 스토리지에 저장
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem("isLogined", "true");

        const payload = decodeToken(token);
        if (payload) {
            userRole.value = payload.auth;
            userSeq.value = payload.userSeq;

            localStorage.setItem('userRole', userRole.value);
            localStorage.setItem('userSeq', userSeq.value);
        }

        // 로그인 시 사용자 정보 API 호출
        await fetchUserInfo();
    }

    // 사용자 정보 API 호출
    async function fetchUserInfo() {
        try {
            const response = await axios.get("/v1/users", {
                headers: {
                    Authorization: `Bearer ${accessToken.value}`,
                },
            });

            if (response.data && response.data.success) {
                setUserInfo(response.data.data);
            } else {
            }
        } catch (error) {
        }

        localStorage.setItem('userRole', userRole.value);
        localStorage.setItem('userSeq', userSeq.value);
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
    }

    function refreshTokenExpired() {
        const expirationTime = localStorage.getItem('refreshTokenExpiration');
        return expirationTime && Date.now() > Number(expirationTime);
    }

    async function reissueTokens(refresh) {
        try {
            const response = await axios.post("/v1/token/reissue", null, {
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

    // 로그아웃 처리
    async function logout() {
        console.log("[AuthStore] Logout 시작");

        try {
            if (accessToken.value) {
                // 로그아웃 API 호출
                await axios.post("/v1/token/logout", {}, {
                    headers: {
                        Authorization: `Bearer ${accessToken.value}`,
                    },
                });
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
        fetchUserInfo,
        refreshTokenExpired,
        reissueTokens,

    };
});
