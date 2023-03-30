/* eslint-env node */
const fs = require('fs');
const path = require('path');

const { getModuleName } = require('./binaries');

const lib = path.resolve(__dirname, '..', 'lib');
const binaries = path.resolve(__dirname, '..', 'lib', 'binaries');

if (!fs.existsSync(lib)) {
  fs.mkdirSync(lib);
}

if (!fs.existsSync(binaries)) {
  fs.mkdirSync(binaries);
}

const source = path.join(__dirname, '..', 'build', 'Release', 'sentry_cpu_profiler.node');
const target = path.join(__dirname, '..', 'lib', 'binaries', getModuleName());

console.log('Renaming', source, 'to', target);
fs.renameSync(source, target);
