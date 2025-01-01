import CpMain from "@/views/cp/cp/CpMain.vue";
import CpDetail from "@/views/cp/cp/CpDetail.vue";
import CpListBody from "@/components/cp/CpListBody.vue";
import CpOpinionRegister from "@/views/cp/cp_opinion/CpOpinionRegister.vue";
import CpOpinionDetail from "@/views/cp/cp_opinion/CpOpinionDetail.vue";
import CpOpinionUpdate from "@/views/cp/cp_opinion/CpOpinionUpdate.vue";
import CpSearchCategoryDataManagement from "@/views/cp/admin/CpSearchCategoryDataManagement.vue";
import CpSearchCategoryManagement from "@/views/cp/admin/CpSearchCategoryManagement.vue";

export default [
    {
        path: '/cp/',
        name: 'CpMainPage',
        component: CpMain,
        children: [
            {
                path: '',
                name: 'CpListPage',
                component: CpListBody,
            },
            {
                path: ':cpVersionSeq',
                name: 'CpDetailPage',
                component: CpDetail,
                props: true
            }
        ]
    }, {
        path: '/cp/:cpVersionSeq/cpOpinionLocation/:cpOpinionLocationSeq/cpOpinion',
        name: 'CpOpinionRegisterPage',
        component: CpOpinionRegister
    }, {
        path: '/cp/:cpVersionSeq/cpOpinionLocation/:cpOpinionLocationSeq/cpOpinion/:cpOpinionSeq',
        name: 'CpOpinionPage',
        component: CpOpinionDetail
    }, {
        path: '/cp/:cpVersionSeq/cpOpinionLocation/:cpOpinionLocationSeq/cpOpinion/:cpOpinionSeq/update',
        name: 'CpOpinionUpdatePage',
        component: CpOpinionUpdate
    }, {
        path: '/admin/cp/cpSearchCategoryData/management',
        name: 'CpSearchCategoryDataManagementPage',
        component: CpSearchCategoryDataManagement,
    }, {
        path: '/admin/cp/cpSearchCategory/management',
        name: 'CpSearchCategoryManagementPage',
        component: CpSearchCategoryManagement
    }
];
