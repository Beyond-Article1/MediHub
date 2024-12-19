import CpMain from "@/views/cp/cp/CpMain.vue";
import CpDetail from "@/views/cp/cp/CpDetail.vue";
import CpListBody from "@/components/cp/CpListBody.vue";
import CpOpinionRegister from "@/views/cp/CpOpinionRegister.vue";
import CpOpinionDetail from "@/views/cp/cp-opinion/CpOpinionDetail.vue";
import CpOpinionUpdate from "@/views/cp/CpOpinionUpdate.vue";

export default [
    {
        path: '/cp/',
        name: 'CpMainPage',
        component: CpMain,
        children: [
            {
                path: '',
                name: 'CpList',
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
        component: CpOpinionUpdate,
    }
];
