//import copy from './copy';
import number from './number';
// 自定义指令
const directives = {
  number
}

export default {
  install(Vue) {
    Object.keys(directives).forEach((key) => {
      Vue.directive(key, directives[key])
    })
  },
}