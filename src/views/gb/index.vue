<template>
  <div>
    <!--<van-nav-bar safe-area-inset-top>
      <template #title>
        <img :src="require('../../assets/logo.png')" style="height:28px"/>
      </template>
    </van-nav-bar>-->
    <div class="content-container">
      <div class="border-bg">
        <div>
          <span style="display:inline-block;font-size:16px;margin:15px 10px 10px;line-height:24px;padding:2px 8px;color:var(--van-primary-color);background-color:#4d4159;border-radius:4px;" @click="openSidebar">
            <van-icon name="wap-nav" />
          </span>
        </div>
        <div></div>
        <div></div>
      </div>
      <div class="ui-content">
        <div class="wallet"></div>
        <div class="bg">
          <metamask-connect></metamask-connect>
          <div style="padding:5px 10px;display:flex;justify-content: space-between;">
            <p>BUSD {{$t('text.balance')}}: <b>{{ $store.state.balance.busd }}</b></p>
            <van-button size="mini" type="primary" @click="open('evic_exchange-approve')">&nbsp;&nbsp;{{$t('text.exchange')}}&nbsp;&nbsp;</van-button>
          </div>
          <van-grid :column-num="2">
            <van-grid-item>
              <h3>{{ $store.state.balance.evic }}</h3>
              <p><small>Evic {{$t('text.balance')}}</small></p>
              <van-button size="mini" type="primary" @click="open('busd_exchange-approve')">&nbsp;&nbsp;{{$t('text.exchange')}}&nbsp;&nbsp;</van-button>
            </van-grid-item>
            <van-grid-item>
              <h3>{{ $store.state.fund }}</h3>
              <p><small>{{$t('text.earned')}}</small></p>
              <van-button size="mini" type="primary" :disabled="$store.state.fund?false:true" @click="open('evic_withdraw')">&nbsp;&nbsp;{{$t('btn.withdraw')}}&nbsp;&nbsp;</van-button>
            </van-grid-item>
          </van-grid>
          <van-tabs v-model:active="activeName">
            <van-tab :title="$t('text.play')" name="trans">
              <div style="padding:15px 10px 25px;text-align: center;">
                <van-image width="240px" height="180px" fill="contain" :src="require('@/assets/hero_attack.gif')"></van-image>
                <h3 style="margin:-30px 0 15px;color: var(--van-danger-color);">{{$store.state.pools[$store.state.pool+'']}} EVIC</h3>
                <div style="font-weight: bold;font-size: 15px;">{{$t('message.play.title')}}</div>
                <p style="color:var(--van-gray-5);margin-bottom:15px;">{{$t('message.play.sub')}}</p>
                <van-button class="action-btn" size="small" type="primary" @click="open('evic_play-approve')"></van-button>
              </div>
            </van-tab>
            <van-tab :title="$t('text.playing')" name="playing">
              <buying-list v-if="activeName =='playing'"></buying-list>
            </van-tab>
            <van-tab :title="$t('text.history')" name="history">
              <buy-list v-if="activeName =='history'"></buy-list>
            </van-tab>
          </van-tabs>
        </div>
      </div>
    </div>
    <side-bar v-model:visible="sidebarVisible"></side-bar>
    <exchange-pop v-model:visible="visible" :title="action.title" :type="action.type" :error="errorMsg" @do="handleTransferOperate">
    </exchange-pop>
  </div>
</template>
<script setup>
import { ref, onMounted, getCurrentInstance, onUnmounted } from "vue"
import { useStore } from "vuex"
import { DateHelper } from "@/utils/helper";
import { loadingHelper } from "@/utils/loading";
import { userApi } from "@/api/request";
import { copyClick } from '@/utils/copy';
import { showNotify, showToast } from 'vant';
import ExchangePop from "./components/exchangePop.vue";
import BuyList from "./components/trans-list.vue";
import BuyingList from "./components/transing-list.vue";
import MetamaskConnect from "@/components/user/metamask.vue";
import SideBar from "@/components/user/sidebar.vue";
import Bus from "@/utils/event-bus";
const store = useStore();
const round = ref(1);
const action = ref({
  title: "",
  amount: "1000",
  command: ''
});
const min = ref(1000);
const amount = ref("")
getABI();
const abis = ref({ aacFundPool: "" })
const visible = ref(false)
const { proxy } = getCurrentInstance();
const metaMask = proxy.metaMask;
const activeName = ref("trans")
const hasConfig = ref(false)
const errorMsg = ref({ msg1: "", msg2: "" });
const sidebarVisible = ref(false);
//config
function getABI() {
  let data = {
    network: "bsc"
  }
  userApi.abi(data).then(res => {
    if (res.code == 0) {
      hasConfig.value = true;
      store.commit("setConfig", res.data);
      abis.value = {
        aacFundPool: store.state.config?.contract.aacFundPool.abi,
        evic: store.state.config?.contract.evic.abi,
        busd: store.state.config?.contract.busd.abi,
        exchangeEvic: store.state.config?.contract.exchangeEvic.abi,
      }
      if (metaMask.isAvailable()) {
        refresh()
      }
    }
  })
}
//余额
function getBalance(key) {
  let data = {
    abi: abis.value[key],
    address: store.state.config?.contract[key].address,
    from: store.state.metaMask?.account,
    funcName: "balanceOf"
  }//getDataByContract
  console.log("balance of")
  metaMask.getBalanceOfDifferentWallet(data).then(res => {
    let balance = Number(res) / Math.pow(10, 18);
    let obj={};
    obj[key] = Math.round((balance) * 1000) / 1000;
    store.commit("setBalance", obj);
  });
}
function getAllowance(key,type) {
  let data = {
    abi: abis.value[key],
    address: store.state.config?.contract[key].address,
    from: store.state.metaMask?.account,
    to: type=='play'? store.state.config?.contract.aacFundPool.proxyAddress:store.state.config?.contract.exchangeEvic.proxyAddress,
    funcName: "allowance"
  }
  console.log("search allowance")
  metaMask.getAllowanceDifferentWallet(data).then(res => {
    let allowance = Number(res) / Math.pow(10, 18);
    let obj={};
    obj[key] = Math.round((allowance) * 1000) / 1000
    store.commit("setAllowance", obj);
  });
}
//游戏收益
function getReward(key) {
  if (!hasConfig.value) return;
  let data = {
    abi: abis.value[key],
    address: store.state.config?.contract[key].proxyAddress,
    from: store.state.metaMask?.account,
    funcName: "userRewards"
  }//queryByethers
  console.log("rewards")
  metaMask.getBalanceOfDifferentWallet(data).then(res => {
    let reward = Number(res) / Math.pow(10, 18);
    store.commit("setFund", Math.round(reward * 1000) / 1000);
  });
}
function getRound(key) {
  if (!hasConfig.value) return;
  let data = {
    abi: abis.value[key],
    address: store.state.config?.contract[key].address,
    from: store.state.metaMask?.account,
    funcName: "roundsCount"
  }
  metaMask.queryByethersNoParam(data).then(res => {
    round.value = res;
  });
}
function open(command) {
  if (!metaMask.isAvailable()) return;
  //command: KEY_TYPE;
  //key:币种(evic/aac/busd);
  //type:play/buy/exchange/withdraw
  action.value = {
    command: command,
    key: command.split("_")[0],
    type: command.split("-")[0],
    title: ""
  }
  console.log("command",command)
  min.value = store.state.pools[store.state.pool+''];
  if (command == "evic_withdraw") {
    transferHandler["evic_withdraw"]()
  } else {
    let key = command.split("-")[0]||command;
    action.value.title = proxy.$t(`text.${key.split("_")[1]}`);
    openHandler();
  }

}
const openHandler = () => {
  visible.value = true;
}
const transferHandler = {
  "busd_exchange-approve": approveExchange.bind(this),//to evic
  "evic_exchange-approve": approveExchange.bind(this),//to busd
  "evic_play-approve": approve.bind(this),
  "busd_buy-approve": approve.bind(this),
  busd_exchange: exchange.bind(this),//to evic
  evic_exchange: exchangeBusd.bind(this),//to busd
  evic_play: transfer.bind(this),
  busd_buy: transfer.bind(this),
  evic_withdraw: withdraw.bind(this, 'aacFundPool')
}
function handleTransferOperate(value) {
  console.log(value)
  let key = (value && value.command)?value.command:action.value.command
  transferHandler[key](value);
}
function checkValue(amount) {
  let ret = true;
  if (amount < min.value) {
    errorMsg.value.msg1 = proxy.$t("error.min") + " " + min.value;
    ret = false;
  }
  return ret;
}
//玩游戏；使用evic合约，参数使用aacFundPool.proxyAddress
function approve(value) {
  if (!hasConfig.value) return;
  if (!metaMask.isAvailable()) return;
  let key = action.value.key;
  let data = {
    from: store.state.metaMask?.account,
    address: store.state.config?.contract[key].address,
    amount: key == "evic"?value.amount1:value.amount,
    abi: abis.value[key],
    addressParam: store.state.config?.contract.aacFundPool.proxyAddress,
    funcName: "approve"
  }
  if (!checkValue(data.amount)) return;
  loadingHelper.show();
  metaMask.approveByEthers(data).then((res) => {
    loadingHelper.hide();
    getAllowance('evic','play')
    //refresh()
  }).catch(err => {
    loadingHelper.hide();
  })
}
//evic => busd;使用busd合约，参数使用exchangeEvic
//busd => evic;使用evic合约，参数使用exchangeEvic
function approveExchange(value) {
  if (!hasConfig.value) return;
  if (!metaMask.isAvailable()) return;
  let key = action.value.key;
  let data = {
    from: store.state.metaMask?.account,
    address: store.state.config?.contract[key].address,
    amount: key=="evic"?value.amount1:value.amount,
    abi: abis.value[key],
    addressParam: store.state.config?.contract.exchangeEvic.proxyAddress,
    funcName: "approve"
  }
  loadingHelper.show();
  metaMask.approveByEthers(data).then((res) => {
    loadingHelper.hide();
    getAllowance('evic','exchange')
    getAllowance('busd','exchange')
    //refresh()
  }).catch(err => {
    loadingHelper.hide();
  })
}
//evic => busd;参数 busd数量
function exchangeBusd(value) {
  if (!hasConfig.value) return;
  if (!metaMask.isAvailable()) return;
  let key = "exchangeEvic";
  let data = {
    from: store.state.metaMask?.account,
    address: store.state.config?.contract[key].proxyAddress,
    amount: value.amount1,
    abi: abis.value[key],
    funcName: "sellToken"
  }
  console.log(data)
  if(data.amount > store.state.allowance[value.command]) {
    showToast(`${proxy.$t('error.allowance')}`)
    return
  }
  loadingHelper.show();
  metaMask.sendTransactionUseEthersNoPool(data).then((res) => {
    visible.value = false;
    loadingHelper.hide()
    refresh()
  }).catch(err => {
    loadingHelper.hide();
  })
}
//busd => evic;参数 evic数量
function exchange(value) {
  if (!hasConfig.value) return;
  if (!metaMask.isAvailable()) return;
  let key = "exchangeEvic";
  let data = {
    from: store.state.metaMask?.account,
    address: store.state.config?.contract[key].proxyAddress,
    amount: value.amount,
    abi: abis.value[key],
    funcName: "buyToken"
  }
  if(data.amount > store.state.allowance[value.command]) {
    showToast(`${proxy.$t('error.allowance')}`)
    return
  }
  loadingHelper.show();
  metaMask.sendTransactionUseEthersNoPool(data).then((res) => {
    visible.value = false;
    loadingHelper.hide()
    refresh()
  }).catch(err => {
    loadingHelper.hide();
  })
}
//玩游戏，使用aacFundPool合约
function transfer(value) {
  if (!hasConfig.value) return;
  if (!metaMask.isAvailable()) return;
  let key = 'aacFundPool';
  let data = {
    from: store.state.metaMask?.account,
    address: store.state.config?.contract[key].proxyAddress,
    amount: value.amount1,
    abi: abis.value[key],
    funcName: "deposit"
  }
  if (!checkValue(data.amount)) return;
  if(data.amount > store.state.allowance[value.command]) {
    showToast(`${proxy.$t('error.allowance')}`)
    return
  }
  loadingHelper.show();//sendTransactionByContract
  metaMask.sendTransactionUseEthers(data).then((res) => {
    visible.value = false;
    loadingHelper.hide()
    refresh()
  }).catch(err => {
    loadingHelper.hide();
  })
}
function withdraw(key) {
  if (!hasConfig.value) return;
  if (!metaMask.isAvailable()) return;
  let data = {
    from: store.state.metaMask?.account,
    address: store.state.config?.contract[key].proxyAddress,
    abi: abis.value[key],
    funcName: "withdraw"
  }
  loadingHelper.show();
  metaMask.withdrawUseEthers(data).then((res) => {
    loadingHelper.hide()
    getBalance('evic')
    getReward("aacFundPool")
  }).catch(err => {
    loadingHelper.hide();
  })
}
function copy(val) {
  if (!store.state.mycode) return;
  copyClick(val)
}
function openSidebar() {
  sidebarVisible.value = true;
  console.log(sidebarVisible.value)
}
function refresh() {
  if (!hasConfig.value) return;
  getBalance('busd')
  getBalance('evic')
  getAllowance('busd','exchange')
  getAllowance('evic','exchange')
  getAllowance('evic','play')
  getReward("aacFundPool")
  //getRound("aacFundPool");
}
onMounted(() => {
  refresh()
})
Bus.$on('refresh', (isRefresh) => {
  if (isRefresh) refresh();
})
function handleClickb(tab) {
  activeName.value = tab;
}
onUnmounted(() => {
  Bus.$off('refresh')
})
</script>
