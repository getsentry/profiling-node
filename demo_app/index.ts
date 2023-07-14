import * as Sentry from '@sentry/node';

import { ProfilingIntegration } from './../lib/index';

Sentry.init({
  dsn: 'http://example.com',
  integrations: [new ProfilingIntegration()]
});

const transaction = Sentry.startTransaction({ name: 'smoke-test-application-txn' });

function sleep(time) {
  const stop = new Date().getTime();
  while (new Date().getTime() < stop + time) {
    // block
  }
}

sleep(100);

transaction.finish();

(async () => {
  await Sentry.flush();
})();
