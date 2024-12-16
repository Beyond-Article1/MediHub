import CpMain from "@/views/cp/CpMain.vue";
import CpDetail from "@/views/cp/CpDetail.vue";

export default [
    {
        path: '/cp/',
        name: 'CpMainPage',
        component: CpMain,
    },
    {
        path: '/cp/:cpVersionSeq',
        name: 'CpDetailPage',
        component: CpDetail,
        props: true
    }
]