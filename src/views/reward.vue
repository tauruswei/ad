<template>
    <div>
      <!--<van-nav-bar safe-area-inset-top>
        <template #title>
          <img :src="require('../../assets/logo.png')" style="height:28px"/>
        </template>
      </van-nav-bar>-->
      <div class="content-container">
        <div class="border-bg">
          <div>
            <span style="display:inline-block;font-size:16px;margin:15px 10px 10px;line-height:24px;padding:2px 8px;color:var(--van-primary-color);background-color:#4d4159;border-radius:4px;" @click="openSidebar">
              <van-icon name="wap-nav" />
            </span>
          </div>
          <div></div>
          <div></div>
        </div>
        <div class="ui-content">
          <div class="wallet"></div>
          <div class="bg">
            <van-grid :column-num="2">
              <van-grid-item>
                <van-icon name="friends" size="48" />
                <h3>{{ number }}</h3>
                {{$t('text.inviteNum')}}
              </van-grid-item>
              <van-grid-item>
                <van-icon name="gem" size="48" />
                <h3>{{ reward }}</h3>
                {{$t('text.reward')}}
              </van-grid-item>
            </van-grid>
            <div style="padding:0 10px 10px;text-align: center;">
                <van-image width="360px" fill="contain" :src="require('@/assets/img/bannerhead02.png')"></van-image>
                <div style="font-weight: bold;font-size: 15px;">{{$t('btn.invite')}}</div>
                <p style="color:var(--van-gray-5);margin-bottom:15px;">{{$t('message.invite.sub')}}</p>
                <van-button v-if="$store.state.metaMask" type="primary" @click="copy(`${inviteUrl}?inviteCode=${encodeURIComponent($store.state.mycode)}`)">&nbsp;&nbsp;{{$t('text.clickcopy')}}&nbsp;&nbsp;</van-button>
                &nbsp;&nbsp;
                <van-button type="success" v-if="reward" @click="withdraw('aac')">&nbsp;&nbsp;{{$t('btn.withdraw')}}&nbsp;&nbsp;</van-button>
              </div>
          </div>
        </div>
      </div>
      <side-bar v-model:visible="sidebarVisible" ></side-bar>
    </div>
  </template>
  <script setup>
  import { ref, onMounted, getCurrentInstance, onUnmounted } from "vue"
  import { useStore } from "vuex"
  import { DateHelper } from "@/utils/helper";
  import { loadingHelper } from "@/utils/loading";
  import { userApi,rebateApi } from "@/api/request";
  import { base64 } from "@/utils/base64";
  import { copyClick } from '@/utils/copy';
  import { showNotify, showToast } from 'vant';
  import MetamaskConnect from "@/components/user/metamask.vue";
  import SideBar from "@/components/user/sidebar.vue";
  import Bus from "@/utils/event-bus";
  const store = useStore();
  const round = ref(1);
  const action = ref({
    amount: "0.01",
    command: ''
  });
  const amount = ref("")
  getABI();
  const abis = ref({ aac: "" })
  const visible = ref(false)
  const show = ref(true)
  const { proxy } = getCurrentInstance();
  const metaMask = proxy.metaMask;
  const hasConfig = ref(false)
  const errorMsg = ref("");
  const sidebarVisible = ref(false);
  let inviteUrl = ref('');
  let number = ref(0);
  let reward = ref(0);
  function getABI() {
    let data = {
      network: "aac"
    }
    /*let res = {
      "code": 0,
      "msg": "success",
      "data": {
          "networkName": "Double-A Chain",
          "nativeCurrency": "AAC",
          "rpcUrls": [
              "https://rpc.acuteangle.com"
          ],
          "explorer": "https://scan.acuteangle.com",
          "blockNumber": 6,
          "chainId": 512,
          "nftReceiveAddress": null,
          "tokenUriPrefix": null,
          "contract": {
              "aacFundPool": {
                  "address": "0xC7EbfC3C075c521DBf9D572710c53C16C3334Acc",
                  "proxyAddress": "0xC7EbfC3C075c521DBf9D572710c53C16C3334Acc",
                  "abi": "WwoJewoJCSJpbnB1dHMiOiBbCgkJCXsKCQkJCSJpbnRlcm5hbFR5cGUiOiAiYWRkcmVzcyIsCgkJCQkibmFtZSI6ICJfb3BlcmF0b3IiLAoJCQkJInR5cGUiOiAiYWRkcmVzcyIKCQkJfQoJCV0sCgkJIm5hbWUiOiAiYWRkT3BlcmF0b3IiLAoJCSJvdXRwdXRzIjogW10sCgkJInN0YXRlTXV0YWJpbGl0eSI6ICJub25wYXlhYmxlIiwKCQkidHlwZSI6ICJmdW5jdGlvbiIKCX0sCgl7CgkJImlucHV0cyI6IFtdLAoJCSJzdGF0ZU11dGFiaWxpdHkiOiAibm9ucGF5YWJsZSIsCgkJInR5cGUiOiAiY29uc3RydWN0b3IiCgl9LAoJewoJCSJhbm9ueW1vdXMiOiBmYWxzZSwKCQkiaW5wdXRzIjogWwoJCQl7CgkJCQkiaW5kZXhlZCI6IGZhbHNlLAoJCQkJImludGVybmFsVHlwZSI6ICJhZGRyZXNzIiwKCQkJCSJuYW1lIjogInByZXZpb3VzQWRtaW4iLAoJCQkJInR5cGUiOiAiYWRkcmVzcyIKCQkJfSwKCQkJewoJCQkJImluZGV4ZWQiOiBmYWxzZSwKCQkJCSJpbnRlcm5hbFR5cGUiOiAiYWRkcmVzcyIsCgkJCQkibmFtZSI6ICJuZXdBZG1pbiIsCgkJCQkidHlwZSI6ICJhZGRyZXNzIgoJCQl9CgkJXSwKCQkibmFtZSI6ICJBZG1pbkNoYW5nZWQiLAoJCSJ0eXBlIjogImV2ZW50IgoJfSwKCXsKCQkiYW5vbnltb3VzIjogZmFsc2UsCgkJImlucHV0cyI6IFsKCQkJewoJCQkJImluZGV4ZWQiOiB0cnVlLAoJCQkJImludGVybmFsVHlwZSI6ICJhZGRyZXNzIiwKCQkJCSJuYW1lIjogImJlYWNvbiIsCgkJCQkidHlwZSI6ICJhZGRyZXNzIgoJCQl9CgkJXSwKCQkibmFtZSI6ICJCZWFjb25VcGdyYWRlZCIsCgkJInR5cGUiOiAiZXZlbnQiCgl9LAoJewoJCSJpbnB1dHMiOiBbXSwKCQkibmFtZSI6ICJkZXBvc2l0IiwKCQkib3V0cHV0cyI6IFtdLAoJCSJzdGF0ZU11dGFiaWxpdHkiOiAicGF5YWJsZSIsCgkJInR5cGUiOiAiZnVuY3Rpb24iCgl9LAoJewoJCSJpbnB1dHMiOiBbCgkJCXsKCQkJCSJpbnRlcm5hbFR5cGUiOiAidWludDI1NiIsCgkJCQkibmFtZSI6ICJfbWF4UGxheWVycyIsCgkJCQkidHlwZSI6ICJ1aW50MjU2IgoJCQl9LAoJCQl7CgkJCQkiaW50ZXJuYWxUeXBlIjogInVpbnQyNTYiLAoJCQkJIm5hbWUiOiAiX2ZpcnN0UmV3YXJkIiwKCQkJCSJ0eXBlIjogInVpbnQyNTYiCgkJCX0sCgkJCXsKCQkJCSJpbnRlcm5hbFR5cGUiOiAidWludDI1NiIsCgkJCQkibmFtZSI6ICJfc2Vjb25kUmV3YXJkIiwKCQkJCSJ0eXBlIjogInVpbnQyNTYiCgkJCX0sCgkJCXsKCQkJCSJpbnRlcm5hbFR5cGUiOiAidWludDI1NiIsCgkJCQkibmFtZSI6ICJfdGhpcmRSZXdhcmQiLAoJCQkJInR5cGUiOiAidWludDI1NiIKCQkJfSwKCQkJewoJCQkJImludGVybmFsVHlwZSI6ICJ1aW50MjU2IiwKCQkJCSJuYW1lIjogIl9taW5BbW91bnQiLAoJCQkJInR5cGUiOiAidWludDI1NiIKCQkJfQoJCV0sCgkJIm5hbWUiOiAiaW5pdGlhbGl6ZSIsCgkJIm91dHB1dHMiOiBbXSwKCQkic3RhdGVNdXRhYmlsaXR5IjogIm5vbnBheWFibGUiLAoJCSJ0eXBlIjogImZ1bmN0aW9uIgoJfSwKCXsKCQkiYW5vbnltb3VzIjogZmFsc2UsCgkJImlucHV0cyI6IFsKCQkJewoJCQkJImluZGV4ZWQiOiBmYWxzZSwKCQkJCSJpbnRlcm5hbFR5cGUiOiAidWludDgiLAoJCQkJIm5hbWUiOiAidmVyc2lvbiIsCgkJCQkidHlwZSI6ICJ1aW50OCIKCQkJfQoJCV0sCgkJIm5hbWUiOiAiSW5pdGlhbGl6ZWQiLAoJCSJ0eXBlIjogImV2ZW50IgoJfSwKCXsKCQkiYW5vbnltb3VzIjogZmFsc2UsCgkJImlucHV0cyI6IFsKCQkJewoJCQkJImluZGV4ZWQiOiB0cnVlLAoJCQkJImludGVybmFsVHlwZSI6ICJhZGRyZXNzIiwKCQkJCSJuYW1lIjogInByZXZpb3VzT3duZXIiLAoJCQkJInR5cGUiOiAiYWRkcmVzcyIKCQkJfSwKCQkJewoJCQkJImluZGV4ZWQiOiB0cnVlLAoJCQkJImludGVybmFsVHlwZSI6ICJhZGRyZXNzIiwKCQkJCSJuYW1lIjogIm5ld093bmVyIiwKCQkJCSJ0eXBlIjogImFkZHJlc3MiCgkJCX0KCQldLAoJCSJuYW1lIjogIk93bmVyc2hpcFRyYW5zZmVycmVkIiwKCQkidHlwZSI6ICJldmVudCIKCX0sCgl7CgkJImlucHV0cyI6IFtdLAoJCSJuYW1lIjogInBhdXNlIiwKCQkib3V0cHV0cyI6IFtdLAoJCSJzdGF0ZU11dGFiaWxpdHkiOiAibm9ucGF5YWJsZSIsCgkJInR5cGUiOiAiZnVuY3Rpb24iCgl9LAoJewoJCSJhbm9ueW1vdXMiOiBmYWxzZSwKCQkiaW5wdXRzIjogWwoJCQl7CgkJCQkiaW5kZXhlZCI6IGZhbHNlLAoJCQkJImludGVybmFsVHlwZSI6ICJhZGRyZXNzIiwKCQkJCSJuYW1lIjogImFjY291bnQiLAoJCQkJInR5cGUiOiAiYWRkcmVzcyIKCQkJfQoJCV0sCgkJIm5hbWUiOiAiUGF1c2VkIiwKCQkidHlwZSI6ICJldmVudCIKCX0sCgl7CgkJImlucHV0cyI6IFsKCQkJewoJCQkJImludGVybmFsVHlwZSI6ICJ1aW50MjU2IiwKCQkJCSJuYW1lIjogInJvdW5kSW5kZXgiLAoJCQkJInR5cGUiOiAidWludDI1NiIKCQkJfSwKCQkJewoJCQkJImludGVybmFsVHlwZSI6ICJhZGRyZXNzIiwKCQkJCSJuYW1lIjogImZpcnN0IiwKCQkJCSJ0eXBlIjogImFkZHJlc3MiCgkJCX0sCgkJCXsKCQkJCSJpbnRlcm5hbFR5cGUiOiAiYWRkcmVzcyIsCgkJCQkibmFtZSI6ICJzZWNvbmQiLAoJCQkJInR5cGUiOiAiYWRkcmVzcyIKCQkJfSwKCQkJewoJCQkJImludGVybmFsVHlwZSI6ICJhZGRyZXNzIiwKCQkJCSJuYW1lIjogInRoaXJkIiwKCQkJCSJ0eXBlIjogImFkZHJlc3MiCgkJCX0KCQldLAoJCSJuYW1lIjogInBheW91dCIsCgkJIm91dHB1dHMiOiBbXSwKCQkic3RhdGVNdXRhYmlsaXR5IjogIm5vbnBheWFibGUiLAoJCSJ0eXBlIjogImZ1bmN0aW9uIgoJfSwKCXsKCQkiaW5wdXRzIjogWwoJCQl7CgkJCQkiaW50ZXJuYWxUeXBlIjogImFkZHJlc3MiLAoJCQkJIm5hbWUiOiAiX29wZXJhdG9yIiwKCQkJCSJ0eXBlIjogImFkZHJlc3MiCgkJCX0KCQldLAoJCSJuYW1lIjogInJlbW92ZU9wZXJhdG9yIiwKCQkib3V0cHV0cyI6IFtdLAoJCSJzdGF0ZU11dGFiaWxpdHkiOiAibm9ucGF5YWJsZSIsCgkJInR5cGUiOiAiZnVuY3Rpb24iCgl9LAoJewoJCSJpbnB1dHMiOiBbXSwKCQkibmFtZSI6ICJyZW5vdW5jZU93bmVyc2hpcCIsCgkJIm91dHB1dHMiOiBbXSwKCQkic3RhdGVNdXRhYmlsaXR5IjogIm5vbnBheWFibGUiLAoJCSJ0eXBlIjogImZ1bmN0aW9uIgoJfSwKCXsKCQkiYW5vbnltb3VzIjogZmFsc2UsCgkJImlucHV0cyI6IFsKCQkJewoJCQkJImluZGV4ZWQiOiB0cnVlLAoJCQkJImludGVybmFsVHlwZSI6ICJ1aW50MjU2IiwKCQkJCSJuYW1lIjogInJvdW5kSW5kZXgiLAoJCQkJInR5cGUiOiAidWludDI1NiIKCQkJfSwKCQkJewoJCQkJImluZGV4ZWQiOiBmYWxzZSwKCQkJCSJpbnRlcm5hbFR5cGUiOiAiYWRkcmVzc1tdIiwKCQkJCSJuYW1lIjogInBsYXllckFkZHJlc3NlcyIsCgkJCQkidHlwZSI6ICJhZGRyZXNzW10iCgkJCX0sCgkJCXsKCQkJCSJpbmRleGVkIjogZmFsc2UsCgkJCQkiaW50ZXJuYWxUeXBlIjogInVpbnQyNTYiLAoJCQkJIm5hbWUiOiAidG90YWxGdW5kIiwKCQkJCSJ0eXBlIjogInVpbnQyNTYiCgkJCX0KCQldLAoJCSJuYW1lIjogIlJvdW5kRmluaXNoZWQiLAoJCSJ0eXBlIjogImV2ZW50IgoJfSwKCXsKCQkiaW5wdXRzIjogWwoJCQl7CgkJCQkiaW50ZXJuYWxUeXBlIjogImFkZHJlc3MiLAoJCQkJIm5hbWUiOiAibmV3T3duZXIiLAoJCQkJInR5cGUiOiAiYWRkcmVzcyIKCQkJfQoJCV0sCgkJIm5hbWUiOiAidHJhbnNmZXJPd25lcnNoaXAiLAoJCSJvdXRwdXRzIjogW10sCgkJInN0YXRlTXV0YWJpbGl0eSI6ICJub25wYXlhYmxlIiwKCQkidHlwZSI6ICJmdW5jdGlvbiIKCX0sCgl7CgkJImlucHV0cyI6IFtdLAoJCSJuYW1lIjogInVucGF1c2UiLAoJCSJvdXRwdXRzIjogW10sCgkJInN0YXRlTXV0YWJpbGl0eSI6ICJub25wYXlhYmxlIiwKCQkidHlwZSI6ICJmdW5jdGlvbiIKCX0sCgl7CgkJImFub255bW91cyI6IGZhbHNlLAoJCSJpbnB1dHMiOiBbCgkJCXsKCQkJCSJpbmRleGVkIjogZmFsc2UsCgkJCQkiaW50ZXJuYWxUeXBlIjogImFkZHJlc3MiLAoJCQkJIm5hbWUiOiAiYWNjb3VudCIsCgkJCQkidHlwZSI6ICJhZGRyZXNzIgoJCQl9CgkJXSwKCQkibmFtZSI6ICJVbnBhdXNlZCIsCgkJInR5cGUiOiAiZXZlbnQiCgl9LAoJewoJCSJhbm9ueW1vdXMiOiBmYWxzZSwKCQkiaW5wdXRzIjogWwoJCQl7CgkJCQkiaW5kZXhlZCI6IHRydWUsCgkJCQkiaW50ZXJuYWxUeXBlIjogImFkZHJlc3MiLAoJCQkJIm5hbWUiOiAiaW1wbGVtZW50YXRpb24iLAoJCQkJInR5cGUiOiAiYWRkcmVzcyIKCQkJfQoJCV0sCgkJIm5hbWUiOiAiVXBncmFkZWQiLAoJCSJ0eXBlIjogImV2ZW50IgoJfSwKCXsKCQkiaW5wdXRzIjogWwoJCQl7CgkJCQkiaW50ZXJuYWxUeXBlIjogImFkZHJlc3MiLAoJCQkJIm5hbWUiOiAibmV3SW1wbGVtZW50YXRpb24iLAoJCQkJInR5cGUiOiAiYWRkcmVzcyIKCQkJfQoJCV0sCgkJIm5hbWUiOiAidXBncmFkZVRvIiwKCQkib3V0cHV0cyI6IFtdLAoJCSJzdGF0ZU11dGFiaWxpdHkiOiAibm9ucGF5YWJsZSIsCgkJInR5cGUiOiAiZnVuY3Rpb24iCgl9LAoJewoJCSJpbnB1dHMiOiBbCgkJCXsKCQkJCSJpbnRlcm5hbFR5cGUiOiAiYWRkcmVzcyIsCgkJCQkibmFtZSI6ICJuZXdJbXBsZW1lbnRhdGlvbiIsCgkJCQkidHlwZSI6ICJhZGRyZXNzIgoJCQl9LAoJCQl7CgkJCQkiaW50ZXJuYWxUeXBlIjogImJ5dGVzIiwKCQkJCSJuYW1lIjogImRhdGEiLAoJCQkJInR5cGUiOiAiYnl0ZXMiCgkJCX0KCQldLAoJCSJuYW1lIjogInVwZ3JhZGVUb0FuZENhbGwiLAoJCSJvdXRwdXRzIjogW10sCgkJInN0YXRlTXV0YWJpbGl0eSI6ICJwYXlhYmxlIiwKCQkidHlwZSI6ICJmdW5jdGlvbiIKCX0sCgl7CgkJImlucHV0cyI6IFtdLAoJCSJuYW1lIjogIndpdGhkcmF3IiwKCQkib3V0cHV0cyI6IFtdLAoJCSJzdGF0ZU11dGFiaWxpdHkiOiAibm9ucGF5YWJsZSIsCgkJInR5cGUiOiAiZnVuY3Rpb24iCgl9LAoJewoJCSJpbnB1dHMiOiBbCgkJCXsKCQkJCSJpbnRlcm5hbFR5cGUiOiAiYWRkcmVzcyBwYXlhYmxlIiwKCQkJCSJuYW1lIjogInJlY2lwaWVudCIsCgkJCQkidHlwZSI6ICJhZGRyZXNzIgoJCQl9CgkJXSwKCQkibmFtZSI6ICJ3aXRoZHJhd1JlbWFpbmluZyIsCgkJIm91dHB1dHMiOiBbXSwKCQkic3RhdGVNdXRhYmlsaXR5IjogIm5vbnBheWFibGUiLAoJCSJ0eXBlIjogImZ1bmN0aW9uIgoJfSwKCXsKCQkiaW5wdXRzIjogWwoJCQl7CgkJCQkiaW50ZXJuYWxUeXBlIjogInVpbnQyNTYiLAoJCQkJIm5hbWUiOiAiIiwKCQkJCSJ0eXBlIjogInVpbnQyNTYiCgkJCX0KCQldLAoJCSJuYW1lIjogImZpbmlzaFBheW91dCIsCgkJIm91dHB1dHMiOiBbCgkJCXsKCQkJCSJpbnRlcm5hbFR5cGUiOiAiYm9vbCIsCgkJCQkibmFtZSI6ICIiLAoJCQkJInR5cGUiOiAiYm9vbCIKCQkJfQoJCV0sCgkJInN0YXRlTXV0YWJpbGl0eSI6ICJ2aWV3IiwKCQkidHlwZSI6ICJmdW5jdGlvbiIKCX0sCgl7CgkJImlucHV0cyI6IFtdLAoJCSJuYW1lIjogImZpcnN0UmV3YXJkIiwKCQkib3V0cHV0cyI6IFsKCQkJewoJCQkJImludGVybmFsVHlwZSI6ICJ1aW50MjU2IiwKCQkJCSJuYW1lIjogIiIsCgkJCQkidHlwZSI6ICJ1aW50MjU2IgoJCQl9CgkJXSwKCQkic3RhdGVNdXRhYmlsaXR5IjogInZpZXciLAoJCSJ0eXBlIjogImZ1bmN0aW9uIgoJfSwKCXsKCQkiaW5wdXRzIjogWwoJCQl7CgkJCQkiaW50ZXJuYWxUeXBlIjogImFkZHJlc3MiLAoJCQkJIm5hbWUiOiAib3duZXIiLAoJCQkJInR5cGUiOiAiYWRkcmVzcyIKCQkJfQoJCV0sCgkJIm5hbWUiOiAiZ2V0UmV3YXJkc0J5T3duZXIiLAoJCSJvdXRwdXRzIjogWwoJCQl7CgkJCQkiY29tcG9uZW50cyI6IFsKCQkJCQl7CgkJCQkJCSJpbnRlcm5hbFR5cGUiOiAidWludDI1NiIsCgkJCQkJCSJuYW1lIjogInJvdW5kSW5kZXgiLAoJCQkJCQkidHlwZSI6ICJ1aW50MjU2IgoJCQkJCX0sCgkJCQkJewoJCQkJCQkiaW50ZXJuYWxUeXBlIjogInVpbnQyNTYiLAoJCQkJCQkibmFtZSI6ICJyZXdhcmQiLAoJCQkJCQkidHlwZSI6ICJ1aW50MjU2IgoJCQkJCX0KCQkJCV0sCgkJCQkiaW50ZXJuYWxUeXBlIjogInN0cnVjdCBGb3VuZHNQb29sLnBsYXllclJld2FyZFtdIiwKCQkJCSJuYW1lIjogIiIsCgkJCQkidHlwZSI6ICJ0dXBsZVtdIgoJCQl9CgkJXSwKCQkic3RhdGVNdXRhYmlsaXR5IjogInZpZXciLAoJCSJ0eXBlIjogImZ1bmN0aW9uIgoJfSwKCXsKCQkiaW5wdXRzIjogW10sCgkJIm5hbWUiOiAibWF4UGxheWVycyIsCgkJIm91dHB1dHMiOiBbCgkJCXsKCQkJCSJpbnRlcm5hbFR5cGUiOiAidWludDI1NiIsCgkJCQkibmFtZSI6ICIiLAoJCQkJInR5cGUiOiAidWludDI1NiIKCQkJfQoJCV0sCgkJInN0YXRlTXV0YWJpbGl0eSI6ICJ2aWV3IiwKCQkidHlwZSI6ICJmdW5jdGlvbiIKCX0sCgl7CgkJImlucHV0cyI6IFtdLAoJCSJuYW1lIjogIm1pbkFtb3VudCIsCgkJIm91dHB1dHMiOiBbCgkJCXsKCQkJCSJpbnRlcm5hbFR5cGUiOiAidWludDI1NiIsCgkJCQkibmFtZSI6ICIiLAoJCQkJInR5cGUiOiAidWludDI1NiIKCQkJfQoJCV0sCgkJInN0YXRlTXV0YWJpbGl0eSI6ICJ2aWV3IiwKCQkidHlwZSI6ICJmdW5jdGlvbiIKCX0sCgl7CgkJImlucHV0cyI6IFsKCQkJewoJCQkJImludGVybmFsVHlwZSI6ICJhZGRyZXNzIiwKCQkJCSJuYW1lIjogIiIsCgkJCQkidHlwZSI6ICJhZGRyZXNzIgoJCQl9CgkJXSwKCQkibmFtZSI6ICJvcGVyYXRvciIsCgkJIm91dHB1dHMiOiBbCgkJCXsKCQkJCSJpbnRlcm5hbFR5cGUiOiAiYm9vbCIsCgkJCQkibmFtZSI6ICIiLAoJCQkJInR5cGUiOiAiYm9vbCIKCQkJfQoJCV0sCgkJInN0YXRlTXV0YWJpbGl0eSI6ICJ2aWV3IiwKCQkidHlwZSI6ICJmdW5jdGlvbiIKCX0sCgl7CgkJImlucHV0cyI6IFtdLAoJCSJuYW1lIjogIm93bmVyIiwKCQkib3V0cHV0cyI6IFsKCQkJewoJCQkJImludGVybmFsVHlwZSI6ICJhZGRyZXNzIiwKCQkJCSJuYW1lIjogIiIsCgkJCQkidHlwZSI6ICJhZGRyZXNzIgoJCQl9CgkJXSwKCQkic3RhdGVNdXRhYmlsaXR5IjogInZpZXciLAoJCSJ0eXBlIjogImZ1bmN0aW9uIgoJfSwKCXsKCQkiaW5wdXRzIjogW10sCgkJIm5hbWUiOiAicGF1c2VkIiwKCQkib3V0cHV0cyI6IFsKCQkJewoJCQkJImludGVybmFsVHlwZSI6ICJib29sIiwKCQkJCSJuYW1lIjogIiIsCgkJCQkidHlwZSI6ICJib29sIgoJCQl9CgkJXSwKCQkic3RhdGVNdXRhYmlsaXR5IjogInZpZXciLAoJCSJ0eXBlIjogImZ1bmN0aW9uIgoJfSwKCXsKCQkiaW5wdXRzIjogW10sCgkJIm5hbWUiOiAicHJveGlhYmxlVVVJRCIsCgkJIm91dHB1dHMiOiBbCgkJCXsKCQkJCSJpbnRlcm5hbFR5cGUiOiAiYnl0ZXMzMiIsCgkJCQkibmFtZSI6ICIiLAoJCQkJInR5cGUiOiAiYnl0ZXMzMiIKCQkJfQoJCV0sCgkJInN0YXRlTXV0YWJpbGl0eSI6ICJ2aWV3IiwKCQkidHlwZSI6ICJmdW5jdGlvbiIKCX0sCgl7CgkJImlucHV0cyI6IFsKCQkJewoJCQkJImludGVybmFsVHlwZSI6ICJhZGRyZXNzIiwKCQkJCSJuYW1lIjogIiIsCgkJCQkidHlwZSI6ICJhZGRyZXNzIgoJCQl9CgkJXSwKCQkibmFtZSI6ICJyZXdhcmRzIiwKCQkib3V0cHV0cyI6IFsKCQkJewoJCQkJImludGVybmFsVHlwZSI6ICJ1aW50MjU2IiwKCQkJCSJuYW1lIjogIiIsCgkJCQkidHlwZSI6ICJ1aW50MjU2IgoJCQl9CgkJXSwKCQkic3RhdGVNdXRhYmlsaXR5IjogInZpZXciLAoJCSJ0eXBlIjogImZ1bmN0aW9uIgoJfSwKCXsKCQkiaW5wdXRzIjogWwoJCQl7CgkJCQkiaW50ZXJuYWxUeXBlIjogImFkZHJlc3MiLAoJCQkJIm5hbWUiOiAiIiwKCQkJCSJ0eXBlIjogImFkZHJlc3MiCgkJCX0sCgkJCXsKCQkJCSJpbnRlcm5hbFR5cGUiOiAidWludDI1NiIsCgkJCQkibmFtZSI6ICIiLAoJCQkJInR5cGUiOiAidWludDI1NiIKCQkJfQoJCV0sCgkJIm5hbWUiOiAicm91bmRSZXdhcmRzIiwKCQkib3V0cHV0cyI6IFsKCQkJewoJCQkJImludGVybmFsVHlwZSI6ICJ1aW50MjU2IiwKCQkJCSJuYW1lIjogInJvdW5kSW5kZXgiLAoJCQkJInR5cGUiOiAidWludDI1NiIKCQkJfSwKCQkJewoJCQkJImludGVybmFsVHlwZSI6ICJ1aW50MjU2IiwKCQkJCSJuYW1lIjogInJld2FyZCIsCgkJCQkidHlwZSI6ICJ1aW50MjU2IgoJCQl9CgkJXSwKCQkic3RhdGVNdXRhYmlsaXR5IjogInZpZXciLAoJCSJ0eXBlIjogImZ1bmN0aW9uIgoJfSwKCXsKCQkiaW5wdXRzIjogWwoJCQl7CgkJCQkiaW50ZXJuYWxUeXBlIjogInVpbnQyNTYiLAoJCQkJIm5hbWUiOiAiIiwKCQkJCSJ0eXBlIjogInVpbnQyNTYiCgkJCX0KCQldLAoJCSJuYW1lIjogInJvdW5kcyIsCgkJIm91dHB1dHMiOiBbCgkJCXsKCQkJCSJpbnRlcm5hbFR5cGUiOiAidWludDI1NiIsCgkJCQkibmFtZSI6ICJ0b3RhbEZ1bmQiLAoJCQkJInR5cGUiOiAidWludDI1NiIKCQkJfSwKCQkJewoJCQkJImludGVybmFsVHlwZSI6ICJ1aW50MjU2IiwKCQkJCSJuYW1lIjogInRvdGFsUGxheWVycyIsCgkJCQkidHlwZSI6ICJ1aW50MjU2IgoJCQl9CgkJXSwKCQkic3RhdGVNdXRhYmlsaXR5IjogInZpZXciLAoJCSJ0eXBlIjogImZ1bmN0aW9uIgoJfSwKCXsKCQkiaW5wdXRzIjogW10sCgkJIm5hbWUiOiAicm91bmRzQ291bnQiLAoJCSJvdXRwdXRzIjogWwoJCQl7CgkJCQkiaW50ZXJuYWxUeXBlIjogInVpbnQyNTYiLAoJCQkJIm5hbWUiOiAiIiwKCQkJCSJ0eXBlIjogInVpbnQyNTYiCgkJCX0KCQldLAoJCSJzdGF0ZU11dGFiaWxpdHkiOiAidmlldyIsCgkJInR5cGUiOiAiZnVuY3Rpb24iCgl9LAoJewoJCSJpbnB1dHMiOiBbXSwKCQkibmFtZSI6ICJzZWNvbmRSZXdhcmQiLAoJCSJvdXRwdXRzIjogWwoJCQl7CgkJCQkiaW50ZXJuYWxUeXBlIjogInVpbnQyNTYiLAoJCQkJIm5hbWUiOiAiIiwKCQkJCSJ0eXBlIjogInVpbnQyNTYiCgkJCX0KCQldLAoJCSJzdGF0ZU11dGFiaWxpdHkiOiAidmlldyIsCgkJInR5cGUiOiAiZnVuY3Rpb24iCgl9LAoJewoJCSJpbnB1dHMiOiBbXSwKCQkibmFtZSI6ICJ0aGlyZFJld2FyZCIsCgkJIm91dHB1dHMiOiBbCgkJCXsKCQkJCSJpbnRlcm5hbFR5cGUiOiAidWludDI1NiIsCgkJCQkibmFtZSI6ICIiLAoJCQkJInR5cGUiOiAidWludDI1NiIKCQkJfQoJCV0sCgkJInN0YXRlTXV0YWJpbGl0eSI6ICJ2aWV3IiwKCQkidHlwZSI6ICJmdW5jdGlvbiIKCX0sCgl7CgkJImlucHV0cyI6IFtdLAoJCSJuYW1lIjogInRvdGFsUmV3YXJkcyIsCgkJIm91dHB1dHMiOiBbCgkJCXsKCQkJCSJpbnRlcm5hbFR5cGUiOiAidWludDI1NiIsCgkJCQkibmFtZSI6ICIiLAoJCQkJInR5cGUiOiAidWludDI1NiIKCQkJfQoJCV0sCgkJInN0YXRlTXV0YWJpbGl0eSI6ICJ2aWV3IiwKCQkidHlwZSI6ICJmdW5jdGlvbiIKCX0KXQ==",
                  "image": null
              }
          }
      }
  }
  setTimeout(()=>{
    hasConfig.value = true;
        store.commit("setABI",res.data);
        abis.value = { aac: JSON.parse(base64.decode(store.state.abi?.contract.aacFundPool.abi)) }
        if (metaMask.isAvailable()) {
          refresh()
        }
  },100)*/
  
    userApi.abi(data).then(res => {
      if (res.code == 0) {
        hasConfig.value = true;
        store.commit("setABI", res.data);
        abis.value = { aac: JSON.parse(base64.decode(store.state.abi?.contract.aacFundPool.abi)) }
        if (metaMask.isAvailable()) {
          refresh()
        }
      }
    })
  }
  function isEmpty() {
    if (!action.value.amount) {
      errorMsg.value = proxy.$t("error.required")
    }
    return !!action.value.amount;
  }
  function getInviteNumber() {
    loadingHelper.show();
    rebateApi.number().then((res) => {
      loadingHelper.hide()
      number.value = res.data.level1;
    }).catch(err => {
      loadingHelper.hide();
    })
  }
  function getReward() {
    let data = {
        userId:3,
        assetType:100
    }
    loadingHelper.show();
    rebateApi.reward(data).then((res) => {
      loadingHelper.hide()
      reward.value = res.data[0].amount;
    }).catch(err => {
      loadingHelper.hide();
    })
  }
  async function withdraw() {
    if (!metaMask.isAvailable()) return;
    let param = {
      form:store.state.abi?.contract.aacFundPool.address,
      to: store.state.metaMask?.account,
      value:reward.value
    }
    let gas = await metaMask.getGasByEthers(param);
    if(!reward.value) return;
    let data = {
      transType:13,
      fromUserId:1,
      fromAssetType:100,
      fromAmount:reward.value,
      toUserId:1,
      toAmount:reward.value,
      gasPrice: Number(gas.gasPrice),
      gasLimit: Number(gas.gasLimit),
      nftVo:{}
    }
    loadingHelper.show();
    rebateApi.withdraw(data).then((res) => {
      loadingHelper.hide()
      refresh()
    }).catch(err => {
      loadingHelper.hide();
    })
  }
  function copy(val) {
    if (!store.state.mycode) return;
    copyClick(val)
  }
  function openSidebar(){
    sidebarVisible.value = true;
  }
  function refresh() {
    getInviteNumber();
    getReward();
  }
  onMounted(()=>{
    inviteUrl.value = `${window.location.protocol}//${window.location.host}/invite`;
    refresh()
  })
  
  //getABI();
  </script>
  