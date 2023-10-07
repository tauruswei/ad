<template>
  <div style="height:calc(100vh - 300px);overflow-y: auto;">
    <van-pull-refresh v-model="loading" @refresh="onRefresh" loosing-text="pull to refresh..." loading-text="loading..." pulling-text="refresh after release">
      <van-list :finished="finished" finished-text="no more ..." @load="query">
        <van-row v-for="item in listData" :key="item" :title="item.id" style="margin-bottom:10px;margin-top:10px">
          <van-col :span="6">
            <div style="height:100%;box-sizing:border-box;padding:8px 0;border-radius:12px 0 0 12px;text-align: center;">
              <h3><small>{{ item.roundIndex }}</small></h3>
              Round
              <h3><small>{{ item.totalPlayers }}</small></h3>
              Players
            </div>
          </van-col>
          <van-col :span="18" style="height:100%;padding-left:10px">
            <p>Date: {{ item.updateTime }}</p>
            <div style="padding:7px 0 3px;">
              <van-tag type="primary">1</van-tag>
              <small :title="item.firstWinner">&nbsp;&nbsp;{{ item.firstWinner?.substr(12)+"..." }}</small>
            </div>
            <div style="padding:7px 0 3px;">
              <van-tag type="warning">2</van-tag>
              <small :title="item.secondWinner">&nbsp;&nbsp;{{ item.secondWinner?.substr(12)+"..." }}</small>
            </div>
            <div style="padding:7px 0 3px;">
              <van-tag type="success">3</van-tag>
              <small :title="item.thirdWinner">&nbsp;&nbsp;{{ item.thirdWinner?.substr(12)+"..." }}</small>
            </div>
          </van-col>
        </van-row>
      </van-list>
      <van-empty v-if="!listData.length" style="margin:0 auto"></van-empty>
    </van-pull-refresh>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useStore } from "vuex"
import { aacApi } from "@/api/request";
import { DateHelper } from "@/utils/helper";
const store = useStore();
const listData = ref([]);
const loading = ref(false);
const finished = ref(false);
const page = ref(1);
onMounted(()=>{
  page.value = 1;
  query()
})
function query() {
  let data = {
    isFinished: true,
    address: store.state.metaMask?.account,
    pageSize: 20,
    pageNum: page.value
  }
  loading.value = true;
  aacApi.playList(data).then((res) => {
    if (res.code == 0) {
      if(res.data.list && res.data.list.length) listData.value = res.data.list;
      listData.value.forEach(item => {
        if (item.createTime) item.createTime = DateHelper.toString(item.createTime)
        if (item.updateTime) item.updateTime = DateHelper.toString(item.updateTime)
      })
      loading.value = false;
      page.value++;
      if((page.value * 20 - 20) > res.data.total) finished.value = true; 
    }
  })
}
function onRefresh(){
  query()
} 
</script>