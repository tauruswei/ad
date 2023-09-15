const { defineConfig } = require("@vue/cli-service");
const CompressionPlugin = require("compression-webpack-plugin");
const Timestamp = new Date().getTime();
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = defineConfig({
  publicPath: process.env.VUE_APP_PUBLICPATH,
  transpileDependencies: true,
  lintOnSave: false, //关闭eslint
  outputDir: "dist",
  assetsDir: "static",
  indexPath: "index.html",
  configureWebpack: {
    // webpack 配置
    output: {
      // 输出重构  打包编译后的 文件名称  【模块名称.版本号.时间戳】
      filename: `static/js/[name].${process.env.VUE_APP_Version}.${Timestamp}.js`,
      chunkFilename: `static/js/[name].${process.env.VUE_APP_Version}.${Timestamp}.js`,
    },
    externals: {
      fs: "var fs",
      //xmlhttprequest:'{XMLHttpRequest:XMLHttpRequest}'
      //web3: "Web3",
      //"@metamask/sdk":"MetaMaskSDK"
    },
    optimization: {
      minimize: true,
      splitChunks: {
        chunks: 'all'
      }
    },
    plugins: [
      new CompressionPlugin({
        algorithm: 'gzip', // 使用gzip压缩
        test: /\.js$|\.html$|\.css$/, // 匹配文件名
        filename: '[path][base].gz[query]', // 压缩后的文件名(保持原文件名，后缀加.gz)
        minRatio: .8, // 压缩率小于1才会压缩
        threshold: 10240, // 对超过10k的数据压缩
        deleteOriginalAssets: false, // 是否删除未压缩的源文件，谨慎设置，如果希望提供非gzip的资源，可不设置或者设置为false（比如删除打包后的gz后还可以加载到原始资源文件）
      }),
      //new BundleAnalyzerPlugin()
    ],
  },
  devServer: {
    port: 1521,
    historyApiFallback: true,
    client: {
      overlay: false//{runtimeErrors: false}
    }

  },

});
