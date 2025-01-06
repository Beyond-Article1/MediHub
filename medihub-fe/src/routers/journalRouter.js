import BestJournalView from "@/views/journal/BestJournalView.vue";
import MediH from "@/views/journal/MediH.vue";
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
        // BEST 100 논문 조회
        path: '/journal/best',
        component: BestJournalView,
        name: "BestJournal",
        beforeEnter: loginGuard,
    },
    {
        // MediH 논문 AI
        path: '/journal/medi-h',
        component: MediH,
        name: "MediH",
        beforeEnter: loginGuard,
    },
];