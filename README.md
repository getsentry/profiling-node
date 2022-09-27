<p align="center">
  <a href="https://sentry.io/?utm_source=github&utm_medium=logo" target="_blank">
    <img src="https://sentry-brand.storage.googleapis.com/sentry-wordmark-dark-280x84.png" alt="Sentry" width="280" height="84">
  </a>
</p>

# Official Sentry Profiling SDK for NodeJS

<!-- [![npm version](https://img.shields.io/npm/v/@sentry/node.svg)](https://www.npmjs.com/package/@sentry/node) -->
<!-- [![npm dm](https://img.shields.io/npm/dm/@sentry/node.svg)](https://www.npmjs.com/package/@sentry/node) -->
<!-- [![npm dt](https://img.shields.io/npm/dt/@sentry/node.svg)](https://www.npmjs.com/package/@sentry/node) -->

<!-- ## Links -->

<!-- - [Official SDK Docs](https://docs.sentry.io/quickstart/) -->
<!-- - [TypeDoc](http://getsentry.github.io/sentry-javascript/) -->

## Usage 🔥

```javascript
import * as Sentry from '@sentry/node';
import '@sentry/tracing';
import { ProfilingIntegration } from '@sentry/profiling-node'.

Sentry.init({
  dsn: 'https://7fa19397baaf433f919fbe02228d5470@o1137848.ingest.sentry.io/6625302',
  debug: true,
  tracesSampleRate: 1,
  profilesSampleRate: 1 // Set sampling rate
  integrations: [new ProfilingIntegration()]
});
```

Sentry will automatically profile all transactions

```javascript
const transaction = Sentry.startTransaction({ name: 'I will do some work' });

// The code between startTransaction and transaction.finish will be profiled

transaction.finish();
```

## FAQ 💭

### When should I not use this package

Todo: explain possible problems

### Can the profiler leak PII to Sentry?

Todo: unlikely as we do not collect function arguments unless function calls are somehow created per user

### What is the profiler overhead?

Todo: explain overhead and difference for kLazyLogging vs kEagerLogging

### Will starting the profiler on main thread automatically profile worker threads too?

No, it will not (see WORKERS.md for an explanation)

### What happens in the event of a profiler crash?

Todo: Check if napi will crash main process if worker is terminated while profiling.
Todo: Check what happens if it crashes on main thread.
