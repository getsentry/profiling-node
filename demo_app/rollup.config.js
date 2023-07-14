const rollupNativePlugin = require('rollup-plugin-natives');
const path = require('path');

const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');

module.exports = {
  input: path.resolve(__dirname, './index.js'),
  output: {
    format: 'cjs',
    dir: path.resolve(__dirname, './dist/rollup'),
    preserveModules: false
  },
  plugins: [
    resolve({
      extensions: ['.js', '.ts', '.node']
    }),
    commonjs(),
    rollupNativePlugin({
      // Where we want to physically put the extracted .node files
      copyTo: path.resolve(__dirname, './dist/rollup'),

      // Path to the same folder, relative to the output bundle js
      destDir: path.resolve(__dirname, './dist/rollup'),

      // If the target is ESM, so we can't use `require` (and .node is not supported in `import` anyway), we will need to use `createRequire` instead.
      targetEsm: false
    })
  ]
};
