import * as Sentry from '@sentry/node';
import '@sentry/tracing'; // this has a addExtensionMethods side effect
import type { Transport } from '@sentry/types';
import { writeFileSync } from 'fs';
import { ProfilingIntegration } from '../../src/index'; // this has a addExtensionMethods side effect
import path from 'path';
import { Worker } from 'node:worker_threads';

const Transport: Transport = {
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

const transaction = Sentry.startTransaction({ name: 'main thread' });
const worker = new Worker(path.resolve(__dirname, './worker.js'));

function processInWorker(): Promise<void> {
  return new Promise((resolve, reject) => {
    worker.on('message', (event) => {
      console.log('Event received in main thread', event);
      resolve(event);
    });
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });

    worker.postMessage('start');
  });
}

(async () => {
  await processInWorker();
  worker.terminate();
  transaction.finish();

  await Sentry.flush(2000);
})();
