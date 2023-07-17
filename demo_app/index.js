const Sentry = require('@sentry/node');
const profiling =  require('@sentry/profiling-node'); // <- is symlinked

Sentry.init({
  dsn: 'https://03fdc938a5f3431ea023c381b759669c@o1.ingest.sentry.io/4505528192335872',
  integrations: [new profiling.ProfilingIntegration()],
  tracesSampleRate: 1,
  profilesSampleRate: 1
});

const transaction = Sentry.startTransaction({ name: `${process.env['BUNDLER']}-application-build` });

function sleep(time) {
  const stop = new Date().getTime();
  while (new Date().getTime() < stop + time) {
    // block
  }
}

sleep(1000);
transaction.finish();

(async () => {
  await Sentry.flush();
})();
