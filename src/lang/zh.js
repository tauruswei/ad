import store from "../store/index"
export default {
    btn: {
        withdraw: "提現",
        connect: "鏈接錢包",
        buy: "購買",
        invite: "分享邀請",
        accept: "接受邀請",
        approve: "質押"
    },
    text: {
        home: "主頁",
        connected: "已連接",
        balance: "餘額",
        earned: "已賺取",
        play: "遊戲",
        buy: "購買",
        exchange: "兌換",
        playing: "進行中",
        history: "歷史",
        amount: "數量",
        copy: "已複製",
        round: "輪數",
        players: "玩家",
        date: "日期",
        loosingText: "下拉刷新",
        loadingText: "加載中...",
        pullingText: "鬆開後刷新",
        finishedText: "已經到底了",
        inviteLabel: "邀請碼",
        nodata: "数据为空！",
        language: "語言",
        clickcopy: "複製",
        rebate: "返利",
        reward: "獎勵",
        inviteNum: "邀請人數",
        allowance: "質押金額",
        exchangeTo: "轉換成",
    },
    message: {
        play: {
            title: "参与8人对战（" + store.state.pools[store.state.pool.toString()] + " EVIC）",
            sub: "在遊戲中勝出將會贏得獎勵"
        },
        wallet: {
            install: "請點擊鏈接下載Metamask錢包",
            connect: "錢包尚未連接，請鏈接！"
        },
        invite: {
            tip: "是否輸入邀請碼？",
            success: "操作成功",
            required: "邀請碼不能為空！",
            sub: "您將獲得 0.25% 的返利"
        },
        chain: {
            error: "請您切換到正確的網絡 (Binance Smart Chain, ChainID=",
            tip: "請您切換到正確的網絡！'"
        }
    },
    error: {
        required: "數量不能為空!",
        reject: "您已拒絕了本次操作。",
        authorized: "賬戶或方法未授權。",
        wrong: "錢包發生錯誤，請檢車後重試。",
        wait: "錢包已有該操作請求，請優先處理！",
        failed: "操作失敗",
        wentWrong: "發生錯誤",
        exceed: "當前餘額過低，燃氣費用不足，可能導致提現失敗。",
        min: "交易數量不能小於最小金额。",
        max: "最大金额不能超出餘額。",
        allowance:"交易金额不能超出質押數量。"
    }
}