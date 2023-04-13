/* eslint-env node */
const os = require('os');
const path = require('path');
const { getAbi } = require('node-abi');
const { familySync } = require('detect-libc');

function getModuleName() {
  const family = familySync();
  const userPlatform = os.platform();
  const userArchitecture = process.env.BUILD_ARCH || os.arch();

  const identifier = [userPlatform, userArchitecture, family].filter((c) => c !== undefined && c !== null).join('-');

  return `sentry_cpu_profiler-v${getAbi(process.versions.node, 'node')}-${identifier}.node`;
}

const source = path.join(__dirname, '..', 'build', 'Release', 'sentry_cpu_profiler.node');
const target = path.join(__dirname, '..', 'lib', 'binaries', getModuleName());

module.exports.getModuleName = getModuleName;
module.exports.target = target;
module.exports.source = source;
