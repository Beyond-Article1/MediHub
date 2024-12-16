import {defineStore} from "pinia";
import {onMounted, ref} from "vue";

export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref(null);
    const refreshToken = ref(null);
    const userRole = ref(null);
    const isLogined = ref(false);

    onMounted(() => {
        let item = localStorage.getItem('accessToken');
        if (item){
            accessToken.value = item;
        }
    })

    // JWT 토큰 디코딩 유틸리티 함수
    function decodeToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log("[AuthStore] Decoded payload: ", payload); // 디코딩된 payload 확인
            return payload;
        } catch (error) {
            console.error("[AuthStore] 디코딩 에러: ", error);
            return null;
        }
    }

    // 로그인 처리
    function login(token, refresh) {
        console.log("[AuthStore] token: ", token); // 로그인 디버깅
        isLogined.value = true;
        accessToken.value = token;
        refreshToken.value = refresh
        localStorage.setItem('accessToken', token);

        const payload = decodeToken(token);
        if (payload) {
            userRole.value = payload.auth[0]; // `auth`에서 역할 설정
            console.log("[AuthStore] login:" , userRole.value); // 디버깅
        }
    }

    // 로그아웃 처리
    function logout() {
        console.log("[AuthStore] Logout"); // 로그아웃 디버깅
        isLogined.value = false;
        accessToken.value = null;
        refreshToken.value = null;
        userRole.value = null;
        localStorage.removeItem('accessToken');
    }

    // 권한 확인
    function isAuthorized(requiredRole) {
        console.log("[AuthStore] role: ", requiredRole); // 권한 확인 디버깅
        if (!userRole.value) return false;
        return userRole.value === requiredRole; // 역할 비교
    }

    return {
        accessToken,
        refreshToken,
        userRole,
        login,
        logout,
        isAuthorized,
        isLogined,
    };
})