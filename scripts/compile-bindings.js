const { execSync } = require('child_process');

const flags = [];

if (process.env.SENTRY_PROFILER_LOGGING_MODE) {
  flags.push(`--SENTRY_PROFILER_LOGGING_MODE=${process.env.SENTRY_PROFILER_LOGGING_MODE}`);
}

if (flags.length > 0) {
  console.log('Building @sentry/profiling-node with flags ' + flags.join(' '));
}

execSync('node-gyp build ' + flags.join(' '));
