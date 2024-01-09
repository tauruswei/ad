import store from "../store/index"
export default {
    btn: {
      withdraw:"withdraw",
      connect:"Connect Wallet",
      buy: "Buy",
      invite:"Share to invite",
      accept:"Accept Invitation",
      approve:"Approve"
    },
    text:{
        current:"Current",
        home:"Home",
        connected:"Conected",
        balance:"Balance",
        earned:"Earned",
        play:"Play",
        buy: "Buy",
        exchange:"Exchange",
        playing:"Playing",
        history:"History",
        amount:"AMOUNT",
        copy:"Copyed",
        round:"Round",
        players:"Players",
        date:"Date",
        loosingText:"pull to refresh...",
        loadingText:"loading...",
        pullingText:"refresh after release",
        finishedText:"no more ...",
        inviteLabel:"invite code",
        nodata: "No data !",
        language: "language",
        clickcopy: "copy",
        rebate: "rebate",
        reward: "Reward",
        inviteNum: "Invite Number",
        allowance: "Allowance",
        exchangeTo: "Exchange to",
        totalFund: "total Fund",
        level: "level",
        airdropPoints:"Airdrop Points",
        wallet:"Wallet",
        point:"Point",
        rank:"Rank",
        norank:"Not yet playing the game",
        invitead:"Playing the game or inviting for more points !"
    },
    message:{
        play:{
            title:"Spend EVIC for a 8-players game",
            sub:"You will get paid if you win the game."
        },
        wallet:{
            install:"Please install Metamask Wallet at",
            connect:"please connect wallet"
        },
        invite:{
            tip:"Would you like to enter your invite code?",
            success:"success",
            required:"invite code is required!",
            sub:"You will receive a 0.25% reward！"
        },
        chain:{
            error:"Please connect to the right chain (Binance Smart Chain, ChainID=",
            tip:"'Sorry you need to switch to the right network, please try again!'"
        }
    },
    error:{
        required:"amount is required!",
        reject:"You have rejected this operation.",
        authorized:"The requested account and/or method has not been authorized.",
        wrong:"It seems that something wrong happens in your wallet, please check and solve it first.",
        wait:"The wallet is processing your request, please finish the operation in the wallet.",
        failed:"failed!",
        wentWrong:"Something went wrong.",
        exceed:"The current reward is less than the gas fee estimated",
        min:"The amount can not be less than",
        max:"The amount can not be more than balance",
        allowance:"The amount can not be more than allowance"
    }
  }