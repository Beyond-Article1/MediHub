import AnonymousBoardListView from "@/views/anonymousBoard/AnonymousBoardListView.vue";
import AnonymousBoardDetailView from "@/views/anonymousBoard/AnonymousBoardDetailView.vue";
import AnonymousBoardCreateView from "@/views/anonymousBoard/AnonymousBoardCreateView.vue";
import AnonymousBoardEditView from "@/views/anonymousBoard/AnonymousBoardEditView.vue";
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
        path: '/anonymous-board',
        name: 'AnonymousBoardList',
        component: AnonymousBoardListView,
        beforeEnter: loginGuard,
    },
    {
        path: '/anonymous-board/:id',
        name: 'AnonymousBoardDetail',
        component: AnonymousBoardDetailView,
        beforeEnter: loginGuard,
    },
    {
        path: '/anonymous-board/create',
        name: 'AnonymousBoardCreate',
        component: AnonymousBoardCreateView,
        beforeEnter: loginGuard,
    },
    {
        path: '/anonymous-board/edit/:id',
        name: 'AnonymousBoardEdit',
        component: AnonymousBoardEditView,
        beforeEnter: loginGuard,
    }
];