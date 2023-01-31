/* eslint-env node */
const cp = require('child_process');
const { existsSync } = require('fs');

const { target } = require('./binaries');

function recompileFromSource() {
  try {
    console.log('@sentry/profiling-node: Compiling from source...');
    cp.execSync(`npm run build:configure`, { env: process.env });
    cp.execSync(`npm run build:bindings`, { env: process.env });
    cp.execSync('node scripts/copy-target.js', { env: process.env });
    return true;
  } catch (e) {
    console.error(
      '@sentry/profiling-node: Failed to build from source, please report this a bug at https://github.com/getsentry/profiling-node/issues/new?assignees=&labels=Type%3A+Bug&template=bug.yml'
    );
    return false;
  }
}

try {
  console.log('@sentry/profiling-node: Precompiled binary found, attempting to load...');
  require(target);
  console.log('@sentry/profiling-node: Precompiled binary found, skipping build from source.');
} catch (e) {
  // Check for node version missmatch
  if (/was compiled against a different Node.js/.test(e.message)) {
    const success = recompileFromSource();
    if (success) {
      process.exit(0);
    }
  }
  // Not sure if this could even happen, but just in case it somehow does,
  //  we can provide a better experience than just crashing with cannot find module message.
  if (/Cannot find module/.test(e.message)) {
    const success = recompileFromSource();
    if (success) {
      process.exit(0);
    }
  }

  if (/cannot open shared object file/.test(e.message)) {
    const success = recompileFromSource();
    if (success) {
      process.exit(0);
    }
  }

  // re-throw so we dont end up swallowing errors
  throw e;
}
