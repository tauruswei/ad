import { createStore } from "vuex";
import createPersistedstate from "vuex-persistedstate"

const store = createStore({
    state() {
        return {
            token: "",
            user: null,
            role: null,
            roles: [{ id: 0, name: "admin" }, { id: 1, name: "user" }],
            metaMask: null,
            balance: 0,
            fund:0,
            time: null,
            abi: null,
            cancelTokenArr: []
        }
    },
    mutations: {
        setToken(state, token) {
            // 第一个参数为 state 用于变更状态 登录
            localStorage.setItem("TOKEN", token);
            state.token = token;
        },
        removeToken(state) {
            // 退出登录
            localStorage.removeItem("TOKEN");
            state.token = "";
        },
        setUser(state, user) {
            state.user = user;
        },
        setRole(state, role) {
            state.role = role;
        },
        setTime(state, time) {
            state.time = time;
        },
        setRoles(state, roles) {
            state.roles = roles;
        },
        setMetaMask(state, metaMask) {
            state.metaMask = metaMask;
        },
        setBalance(state, balance) {
            state.balance = balance;
        },
        setFund(state, fund) {
            state.fund = fund;
        },
        setABI(state, abi) {
            state.abi = abi;
        },
        pushRequestToken(state, payload) {
            state.cancelTokenArr.push(payload.cancelToken)
        },
        clearRequestToken({ cancelTokenArr }) {
            cancelTokenArr.forEach(item => {
                if(item) item(499)
            })
            cancelTokenArr = []
        }
    },
    plugins: [
        createPersistedstate({
            key: 'pc-store', // 本地存储名字
        })
    ]
});
export default store;