import MyJournalView from "@/views/mypage/MyJournalView.vue";
import MedicalLifeView from "@/views/mypage/MedicalLifeView.vue";
import AnonymousBoardView from "@/views/mypage/AnonymousBoardView.vue";
import CPView from "@/views/mypage/CPView.vue";
import FollowMemberView from "@/views/mypage/FollowMemberView.vue";
import MyCaseSharingView from "@/views/mypage/MyCaseSharingView.vue";
import {useAuthStore} from "@/stores/authStore.js";

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
        path: "/myPage/journal",
        name: "MyJournalView",
        component: MyJournalView,
        beforeEnter: loginGuard,
    },
    {
        path: "/myPage/CaseSharing",
        name: "CaseSharingView",
        component: MyCaseSharingView,
        beforeEnter: loginGuard,
    },
    {
        path: "/myPage/MedicalLife",
        name: "MedicalLifeView",
        component: MedicalLifeView,
        beforeEnter: loginGuard,
    },
    {
        path: "/myPage/anonymousboard",
        name: "AnonymousBoardView",
        component: AnonymousBoardView,
        beforeEnter: loginGuard,
    },
    {
        path: "/myPage/CP",
        name: "CPView",
        component: CPView,
        beforeEnter: loginGuard,
    },
    {
        path: "/myPage/followmember",
        name: "FollowMemberView",
        component: FollowMemberView,
        beforeEnter: loginGuard,
    },

];

