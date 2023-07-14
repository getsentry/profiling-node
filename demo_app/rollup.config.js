const rollupNativePlugin = require('rollup-plugin-natives');
const path = require('path');
const typescriptPlugin = require('rollup-plugin-typescript2');

const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');

module.exports = {
  input: path.resolve(__dirname, './index.ts'),
  output: {
    format: 'cjs',
    file: path.resolve(__dirname, './dist/rollup/rollup.app.js')
  },
  plugins: [
    rollupNativePlugin({
      // Where we want to physically put the extracted .node files
      copyTo: path.resolve(__dirname),

      // Path to the same folder, relative to the output bundle js
      destDir: __dirname,

      // Use `dlopen` instead of `require`/`import`.
      // This must be set to true if using a different file extension that '.node'
      dlopen: false,

      // Generate sourcemap
      sourcemap: true,

      // If the target is ESM, so we can't use `require` (and .node is not supported in `import` anyway), we will need to use `createRequire` instead.
      targetEsm: false
    }),
    typescriptPlugin({
      compilerOptions: {
        esModuleInterop: true
      },
      include: ['./demo_app/index.ts']
    }),
    commonjs(),
    resolve()
  ]
};
