import AnonymousBoardListView from "@/views/anonymousBoard/AnonymousBoardListView.vue";
import AnonymousBoardDetailView from "@/views/anonymousBoard/AnonymousBoardDetailView.vue";
import AnonymousBoardCreateView from "@/views/anonymousBoard/AnonymousBoardCreateView.vue";
import AnonymousBoardEditView from "@/views/anonymousBoard/AnonymousBoardEditView.vue";

export default [
    {
        path: '/anonymous-board',
        name: 'AnonymousBoardList',
        component: AnonymousBoardListView
    },
    {
        path: '/anonymous-board/:id',
        name: 'AnonymousBoardDetail',
        component: AnonymousBoardDetailView
    },
    {
        path: '/anonymous-board/create',
        name: 'AnonymousBoardCreate',
        component: AnonymousBoardCreateView
    },
    {
        path: '/anonymous-board/edit/:id',
        name: 'AnonymousBoardEdit',
        component: AnonymousBoardEditView
    }
];