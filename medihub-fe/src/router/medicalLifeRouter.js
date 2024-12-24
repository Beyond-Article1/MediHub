import Medical_Life from "@/views/medical_life/Medical_Life.vue";
import MedicalLifeDetail from "@/views/medical_life/MedicalLifeDetail.vue";
import MedicalLifeCreate from "@/views/medical_life/MedicalLifeCreate.vue";

export default [
    {
        path: "/medicalLife",
        name: "medical_Life",
        component: Medical_Life,
    },
    {

        path: '/medicalLife/:id',
        name: 'MedicalLifeDetail',
        component: MedicalLifeDetail
    },
    {
        path: '/medicalLife/create',
        name: 'MedicalLifeCreate',
        component: MedicalLifeCreate
    },
];