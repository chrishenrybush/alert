module.exports = {
  baseUrl: "/alert/",
  outputDir: undefined,
  assetsDir: undefined,
  runtimeCompiler: undefined,
  productionSourceMap: undefined,
  parallel: undefined,
  css: undefined,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8060',
        ws: true,
        changeOrigin: true
      }
    }
  }
};
