import { createRouter, createWebHistory } from "vue-router";

import journalRouter from "@/router/journalRouter.js";
import cpRouter from "@/router/cpRouter.js";
import caseSharingRouter from "@/router/caseSharingRouter.js";
import medicalLifeRouter from "@/router/medicalLifeRouter.js";
import userRouter from "@/router/userRouter.js";
import anonymousBoardRouter from "@/router/anonymousBoardRouter.js";
import loginRouter from "@/router/loginRouter.js";
import mainRouter from "@/router/mainRouter.js";
import testRouter from "@/router/testRouter.js";
import adminRouter from "@/router/adminRouter.js";

const routes = [

    {
        path: "/", // 기본 경로
        redirect: "/login",
    },
    // 논문 라우터
    ...journalRouter,
    // CP 라우터
    ...cpRouter,
    // 케이스 공유 라우터
    ...caseSharingRouter,
    // 메디컬 라이프 라우터
    ...medicalLifeRouter,
    // 직원 라우터
    ...userRouter,
    // 익명 게시판 라우터
    ...anonymousBoardRouter,
    ...loginRouter,
    ...mainRouter,
    ...adminRouter
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