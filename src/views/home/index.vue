<template>
  <div>
    <div class="content-container">
      <div style="position:relative;text-align: center;padding:10px 0;height:48px;overflow-y: hidden;box-sizing: border-box;">
        <span style="position:absolute;left:0;top:0;display:inline-block;font-size:16px;margin:10px 10px 10px 0;line-height:24px;padding:2px 8px;color:var(--van-primary-color);" @click="openSidebar">
          <van-icon name="wap-nav" />
        </span>
        <img :src="require('../../assets/logo.png')" style="height:28px" />
      </div>
      <div class="ui-content">
        <div class="bg">
          <metamask-connect></metamask-connect>
          <div style="padding:5px 10px;display:flex;justify-content: space-between;">
            <p><van-icon name="balance-o" :size="18" /> USDT {{$t('text.balance')}}</p>
            <p><b v-number="$store.state.balance.busd"></b></p>
          </div>
          <van-tabs v-model:active="activeName">
            <van-tab :title="$t('text.buy')" name="trans">
              <div style="padding:30px 10px 25px;text-align: center;">
                <van-image width="240px" height="160px" fill="contain" :src="require('@/assets/img/blindbox.gif')"></van-image>
                <h3 style="margin:0 0 15px;" :class="`leveltext level2`">10 USDT</h3>
                <div style="font-weight: bold;font-size: 15px;">{{$t('message.play.title')}}</div>
                <p style="color:var(--van-gray-5);margin-top:5px;margin-bottom:15px;">{{$t('message.play.sub')}}</p>
                <van-button size="small" type="primary" @click="open('approve')">{{$t('message.play.buy')}}</van-button>
              </div>
            </van-tab>
            <van-tab :title="$t('text.history')" name="history">
              <buy-list v-if="activeName =='history'" :data="nftList"></buy-list>
            </van-tab>
          </van-tabs>
        </div>
      </div>
    </div>
    <side-bar v-model:visible="sidebarVisible"></side-bar>
    <exchange-pop v-model:visible="visible" :title="action.title" @do="handleTransferOperate" @refresh="refreshAllowance">
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
import confetti from 'canvas-confetti';
import ExchangePop from "./components/exchangePop.vue";
import BuyList from "./components/trans-list.vue";
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
const nftList=ref([])
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
        busd: store.state.config?.contract.busd.abi,
        blindbox: store.state.config?.contract.blindBoxNFTCosd.abi,
        nft: store.state.config?.contract.NFTCosd.abi
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
  metaMask.getBalanceOfDifferentWallet(data).then(res => {
    let balance = Number(res) / Math.pow(10, 18);
    let obj = {};
    obj[key] = Math.round((balance) * 1000) / 1000;
    store.commit("setBalance", obj);
  });
}
function getAllowance() {
  let data = {
    abi: abis.value.busd,
    address: store.state.config?.contract.busd.address,
    from: store.state.metaMask?.account,
    to: store.state.config?.contract.blindBoxNFTCosd.proxyAddress,
    funcName: "allowance"
  }
  metaMask.getAllowanceDifferentWallet(data).then(res => {
    let allowance = Number(res) / Math.pow(10, 18);
    let obj = {};
    obj["busd"] = Math.round((allowance) * 1000) / 1000;
    store.commit("setAllowance", obj);
  });
}
function getNFTs() {
  let data = {
    abi: abis.value.nft,
    address: store.state.config?.contract.NFTCosd.proxyAddress,
    from: store.state.metaMask?.account,
    funcName: "getNftsByOwner"
  }
  metaMask.getBalanceOfDifferentWallet(data).then(res => {
    console.log(res)
    nftList.value = Array.from(res);
    console.log(nftList.value)
  });
}
function open(command) {
  if (!metaMask.isAvailable()) return;
  action.value = {
    command: command,
    title: ""
  }
  action.value.title = proxy.$t(`text.blindbox`);
  openHandler();
}
const openHandler = () => {
  visible.value = true
}
const transferHandler = {
  "approve": approve.bind(this),//to evic
  "buy": transfer.bind(this),
}
function handleTransferOperate(value,event) {
  console.log(value)
  transferHandler[value.command](value,event);
}
function approve(value) {
  if (!hasConfig.value) return;
  if (!metaMask.isAvailable()) return;
  let data = {
    from: store.state.metaMask?.account,
    address: store.state.config?.contract.busd.address,
    amount: value.amount1,
    abi: abis.value.busd,
    addressParam: store.state.config?.contract.blindBoxNFTCosd.proxyAddress,
    funcName: "approve"
  }
  loadingHelper.show();
  metaMask.approveByEthers(data).then(async (res) => {
    await getAllowance()
    loadingHelper.hide();
    //refresh()
  }).catch(err => {
    loadingHelper.hide();
  })

}
//盲盒：blindBoxNFTCosd proxyAddress drawCard
function transfer(value,event) {
  if (!hasConfig.value) return;
  if (!metaMask.isAvailable()) return;
  let data = {
    from: store.state.metaMask?.account,
    address: store.state.config?.contract.blindBoxNFTCosd.proxyAddress,
    amount: value.amount1,
    abi: abis.value.blindbox,
    funcName: "drawCard"
  }
  if (data.amount1 > store.state.allowance.busd) {
    showToast(`${proxy.$t('error.allowance')}`)
    return
  }
  loadingHelper.show();//sendTransactionByContract
  metaMask.sendTransactionUseEthersNoPool(data).then((res) => {
    visible.value = false;
    loadingHelper.hide()
    animation(event, true)
    refresh()
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
}
function animation(evt, hard) {
  let lastX = 0;
  const direction = Math.sign(lastX - evt.clientX);
  lastX = evt.clientX;
  const particleCount = hard ? r(122, 245) : r(2, 15);
  confetti({
    particleCount,
    gravity: 0.5,
    angle: r(90, 90 + direction * 30),
    spread: r(45, 80),
    origin: {
      x: evt.clientX / window.innerWidth,
      y: evt.clientY / window.innerHeight
    }
  });
}
function r(mi, ma) {
  return parseInt(Math.random() * (ma - mi) + mi);
}
function refresh() {
  if (!hasConfig.value) return;
  getBalance('busd')
  getAllowance()
  getNFTs()
}
function refreshAllowance() {
  getAllowance()
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
