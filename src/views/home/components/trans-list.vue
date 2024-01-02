<template>
  <div style="height:calc(100vh - 300px);overflow-y: auto;">
    <template v-if="data.length">
      <van-row v-for="item in data" :key="item[3]">
        <van-col :span="6"></van-col>
        <van-col :span="18">
          <p>TokenID {{ data[0] }}</p>
          <p>Rank {{ data[1] }}</p>
          <p>{{ data[2] }} COSD</p>
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
</script>