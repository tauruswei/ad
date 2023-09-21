<template>
  <div style="height:calc(100vh - 300px);overflow-y: auto;">
    <van-list v-model:loading="loading" :finished="finished" finished-text="" @load="query">
      <van-row :gutter="8" v-for="item in listData" :key="item" :title="item.id" style="margin-top:10px;margin-bottom:10px">
        <van-col :span="4">
          <van-image width="26px" height="26px" fill="contain" style="padding:15px;background-color: rgb(226, 226, 254);" :src="require('@/assets/img/game.png')" round></van-image>
        </van-col>
        <van-col :span="18">
          <p style="font-size:15px;margin-top:2px;margin-bottom:8px;"><b>{{ item }}</b><small>&nbsp;&nbsp;Round</small></p>
          <a style="font-size:12px;margin:8px 0;color:#666;word-break: break-all;" :href="$store.state.abi ?`${$store.state.abi?.explorer}/address/${$store.state.abi.contract.aacFundPool.address}`:'#' "><van-text-ellipsis :content="$store.state.abi?.contract.aacFundPool.address" /></a>
          <div>
            <p>Total Players: <span>{{ players[item+'i']?.player||"0" }}</span>&nbsp;&nbsp;Total Fund:{{ players[item+'i']?.fund||"0" }}</p>
            <van-button size="small" type="warning" @click="getCurrentPlayers(item)" round>
              refresh
            </van-button>
          </div>
      </van-col>
      </van-row>
    </van-list>
    <van-empty v-if="!listData.length" style="margin:0 auto"></van-empty>
  </div>
</template>
<script setup>
import { onMounted, ref, getCurrentInstance,} from "vue";
import {useStore} from "vuex"
import { aacApi } from "@/api/request";
import { DateHelper } from "@/utils/helper";
import { base64 } from "@/utils/base64";
import { loadingHelper } from "@/utils/loading";
const store = useStore();
const listData = ref([]);
const loading = ref(false);
const finished = ref(false);
const players = ref({});
const { proxy } = getCurrentInstance();
const metaMask = proxy.metaMask;
onMounted(()=>{
  query()
})
function query() {
  let data = {
    isFinished: false,
    address: store.state.metaMask?.account,
  }
  loading.value = true;
  aacApi.playingList(data).then((res) => {
    if (res.code == 0) {
      listData.value = res.data||[];
      if(listData.value.length){
        listData.value.forEach(item => {
          if (item.createTime) item.createTime = DateHelper.toString(item.createTime)
          if (item.updateTime) item.updateTime = DateHelper.toString(item.updateTime)
        })
      }
      loading.value = false;
      finished.value = true;
    }
  })
}
function getCurrentPlayers(round){
  if (!metaMask.isAvailable()) return;
  let data = {
    from: store.state.metaMask?.account,
    address: store.state.abi?.contract.aacFundPool.address,
    abi: JSON.parse(base64.decode(store.state.abi?.contract.aacFundPool.abi)),
    funcName: "rounds",
    amount:round
  }
  loadingHelper.show();
  metaMask.queryTransactionByContract(data).then((res) => {
    loadingHelper.hide()
    players.value[round+"i"] = {
      fund: Number(res.totalFund),
      player: Number(res.totalPlayers)
    }
    refresh()
  }).catch(err => {
    loadingHelper.hide();
  })
}
</script>
