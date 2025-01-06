import SearchAllView from "@/views/search/SearchAllView.vue";
import SearchCaseView from "@/views/search/SearchCaseView.vue";
import SearchLifeView from "@/views/search/SearchLifeView.vue";
import SearchBoardView from "@/views/search/SearchBoardView.vue";

export default [
    {
        path: "/search/result/all/:query",
        name: "SearchAll",
        component: SearchAllView
    },
    {
        path: "/search/result/case_sharing/:query",
        name: "SearchCase",
        component: SearchCaseView
    },
    {
        path: "/search/result/medical_life/:query",
        name: "SearchLife",
        component: SearchLifeView
    },
    {
        path: "/search/result/anonymous_board/:query",
        name: "SearchBoard",
        component: SearchBoardView
    }
];