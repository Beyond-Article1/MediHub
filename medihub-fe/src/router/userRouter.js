import User from '@/views/user/UserDetail.vue';
import AllUser from "@/views/user/AllUser.vue";
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
        path: "/userDetail",
        name: "UserDetail",
        component: User,
        beforeEnter: loginGuard,
    },
    {
        path: "/AllUser",
        name: "AllUser",
        component: AllUser,
        beforeEnter: loginGuard,
    }
];