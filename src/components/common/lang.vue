<template>
  <div>
    <van-popover v-model:show="showPopover" :actions="columns" @select="onChange">
      <template #reference>
        <van-button size="small" round>{{result}}</van-button>
      </template>
    </van-popover>
  </div>
</template>
  
<script setup>
import { onMounted, ref } from 'vue';
import { vantLocales } from '@/lang';
import { useI18n } from 'vue-i18n'
const { locale } = useI18n();
const result = ref(localStorage.getItem("language"));
const showPopover = ref(false);
const columns = [
  { text: '繁体中文', value: 'zh' },
  { text: 'English', value: 'en' },
];
const onChange = (action) => {
  let lang = action.value
  //切换vant组件语言
  vantLocales(lang)
  //切换页面中的语言
  locale.value = lang;
  localStorage.setItem("language", lang)
  result.value = action.text;
  showPopover.value = false;
};
onMounted(()=>{
    let lang = localStorage.getItem("language");
    result.value = columns.find(i=>i.value == lang).text;
})
</script>

