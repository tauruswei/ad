<template>
  <div style="height:calc(100vh - 300px);overflow-y: auto;">
    <van-list v-model:loading="loading" :finished="finished" finished-text="no more ..." @load="query">
      <van-row :gutter="10" v-for="item in listData" :key="item" :title="item.id" style="margin-top:10px;margin-bottom:10px">
        <van-col :span="4">
          <van-image width="28px" height="28px" fill="contain" style="padding:15px;background-color: rgb(226, 226, 254);" :src="require('@/assets/img/game.png')" round></van-image>
        </van-col>
        <van-col :span="18">
          <p style="font-size:15px;margin-top:2px;margin-bottom:8px;"><b>{{ item.roundIndex }}</b><small>&nbsp;&nbsp;Round</small> <van-tag type="warning"><b>{{ item.totalPlayers }}</b>&nbsp;&nbsp;Players</van-tag></p>
          <p style="font-size:12px;margin:8px 0;color:#666">{{ item.updateTime }}</p>
        </van-col>
      </van-row>
    </van-list>
    <van-empty v-if="!listData.length" style="margin:0 auto"></van-empty>
  </div>
</template>
<script setup>
import { onMounted, ref, } from "vue";
import {useStore} from "vuex"
import { aacApi } from "@/api/request";
import { DateHelper } from "@/utils/helper";
const store = useStore();
const listData = ref([]);
const loading = ref(false);
const finished = ref(false);
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
      listData.value.push(res.data.list);
      listData.value.forEach(item => {
        if (item.createTime) item.createTime = DateHelper.toString(item.createTime)
        if (item.updateTime) item.updateTime = DateHelper.toString(item.updateTime)
      })
      loading.value = false;
      finished.value = true;
    }
  })
}
</script>
