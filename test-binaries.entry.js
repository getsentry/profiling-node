// See test-binaries.esbuild.mjs
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from './build';
import { setTimeout } from 'node:timers';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

Sentry.init({
  dsn: 'https://7fa19397baaf433f919fbe02228d5470@o1137848.ingest.sentry.io/6625302',
  integrations: [new ProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0
});

const txn = Sentry.startTransaction('Precompile test');

await wait(500);
txn.finish();
