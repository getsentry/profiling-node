<p align="center">
  <a href="https://sentry.io/?utm_source=github&utm_medium=logo" target="_blank">
    <img src="https://sentry-brand.storage.googleapis.com/sentry-wordmark-dark-280x84.png" alt="Sentry" width="280" height="84">
  </a>
</p>

# Official Sentry Profiling SDK for NodeJS (alpha ⚠️)

[![npm version](https://img.shields.io/npm/v/@sentry/profiling-node.svg)](https://www.npmjs.com/package/@sentry/profiling-node)
[![npm dm](https://img.shields.io/npm/dm/@sentry/profiling-node.svg)](https://www.npmjs.com/package/@sentry/profiling-node)
[![npm dt](https://img.shields.io/npm/dt/@sentry/profiling-node.svg)](https://www.npmjs.com/package/@sentry/profiling-node)

## Usage 🔥

```javascript
import * as Sentry from '@sentry/node';
import '@sentry/tracing';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: 'https://7fa19397baaf433f919fbe02228d5470@o1137848.ingest.sentry.io/6625302',
  debug: true,
  tracesSampleRate: 1,
  profilesSampleRate: 1, // Set profiling sampling rate.
  integrations: [new ProfilingIntegration()]
});
```

Sentry SDK will now automatically profile all transactions, even the ones which may be started as a result of using an automatic instrumentation integration.

```javascript
const transaction = Sentry.startTransaction({ name: 'I will do some work' });

// The code between startTransaction and transaction.finish will be profiled

transaction.finish();
```

### Environment flags flags

The default mode of the v8 CpuProfiler is kEagerLoggin which enables the profiler even when no profiles are active - this is good because it makes calls to startProfiling fast at the tradeoff for constant CPU overhead. The behavior can be controlled via the `SENTRY_PROFILER_LOGGING_MODE` environment variable with values of `eager|lazy`. If you opt to use the lazy logging mode, calls to startProfiling may be slow (depending on environment and node version, it can be in the order of a few hundred ms).

Example of starting a server with lazy logging mode.

```javascript
SENTRY_PROFILER_LOGGING_MODE=lazy node server.js
```

## FAQ 💭

### When should I not use this package

The package is still in alpha stage and we discourage using it in production systems while extensive testing is done. There is a possibility that adding this package may crash your entire node process (even when imported only in worker threads). We would also advise caution if you want to profile high throughput operations as starting the profiler adds some performance overhead and while we do have micro benchmarks to measure overhead, we have yet to properly test this on production system.

### Can the profiler leak PII to Sentry?

The profiler does not collect function arguments so leaking any PII is unlikely unless. We only collect a subset of the values which may identify the device and os that the profiler is running on - this is a smaller subset of the values already collected by the @sentry/node SDK.

The only way to leak PII would be if you are executing code like

```js
eval('function scriptFor${CUSTOMER_NAME}....');
```

In that case it is possible that the function name may end up being reported to Sentry.

### Will starting the profiler on main thread automatically profile worker threads too?

No. All instances of the profiler are scoped per thread (v8 isolate). In practice, this means that starting a transaction on thread A and delegating work to thread B will only result in sample stacks being collected from thread A. That said, nothing should prevent you from starting a transaction on thread B concurrently which will result in two independant profiles being sent to the Sentry backend. We currently do not do any correlation between such transactions, but we would be open to exploring the possibilities. Please file an issue if you have suggestions or specific use-cases in mind.

### How much overhead will this profiler add?

The profiler uses the kEagerLogging option by default which trades off fast calls to startProfiling for a small amount of constant CPU overhead.
If you are using kEagerLogging then the tradeoff is reversed and there will be no CPU overhead while the profiler is not running, but calls to startProfiling could be slow (in our tests, this varies by environments and node versions, but could be in the order of 100s of ms).