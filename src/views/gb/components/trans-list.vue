<template>
  <div style="height:calc(100vh - 300px);overflow-y: auto;">
    <van-pull-refresh v-model="loading" @refresh="onRefresh" :loosing-text="$t('text.loosingText')" :loading-text="$t('text.loadingText')" :pulling-text="$t('text.pullingText')">
      <van-list :finished="finished" :finished-text="$t('text.finishedText')" @load="query">
        <van-row v-for="item in listData" :key="item" :title="item.id" style="margin-bottom:10px;margin-top:10px">
          <van-col :span="6">
            <div style="height:100%;box-sizing:border-box;padding:8px 0;border-radius:12px 0 0 12px;text-align: center;">
              <h3><small>{{ item.roundIndex }}</small></h3>
              {{$t('text.round')}}
              <h3><small>{{ item.totalPlayers }}</small></h3>
              {{$t('text.players')}}
            </div>
          </van-col>
          <van-col :span="18" style="height:100%;padding-left:10px">
            <span :class="`level level${item.poolIndex||0}`">{{ $store.state.pools[(item.poolIndex||0)+''] }}</span>
            <p>{{ item.updateTime }}</p>
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
      <div v-if="!listData.length" style="margin:40px auto;text-align:center">{{$t('text.nodata')}}</div>
    </van-pull-refresh>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useStore } from "vuex"
import { bscApi } from "@/api/request";
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
  bscApi.playList(data).then((res) => {
    if (res.code == 0) {
      if(res.data.list && res.data.list.length){ 
        listData.value = res.data.list;
        listData.value.forEach(item => {
        if (item.createTime) item.createTime = DateHelper.toString(item.createTime)
        if (item.updateTime) item.updateTime = DateHelper.toString(item.updateTime)
      })
    }
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