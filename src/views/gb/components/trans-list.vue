<template>
  <div style="height:calc(100vh - 300px);overflow-y: auto;">
    <van-pull-refresh v-model="loading" @refresh="onRefresh" :loosing-text="$t('text.loosingText')" :loading-text="$t('text.loadingText')" :pulling-text="$t('text.pullingText')">
      <van-list :finished="finished" :finished-text="$t('text.finishedText')" @load="query">
        <van-row v-for="item in listData" :key="item" :title="item.id" style="margin-bottom:10px;margin-top:10px;align-items:center">
          <van-col :span="6">
            <div style="height:100%;box-sizing:border-box;padding:8px 0;border-radius:12px 0 0 12px;text-align: center;">
              <h3 style="font-size:30px">{{ item.roundIndex }}</h3>
              {{$t('text.round')}}
              <h3 style="font-size:30px">{{ item.totalPlayers }}</h3>
              {{$t('text.players')}}
            </div>
          </van-col>
          <van-col :span="18" style="height:100%;padding-left:10px">
            <span :class="`level level${item.poolIndex||0}`">{{ $store.state.pools[(item.poolIndex||0)+''] }}</span>
            <p>{{ item.updateTime }}</p>
            <div style="padding:3px 0;" v-for="item0 in item.rewards" :key="item0.position">
              <van-tag type="primary" style="background-color:#d93f68;" v-if="item0.position==1">{{ item0.position }}</van-tag>
              <van-tag type="primary" style="background-color:#7146cd;" v-if="item0.position==2">{{ item0.position }}</van-tag>
              <van-tag type="primary" v-if="item0.position==3">{{ item0.position }}</van-tag>
              <van-tag type="primary" style="background-color:#545cd0;" v-if="item0.position==4">{{ item0.position }}</van-tag>
              <van-tag type="primary" style="background-color:#548bd0;" v-if="item0.position==5">{{ item0.position }}</van-tag>
              <van-tag type="primary" style="background-color:#6dd054;" v-if="item0.position==6">{{ item0.position }}</van-tag>
              <small :title="item0.address">&nbsp;&nbsp;{{ item0.address?.substr(12)+"..." }}</small>
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