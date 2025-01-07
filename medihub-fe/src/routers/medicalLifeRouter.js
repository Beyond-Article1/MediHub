import Medical_Life from "@/views/medical_life/Medical_Life.vue";
import MedicalLifeDetail from "@/views/medical_life/MedicalLifeDetail.vue";
import MedicalLifeCreate from "@/views/medical_life/MedicalLifeCreate.vue";
import MedicalLifeEdit from "@/views/medical_life/MedicalLifeEdit.vue";
import {useAuthStore} from "@/stores/authStore.js";

const loginGuard= (to, from, next) => {
    const authStore = useAuthStore();

    if (authStore.isLogined) {
        next();
    } else {
        alert("로그인 후 접근할 수 있습니다.");
        next("/login");
    }
};

export default [
    {
        path: "/medicalLife",
        name: "medical_Life",
        component: Medical_Life,
        beforeEnter: loginGuard,
    },
    {

        path: '/medicalLife/:id',
        name: 'MedicalLifeDetail',
        component: MedicalLifeDetail,
        beforeEnter: loginGuard,
    },
    {
        path: '/medicalLife/create',
        name: 'MedicalLifeCreate',
        component: MedicalLifeCreate,
        beforeEnter: loginGuard,
    },
    {
        path: '/medicalLife/edit/:id',
        name: 'MedicalLifeEdit',
        component: MedicalLifeEdit,
        beforeEnter: loginGuard,
    },
];