/* eslint-env node */
const fs = require('fs');
const path = require('path');

const { getModuleName } = require('./binaries');

const lib = path.resolve(__dirname, '..', 'lib');

if (!fs.existsSync(lib)) {
  fs.mkdirSync(lib);
}

const source = path.join(__dirname, '..', 'build', 'Release', 'sentry_cpu_profiler.node');
const target = path.join(__dirname, '..', 'lib', getModuleName());

console.log('Renaming', source, 'to', target);
fs.renameSync(source, target);
