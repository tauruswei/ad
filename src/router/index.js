import { createRouter, createWebHistory } from "vue-router";
import store from "../store/index";
import Notfound from "@/components/page/404.vue";
const routes = [
  {
    path: "/",
    redirect: "/gb",
  },
  {
    path: "/404",
    name: "404",
    component: Notfound,
    meta: {
      title: "no found",
      route: "/404",
    }
  },
  {
    path: "/gb",
    name: "gb",
    component: () => import("@/views/gb/index.vue"),
    meta: {
      title: "Game Home",
      route: "/gb",
    },
  },
  {
    path: "/invite",
    name: "invite",
    component: () => import("@/views/invite.vue"),
    meta: {
      title: "Invite",
      route: "/invite",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
    document.title = 'Accout - Chess of Stars';
    store.commit("clearRequestToken");
    //进入登录页面的时候清除 token
    if (to.path == "/login" || to.path == "/register") {
      store.commit("setUser", null);
      store.commit("setRole", null);
      store.commit("removeToken", "");
      store.commit("setMetaMask", null);
    }
    if (to.meta.requireAuth) {
      let token = localStorage.getItem("TOKEN");
      // 判断该路由是否需要登录权限
      if (token !== "" && token !== null) {
        next();
      } else {
        next({
          path: "/login",
        });
      }
    } else {
      next();
    }
});

export default router;
