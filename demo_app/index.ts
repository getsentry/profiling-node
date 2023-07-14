const lib = require('@sentry/node');
const profiling = require('./../lib/index');

lib.init({
  dsn: 'https://03fdc938a5f3431ea023c381b759669c@o1.ingest.sentry.io/4505528192335872',
  integrations: [new profiling.ProfilingIntegration()]
});

const transaction = lib.startTransaction({ name: 'smoke-test-application-txn' });

function sleep(time: number) {
  const stop = new Date().getTime();
  while (new Date().getTime() < stop + time) {
    // block
  }
}

sleep(100);

transaction.finish();

(async () => {
  await lib.flush();
})();
