<template>
  <div>
    <van-row style="color:#fff;padding:10px 12px;background-color:#4c4741;border-radius:16px 16px 0 0;">
      <van-col :span="4">
        <van-image style="width:48px;height:48px;padding:8px;box-sizing:border-box;background-color: rgba(255,255,255,.05);" :src="require('@/assets/metamask-fox.svg')" round></van-image>
      </van-col>
      <van-col :span="8">
        <van-button v-if="!$store.state.metaMask" size="small" type="primary" @click="connectWallet">{{$t('btn.connect')}}</van-button>
        <div v-if="$store.state.metaMask">
          <p style="margin:0 0 10px;">{{ $store.state.metaMask?.account?($store.state.metaMask?.account.substr(0,12)+"...") :""}} <van-icon name="records" @click="copy($store.state.metaMask?.account)" /></p>
          <van-tag type="success" round>{{$t('text.connected')}}</van-tag>
        </div>
      </van-col>
      <van-col :span="12">
        <span style="display:block;text-align: right;color:#f09424" :title="$store.state.config?.networkName"><small>{{$store.state.config?.networkName ||""}}</small></span>
      </van-col>
    </van-row>
    <van-popup v-model:show="visible" position="bottom" :style="{height: '420px'}" round :close-on-click-overlay="false">
      <div style="padding:10px 15px 20px;font-size:17px">
        <h3>Evic</h3>
        <van-cell-group inset style="margin-bottom:15px;">
          <van-field v-model="code" :label="`${$t('text.inviteLabel')}:`" type="text" required :error-message="errorMsg" placeholder="code" clickable />
        </van-cell-group>
        <van-button type="success" @click="update(true)" style="width:100%">sure</van-button>
      </div>
    </van-popup>
  </div>
</template>
<script setup>
import { ref, getCurrentInstance, computed } from "vue";
import { useStore } from "vuex"
import { chainApi, bscApi, userApi } from "@/api/request";
import { base64 } from "@/utils/base64";
import { copyClick } from '@/utils/copy';
import Bus from "@/utils/event-bus";
import { showSuccessToast, showConfirmDialog } from "vant";
const { proxy } = getCurrentInstance()
const store = useStore()
let CONTRACTS = store.state.config?.contract;
const emit = defineEmits(['refresh'])
const metaMask = proxy.metaMask;
const provider = window.ethereum;
const chains = ref({ '0x1': "ethereum", '0x61': 'bsc test', '0x0200': 'Double-A Chain' })
let visible = ref(false)
let code = ref(store.state.inviteCode)
const errorMsg = ref("")
let isConnected = computed(() => {
  return store.state.metaMask ? true : false
})
if (provider) {
  //手机钱包切换
  if (store.state.metaMask) {
    let func = async () => {
      let account = await metaMask.getAccount();
      let chainId = await ethereum.request({ method: 'eth_chainId' })
      metaMask.setValue(chainId, account);
      if (account != store.state.metaMask.account) {
        store.commit("setMetaMask", { chainID: chainId, url: store.state.metaMask?.url, account: account });
      }
      isAccountExist()
      Bus.$emit('refresh', true);
    }
    func()

  }
  provider.on('connect', async (info) => {
    console.log('connect', info)
    if (!store.state.metaMask) metaMask.connectMetaMask();
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
  if (!metaMask.isAvailable()) return;
  bscApi.checkAccount(data).then(res => {
    if (!res.data) {
      if (!code.value) {
        visible.value = true;
      } else {
        update()
      }
    } else {
      store.commit("setUser", { id: res.data.id, account: res.data.walletAddress })
      getInviteCode()
    }
  }).catch((err) => {
    console.log(err)
    metaMask.disconnect();
  })
}
function update(hascode) {
  if (hascode) {
    if (!code.value) {
      errorMsg.value = `${proxy.$t('message.invite.required')}`
      return
    }
  }
  console.log(code.value)
  let data = {
    walletAddress: store.state.metaMask?.account,
    inviterId: code.value ? decodeURIComponent(code.value) : null
  }
  bscApi.updateAccount(data).then(res => {
    if (res.code == 0) {
      showSuccessToast(proxy.$t('message.invite.success'));
      store.commit("setInviteCode", null);
      visible.value = false;
      getInviteCode()
    }
  }).catch((err) => {
    console.log(err)
    metaMask.disconnect();
  })
}
function getInviteCode() {
  let data = { walletAddress: store.state.metaMask?.account };
  userApi.channelLeader(data).then(res => {
    if (res && res.code == 0) {
      store.commit("setMyCode", res.data);
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