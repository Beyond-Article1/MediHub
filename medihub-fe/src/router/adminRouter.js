import AdminUser from '@/views/admin/AdminUser.vue';
import AdminUserDetail from "@/views/admin/AdminUserDetail.vue";
import createUser from "@/views/admin/CreateUser.vue";
import PartManage from "@/views/admin/PartManage.vue";
import deptManage from "@/views/admin/DeptManage.vue";
import RankManage from "@/views/admin/RankManage.vue";
import {useAuthStore} from "@/store/authStore.js";

const adminLoginGuard = (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isLogined) {
        // 로그인이 안 된 경우
        alert("관리자 이이디로 로그인 후 접근하세요.");
        next("/login");
    } else if (authStore.userRole !== "ADMIN") {
        // 관리자가 아닌 경우
        alert("관리자 권한이 없습니다.");
        next("/main");
    } else {
        next();
    }
};

export default [
    {
        path: "/admin/user",
        name: "AdminUser",
        component: AdminUser,
        beforeEnter: adminLoginGuard,
    },
    {
        path: "/admin/users/:userSeq",
        name: "AdminUserDetail",
        component: AdminUserDetail,
        beforeEnter: adminLoginGuard,
    },
    {
        path: "/create/user",
        name: "createUser",
        component: createUser,
        beforeEnter: adminLoginGuard,
    },
    {
        path: "/deptManage",
        name: "deptManage",
        component: deptManage,
        beforeEnter: adminLoginGuard,
    },
    {
        path: "/partManage",
        name: "partManage",
        component: PartManage,
        beforeEnter: adminLoginGuard,
    },
    {
        path: "/rankManage",
        name: "rankManage",
        component: RankManage,
        beforeEnter: adminLoginGuard,
    },
];