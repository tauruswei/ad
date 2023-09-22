<template>
  <div>
    <van-row style="color:#393634;padding:15px;background-color:rgb(253, 230, 211);border-radius:16px 16px 0 0;">
      <van-col :span="4">
        <van-image width="48px" height="48px" :src="require('@/assets/metamask-fox.svg')" fit="contain" round></van-image>
      </van-col>
      <van-col :span="12">
        <van-button v-if="!isConnected" size="small" type="primary" @click="connectWallet" round>Connect Wallet</van-button>
        <div v-if="isConnected">
          <p style="margin:0 0 10px;">{{ $store.state.metaMask?.account.substr(0,12)+"..." }} <van-icon name="records" @click="copy($store.state.metaMask?.account)" /></p>
          <van-tag type="success" round>Connected</van-tag>
        </div>
      </van-col>
      <van-col :span="8">
        <span style="display:block;text-align: right;color:#f09424;" :title="$store.state.abi?.networkName"><small>{{$store.state.abi?.networkName ||""}}</small></span>
      </van-col>
    </van-row>
    <van-popup v-model:show="visible" position="bottom" :style="{height: '420px'}" closeable close-icon="close" round :close-on-click-overlay="false">
      <div style="padding:10px 15px 20px;font-size:17px">
        <h3>AAC</h3>
        <van-cell-group inset style="margin-bottom:15px;">
          <van-field v-model="code" label="code:" type="text" required :error-message="errorMsg" placeholder="code" clickable />
        </van-cell-group>
        <van-button type="success" @click="update(true)" style="width:100%" round>sure</van-button>
      </div>
    </van-popup>
  </div>
</template>
<script setup>
import { ref, getCurrentInstance, computed } from "vue";
import { useStore } from "vuex"
import { chainApi,aacApi } from "@/api/request";
import { base64 } from "@/utils/base64";
import { copyClick } from '@/utils/copy';
import Bus from "@/utils/event-bus";
import { showSuccessToast, showConfirmDialog } from "vant";
const { proxy } = getCurrentInstance()
const store = useStore()
let CONTRACTS = store.state.abi?.contract;
const emit = defineEmits(['refresh'])
const metaMask = proxy.metaMask;
const provider = window.ethereum;
const chains = ref({ '0x1': "ethereum", '0x61': 'bsc test', '0x0200': 'Double-A Chain' })
let visible = ref(false)
let code =ref("")
const errorMsg = ref("")
let isConnected = computed(() => {
  return store.state.metaMask ? true : false
})
if (provider) {
  provider.on('connect', (account) => {
    console.log('connect', account)
    if (!store.state.metaMask) metaMask.connectMetaMask()
  })
  provider.on('accountsChanged', (accounts) => {
    console.log('accountsChanged', accounts);
    if (!accounts.length) {
      metaMask.disconnect();
    } else {
      if (store.state.metaMask) {
        metaMask.account = accounts[0]
        store.commit("setMetaMask", { chainID: store.state.metaMask?.chainID, url: store.state.metaMask?.url, account: accounts[0] });
        isAccountExist()
        Bus.$emit('refresh', true);
      }
    }
  })
  provider.on('message', message => {
    console.log('message', message)
  })
  provider.on('disconnect', () => {
    console.log('disconnect')
    metaMask.disconnect();
  })
  provider.on('chainChanged', (chainId) => {
    if (store.state.metaMask) {
      showSuccessToast("You have changed the chain!")
    }
  })
}
function isAccountExist() {
  let ret = false;
  let data = {
    walletAddress: store.state.metaMask?.account
  }
  aacApi.checkAccount(data).then(res => {
    if (!res.data) {
      showConfirmDialog({ message: 'Would you like to enter your invite code?' })
        .then(() => {
          visible.value = true;
        })
        .catch(() => {
          update()
        });
    }
  })
}
function update(hascode) {
  if(hascode){
    if(!code.value){
      errorMsg.value = "code is required!"
      return
    }
  }
  let data = {
    walletAddress: store.state.metaMask?.account,
    code: code.value?code.value:null
  }
  aacApi.updateAccount(data).then(res => {
    if (res.code == 0) {
      showSuccessToast("success!")
      visible.value = false;
    }
  })
}
async function connectWallet() {
  await metaMask.connectMetaMask()
  isAccountExist();
  if (!metaMask.isAvailable()) return;
  Bus.$emit('refresh', true);
}
function copy(val) {
  copyClick(val)
}
</script>