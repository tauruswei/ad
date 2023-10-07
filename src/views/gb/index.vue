<template>
  <div>
    <van-nav-bar safe-area-inset-top>
      <template #title>
        <img :src="require('../../assets/logo.png')" style="height:28px"/>
      </template>
    </van-nav-bar>
    <div class="content-container">
      <metamask-connect></metamask-connect>
      <van-grid :column-num="2" style="margin:10px 0;">
        <van-grid-item>
          <h3>{{ $store.state.balance }}</h3>
          Balance
        </van-grid-item>
        <van-grid-item>
          <h3>{{ $store.state.fund }}</h3>
          Earned
          <van-button size="small" type="primary" v-if="round && $store.state.fund" @click="withdraw('aac')">&nbsp;&nbsp;Withdraw&nbsp;&nbsp;</van-button>
        </van-grid-item>
      </van-grid>

      <van-tabs v-model:active="activeName">
        <van-tab title="Play" name="trans">
          <div style="padding:0 10px 25px;text-align: center;">
            <van-image width="280px" height="280px" fill="contain" :src="require('@/assets/img/game.gif')" round></van-image>
            <h3 style="margin:-30px 0 15px;color: var(--van-danger-color);">1000 AAC</h3>
            <div style="font-weight: bold;color:var(--van-gray-8);font-size: 15px;">Spend 1000 AAC for a 8-players game</div>
            <p style="color:var(--van-gray-5);margin-bottom:15px;">You will get paid if you win the game.</p>
            <van-button class="action-btn" size="small" type="primary" @click="open('aacstaking')"></van-button>
          </div>
        </van-tab>
        <van-tab title="Playing" name="playing">
            <buying-list v-if="activeName =='playing'"></buying-list>
        </van-tab>
        <van-tab title="History" name="history">
          <buy-list v-if="activeName =='history'"></buy-list>
        </van-tab>
      </van-tabs>
    </div>
    <!--Staking && UnStaking-->
    <van-popup v-model:show="visible" position="bottom" :style="{height: '420px'}" closeable close-icon="close" round :close-on-click-overlay="false">
      <div style="padding:10px 15px 20px;font-size:17px">
        <h3>AAC</h3>
        <van-cell-group inset style="margin-bottom:15px;">
          <van-field v-model="action.amount" label="AMOUNT:" type="number" required :error-message="errorMsg" placeholder="amount" clickable />
        </van-cell-group>
        <van-button type="success" @click="handleTransferOperate()" style="width:100%">
          {{buttonText}}
        </van-button>
        <van-number-keyboard :show="show" v-model="action.amount" theme="custom" extra-key="." safe-area-inset-bottom/>
      </div>
    </van-popup>
  </div>
</template>
<script setup>
import { ref, onMounted, getCurrentInstance, onUnmounted } from "vue"
import { useStore } from "vuex"
import { DateHelper } from "@/utils/helper";
import { loadingHelper } from "@/utils/loading";
import {userApi} from "@/api/request";
import { base64 } from "@/utils/base64";
import { showNotify, showToast } from 'vant';
import BuyList from "./components/trans-list.vue";
import BuyingList from "./components/transing-list.vue";
import MetamaskConnect from "@/components/user/metamask.vue";
import Bus from "@/utils/event-bus";
const store = useStore();
const round = ref(1)
const action = ref({
  amount: "0.01",
  command: ''
});
const amount = ref("")
getABI();
const abis = ref({aac:""})
const visible = ref(false)
const show = ref(true)
const { proxy } = getCurrentInstance();
const metaMask = proxy.metaMask;
const buttonText = ref('Play')
const activeName = ref("trans")
const hasConfig = ref(false)
const errorMsg = ref("")

console.log("store.state.abi", store.state.abi);

function getABI() {
  let data = {
    network:"aac"
  }
  userApi.abi(data).then(res=>{
    if(res.code == 0){
      hasConfig.value = true;
      store.commit("setABI",res.data);
      abis.value = { aac: JSON.parse(base64.decode(store.state.abi?.contract.aacFundPool.abi)) }
      if (metaMask.isAvailable()) {
        refresh()
      }
    }
  })
}

function getBalance(key) {
  metaMask.getBalance(store.state.metaMask?.account).then(res => {
    store.commit("setBalance", Math.round((res) * 1000) / 1000);
  });
}
function getReward(key){
  if(!hasConfig.value) return;
  let data = {
    abi: abis.value[key],
    address: store.state.abi?.contract.aacFundPool.address,
    from: store.state.metaMask?.account,
    funcName:"rewards"
  }
  metaMask.queryTransactionByContract(data).then(res => {
    store.commit("setFund", Number(res)/ Math.pow(10, 18));
  });
}
function getRound(key){
  if(!hasConfig.value) return;
  let data = {
    abi: abis.value[key],
    address: store.state.abi?.contract.aacFundPool.address,
    from: store.state.metaMask?.account,
    funcName:"roundsCount"
  }
  metaMask.queryTransactionByContract(data).then(res => {
    round.value = res;
  });
}
function open(command) {
  if (!metaMask.isAvailable()) return;
  action.value = {
    amount: "0.01",
    command: command,
    key: ''
  }
  openHandler[command]();
}
const openHandler = {
  aacstaking: () => {
    buttonText.value = "Buy";
    action.value.key = 'aac'
    visible.value = true
  }
}
const transferHandler = {
  aacstaking: transfer.bind(this, 'aac'),
}
function handleTransferOperate() {
  transferHandler[action.value.command]();
}
function isEmpty() {
  if (!action.value.amount) {
    errorMsg.value = "amount is required!"
  }
  return !!action.value.amount;
}
function transfer(key) {
  if(!hasConfig.value) return;
  if (!metaMask.isAvailable()) return;
  if(!isEmpty()) return;
  let data = {
    from: store.state.metaMask?.account,
    address: store.state.abi?.contract.aacFundPool.address,
    amount: action.value.amount,
    abi: abis.value[key],
    funcName: "deposit"
  }
  loadingHelper.show();
  metaMask.sendTransactionUseEthers(data).then((res) => {
    visible.value = false;
    loadingHelper.hide()
    refresh()
  }).catch(err => {
    loadingHelper.hide();
  })
}
function withdraw(key) {
  if(!hasConfig.value) return;
  if (!metaMask.isAvailable()) return;
  let data = {
    from: store.state.metaMask?.account,
    address: store.state.abi?.contract.aacFundPool.address,
    abi: abis.value[key],
    funcName: "withdraw"
  }
  loadingHelper.show();
  metaMask.sendTransactionUseEthers(data).then((res) => {
    loadingHelper.hide()
    refresh()
  }).catch(err => {
    loadingHelper.hide();
  })
}
function refresh() {
  if(!hasConfig.value) return;
  getBalance('aac')
  getReward("aac")
  getRound("aac")
}
Bus.$on('refresh', (isRefresh) => {
  if (isRefresh) refresh();
})
function handleClickb(tab) {
  activeName.value = tab;
}
onUnmounted(() => {
  Bus.$off('refresh')
})

//getABI();
</script>
