/**
 * Test case for when a worker thread is triggering the profiler call
 */

import path from 'path';
import { Worker } from 'node:worker_threads';

const worker = new Worker(path.resolve(__dirname, './worker.hub_trigger.worker.js'));

worker.postMessage({
  type: 'work'
});

const waitForDone = new Promise<void>((resolve) => {
  worker.on('message', (e) => {
    console.log('worker done', e.data);
    resolve();
  });
});

(async () => {
  await waitForDone;
})();
