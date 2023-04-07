// Contains unit tests for some of the C++ bindings. These functions
// are exported on the private bindings object, so we can test them and
// they should not be used outside of this file.
import { importCppBindingsModule } from './cpu_profiler';
import { platform } from 'os';

const privateBindings = importCppBindingsModule();

const cases = [
  ['/Users/jonas/code/node_modules/@scope/package/file.js', '/Users/jonas/code', '@scope.package:file'],
  ['/Users/jonas/code/node_modules/package/dir/file.js', '/Users/jonas/code', 'package.dir:file'],
  ['/Users/jonas/code/node_modules/package/file.js', '/Users/jonas/code', 'package:file'],
  ['/Users/jonas/code/src/file.js', '/Users/jonas/code', 'src:file'],

  //   Preserves non .js extensions
  ['/Users/jonas/code/src/file.ts', '/Users/jonas/code', 'src:file.ts'],
  //   Edge cases that shouldn't happen in practice, but try and handle them so we dont crash
  ['/Users/jonas/code/src/file.js', '', 'Users.jonas.code.src:file'],
  ['', '/Users/jonas/code', '']
];

describe('GetFrameModule', () => {
  it.each(
    platform() === 'win32'
      ? cases.map(([abs_path, root_dir, expected]) => [
          abs_path ? 'C:' + abs_path.replace(/\//g, '\\') : '',
          root_dir ? 'C:' + root_dir.replace(/\//g, '\\') : '',
          expected
        ])
      : cases
  )('%s with base at %s = %s', (abs_path: string, root_dir: string, expected: string) => {
    expect(privateBindings.getFrameModule(abs_path, root_dir)).toBe(expected);
  });
});
