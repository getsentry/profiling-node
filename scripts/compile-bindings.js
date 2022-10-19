const { execSync } = require('child_process');

const flags = [];

if (process.env.SENTRY_PROFILER_LOGGING_MODE) {
  flags.push(`--SENTRY_PROFILER_LOGGING_MODE=${process.env.SENTRY_PROFILER_LOGGING_MODE}`);
}

const cmd = 'node-gyp build ' + flags.join(' ');
execSync(cmd);
