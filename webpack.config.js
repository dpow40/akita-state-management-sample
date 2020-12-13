const path = require('path');

module.exports = {
  entry: './state/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map',
  optimization: {
      minimize: false
  }
};
