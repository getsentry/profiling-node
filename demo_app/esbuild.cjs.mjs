import esbuild from 'esbuild';
import path from 'path';

import { URL, fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

esbuild.build({
  platform: 'node',

  entryPoints: [path.resolve(__dirname, './index.js')],
  outdir: path.resolve(__dirname, './dist/esbuild'),
  format: 'cjs',
  target: 'node12',
  bundle: true,
  loader: {
    '.node': 'file'
  },
  tsconfig: path.resolve(__dirname, '../tsconfig.cjs.json')
});
