const Sentry = require('@sentry/node');
require('@sentry/tracing'); // this has a addExtensionMethods side effect
const { writeFileSync, existsSync, unlinkSync } = require('fs');
const { ProfilingIntegration } = require('../../lib/index'); // this has a addExtensionMethods side effect
const path = require('path');

if (existsSync(path.resolve(__dirname, 'fork.profile.json'))) {
  unlinkSync(path.resolve(__dirname, 'fork.profile.json'));
}

const worker_waiting = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const transport = () => {
  return {
    send: (event) => {
      if (event[1][0][0].type === 'profile') {
        console.log('Writing fork.profile.json');
        writeFileSync(path.resolve(__dirname, 'fork.profile.json'), JSON.stringify(event[1][0][1]));
      }
      return Promise.resolve();
    },
    flush: () => {
      return Promise.resolve(true);
    }
  };
};

Sentry.init({
  dsn: 'https://7fa19397baaf433f919fbe02228d5470@o1137848.ingest.sentry.io/6625302',
  debug: true,
  tracesSampleRate: 1,
  // @ts-expect-error profilingSampleRate is not part of the options type yet
  profileSampleRate: 1,
  integrations: [new ProfilingIntegration()],
  transport
});

process.on('message', async function (message) {
  const transaction = Sentry.startTransaction({ name: 'fork' });
  await worker_waiting(1000);
  transaction.finish();
  await Sentry.flush(1000);
  console.log('pong');
  process.exit(0);
});
