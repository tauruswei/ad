<template>
    <div>
        <van-dropdown-menu>
            <van-dropdown-item v-model="result" :options="columns" @change="onChange"/>
        </van-dropdown-menu>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
import { vantLocales } from '@/lang';
import { useI18n } from 'vue-i18n'
const { locale } = useI18n();
const result = ref(localStorage.getItem("language"));
const showPicker = ref(false);
const columns = [
    { text: '繁体中文', value: 'zh' },
    { text: 'English', value: 'en' },
];
const onChange = (value) => {
    let lang = value
    //切换vant组件语言
    vantLocales(lang)
    //切换页面中的语言
    locale.value = lang;
    localStorage.setItem("language", lang)
    result.value = value;
    showPicker.value = false;
};
</script>

