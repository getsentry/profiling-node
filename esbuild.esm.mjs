import esbuild from 'esbuild';

let missingBindingsPlugin = {
  name: 'MissingBindings',
  setup(build) {
    build.onResolve({ filter: /\.node$/ }, (args) => ({
      path: args.path,
      namespace: 'missing-bindings',
      external: true
    }));
  }
};

esbuild.build({
  platform: 'node',
  entryPoints: ['./src/index.ts'],
  outfile: './lib/index.mjs',
  format: 'esm',
  target: 'esnext',
  bundle: true,
  tsconfig: './tsconfig.esm.json',
  plugins: [missingBindingsPlugin],
  banner: {
    // This is here to fix a require issue with detect-libc
    // if we remove it, we get a cannot use dynamic require error
    js: `
    import {dirname as pathDirname} from 'path';
    import { fileURLToPat as topLevelFileToUrlPath } from 'url';
    import { createRequire as topLevelCreateRequire } from 'module';
    const require = topLevelCreateRequire(import.meta.url);
    const __filename = topLevelFileToUrlPath(import.meta.url);
    const __dirname = pathDirname(__filename);
    `
  }
});
