import esbuild from 'esbuild';

esbuild.build({
  platform: 'node',
  entryPoints: ['./test-binaries.entry.js'],
  outfile: './test-binaries.js',
  format: 'cjs',
  bundle: true,
  tsconfig: './tsconfig.cjs.json',
  loader: {
    '.node': 'copy'
  }
});
