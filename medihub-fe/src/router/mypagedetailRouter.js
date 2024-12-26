import MyJournalView from "@/views/mypage/MyJournalView.vue";
import MedicalLifeView from "@/views/mypage/MedicalLifeView.vue";
import AnonymousBoardView from "@/views/mypage/AnonymousBoardView.vue";
import CPView from "@/views/mypage/CPView.vue";
import FollowMemberView from "@/views/mypage/FollowMemberView.vue";
import MyCaseSharingView from "@/views/mypage/MyCaseSharingView.vue";

export default [
    {
        path: "/myPage/journal",
        name: "MyJournalView",
        component: MyJournalView,
    },
    {
        path: "/myPage/CaseSharing",
        name: "CaseSharingView",
        component: MyCaseSharingView,
    },
    {
        path: "/myPage/MedicalLife",
        name: "MedicalLifeView",
        component: MedicalLifeView,
    },
    {
        path: "/myPage/anonymousboard",
        name: "AnonymousBoardView",
        component: AnonymousBoardView,
    },
    {
        path: "/myPage/CP",
        name: "CPView",
        component: CPView,
    },
    {
        path: "/myPage/followmember",
        name: "FollowMemberView",
        component: FollowMemberView,
    },

];

