<template>
  <div style="height:calc(100vh - 300px);padding:0 10px;overflow-y: auto;">
    <van-row :gutter="10" style="margin-bottom:10px;margin-top:10px;align-items: center;">
      <van-col :span="3" style="text-align: center;">
        <span class="rank-title">{{ $t('text.rank') }}</span>
      </van-col>
      <van-col :span="14" style="text-align: center;">
        <span class="rank-title">{{ $t('text.wallet') }}</span>
      </van-col>
      <van-col :span="6" style="text-align: right;">
        <span class="rank-title">{{ $t('text.point') }}</span>
      </van-col>
      <van-col :span="3" style="text-align: center;">
        <span class="rank-num self">{{ data.rank }}</span>
      </van-col>
      <van-col :span="14">
        <a style="color:var(--van-gray-9);" :href="`${$store.state.config?.explorer}/address/${data.walletAddress}`">
          <van-text-ellipsis :content="data.walletAddress" />
        </a>
      </van-col>
      <van-col :span="6" style="text-align: right;">
        <b>{{ data.point }}</b>
      </van-col>
    </van-row>
    <van-pull-refresh v-model="loading" @refresh="onRefresh" :loosing-text="$t('text.loosingText')" :loading-text="$t('text.loadingText')" :pulling-text="$t('text.pullingText')">
      <van-list :finished="finished" :finished-text="$t('text.finishedText')" @load="pegeHanlder">
        <van-row :gutter="10" v-for="(item,index) in listData" :key="item" :title="item.userId" style="margin-bottom:10px;margin-top:10px;align-items: center;">
          <van-col :span="3" style="text-align: center;">
            <span class="rank-num" :class="`rank-num${index}`">{{ item.rank }}</span>
          </van-col>
          <van-col :span="14">
            <a style="color:var(--van-gray-9);" :href="`${$store.state.config?.explorer}/address/${item.walletAddress}`">
              <van-text-ellipsis :content="item.walletAddress" />
            </a>
          </van-col>
          <van-col :span="6" style="text-align: right;">
            <b>{{ item.point }}</b>
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
const listDatao = ref([]);
const loading = ref(false);
const finished = ref(false);
const page = ref(1);
const data = ref({
  rank: 1,
  walletAddress: "--",
  point: "--"
});
onMounted(() => {
  page.value = 1;
  query()
})
function query() {
  /*let data = {
    isFinished: true,
    address: store.state.metaMask?.account,
    pageSize: 20,
    pageNum: page.value
  }*/
  loading.value = true;
  bscApi.rankList(100).then((res) => {
    if (res.code == 0) {
      if (res.data) {
        listDatao.value = res.data;
      }
      loading.value = false;
      pegeHanlder();
    }
  })
}
function queryRank() {
  bscApi.rank(store.state.user.id).then((res) => {
    if (res.code == 0) {
      if (res.data) {
        data.value = res.data;
      }
    }
  })
}
function pegeHanlder() {
  let pagesize = 10;
  let limit = listDatao.value.length > page.value * pagesize ? page.value * pagesize : listDatao.value.length;
  listData.value = listDatao.value.filter((item, i) => i < page.value * pagesize);
  if (limit == listDatao.value.length) finished.value = true;
  else page.value++
}
function onRefresh() {
  pegeHanlder();
} 
</script>
<style lang="scss" scoped>
.rank-title{
  display:inline-block;
  padding-bottom: 10px;
  color:var(--vant-gray-6)
}
.rank-num {
  display: inline-block;
  width: 24px;
  height: 24px;
  font-size: 12px;
  font-family:"Teko",Verdana,sans-serif;
  text-align: center;
  line-height: 24px;
  border-radius: 14px;
  background-color: rgba(255, 255, 255, 0.1);
}
.rank-num.self {
  width: 100%;
  font-weight:600;
  color: var(--van-primary-color);
  background-color: transparent;
  color: var(--van-primary-color);
}
.rank-num.rank-num0 {
  font-size: 13px;
  font-weight:600;
  color: #d05454;
  border: 0.5px solid #d05454;
  box-shadow: 0 1px 6px 0 #d05454;
}
.rank-num.rank-num1 {
  font-size: 13px;
  font-weight:600;
  color: #8c54d0;
  border: 0.5px solid #8c54d0;
  box-shadow: 0 1px 6px 0 #8c54d0;
}
.rank-num.rank-num2 {
  color: #548bd0;
  font-weight:600;
  border: 0.5px solid #548bd0;
  box-shadow: 0 1px 6px 0 #548bd0;
}
.rank-num.rank-num3 {
  color: #6dd054;
  font-weight:600;
  border: 0.5px solid #6dd054;
  box-shadow: 0 1px 6px 0 #6dd054;
}
b{font-family:"Teko",Tahoma,sans-serif}
</style>