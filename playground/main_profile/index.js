const Sentry = require( '@sentry/node')
const { ProfilingIntegration } = require( '../../lib/index');
const { writeFileSync } = require( 'node:fs')
const path = require( 'path')

const process = require('process');
const os = require('os');

const SegfaultHandler = require('segfault-handler');
SegfaultHandler.registerHandler('crash.log');


// let e = 0;
// const transport = () => {
//   return {
//     send: (event) => {
//         writeFileSync(path.resolve(__dirname, `main.profile-${e}.json`), JSON.stringify(event[1][0][1]));
//         e++;
//       return Promise.resolve();
//     },
//     flush: () => {
//       return Promise.resolve(true);
//     }
//   };
// };

Sentry.init({
  dsn: 'https://7fa19397baaf433f919fbe02228d5470@o1137848.ingest.sentry.io/6625302',
  debug: true,
  tracesSampleRate: 1,
  profilesSampleRate: 1,
  integrations: [new ProfilingIntegration()],
  // transport
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const transaction = Sentry.startTransaction({ name: 'first-sampled-profile' });
  await wait(1000);
  transaction.finish();
  await Sentry.flush(5000);
})();
