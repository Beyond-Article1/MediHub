import CpMain from "@/views/cp/cp/CpMain.vue";
import CpDetail from "@/views/cp/cp/CpDetail.vue";
import CpListBody from "@/components/cp/CpListBody.vue";
import CpOpinionRegister from "@/views/cp/cp_opinion/CpOpinionRegister.vue";
import CpOpinionDetail from "@/views/cp/cp_opinion/CpOpinionDetail.vue";
import CpOpinionUpdate from "@/views/cp/cp_opinion/CpOpinionUpdate.vue";
import CpSearchCategoryDataManagement from "@/views/cp/admin/CpSearchCategoryDataManagement.vue";
import CpSearchCategoryManagement from "@/views/cp/admin/CpSearchCategoryManagement.vue";

import { useAuthStore } from "@/stores/authStore.js";

const cpUserGuard= (to, from, next) => {
    const authStore = useAuthStore();

    if (authStore.isLogined) {
        next(); // 로그인 상태이면 접근 허용
    } else {
        alert("로그인 후 접근할 수 있습니다."); // 경고 메시지
        next("/login"); // 로그인 페이지로 리다이렉트
    }
};

const cpAdminGuard= (to, from, next) => {
    const authStore = useAuthStore();

    if (authStore.userRole === "ADMIN") {
        next(); // 관리자 권한만 접근 허용
    } else {
        alert("관리자에게 문의하세요."); // 경고 메시지
    }
};

export default [
    {
        path: '/cp/',
        name: 'CpMainPage',
        component: CpMain,
        beforeEnter: cpUserGuard,
        children: [
            {
                path: '',
                name: 'CpListPage',
                component: CpListBody,
                beforeEnter: cpUserGuard,
            },
            {
                path: ':cpVersionSeq',
                name: 'CpDetailPage',
                component: CpDetail,
                props: true,
                beforeEnter: cpUserGuard,
            }
        ]
    }, {
        path: '/cp/:cpVersionSeq/cpOpinionLocation/:cpOpinionLocationSeq/cpOpinion',
        name: 'CpOpinionRegisterPage',
        component: CpOpinionRegister,
        beforeEnter: cpUserGuard,
    }, {
        path: '/cp/:cpVersionSeq/cpOpinionLocation/:cpOpinionLocationSeq/cpOpinion/:cpOpinionSeq',
        name: 'CpOpinionPage',
        component: CpOpinionDetail,
        beforeEnter: cpUserGuard,
    }, {
        path: '/cp/:cpVersionSeq/cpOpinionLocation/:cpOpinionLocationSeq/cpOpinion/:cpOpinionSeq/update',
        name: 'CpOpinionUpdatePage',
        component: CpOpinionUpdate,
        beforeEnter: cpUserGuard,
    }, {
        path: '/admin/cp/cpSearchCategoryData/management',
        name: 'CpSearchCategoryDataManagementPage',
        component: CpSearchCategoryDataManagement,
        beforeEnter: cpAdminGuard,
    }, {
        path: '/admin/cp/cpSearchCategory/management',
        name: 'CpSearchCategoryManagementPage',
        component: CpSearchCategoryManagement,
        beforeEnter: cpAdminGuard,
    }
];
