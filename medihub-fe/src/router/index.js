import {createRouter, createWebHistory} from "vue-router";

import journalRouter from "@/router/journalRouter.js";
import cpRouter from "@/router/cpRouter.js";
import caseSharingRouter from "@/router/caseShairngRouter.js";
import loginRouter from "@/router/loginRouter.js";
import mainRouter from "@/router/mainRouter.js";
import medicalLifeRouter from "@/router/medicalLifeRouter.js";
import userRouter from "@/router/userRouter.js";

const routes = [

    {
        path: "/", // 기본 경로
        redirect: "/login",
    },
    ...loginRouter,
    // CP 라우터
    ...cpRouter,
    ...caseSharingRouter,
    // 논문 라우터
    ...journalRouter,

    ...mainRouter,

    ...medicalLifeRouter,

    ...userRouter,

]

const router = createRouter({
    history: createWebHistory(),
    routes,
    // 라우팅 시 화면 최 상단으로 이동됨.
    scrollBehavior(to, from, savedPosition) {
        // savedPosition이 있는 경우(예: 뒤로 가기), 해당 위치로 이동
        if (savedPosition) {
            return savedPosition;
        } else {
            // 새로운 페이지 이동 시 맨 위로 스크롤
            return {top: 0};
        }
    },
})

export default router;