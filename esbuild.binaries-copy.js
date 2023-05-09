// eslint-env node
import esbuild from 'esbuild';

esbuild.build({
  platform: 'node',
  entryPoints: ['./src/index.ts'],
  outfile: './lib/index.js',
  format: 'cjs',
  target: 'node12',
  bundle: true,
  tsconfig: './tsconfig.cjs.json',
  loader: {
    '.node': 'copy'
  }
});
