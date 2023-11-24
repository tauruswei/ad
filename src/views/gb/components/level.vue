<template>
    <van-popup v-model:show="show" position="bottom" :style="{height: '280px'}" round :close-on-click-overlay="false" @close="close">
        <van-picker
        :title="title"
        :columns="columns"
        @cancel="close"
        @confirm="onConfirm"
    />
    </van-popup>
  </template>
  <script setup>
  import { ref, watch, getCurrentInstance, toRaw } from "vue";
  import { useStore } from "vuex";
  const { proxy } = getCurrentInstance();
  const store = useStore()
  const show = ref(false)
  const columns = [
      { text: 1000, value: 0 },
      { text: 2000, value: 1 },
    ];
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String
    }
  })
  const emit = defineEmits(['update:visible','select'])
  watch(() => props.visible, (val) => {
    show.value = val;
  })
  const close = () => {
    emit('update:visible', false);
  }
  const onConfirm=({ selectedOptions })=>{
    store.commit("setPool",selectedOptions[0].value)
    emit('select');
  }
  </script>
  