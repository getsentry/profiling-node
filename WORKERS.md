# Profiling support for worker threads

Profiling is supported in worker threads, however each thread is treated as a separate entity and the final profile will only include the profiling data from that thread. The profiler currently does not do any linking of profiles across threads as that would require bidirectional cross thread communication. If this is something that you would like us to support, please file a feature request describing your use-case.

## Worker SDK setup

Profiling worker threads requires the Sentry SDK to be initialized per thread. If you are cloning the Sentry hub and passing it to workers, you will have to change your approach and reinitialize the SDK in each thread.

```ts
// cpuintense.worker.js
const Sentry = require('@sentry/node');
const { parentPort } = require('node:worker_threads');
require('@sentry/tracing'); // this has a addExtensionMethods side effect
const { ProfilingIntegration } = require('@sentry/profiler-node'); // this has a addExtensionMethods side effect

Sentry.init({
  dsn: 'https://3e28828639ff4360baed0f350b8010bd@o1137848.ingest.sentry.io/6326615',
  debug: true,
  tracesSampleRate: 1,
  profileSampleRate: 1,
  integrations: [new ProfilingIntegration()]
});

/*
 * Synchronous worker example
 */
const transaction = Sentry.startTransaction({ name: 'worker_profiling' });
// The code between these two calls will be profiled.
transaction.finish();

/*
 * Asynchronous worker example
 */
parentPort.on('message', () => {
  const transaction = Sentry.startTransaction({ name: 'worker_profiling' });
  // The code between these two calls will be profiled each time a message is received
  transaction.finish();
});
```

## Questions, issues or feature requests?

Please file an issue.
