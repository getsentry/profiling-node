import cp from 'child_process';
import { existsSync } from 'fs';
import process from 'process';
import { target } from './binaries.mjs';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

function recompileFromSource() {
  console.log('@sentry/profiling-node: Compiling from source...');
  cp.spawnSync('npm', ['run', 'build:configure'], { env: process.env });
  cp.spawnSync('npm', ['run', 'build:bindings'], { env: process.env });
  cp.spawnSync('node', ['scripts/copy-target.mjs'], { env: process.env });
}

if (existsSync(target)) {
  try {
    console.log(`@sentry/profiling-node: Precompiled binary found, attempting to load ${target}`);
    require(target);
    console.log('@sentry/profiling-node: Precompiled binary found, skipping build from source.');
  } catch (e) {
    console.log('@sentry/profiling-node: Precompiled binary found but failed loading');
    try {
      recompileFromSource();
    } catch (e) {
      console.log('@sentry/profiling-node: Failed to compile from source');
      throw e;
    }
  }
} else {
  console.log('@sentry/profiling-node: No precompiled binary found');
  recompileFromSource();
}
