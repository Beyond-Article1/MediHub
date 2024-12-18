import CpMain from "@/views/cp/CpMain.vue";
import CpDetail from "@/views/cp/CpDetail.vue";
import CpListBody from "@/components/cp/CpListBody.vue";
import CpOpinionRegister from "@/views/cp/CpOpinionRegister.vue";

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
        name: 'CpOpinionRegister',
        component: CpOpinionRegister
    }
];
