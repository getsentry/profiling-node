const lib = require('@sentry/node');
const profiling = require('./../lib/index.js');
const process = require('process');

lib.init({
  dsn: 'https://03fdc938a5f3431ea023c381b759669c@o1.ingest.sentry.io/4505528192335872',
  integrations: [new profiling.ProfilingIntegration()],
  tracesSampleRate: 1,
  profilesSampleRate: 1
});

const transaction = lib.startTransaction({ name: `${process.env['BUNDLER']}-application-build` });

function sleep(time) {
  const stop = new Date().getTime();
  while (new Date().getTime() < stop + time) {
    // block
  }
}

console.time('test');
sleep(1000);
console.timeEnd('test');
transaction.finish();

(async () => {
  await lib.flush();
})();
