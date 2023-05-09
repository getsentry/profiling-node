// eslint-env node
require('esbuild').build({
  platform: 'node',
  entryPoints: ['./src/index.ts'],
  outfile: './lib/esm/index.mjs',
  format: 'esm',
  target: 'esnext',
  bundle: true,
  tsconfig: './tsconfig.esm.json',
  banner: {
    js: `
  import {dirname as topLevelAliasedDirname} from 'path';
    import { fileURLToPath } from 'url';
    import { createRequire as topLevelCreateRequire } from 'module';
    const require = topLevelCreateRequire(import.meta.url);
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = topLevelAliasedDirname(__filename);
  //   `
  }
});
