<template>
  <van-popup v-model:show="show" position="bottom" :style="{height: '300px'}" closeable close-icon="close" round :close-on-click-overlay="false" @close="close">
    <van-form ref="formRef" style="padding:10px 15px 20px;font-size:17px">
      <h3>{{ title }}</h3>
      <van-cell-group inset style="margin-bottom:15px;">
        <van-field v-model="action.amount" name="amount" label="NFT:" type="number" required @input="nftChange" :disabled="disabled" :placeholder="$t('text.amount')" clickable />
        <van-field v-model="action.amount1" name="amount1" label="USDT:" type="number" required @input="busdChange" :placeholder="$t('text.amount')" clickable />
      </van-cell-group>
      <div>
        {{ 'USDT '+$t('text.allowance')+": " }}<b>{{ $store.state.allowance.busd }}</b>&nbsp;&nbsp;
        <van-icon name="replay" @click="refresh" />
      </div>
      <van-button @click="submit($event,'approve')" native-type="button" style="width:100%;margin-bottom: 10px;">
        {{$t('btn.approve')}}
      </van-button>
      <van-button native-type="button" type="primary" @click="submit($event,'buy')" style="width:100%">
        {{$t('btn.buy')}}
      </van-button>
    </van-form>
  </van-popup>
</template>
<script setup>
import { showFailToast } from "vant";
import { ref, watch, getCurrentInstance, toRaw } from "vue";
import { useStore } from "vuex";
const disabled = ref(false)
const { proxy } = getCurrentInstance();
const store = useStore()
const formRef = ref()
const show = ref(false)
const action = ref({
  amount: "1",
  amount1: "10",
  command:"approve"
})
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String
  },
  error: {
    type: Object
  }
})
const emit = defineEmits(['update:visible', 'do', "refresh", 'reset'])
watch(() => props.visible, (val) => {
  show.value = val;
  if (!val) {
    formRef.value.resetValidation();
    reset();
  } else {
    action.value.amount1 = 10;
    disabled.value = true;
  }
})
function check() {
  let ret = true;
  if (!action.value.amount1) {
    showFailToast(`${proxy.$t("error.required")}`);
    return false;
  } else {
    if (action.value.amount1 > store.state.balance.busd) {
      showFailToast(`${proxy.$t("error.max")}`)
      return false;
    }
  }
  return ret;
}
const close = () => {
  emit('update:visible', false);
  formRef.value.resetValidation();
  reset();
}
const reset = () => {
  action.value = {
    amount: "1",
    amount1: "10",
    command:"approve"
  }
  disabled.value = false
}
const submit = (event,command) => {
  action.value.command = command;
  let valid = check();
  if (!valid) return;
  emit("do", toRaw(action.value),event)
}
function busdChange() {
  action.value.amount = action.value.amount1 / 10
}
function nftChange() {
  action.value.amount1 = action.value.amount * 10
}
function refresh() {
  emit('refresh')
}
</script>
