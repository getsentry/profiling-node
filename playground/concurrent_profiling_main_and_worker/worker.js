const Sentry = require('@sentry/node');
require('@sentry/tracing'); // this has a addExtensionMethods side effect
const { writeFileSync } = require('fs');
const { ProfilingIntegration } = require('../../lib/index'); // this has a addExtensionMethods side effect
const path = require('path');

const { parentPort } = require('worker_threads');

Sentry.init({
  dsn: 'https://3e28828639ff4360baed0f350b8010bd@o1137848.ingest.sentry.io/6326615',
  debug: true,
  tracesSampleRate: 1,
  // @ts-expect-error profilingSampleRate is not part of the options type yet
  profileSampleRate: 1,
  integrations: [new ProfilingIntegration()]
});

const Transport = {
  send: (event) => {
    writeFileSync(path.resolve(__dirname, 'main_thread.profile.json'), JSON.stringify(event));
    return Promise.resolve();
  },
  flush: () => Promise.resolve(true)
};

Sentry.init({
  dsn: 'https://3e28828639ff4360baed0f350b8010bd@o1137848.ingest.sentry.io/6326615',
  debug: true,
  tracesSampleRate: 1,
  // @ts-expect-error profilingSampleRate is not part of the options type yet
  profileSampleRate: 1,
  integrations: [new ProfilingIntegration()]
});

const worker_waiting = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// You can do any heavy stuff here, in a synchronous way
// without blocking the "main thread"
parentPort.on('message', async function processingMessage(message) {
  console.log('Got message:', message);
  parentPort.postMessage('done');
  await worker_waiting(2000);
});
