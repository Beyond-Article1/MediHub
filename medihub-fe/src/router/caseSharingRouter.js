import CaseSharingListView from "@/views/case_sharing/case_sharing/CaseSharingListView.vue";
import CaseSharingTemplate from "@/views/case_sharing/template/TemplateListView.vue";
import CaseSharingDetailView from "@/views/case_sharing/case_sharing/CaseSharingDetailView.vue";
import CaseSharingEditView from "@/views/case_sharing/case_sharing/CaseSharingEditView.vue";
import CaseSharingCreate from "@/views/case_sharing/case_sharing/CaseSharingCreateView.vue";

export default [
    {
        path: '/case_sharing',
        name: 'CaseSharingList',
        component: CaseSharingListView,
    },
    {
        path: '/case_sharing_create/:id',
        name: 'CaseSharingCreate',
        component: CaseSharingCreate,

    },
    {
        path: '/case_sharing/template',
        name: 'TemplateListView',
        component: CaseSharingTemplate,
    },
    {
        path: '/case_sharing/:id',
        name: 'CaseSharingDetailView',
        component: CaseSharingDetailView,
    },
    {
        path: '/case_sharing/edit/:id',
        name: 'CaseSharingEditView',
        component: CaseSharingEditView,
    },
];