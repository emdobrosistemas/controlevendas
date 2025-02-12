const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, '../dist'),
      publicPath: '/'
    },
    port: 8080,
    hot: true,
    historyApiFallback: true,
    proxy: [{
      context: ['/gestao/api'],
      target: 'http://localhost:3000',
      secure: false,
      changeOrigin: true
    }]
  }
}); 