<template>
  <div>
    <!--sidebar-->
    <van-popup v-model:show="show" position="left" style="width: 50%; height: 100%;padding: 10px " @click-overlay="$emit('update:visible',false)">
      <div>
        <van-image style="height: 24px;padding:12px 0;" :src="require('@/assets/logo.png')"></van-image>
      </div>
      <div style="display:flex;justify-content: space-between;align-items:center;margin:15px 0;">
        <router-link :to="{ path:'/'}" style="color:#fff;flex:1">{{$t("text.home")}}</router-link>
        <van-icon name="arrow" />
      </div>
      <div style="display:flex;justify-content: space-between;align-items:center;margin:15px 0;">
        <router-link :to="{ path:'/reward'}" style="color:#fff;flex:1">{{$t("text.rebate")}}</router-link>
        <van-icon name="arrow" />
      </div>
      <div style="display:flex;justify-content: space-between;align-items:center;margin:15px 0;">
        <span>{{$t('btn.invite')}}</span>
        <van-button v-if="$store.state.metaMask" type="primary" size="small" @click="copy(`${inviteUrl}?inviteCode=${encodeURIComponent($store.state.mycode)}`)" round>{{$t('text.clickcopy')}}</van-button>
      </div>
      <div style="display:flex;justify-content: space-between;align-items:center;">
        <span>{{$t('text.language')}}</span>
        <language-com style="display:inline-block;"></language-com>
      </div>
    </van-popup>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import LanguageCom from "@/components/common/lang.vue";
let props = defineProps({
  visible: {
    type: Boolean,
    default: true
  }
})
let emit = defineEmits(['update:visible']);
let show = ref(false);
let inviteUrl = ref('');
watch(() => props.visible, (val) => {
  show.value = val;
  console.log('11131', show.value)
})
onMounted(() => {
  inviteUrl.value = `${window.location.protocol}//${window.location.host}/invite`;
})
  </script>