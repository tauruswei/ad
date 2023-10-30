import MetaMaskSDK from '@metamask/sdk';
import MetaMaskOnboarding from '@metamask/onboarding'
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import {ethers} from "ethers";
import store from "../store/index";
import router from "../router/index";
import {globals} from '../main.js'
import { aacApi, chainApi, userApi } from '@/api/request';
import { showToast, showSuccessToast, showFailToast, showConfirmDialog,showDialog } from 'vant';
let option = {
  injectProvider: false,
  communicationLayerPreference: 'webrtc',
  preferDesktop: true
}
const MMSDK = new MetaMaskSDK(option);
const ethereum = MMSDK.getProvider();
let web3 = new Web3(ethereum);
function toHex(num) {
  let hex = '0x' + num.toString(16);
  return hex
}
export class MetaMask {
  constructor() {
    this.provider = null;
    this.enabled = false;
    this.account = null;
    this.chainId = null;
    this.url = null;
  }
  setValue(chainId,account){
    this.provider = ethereum;
    this.account = account;
    this.chainId = chainId;
  }
  async getProvider() {
    try {
      let provider = await detectEthereumProvider()
      return provider
    } catch (error) {
      console.log(error)
    }
  }
  async getAccount(){
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    if (accounts && accounts.length) this.account = accounts[0];
    return this.account;
  }
  disconnect() {
    this.enabled = false;
    this.account = null;
    this.chainId = null;
    this.url = null;
    store.commit("setMetaMask", null)
    store.commit("balance", null)
  }
  async connectMetaMask() {
    console.log(ethereum)
    if (!this.isMetaMaskInstalled()) {
      showDialog({
        message: `${globals.$t('message.wallet.install')} <a href="https://metamask.io/">metamask.io</a>`,
      })
      // 判断是否安装MetaMask扩展工具
      const forwarderOrigin = window.location.origin
      const onboarding = new MetaMaskOnboarding({
        forwarderOrigin
      })
      onboarding.startOnboarding()
      return
    } else {
      web3 = new Web3(ethereum)
    }
    let provider = await this.getProvider()
    if (provider !== ethereum) {
      console.log("provider",provider)
      console.log("ethereum",provider)
      console.error('Do you have multiple wallets installed?');
    }
    this.provider = ethereum;

    try {
      console.log("store.state.abi:");
      console.log(store.state.abi);
      const CHAINID = toHex(store.state.abi?.chainId)
      this.chainId = await ethereum.request({ method: 'eth_chainId' })
      if (this.chainId !== CHAINID) {
        let isChecked = await this.checkNetwork();
        console.log("checkednetwork", isChecked)
        console.log(parseInt(CHAINID),this.chainId);
        showFailToast(globals.$t('message.chain.error') + parseInt(CHAINID) + '[' + this.chainId + ']).');
        if (!isChecked) return;
        this.chainId = this.toHex(store.state.abi?.chainId)
      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts && accounts.length) this.account = accounts[0];
      if (this.account) {
        store.commit("setMetaMask", { chainID: this.chainId, account: this.account, url: store.state.abi.rpcUrls[0] });
        //this.isCurrentAccount()
      } else {
        this.disconnect()
      }
    } catch (error) {
      errorHandlerOfMetaMaskRequest(error)
    }
  }
  isMetaMaskInstalled() {
    const { ethereum } = window;
    return Boolean(ethereum&& ethereum.isMetaMask)
  }
  async isMetaMaskConnected() {
    try {
      this.enabled = await ethereum.enable()
    } catch (error) {
      console.log("enable", error)
    }
  }
  //检测网络并添加
  async checkNetwork() {
    let isAdd = false;
    let isSwitch = await this.switchNetwork();
    console.log('isSwitch', isSwitch)
    if (isSwitch == 4902) {
      isAdd = await this.addNetwork();
    }
    console.log('isAdd', isAdd)
    return isSwitch === true ? true : false
  }
  async switchNetwork() {
    const CHAINID = toHex(store.state.abi?.chainId)
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAINID }], // chainId must be in hexadecimal numbers
      }).then(res => {
        console.log("success")
      })
      return true;
    } catch (error) {
      if (error.code === 4902) {
        console.log("no network")
        return 4902
      } else if (error.code === 4001) {
        showFailToast(globals.$t('message.chain.tip'));
        return false
      } else {
        return false
      }
    }
  }
  async addNetwork() {
    try {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainName: store.state.abi?.networkName,
            chainId: toHex(store.state.abi?.chainId),
            rpcUrls: [...store.state.abi?.rpcUrls],
            blockExplorerUrls: [store.state.abi?.explorer],
            nativeCurrency: {
              name: store.state.abi?.nativeCurrency,
              symbol: store.state.abi?.nativeCurrency,
              decimals: 18
            },
          },
        ],
      }).then(res => {
        console.log("success")
      })
      console.log("add network success")
      return true
    } catch (error) {
      console.log(error)
      console.log("cancel")
      errorHandlerOfMetaMaskRequest(error)
      return false
    }
  }
  isCurrentChain(id) {
    const CHAINID = toHex(store.state.abi?.chainId)
    if (id != CHAINID) {
      showFailToast(globals.$t('message.chain.error') + parseInt(CHAINID) + '[' + this.chainId + ']).');
      return false;
    } else {
      return true
    }
  }
  isCurrentAccount() {
    if (!store.state.user?.account) {
      this.noBoundAddressTips();
      return false;
    }
    if (store.state.user.account.toLowerCase() != store.state.metaMask?.account.toLowerCase()) {
      this.currentAccountTips()
      return false;
    }
    return store.state.user.account.toLowerCase() == store.state.metaMask?.account.toLowerCase();
  }
  currentAccountTips() {
    showConfirmDialog({
      message: 'The wallet address you connected is inconsistent with the wallet address bounded to user,would you like to update the wallet address?',
    }).then(() => {
      router.push("/setting/profile")
    })
  }
  noBoundAddressTips() {
    showConfirmDialog({
      message: 'Would you like to bind the current wallet address to your account?'
    }).then(() => {
      let data = {
        name: store.state.user.name,
        userId: store.state.user.id,
        walletAddress: store.state.metaMask?.account
      }
      userApi.update(data).then(res => {
        if (res.code == 0) {
          let user = store.state.user;
          store.commit("setUser", { ...user, account: store.state.metaMask?.account });
          showSuccessToast("Bind successfully!")
        }
      })
    })
  }
  async isCheckedToken() {
    let checked = await checkToken();
    return checked;
  }
  isAvailable() {
    let ret = false;
    console.log(ethereum);
    if (!this.isMetaMaskInstalled()) {
      showDialog({
        message: `${globals.$t('message.wallet.install')} <a href="https://metamask.io/">metamask.io</a>`,
      })
      store.commit("setMetaMask", null)
      return false;
    }
    if (!store.state.metaMask) {
      showFailToast(`${globals.$t("message.wallet.connect")}`)
      return false;
    } else {
      ret = true;
    }
    ret = this.isCurrentChain(store.state.metaMask?.chainID)
    //if (this.isCurrentAccount()) ret = true;
    //else {
    //  ret = false;
    //}
    return ret;
  }
  //ETH转账:eth_sendTransaction
  async sendTransaction(param) {
    let price = await this.getGasPrice();
    let gas = await this.estimateGas();
    const myContract = this.getContract(param.abi, param.address);
    if (!myContract) return;
    return new Promise((resolve, reject) => {
      //metamask参数都是16进制，web3js方法10进制
      ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: param.from, 
          to: param.address, // Required except during contract publications.
          value: toHex(param.amount * Math.pow(10,18)), 
          gasPrice: web3.utils.numberToHex(price), // Customizable by the user during MetaMask confirmation.
          gas: web3.utils.numberToHex(gas), // web3.utils.numberToHex
          chainId: store.state.metaMask?.chainID,
          data: myContract.methods[param.funcName]().encodeABI()
        }]
      })
        .then((res) => {
          console.log(res)
          resolve(res)
        })
        .catch((error) => { console.error(error); reject(error) });
    })
  }
  async sendTransactionToWithdraw(param) {
    let enable = await window.ethereum.request({method:'eth_requestAccounts'});
    console.log(enable)
    let price = await this.getGasPrice();
    let gas = await this.estimateGas();
    const myContract = this.getContract(param.abi, param.address);
    if (!myContract) return;
    return new Promise((resolve, reject) => {
      //metamask参数都是16进制，web3js方法10进制
      ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: param.address, 
          to: param.from, // Required except during contract publications.
          value: toHex(param.amount * Math.pow(10,18)), 
          gasPrice: web3.utils.numberToHex(price), // Customizable by the user during MetaMask confirmation.
          gas: web3.utils.numberToHex(gas), // web3.utils.numberToHex
          chainId: store.state.metaMask?.chainID
        }]
      })
        .then((res) => {
          console.log(res)
          resolve(res)
        })
        .catch((error) => { console.error(error); reject(error) });
    })
  }
  async getGasPrice() {
    let ret;
    await web3.eth.getGasPrice().then(res => {
      ret = Number(res);
    }).catch(err => {
      errorHandlerOfMetaMaskRequest(err)
    });
    return ret + "";
  }
  async estimateGas() {
    let ret;
    await web3.eth.estimateGas().then(res => {
      ret = Number(res);
    }).catch(err => {
      errorHandlerOfMetaMaskRequest(err)
    });
    return ret + "";
  }
  //添加代币
  watchAsset(param) {
    ethereum
      .request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: param.address,
            symbol: param.symbol,
            decimals: 18,
            image: param.image ? param.image : '',
          },
        },
      })
      .then((success) => {
        if (success) {
          console.log(success)
          console.log(param.symbol + ' successfully added to wallet!');
        } else {
          throw new Error(`${globals.$t('error.wentWrong')}`);
        }
      })
      .catch((error) => console.error(error));
  }
  async getBalance(account) {
    let balance;
    await ethereum.request({method:'eth_getBalance',params:[account,"latest"]}).then(res=>{
      balance = ethers.utils.formatEther(res)
      console.log(balance)
      })
    return balance;
  }
  getContract(abi, address) {
    if (!web3) return false;
    let contract = new web3.eth.Contract(abi, address);
    return contract
  }
  toHex(num) {
    if (!web3) return
    return web3.utils.toHex(num + '000000000000000000');
  }
  toWei(num, unit) {
    if (!web3) return
    return web3.utils.toWei(num, unit)
  }
  //交易花费gas
  async sendTransactionByContractOrigin(param) {
    const myContract = this.getContract(param.abi, param.address);
    let price = await this.getGasPrice();
    let gas = await this.estimateGas();
    console.log(this.toWei(param.amount, "ether"))
    if (!myContract) return;
    return new Promise((resolve, reject) => {
      myContract.methods.deposit().send({
        from: param.from, value: this.toWei(param.amount, "ether"),gasPrice: price,gas:gas
      }).on('receipt',res=>{
      //.then(res => {
        resolve(res)
      }).catch(err => {
        reject(err);
        showToast(err)
      })
    })
  }
  //交易不涉及gas
  async sendTransactionByContract(param) {
    const myContract = this.getContract(param.abi, param.address);
    if (!myContract) return;
    return new Promise((resolve, reject) => {
      myContract.methods[param.funcName](param.amount?toHex(this.toWei(param.amount, "ether")):null).send({
        from: param.from
      }).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err);
        showToast(err)
      })
    })
  }
  async queryTransactionByContract(param) {
    const myContract = this.getContract(param.abi, param.address);
    if (!myContract) return;
    let ret = await myContract.methods[param.funcName](param.from).call()
    return ret;
  }
  async queryRoundByContract(param) {
    const myContract = this.getContract(param.abi, param.address);
    if (!myContract) return;
    let ret = await myContract.methods[param.funcName](param.amount).call();
    return ret;
  }
  async getGasByEthers(param){
    const ethprovider = new ethers.providers.Web3Provider(ethereum);
    let gas = {
      gasPrice:0,
      gasLimit:0
    }
    try{
      gas.gasPrice = await ethprovider.getGasPrice()
      gas.gasLimit = await ethprovider.estimateGas({
        to: param.to,
        from: param.from,
        value: param.amount
      })
      return gas;
  } catch(error){
      console.log(error)
    }
  }
  sendTransactionUseEthers(param) {
    console.log("888")
    console.log("ethereum",ethereum)
    const ethprovider = new ethers.providers.Web3Provider(ethereum);
    const signer = ethprovider.getSigner();
    const contract = new ethers.Contract(param.address, param.abi, signer)
    return new Promise((resolve, reject) => {
      try {
        const func = async () => {
          let value = param.amount?ethers.utils.parseEther(param.amount):null;
          let tx = await contract[param.funcName](value?{ value: value }:null);
          let receipt = await tx.wait();
          console.log(receipt)
          resolve(receipt)
        }
        func();
      } catch (error) {
        console.log(error)
        reject(error)
      }
    })
    }
}
function errorHandlerOfMetaMaskRequest(error) {
  console.log(error)
  if (error.code == 4001) {
    showFailToast(`${globals.$t('error.reject')}`)
  } else if (error.code == 4100) {
    showFailToast(`${globals.$t('error.authorized')}`)
  } else if (error.code == -32603) {
    showFailToast(`${globals.$t('error.wrong')}`)
  } else if (error.code == -32002) {
    showFailToast(`${globals.$t('error.wait')}`)
  } else {
    //error?.message
    showFailToast(`${globals.$t('error.failed')}`)
  }
}
const checkToken = async () => {
  let ret = false;
  await chainApi.checkToken().then(res => {
    if (res.code == 0) ret = true
  })
  return ret
}
