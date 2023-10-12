<template>
  <div style="margin:20vh 5vw;text-align:center;">
    <van-image :src="require('@/assets/img/logo.webp')"></van-image>
    <div style="margin-bottom:10px;margin-top:5vh;border-bottom:.5px solid rgba(255,255,255,.2)">
      <van-field v-model="invideCode" label="" placeholder="" readonly/>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import {useStore} from "vuex";
import { useRouter } from "vue-router";
const router = useRouter();
const store = useStore();
const invideCode = ref("");
function getQueryParamByKey(key) {
  let url = window.location.href;
  let paramsStr = url.split("?")[1];
  let params = {};
  for (let i = 0; i < paramsStr.length; i++) {
    let item = paramsStr.split("=");
    params[item[0]] = item[1]
  }
  return decodeURIComponent(params[key])
}
onMounted(() => {
  invideCode.value = getQueryParamByKey('inviteCode');
  if(invideCode.value){
    store.commit("setInviteCode",invideCode.value);
    store.commit("setMetaMask",null);
    router.push({ path: "/" });
  } 
})
</script>