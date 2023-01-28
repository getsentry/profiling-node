/* eslint-env node */
const fs = require('fs');
const path = require('path');

const { getModuleName } = require('./binaries');

const binaries = path.resolve(__dirname, '..', 'binaries');
if (!fs.existsSync(binaries)) {
  fs.mkdirSync(binaries);
}

const source = path.join(__dirname, '..', 'build', 'Release', 'sentry_cpu_profiler.node');
const target = path.join(__dirname, '..', 'binaries', getModuleName());

console.log('Renaming', source, 'to', target);
fs.renameSync(source, target);
