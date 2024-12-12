import CpMain from "@/views/cp/CpMain.vue";
import CpDetail from "@/views/cp/CpDetail.vue";

export default [
    {
        path: '/cp',
        name: 'CpMainPage',
        component: CpMain,
        children: [
            {
                path: '/:cpVersionSeq',
                name: 'CpDetailPage',
                component: CpDetail
            }
        ]
    }
]