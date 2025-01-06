import Main from "@/views/main/Main.vue";
import {useAuthStore} from "@/store/authStore.js";

const loginGuard= (to, from, next) => {
    const authStore = useAuthStore();

    if (authStore.isLogined) {
        next();
    } else {
        alert("로그인 후 접근할 수 있습니다.");
        next("/login");
    }
};

export default [
    {
        path: "/main",
        name: "Main",
        component: Main,
        beforeEnter: loginGuard,
    },
];
