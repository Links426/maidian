import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "index",
    component: () => import("../index.vue"),
  },
  {
    path: "/main",
    name: "main",
    component: () => import("../main.vue"),
  },
];
// lastHref 前一个页面的路由
let lastHref = document.location.href;

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
