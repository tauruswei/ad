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
            <van-grid :column-num="2">
              <van-grid-item>
                <van-icon name="friends" size="48" />
                <h3>{{ number }}</h3>
                {{$t('text.inviteNum')}}
              </van-grid-item>
              <van-grid-item>
                <van-icon name="gem" size="48" />
                <h3>{{ reward }}</h3>
                {{$t('text.reward')}} | Evic
              </van-grid-item>
            </van-grid>
            <div style="padding:0 10px 10px;text-align: center;">
                <van-image width="360px" fill="contain" :src="require('@/assets/img/bannerhead02.png')"></van-image>
                <div style="font-weight: bold;font-size: 15px;">{{$t('btn.invite')}}</div>
                <p style="color:var(--van-gray-5);margin-bottom:15px;">{{$t('message.invite.sub')}}</p>
                <van-button v-if="$store.state.metaMask" type="primary" @click="copy(`${inviteUrl}?inviteCode=${encodeURIComponent($store.state.mycode)}`)">&nbsp;&nbsp;{{$t('text.clickcopy')}}&nbsp;&nbsp;</van-button>
                &nbsp;&nbsp;
                <van-button type="success" v-if="reward" @click="withdraw">&nbsp;&nbsp;{{$t('btn.withdraw')}}&nbsp;&nbsp;</van-button>
              </div>
          </div>
        </div>
      </div>
      <side-bar v-model:visible="sidebarVisible" ></side-bar>
      <van-popup v-model:show="visible" position="bottom" :style="{height: '420px'}" closeable close-icon="close" round :close-on-click-overlay="false">
      <div style="padding:10px 15px 20px;font-size:17px">
        <h3>Evic</h3>
        <van-cell-group inset style="margin-bottom:15px;">
          <van-field v-model="amount" :label="$t('text.amount')+':'" type="number" required :error-message="errorMsg" :placeholder="$t('text.amount')" clickable/>
        </van-cell-group>
        <small>{{"Gas Price: "+(gas.gasPrice/Math.pow(10,9))}}</small>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<small>{{"Gas Fee: "+(gasFee/Math.pow(10,18))}}</small>
        <van-button type="primary" @click="withdraw" style="width:100%">
          {{$t('btn.withdraw')}}
        </van-button>
        <van-number-keyboard :show="show" v-model="amount" theme="custom" extra-key="." safe-area-inset-bottom />
      </div>
    </van-popup>
    </div>
  </template>
  <script setup>
  import { ref, onMounted, getCurrentInstance, onUnmounted,watch } from "vue"
  import { useStore } from "vuex"
  import { DateHelper } from "@/utils/helper";
  import { loadingHelper } from "@/utils/loading";
  import { userApi,rebateApi,evicsApi } from "@/api/request";
  import { base64 } from "@/utils/base64";
  import { copyClick } from '@/utils/copy';
  import { showNotify, showToast } from 'vant';
  import MetamaskConnect from "@/components/user/metamask.vue";
  import SideBar from "@/components/user/sidebar.vue";
  import Bus from "@/utils/event-bus";
  const store = useStore();
  const round = ref(1);
  const amount = ref("1000")
  getABI();
  const abis = ref({ aacFundPool: "" })
  const visible = ref(false)
  const show = ref(true)
  const { proxy } = getCurrentInstance();
  const metaMask = proxy.metaMask;
  const hasConfig = ref(false)
  const errorMsg = ref("");
  const sidebarVisible = ref(false);
  let inviteUrl = ref('');
  let number = ref(0);
  let reward = ref(0);
  let gas = ref({
    gasPrice:0,
    gasLimit:0
  })
  let gasFee = ref(0)
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
          evic:store.state.config?.contract.evic.abi,
          busd:store.state.config?.contract.busd.abi,
          exchangeEvic: store.state.config?.contract.exchangeEvic.abi,
         }
        if (metaMask.isAvailable()) {
          refresh()
        }
      }
    })
  }
  function check() {
    let ret = true;
    if(reward.value < 1000){
      showToast(proxy.$t("error.min") + " 1000");
      return false
    }
    return ret;
  }
  function getInviteNumber() {
    loadingHelper.show();
    rebateApi.number(store.state.user.id).then((res) => {
      loadingHelper.hide()
      number.value = res.data.level1;
    }).catch(err => {
      loadingHelper.hide();
    })
  }
  function getReward() {
    let data = {
        userId: store.state.user.id,
        assetType:3
    }
    loadingHelper.show();
    rebateApi.reward(data).then((res) => {
      loadingHelper.hide()
      reward.value = res.data[0]?.amount||0;
    }).catch(err => {
      loadingHelper.hide();
    })
  }
  function open(){
    if(!reward.value) return;
    visible.value = true;
  }
  watch(()=>amount.value,(val)=>{
    setAmount(val)
  })
  const setAmount = async(value)=>{
    await getFee();
    if(value<0) amount.value = 0;
    if(parseFloat(value)>=reward.value){ 
      if(reward.value > gasFee.value/Math.pow(10,18)){
        amount.value = reward.value - gasFee.value/Math.pow(10,18);
      } 
    }
  }
  async function getFee(key){
    if (!metaMask.isAvailable()) return;
    if(!reward.value) return;
    let param = {
      form:store.state.config?.contract[key].address,
      to: store.state.metaMask?.account,
      amount: reward.value + ""
    }
    gas.value = await metaMask.getGasByEthers(param);
    console.log(reward.value,gas.value)
    gasFee.value = Number(gas.value.gasPrice) * Number(gas.value.gasLimit) * 2;
  }
  async function withdraw() {
    if(!check()) return;
    loadingHelper.show();
    await getFee('aacFundPool');
    if(!store.state.user?.id) return;
    let data = {
      transType:13,
      fromUserId: store.state.user?.id,
      fromAssetType:3,
      fromAmount: -reward.value,
      toUserId: store.state.user?.id,
      toAssetType:3,
      toAmount: -reward.value,
      gasPrice: Number(gas.value.gasPrice),
      gasLimit: Number(gas.value.gasLimit) * 2,
      nftVo:{}
    }
    evicsApi.withdraw(data).then((res) => {
      loadingHelper.hide()
      //visible.value = false;
      refresh()
    }).catch(err => {
      loadingHelper.hide();
    })
  }
  function copy(val) {
    if (!store.state.mycode) return;
    copyClick(val)
  }
  function openSidebar(){
    sidebarVisible.value = true;
  }
  function refresh() {
    getInviteNumber();
    getReward();
  }
  onMounted(()=>{
    inviteUrl.value = `${window.location.protocol}//${window.location.host}/invite`;
    refresh()
  })
  
  //getABI();
  </script>
  