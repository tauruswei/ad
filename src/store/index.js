import { createStore } from "vuex";
import createPersistedstate from "vuex-persistedstate";
import { base64 } from "@/utils/base64";

const store = createStore({
    state() {
        return {
            token: "",
            user: null,
            role: null,
            roles: [{ id: 0, name: "admin" }, { id: 1, name: "user" }],
            metaMask: null,
            balance: { evic:0, busd:0},
            allowance:{evic:0,busd:0},
            fund:0,
            time: null,
            config: null,
            inviteCode:"",
            mycode:"",
            pool: 0,
            pools: {"0":1000,"1":2000,"2":2000},
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
        setBalance(state, data) {
            state.balance = {...state.balance,...data};
        },
        setAllowance(state, data) {
            state.allowance = {...state.allowance,...data};
        },
        setFund(state, fund) {
            state.fund = fund;
        },
        setConfig(state, config) {
            let contract = config.contract;
            for(let k in contract){
                contract[k].abi = JSON.parse(base64.decode(config?.contract[k].abi))
            }
            state.config = config;
        },
        setInviteCode(state, code){
            state.inviteCode = code;
        },
        setMyCode(state, code){
            state.mycode = code;
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