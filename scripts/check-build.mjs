import cp from 'child_process';
import { existsSync } from 'fs';
import process from 'process';
import { target } from './binaries.mjs';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

function recompileFromSource() {
  console.log('@sentry/profiling-node: Compiling from source...');
  cp.execSync(`npm run build:configure`, { env: process.env });
  cp.execSync(`npm run build:bindings`, { env: process.env });
  cp.execSync('node scripts/copy-target.mjs', { env: process.env });
}

try {
  if (existsSync(target)) {
    console.log('@sentry/profiling-node: Precompiled binary found, attempting to load...');
    require(target);
    console.log('@sentry/profiling-node: Precompiled binary found, skipping build from source.');
  } else {
    console.log('@sentry/profiling-node: Precompiled binary not found, attempting to compile...');
    recompileFromSource();
  }
} catch (e) {
  console.log('@sentry/profiling-node: Precompiled binary found but failed loading');

  // Check for node version missmatch
  if (/was compiled against a different Node.js/.test(e.message)) {
    recompileFromSource();
  }

  // Not sure if this could even happen, but just in case it somehow does,
  // we can provide a better experience than just crashing with cannot find module message.
  if (/Cannot find module/.test(e.message)) {
    recompileFromSource();
  }

  if (/cannot open shared object file/.test(e.message)) {
    recompileFromSource();
  }

  // re-throw so we dont end up swallowing errors
  throw e;
}
