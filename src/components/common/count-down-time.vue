<template>
  <van-button style="width:100%" @click="getVerifyCode" type="primary" :disabled="btndisabled" plain>
    <span v-if="!btndisabled">{{sendBtnText}}</span>
    <span v-if="btndisabled">{{ time }}</span>
  </van-button>
</template>
<script setup>
import { showNotify, showToast } from 'vant';
import { ref, onBeforeUnmount, watch } from 'vue';
import { userApi } from "@/api/request";
const sendBtnText = ref("Send");
const btndisabled = ref(false);
const emailValue = ref()
const props = defineProps({
  email: { type: String }
})
const emit = defineEmits(['send'])
const time = ref(0);
let gen = null;
let timer = null;
watch(() => props.email, (val) => {
  if (!val) {
    return;
  }
  emailValue.value = val
}, { immediate: true })
//生成器
function* genTime(num) {
  let second = num;
  while (true) {
    second -= 1;
    if (second === -1) {
      clear()
    }
    yield `${second} s`;
  }
}
async function emailVaild() {
  let ret = false;
  await userApi.checkEmail(emailValue.value).then(res => {
    if (res.data) ret = true
    else showNotify({type:"danger",message:"this email has been used,please use another one"});
  })
  return ret
}
async function getVerifyCode() {
  if (!emailValue.value) {
    showNotify({type:"danger",message:"Email is required"})
    return;
  }
  let isEmailAvaliable = await emailVaild()
  if(!isEmailAvaliable) return;
  emit("send", true);
  sendBtnText.value = "Sending..."
  userApi.code({ email: emailValue.value }).then(res => {
    if (res.code == 0) {
      showToast("The verification code has been sent to your email!");

      btndisabled.value = true;
      if (timer) clearInterval(timer);
      gen = genTime(res.data);
      timer = setInterval(() => {
        time.value = gen.next().value;
      },1000)
    } else {
      emit("send", false);
    }
    sendBtnText.value = "Send"
  })
}
function clear() {
  clearInterval(timer);
  gen = null;
  btndisabled.value = false;
  emit("send", false);
}
onBeforeUnmount(() => {
  clear()
})
  </script>