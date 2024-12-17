import CaseSharingListView from "@/views/case_sharing/case_sharing/CaseSharingListView.vue";
import CaseSharingCreate from "@/views/case_sharing/case_sharing/CaseSharingCreate.vue";
import CaseSharingTemplate from "@/views/case_sharing/template/TemplateListView.vue";

export default [
    {
        path: '/case_sharing',
        name: 'CaseSharingList',
        component: CaseSharingListView,
    },
    {
        path: '/case_sharing_create',
        name: 'CaseSharingCreate',
        component: CaseSharingCreate,

    },
    {
        path: '/case_sharing/template',
        name: 'TemplateListView',
        component: CaseSharingTemplate,
    },
];