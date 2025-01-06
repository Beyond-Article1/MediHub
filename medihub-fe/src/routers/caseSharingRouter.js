import CaseSharingListView from "@/views/case_sharing/case_sharing/CaseSharingListView.vue";
import CaseSharingTemplate from "@/views/case_sharing/template/TemplateListView.vue";
import CaseSharingDetailView from "@/views/case_sharing/case_sharing/CaseSharingDetailView.vue";
import CaseSharingEditView from "@/views/case_sharing/case_sharing/CaseSharingEditView.vue";
import CaseSharingCreate from "@/views/case_sharing/case_sharing/CaseSharingCreateView.vue";
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
        path: '/case_sharing',
        name: 'CaseSharingList',
        component: CaseSharingListView,
        beforeEnter: loginGuard,
    },
    {
        path: '/case_sharing_create/:id',
        name: 'CaseSharingCreate',
        component: CaseSharingCreate,
        beforeEnter: loginGuard,
    },
    {
        path: '/case_sharing/template',
        name: 'TemplateListView',
        component: CaseSharingTemplate,
        beforeEnter: loginGuard,
    },
    {
        path: '/case_sharing/:id',
        name: 'CaseSharingDetailView',
        component: CaseSharingDetailView,
        beforeEnter: loginGuard,
    },
    {
        path: '/case_sharing/edit/:id',
        name: 'CaseSharingEditView',
        component: CaseSharingEditView,
        beforeEnter: loginGuard,
    },
];