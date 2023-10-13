<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>
<style lang="scss">
@import "@/style/common.scss";
</style>
<script>
export default {
  name: "App",
  setup() {
    const debounce = (fn, delay) => {
      let timer = null;
      return function () {
        let context = this;
        let args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
          fn.apply(context, args);
        }, delay);
      }
    }

    const _ResizeObserver = window.ResizeObserver;
    window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
      constructor(callback) {
        callback = debounce(callback, 16);
        super(callback);
      }
    }
  }
};
</script>
<style>
#app {
  font-family: sans-serif, "Hiragino Sans GB", "PingFang SC", "Helvetica Neue",
    Helvetica, "Microsoft YaHei", "微软雅黑", Arial;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #fff;
  background-color: transparent;
}
body{
  background: url("@/assets/body_bg.jpg") repeat;
}
</style>

