const path = require('path');

module.exports = {
  target: 'node',
  entry: path.resolve(__dirname, './index.ts'),
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, './../tsconfig.cjs.json')
            }
          }
        ],
        exclude: /node_modules/
      },
      { test: /\.node$/, loader: 'node-loader' }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: './webpack.app.js',
    path: path.resolve(__dirname, './dist/webpack')
  }
};
