import esbuild from 'esbuild';

esbuild.build({
  platform: 'node',
  entryPoints: ['./test-binaries.entry.js'],
  outfile: './build-test/test-binaries.js',
  target: 'esnext',
  format: 'esm',
  bundle: true,
  tsconfig: './tsconfig.cjs.json',
  loader: {
    '.node': 'copy'
  }
});
