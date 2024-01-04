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
  outfile: './build/index.js',
  format: 'cjs',
  target: 'node16',
  bundle: true,
  tsconfig: './tsconfig.json',
  plugins: [missingBindingsPlugin]
});
