<template>
  <div>
    <van-nav-bar title="CHESS OF STARS" safe-area-inset-top />
    <div class="content-container">
      <metamask-connect></metamask-connect>
      <van-grid :column-num="2" style="margin:10px 0;">
        <van-grid-item>
          <h3>{{ balance.aac }}</h3>
          Balance
        </van-grid-item>
        <van-grid-item>
          <h3>{{ reward }}</h3>
          Earned
          <van-button size="small" type="primary" v-if="round && reward" @click="withdraw('aac')" round>&nbsp;&nbsp;Withdraw&nbsp;&nbsp;</van-button>
        </van-grid-item>
      </van-grid>
      
      <van-tabs v-model:active="activeName">
        <van-tab title="Play" name="trans">
          <div style="padding:25px 10px;text-align: center;">
            <van-image width="64px" height="64px" fill="contain" style="padding:15px;background-color: rgb(226, 226, 254);" :src="require('@/assets/img/game.png')" round></van-image>
            <h3 style="margin:10px 0 15px;color: rgb(188, 0, 0);">1000 AAC</h3>
            <div style="font-weight: bold;color:rgb(66, 66, 66);font-size: 15px;">Spend 1000 AAC for a 8-players game</div>
            <p style="color:#666;margin-bottom:15px;">You will get paid if you win the game.</p>
            <van-button size="small" type="primary" @click="open('aacstaking')" round>&nbsp;&nbsp;LET'S GO !&nbsp;&nbsp;</van-button>
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
        <van-button type="success" @click="handleTransferOperate()" style="width:100%" round>
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
const balance = ref({aac: 0});
const reward = ref(0)
const round = ref(1)
const action = ref({
  amount: "0.01",
  command: ''
});
const amount = ref("")
getABI();
let CONTRACTS = store.state.abi?.contract;
const contracts = ref(CONTRACTS);
const abis = ref({aac:""})
const visible = ref(false)
const show = ref(true)
const { proxy } = getCurrentInstance();
const metaMask = proxy.metaMask;
const buttonText = ref('Play')
const activeName = ref("trans")
const isrefresh = ref(false)
const errorMsg = ref("")

console.log("store.state.abi", store.state.abi);

function getABI() {
  let data = {
    network:"aac"
  }
  userApi.abi(data).then(res=>{
    if(res.code == 0){
      store.commit("setABI",res.data);
      abis.value = { aac: JSON.parse(base64.decode(CONTRACTS?.aacFundPool.abi)) }
      if (metaMask.isAvailable()) {
        refresh()
      }
    }
  })
}

function getBalance(key) {
  metaMask.getBalance(store.state.metaMask?.account).then(res => {
    balance.value[key] = Math.round((res) * 1000) / 1000;
  });
}
function getReward(key){
  let data = {
    abi: abis.value[key],
    address: CONTRACTS?.aacFundPool.address,
    from: store.state.metaMask?.account,
    funcName:"rewards"
  }
  metaMask.queryTransactionByContract(data).then(res => {
    reward.value = Number(res)/ Math.pow(10, 18)
    //reward.value = Math.round((res) * 1000) / 1000;
  });
}
function getRound(key){
  let data = {
    abi: abis.value[key],
    address: CONTRACTS?.aacFundPool.address,
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
  if (!metaMask.isAvailable()) return;
  if(!isEmpty()) return;
  let data = {
    from: store.state.metaMask?.account,
    address: CONTRACTS?.aacFundPool.address,
    amount: action.value.amount,
    abi: abis.value[key],
    funcName: "deposit"
  }
  loadingHelper.show();
  metaMask.sendTransaction(data).then((res) => {
    visible.value = false;
    loadingHelper.hide()
    refresh()
  }).catch(err => {
    loadingHelper.hide();
  })
}
function withdraw(key) {
  if (!metaMask.isAvailable()) return;
  let data = {
    from: store.state.metaMask?.account,
    address: CONTRACTS?.aacFundPool.address,
    abi: abis.value[key],
    funcName: "withdraw"
  }
  loadingHelper.show();
  metaMask.sendTransactionByContractOrigin(data).then((res) => {
    loadingHelper.hide()
    refresh()
  }).catch(err => {
    loadingHelper.hide();
  })
}
function refresh() {
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