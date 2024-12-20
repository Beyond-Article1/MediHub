import BestJournalView from "@/views/journal/BestJournalView.vue";
import MediH from "@/views/journal/MediH.vue";

export default [
    {
        // BEST 100 논문 조회
        path: '/journal/best',
        component: BestJournalView
    },
    {
        // MediH 논문 AI
        path: '/journal/medi-h',
        component: MediH
    },
];