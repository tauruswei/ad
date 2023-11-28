<template>
  <van-popup v-model:show="show" position="bottom" :style="{height: '300px'}" closeable close-icon="close" round :close-on-click-overlay="false" @close="close">
    <van-form ref="formRef" style="padding:10px 15px 20px;font-size:17px">
      <h3>{{ title }}</h3>
      <van-cell-group inset style="margin-bottom:15px;">
        <van-field v-if="type == 'evic_play'" v-model="action.amount1" name="amount1" label="EVIC:" type="number" required  @input="evicChange" :disabled="disabled" :placeholder="$t('text.amount')" clickable />
        <van-field v-if="type != 'evic_play'" v-model="action.amount" name="amount" label="BUSD:" type="number" required  @input="busdChange" :placeholder="$t('text.amount')" clickable />
        <van-field v-if="type != 'evic_play'" v-model="action.amount1" name="amount1" label="EVIC:" type="number" required  @input="evicChange" :placeholder="$t('text.amount')" clickable />
      </van-cell-group>
      <div>
        {{type.split('_')[0].toUpperCase()+' '+$t('text.allowance')+": " }}<b>{{ $store.state.allowance[type] }}</b>&nbsp;&nbsp;
        <van-icon name="replay" @click="refresh" />
      </div>
      <van-button @click="submit('')" native-type="button" style="width:100%;margin-bottom: 10px;">
        {{$t('btn.approve')}}
      </van-button>
      <van-button v-if="type == 'evic_play'" native-type="button" type="primary" @click="submit('evic_play')" style="width:100%">
        {{$t('btn.buy')}}
      </van-button>
      <van-button v-if="type=='busd_exchange'" native-type="button" type="primary" @click="submit('busd_exchange')" style="width:100%">
        BUSD <van-icon name="exchange" /> EVIC
      </van-button>
      <van-button v-if="type=='evic_exchange'" native-type="button" type="primary" @click="submit('evic_exchange')" style="width:100%">
        EVIC <van-icon name="exchange" /> BUSD
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
  amount: "",
  amount1: "",
  command: ""
})
const props = defineProps({
  type: {
    type: String,
    default: ""
  },
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
  }else{
    if(props.type == "evic_play"){
      action.value.amount1 = store.state.pools[store.state.pool+''];
      disabled.value = true;
    }
  }
})
function check(type) {
  let ret = true;
  if (type == 'evic') {
    if (!action.value.amount1) {
      showFailToast(`${proxy.$t("error.required")}`);
      return false;
    } else {
      if (action.command && action.value.amount1 < store.state.balance.evic) {
        showFailToast(`${proxy.$t("error.max")}`)
        return false;
      }
    }
  } else {
    if (!action.value.amount) {
      showFailToast(`${proxy.$t("error.required")}`)
      return false;
    }
    else {
      if (action.command && action.value.amount < store.state.balance.busd) {
        showFailToast(`${proxy.$t("error.max")}`)
        return false;
      }
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
    amount: "",
    amount1: "",
    command: ""
  }
  disabled.value = false
}
const submit = (command) => {
  action.value.command = command;
  let valid = check("evic");
  if (!valid) return;
  if(props.type !== "evic_play"){
    if(!check("busd")) return;
  }
  emit("do", toRaw(action.value))
}
function busdChange() {
  action.value.amount1 = action.value.amount * 100
}
function evicChange() {
  action.value.amount = action.value.amount1 / 100
}
function refresh() {
  emit('refresh')
}
</script>
