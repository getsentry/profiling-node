import { existsSync, mkdirSync, renameSync } from 'fs';
import path from 'path';
import { fileURLToPath, URL } from 'url';
import { exit } from 'process';

import { getModuleName } from './binaries.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const lib = path.resolve(__dirname, '..', 'lib');

if (!existsSync(lib)) {
  mkdirSync(lib);
}

const source = path.join(__dirname, '..', 'build', 'Release', 'sentry_cpu_profiler.node');
const target = path.join(__dirname, '..', 'lib', getModuleName());

if (!existsSync(source)) {
  console.log('Source file does not exist:', source);
  exit(1);
} else {
  console.log('Renaming', source, 'to', target);
  renameSync(source, target);
}
