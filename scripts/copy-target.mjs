import { existsSync, mkdirSync, renameSync } from 'fs';
import path from 'path';
import { fileURLToPath, URL } from 'url';
import { exit } from 'process';
import { getModuleName } from './binaries.mjs';
import { log } from 'console';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const build = path.resolve(__dirname, '..', 'build');

if (!existsSync(build)) {
  mkdirSync(build);
}

const source = path.join(__dirname, '..', 'build', 'Release', 'sentry_cpu_profiler.node');
const target = path.join(__dirname, '..', 'build', getModuleName());

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
