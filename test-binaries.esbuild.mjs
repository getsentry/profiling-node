// Because bundlers can now predetermine a static set of binaries we need to ensure those binaries
// actually exists, else we risk a compile time error when bundling the package. This could happen
// if we added a new binary in cpu_profiler.ts, but forgot to prebuild binaries for it. Because CI
// only runs integration and unit tests, this change would be missed and could end up in a release.
// Therefor, once all binaries are precompiled in CI and tests pass, run esbuild with bundle:true
// which will copy all binaries to the outfile folder and throw if any of them are missing.
import esbuild from 'esbuild';

esbuild.build({
  platform: 'node',
  entryPoints: ['./test-binaries.entry.js'],
  outfile: './build-test/test-binaries.js',
  target: 'esnext',
  format: 'esm',
  bundle: true,
  tsconfig: './tsconfig.json',
  loader: {
    '.node': 'copy'
  }
});
