import os from 'os';
import path from 'path';
import { getAbi } from 'node-abi';
import { familySync } from 'detect-libc';
import process from 'process';
import { fileURLToPath, URL } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export function getModuleName() {
  const stdlib = familySync();
  const userPlatform = os.platform();
  const userArchitecture = process.env.BUILD_ARCH || os.arch();

  const identifier = [userPlatform, userArchitecture, stdlib, getAbi(process.versions.node, 'node')]
    .filter((c) => c !== undefined && c !== null)
    .join('-');

  return `sentry_cpu_profiler-${identifier}.node`;
}

export const source = path.join(__dirname, '..', 'build', 'Release', 'sentry_cpu_profiler.node');
export const target = path.join(__dirname, '..', 'lib', getModuleName());
