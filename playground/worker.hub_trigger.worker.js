const path = require('path');
const { writeFileSync } = require('fs');
const Sentry = require('@sentry/node');
require('@sentry/tracing'); // this has a addExtensionMethods side effect
const { ProfilingIntegration } = require('../lib/index'); // this has a addExtensionMethods side effect

const { CpuProfilerBindings } = require('./../lib/cpu_profiler');

Sentry.init({
  dsn: 'https://3e28828639ff4360baed0f350b8010bd@o1137848.ingest.sentry.io/6326615',
  debug: true,
  tracesSampleRate: 1,
  // @ts-expect-error profilingSampleRate is not part of the options type yet
  profileSampleRate: 1,
  integrations: [new ProfilingIntegration()]
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  CpuProfilerBindings.startProfiling('worker_profiling_cpu');
  const transaction = Sentry.startTransaction({ name: 'worker_profiling' });
  await wait(1000);
  transaction.finish();
  const profile = CpuProfilerBindings.stopProfiling('worker_profiling_cpu');
  writeFileSync(path.resolve(__dirname, './worker.hub_trigger.profile.json'), JSON.stringify(profile));
})();
