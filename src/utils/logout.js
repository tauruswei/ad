import router from "../router/index";
import store from "../store/index";
import { userApi } from "@/api/request";

export const logout = function () {
    (async () => {
        await userApi.logout().then(() => {
            store.commit("removeToken", "");
            //store.commit("setRelogin",true);
            router.replace({
                //跳转到登录页面
                path: "/login",
                //query: { redirect: router.currentRoute.value.fullPath }, // 将跳转的路由path作为参数，登录成功后跳转到该路由
            });
        });
    })();
};
export const logoutR = function () {
    (async () => {
        await doLogout().then(() => {
        });
    })();
};