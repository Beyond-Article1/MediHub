import AdminUser from '@/views/admin/AdminUser.vue';
import AdminUserDetail from "@/views/admin/AdminUserDetail.vue";
import createUser from "@/views/admin/CreateUser.vue";
import PartManage from "@/views/admin/PartManage.vue";
import deptManage from "@/views/admin/DeptManage.vue";
import RankManage from "@/views/admin/RankManage.vue";

export default [
    {
        path: "/admin/user",
        name: "AdminUser",
        component: AdminUser,
    },
    {
        path: "/admin/users/:userSeq",
        name: "AdminUserDetail",
        component: AdminUserDetail,
    },
    {
        path: "/create/user",
        name: "createUser",
        component: createUser,
    },
    {
        path: "/deptManage",
        name: "deptManage",
        component: deptManage,
    },
    {
        path: "/partManage",
        name: "partManage",
        component: PartManage,
    },
    {
        path: "/rankManage",
        name: "rankManage",
        component: RankManage,
    },
];