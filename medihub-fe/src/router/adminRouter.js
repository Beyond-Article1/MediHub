import AdminUser from '@/views/admin/AdminUser.vue';
import AdminUserDetail from "@/views/admin/AdminUserDetail.vue";
import createUser from "@/views/admin/CreateUser.vue";
import PartManage from "@/views/admin/PartManage.vue";
import deptManage from "@/views/admin/DeptManage.vue";
import RankManage from "@/views/admin/RankManage.vue";
import {useAuthStore} from "@/store/authStore.js";

const adminGuard = (to, from, next) => {
    const authStore = useAuthStore();
    if (authStore.userRole === "ADMIN") {
        next();
    } else {
        alert("관리자만 접근할 수 있는 페이지입니다.");
        next("/main");
    }
};

const loginGuard= (to, from, next) => {
    const authStore = useAuthStore();

    if (authStore.isLogined) {
        next();
    } else {
        alert("관리자로 로그인 하세요.");
        next("/login");
    }
};

export default [
    {
        path: "/admin/user",
        name: "AdminUser",
        component: AdminUser,
        beforeEnter: adminGuard,loginGuard
    },
    {
        path: "/admin/users/:userSeq",
        name: "AdminUserDetail",
        component: AdminUserDetail,
        beforeEnter: adminGuard,loginGuard
    },
    {
        path: "/create/user",
        name: "createUser",
        component: createUser,
        beforeEnter: adminGuard,loginGuard
    },
    {
        path: "/deptManage",
        name: "deptManage",
        component: deptManage,
        beforeEnter: adminGuard,loginGuard
    },
    {
        path: "/partManage",
        name: "partManage",
        component: PartManage,
        beforeEnter: adminGuard,loginGuard
    },
    {
        path: "/rankManage",
        name: "rankManage",
        component: RankManage,
        beforeEnter: adminGuard,loginGuard
    },
];