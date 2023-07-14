const path = require('path');

module.exports = {
  target: 'node',
  entry: path.resolve(__dirname, './index.js'),
  mode: 'production',
  module: {
    rules: [{ test: /\.node$/, loader: 'node-loader' }]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: './index.js',
    path: path.resolve(__dirname, './dist/webpack')
  }
};
