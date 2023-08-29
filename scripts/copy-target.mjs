import { existsSync, mkdirSync, renameSync } from 'fs';
import path from 'path';
import { fileURLToPath, URL } from 'url';
import { exit, env } from 'process';
import { log } from 'node:console';

import { getModuleName } from './binaries.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const lib = env['TARGET_DIR'] ? path.resolve(env['TARGET_DIR']) : path.resolve(__dirname, '..', 'lib');

if (!existsSync(lib)) {
  mkdirSync(lib);
}

const source = path.join(__dirname, '..', 'build', 'Release', 'sentry_cpu_profiler.node');
const target = path.join(lib, getModuleName());

if (!existsSync(source)) {
  log('Source file does not exist:', source);
  exit(1);
} else {
  if (existsSync(target)) {
    log('Target file already exists, overwriting it');
  }
  log('Renaming', source, 'to', target);
  renameSync(source, target);
}
