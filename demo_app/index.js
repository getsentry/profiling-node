import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { env } from 'process';

Sentry.init({
  dsn: 'https://03fdc938a5f3431ea023c381b759669c@o1.ingest.sentry.io/4505528192335872',
  integrations: [new ProfilingIntegration()],
  tracesSampleRate: 1,
  profilesSampleRate: 1
});

const transaction = Sentry.startTransaction({ name: `${env['BUNDLER']}-application-build` });

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
  await Sentry.flush();
})();
