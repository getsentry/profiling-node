import cp from 'child_process';
import { existsSync } from 'fs';
import process from 'process';
import { target } from './binaries.mjs';
import { log } from 'console';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

function clean(err) {
  return err.toString().trim();
}

function recompileFromSource() {
  log('@sentry/profiling-node: Compiling from source...');
  let spawn = cp.spawnSync('npm', ['run', 'build:configure'], {
    stdio: ['inherit', 'inherit', 'pipe'],
    env: process.env,
    shell: true
  });

  if (spawn.status !== 0) {
    log('@sentry/profiling-node: Failed to configure gyp');
    log('@sentry/profiling-node:', clean(spawn.stderr));
    return;
  }

  spawn = cp.spawnSync('npm', ['run', 'build:bindings'], {
    stdio: ['inherit', 'inherit', 'pipe'],
    env: process.env,
    shell: true
  });
  if (spawn.status !== 0) {
    log('@sentry/profiling-node: Failed to build bindings');
    log('@sentry/profiling-node:', clean(spawn.stderr));
    return;
  }
}

if (existsSync(target)) {
  try {
    log(`@sentry/profiling-node: Precompiled binary found, attempting to load ${target}`);
    require(target);
    log('@sentry/profiling-node: Precompiled binary found, skipping build from source.');
  } catch (e) {
    log('@sentry/profiling-node: Precompiled binary found but failed loading');
    log('@sentry/profiling-node:', e);
    try {
      recompileFromSource();
    } catch (e) {
      log('@sentry/profiling-node: Failed to compile from source');
      throw e;
    }
  }
} else {
  log('@sentry/profiling-node: No precompiled binary found');
  recompileFromSource();
}
