<template>
  <div style="height:calc(100vh - 300px);overflow-y: auto;">
    <template v-if="data.length">
      <van-row :gutter="6" style="margin:5px 0" v-for="item in data" :key="Number(item.time)">
        <van-col :span="10">
          <img style="width:100%" :src="`https://s3.ap-northeast-1.amazonaws.com/www.chessofstars.io/assets-blindboxcos/git/${Number(item[1])}.gif`"/>
        </van-col>
        <van-col :span="14" style="line-height:1.5">
          <b style="font-size:16px;line-height:2">{{Number(item[2]) }}</b> <small>COSD</small><br>
          <span>TokenID: {{ Number(item[0]) }}</span><br>
          <span>{{(Number(item[1]))+' '+$t('text.prize')}}</span>
        </van-col>
      </van-row>
    </template>
    <div v-if="!data.length" style="margin:40px auto;text-align:center">{{$t('text.nodata')}}</div>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useStore } from "vuex"
import { DateHelper } from "@/utils/helper";
const props = defineProps({ data: Array })
function formateDate(time){
  return DateHelper.toString(time,"yyyy-MM-dd hh:mm:ss")
}
</script>