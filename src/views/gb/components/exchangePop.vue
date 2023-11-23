<template>
  <van-popup v-model:show="show" position="bottom" :style="{height: '280px'}" closeable close-icon="close" round :close-on-click-overlay="false" @close="close">
    <van-form ref="formRef" style="padding:10px 15px 20px;font-size:17px">
      <h3>{{ title }}</h3>
      <van-cell-group inset style="margin-bottom:15px;">
        <van-field v-if="type == 'evic_play'" v-model="action.amount1" name="amount1" label="EVIC:" type="number" :rules="rules.amount1" required :error-message="error.msg2" @input="evicChange" :placeholder="$t('text.amount')" clickable />
        <van-field v-if="type != 'evic_play'" v-model="action.amount" name="amount" label="BUSD:" type="number" :rules="rules.amount" required :error-message="error.msg1" @input="busdChange" :placeholder="$t('text.amount')" clickable />
        <van-field v-if="type != 'evic_play'" v-model="action.amount1" name="amount1" label="EVIC:" type="number" :rules="rules.amount1" required :error-message="error.msg2" @input="evicChange" :placeholder="$t('text.amount')" clickable />
      </van-cell-group>
      <div>{{type.split('_')[0].toUpperCase()+' '+$t('text.allowance')+": " }}<b>{{ $store.state.allowance[type] }}</b></div>
      <van-button @click="submit('')" native-type="button" style="width:100%;margin-bottom: 10px;">
        {{$t('btn.approve')}}
      </van-button>
      <van-button v-if="type == 'evic_play'" native-type="button" type="primary" @click="submit('evic_play')" style="width:100%">
        {{$t('btn.buy')}}
      </van-button>
      <van-button v-if="type=='busd_exchange'" native-type="button" type="primary" @click="submit('busd_exchange')" style="width:100%">
        {{$t('text.exchangeTo') + ' EVIC'}}
      </van-button>
      <van-button v-if="type=='evic_exchange'" native-type="button" type="primary" @click="submit('evic_exchange')" style="width:100%">
        {{$t('text.exchangeTo')+ " BUSD"}}
      </van-button>
    </van-form>
  </van-popup>
</template>
<script setup>
import { ref, watch, getCurrentInstance, toRaw } from "vue";
import { useStore } from "vuex";
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
const emit = defineEmits(['update:visible', 'do'])
watch(() => props.visible, (val) => {
  show.value = val;
  if (!val) {
    formRef.value.resetValidation();
    reset();
  }
})
const rules = ref({
  amount1: [{ required: true, message: proxy.$t("error.required") },
  {
    validator: (val) =>
      new Promise((resolve) => {
        if (val < store.state.balance.evic) {
          resolve();
        }
      }),
    message: proxy.$t("error.max")
  }],
  amount: [{ required: true, message: proxy.$t("error.required") },
  {
    validator: (val) =>
      new Promise((resolve) => {
        if (val < store.state.balance.busd) {
          resolve();
        }
      }),
    message: proxy.$t("error.max")
  }]
})
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
}
const submit = (command) => {
  formRef.value?.validate(['action.value.amount','action.value.amount1']).then((res) => {
    console.log("***************",res)
    action.value.command = command;
    emit("do", toRaw(action.value))
  }).catch(error => {
    console.log(error)
  })
}
function busdChange() {
  action.value.amount1 = action.value.amount * 100
}
function evicChange() {
  action.value.amount = action.value.amount1 / 100
}
</script>
