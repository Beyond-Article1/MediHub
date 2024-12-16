import CpMain from "@/views/cp/CpMain.vue";
import CpDetail from "@/views/cp/CpDetail.vue";
import CpBody from "@/components/cp/CpBody.vue";

export default [
    {
        path: '/cp/',
        name: 'CpMainPage',
        component: CpMain,
        children: [
            {
                path: '',
                name: 'CpList',
                component: CpBody,
            },
            {
                path: ':cpVersionSeq',
                name: 'CpDetailPage',
                component: CpDetail,
                props: true
            }
        ]
    }
];
