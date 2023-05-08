// eslint-env node
require('esbuild').build({
  platform: 'node',
  entryPoints: ['./src/index.ts'],
  outfile: './lib/esm/index.js',
  format: 'esm',
  target: 'esnext',
  bundle: true,
  tsconfig: './tsconfig.esm.json'
});
