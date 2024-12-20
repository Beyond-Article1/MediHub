import AdminUser from '@/views/admin/AdminUser.vue';
import AdminUserDetail from "@/views/admin/AdminUserDetail.vue";
import CreateUser from "@/views/admin/CreateUser.vue";
import PartManage from "@/views/admin/PartManage.vue";

export default [
    {
        path: "/AdminUser",
        name: "AdminUser",
        component: AdminUser,
    },
    {
        path: "/admin/users/:userSeq",
        name: "AdminUserDetail",
        component: AdminUserDetail,
    },
    {
        path: "/CreateUser",
        name: "CreateUser",
        component: CreateUser,
    },
    {
        path: "/PartManage",
        name: "PartManage",
        component: PartManage,
    }
];