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
    js: `
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);`
  }
});
