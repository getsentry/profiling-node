/* eslint-env node */
const os = require('os');
const path = require('path');
const abi = require('node-abi');
const { familySync } = require('detect-libc');

function getModuleName() {
  const family = familySync();
  const arch = process.env.BUILD_ARCH || os.arch();

  if (family === null) {
    // If we did not find libc or musl, we may be on Windows or some other platform.
    return `sentry_cpu_profiler-v${abi.getAbi(process.versions.node, 'node')}-${os.platform()}-${arch}.node`;
  }
  return `sentry_cpu_profiler-v${abi.getAbi(process.versions.node, 'node')}-${os.platform()}-${arch}-${family}.node`;
}

const source = path.join(__dirname, '..', 'build', 'Release', 'sentry_cpu_profiler.node');
const target = path.join(__dirname, '..', 'binaries', getModuleName());

module.exports.getModuleName = getModuleName;
module.exports.target = target;
module.exports.source = source;
