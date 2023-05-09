// eslint-env node
require('esbuild').build({
  platform: 'node',
  entryPoints: ['./src/index.ts'],
  outfile: './lib/cjs/index.js',
  format: 'cjs',
  target: 'node12',
  bundle: true,
  tsconfig: './tsconfig.cjs.json'
});
