<template>
  <div style="height:calc(100vh - 300px);overflow-y: auto;">
    <van-list v-model:loading="loading" :finished="finished" :finished-text="$t('text.finishedText')" :loading-text="$t('text.loadingText')" @load="query">
      <template v-for="(item,key) in listData">
      <div v-if="item.length" :key="key">
      <van-row :gutter="8" v-for="item0 in item" :key="key+item0" :title="item.id" style="margin-top:10px;margin-bottom:10px">
        <van-col :span="4">
          <van-image width="56px" height="56px" fill="cover" style="border:.5px solid var(--van-primary-color);background-color: #fff;" :src="require('@/assets/img/game.gif')" round></van-image>
        </van-col>
        <van-col :span="18">
          <span :class="`level level${key}`">{{ $store.state.pools[key] }}</span>
          <p style="font-size:15px;margin-top:2px;margin-bottom:8px;"><b>{{ item0 }}</b><small>&nbsp;&nbsp;{{$t('text.round')}}</small></p>
          <a style="font-size:12px;margin:8px 0;color:var(--van-gray-6);word-break: break-all;" :href="$store.state.config ?`${$store.state.config?.explorer}/address/${$store.state.config.contract.aacFundPool.proxyAddress}`:'#' "><van-text-ellipsis :content="$store.state.config?.contract.aacFundPool.proxyAddress" /></a>
          <div>
            <p>{{$t('text.players')}}: <span>{{ players[item0+key+'i']?.player||"0" }}</span>&nbsp;&nbsp;{{$t('text.totalFund')}}:{{ players[item0+key+'i']?.fund||"0" }}&nbsp;&nbsp;&nbsp;<van-icon name="replay"  @click="getCurrentPlayers(item0,key)"/></p>
          </div>
      </van-col>
      </van-row>
    </div>
    </template>
    </van-list>
    <div v-if="!Object.keys(listData).length" style="margin:40px auto;text-align:center">{{$t('text.nodata')}}</div>
  </div>
</template>
<script setup>
import { onMounted, ref, getCurrentInstance,} from "vue";
import {useStore} from "vuex"
import { bscApi } from "@/api/request";
import { DateHelper } from "@/utils/helper";
import { base64 } from "@/utils/base64";
import { loadingHelper } from "@/utils/loading";
const store = useStore();
const listData = ref({});
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
  bscApi.playingList(data).then((res) => {
    if (res.code == 0) {
      listData.value = res.data||{};
      loading.value = false;
      finished.value = true;
    }
  })
}
function getCurrentPlayers(round,pool){
  if (!metaMask.isAvailable()) return;
  let data = {
    from: store.state.metaMask?.account,
    address: store.state.config?.contract.aacFundPool.proxyAddress,
    abi: store.state.config?.contract.aacFundPool.abi,
    pool: pool,
    funcName: "getRound",
    amount:round,
    useOrigin:true
  }
  loadingHelper.show();
  metaMask.queryRoundByethers(data).then((res) => {
    loadingHelper.hide()
    players.value[round+pool+"i"] = {
      fund: Number(res.totalFund)/Math.pow(10,18),
      player: Number(res.totalPlayers)
    }
    refresh()
  }).catch(err => {
    loadingHelper.hide();
  })
}
</script>
