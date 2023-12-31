import MetaMaskSDK from '@metamask/sdk';
import MetaMaskOnboarding from '@metamask/onboarding'
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
//import {ethers} from "ethers";
import store from "../store/index";
import router from "../router/index";
import { aacApi, chainApi, userApi } from '@/api/request';
import { showToast, showSuccessToast, showFailToast, showConfirmDialog } from 'vant';
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
  async getProvider() {
    try {
      let provider = await detectEthereumProvider()
      return provider
    } catch (error) {
      console.log(error)
    }
  }
  disconnect() {
    this.enabled = false;
    this.account = null;
    this.chainId = null;
    this.url = null;
    store.commit("setMetaMask", null)
  }
  async connectMetaMask() {
    if (!this.isMetaMaskInstalled()) {
      showFailToast(`Please install Metamask Wallet at <a href="https://metamask.io/">metamask.io</a>.`);
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
        showFailToast('Please connect to the right chain (Double-A Chain, ChainID=' + parseInt(CHAINID) + '[' + this.chainId + ']).');
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
    return Boolean(ethereum && ethereum.isMetaMask)
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
        showFailToast('Sorry you need to switch to the right network, please try again!');
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
  async isCurrentChain(id) {
    const CHAINID = toHex(store.state.abi?.chainId)
    if (id != CHAINID) {
      let res = await this.checkNetwork();
      console.log("isbsc", res)
      return res;
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
    //if(!this.isCheckedToken()) return false;
    if (!this.isMetaMaskInstalled()) {
      showFailToast(`Please install Metamask Wallet at <a href="https://metamask.io/">metamask.io</a>.`)
      store.commit("setMetaMask", null)
      return false;
    }
    if (!store.state.metaMask) {
      showFailToast("please connect wallet")
      //console.log("please connect wallet");
      return false;
    } else {
      ret = true;
    }
    if (!this.isCurrentChain(store.state.metaMask?.chainID)) return false;
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
          throw new Error('Something went wrong.');
        }
      })
      .catch((error) => console.error(error));
  }
  async getBalance(account) {
    if (!web3) return
    let balance = await web3.eth.getBalance(account);
    return Number(balance) / Math.pow(10, 18);
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
    if (!myContract) return;
    return new Promise((resolve, reject) => {
      myContract.methods[param.funcName](param.amount?toHex(this.toWei(param.amount, "ether")):null).send({
        from: param.from, gas:gas, gasPrice: price
      }).then(res => {
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
    let ret = await myContract.methods[param.funcName](param.from).call();
    return ret;
  }
  /*sendTransactionUseEthers(param) {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner();
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
    } */ 
}
function errorHandlerOfMetaMaskRequest(error) {
  console.log(error)
  if (error.code == 4001) {
    showFailToast("You have rejected this operation.")
  } else if (error.code == 4100) {
    showFailToast("The requested account and/or method has not been authorized.")
  } else if (error.code == -32603) {
    showFailToast("It seems that something wrong happens in your wallet, please check and solve it first.")
  } else if (error.code == -32002) {
    showFailToast("The wallet is processing your request, please finish the operation in the wallet.")
  } else {
    //error?.message
    showFailToast("failed!")
  }
}
const checkToken = async () => {
  let ret = false;
  await chainApi.checkToken().then(res => {
    if (res.code == 0) ret = true
  })
  return ret
}
