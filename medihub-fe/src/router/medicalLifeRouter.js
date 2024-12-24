import Medical_Life from "@/views/medical_life/Medical_Life.vue";
import MedicalLifeDetail from "@/views/medical_life/MedicalLifeDetail.vue";
import MedicalLifeCreate from "@/views/medical_life/MedicalLifeCreate.vue";

export default [
    {
        path: "/medical_Life",
        name: "medical_Life",
        component: Medical_Life,
    },
    {

        path: '/medical_Life/:id',
        name: 'MedicalLifeDetail',
        component: MedicalLifeDetail
    },
    {
        path: '/medical_Life/create',
        name: 'MedicalLifeCreate',
        component: MedicalLifeCreate
    },
];