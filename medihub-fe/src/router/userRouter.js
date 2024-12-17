import User from '@/views/user/UserDetail.vue';
import AllUser from "@/views/user/AllUser.vue";

export default [
    {
        path: "/userDetail",
        name: "UserDetail",
        component: User,
    },
    {
        path: "/AllUser",
        name: "AllUser",
        component: AllUser,
    }
];