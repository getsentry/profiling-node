import * as Sentry from '@sentry/node';
import '@sentry/tracing'; // this has a addExtensionMethods side effect
import { ProfilingIntegration } from '../src/index'; // this has a addExtensionMethods side effect

Sentry.init({
  dsn: 'https://3e28828639ff4360baed0f350b8010bd@o1137848.ingest.sentry.io/6326615',
  debug: true,
  tracesSampleRate: 1,
  // @ts-expect-error profilingSampleRate is not part of the options type yet
  profileSampleRate: 1,
  integrations: [new ProfilingIntegration()]
});

const transaction = Sentry.startTransaction({ name: 'Testing' });

async function blocking() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

transaction.setName('profiling.node');
transaction.setStatus('Ok');

(async () => {
  await blocking();
  transaction.finish();
  await Sentry.flush(5000);
})();
