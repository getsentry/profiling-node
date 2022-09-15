import { writeFileSync } from 'node:fs';
import { Worker } from 'node:worker_threads';
import path from 'path';

import { CpuProfilerBindings } from './../src/cpu_profiler';

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

CpuProfilerBindings.startProfiling('worker.cpu_profiler.ts');
(async () => {
  await processInWorker();
  worker.terminate();
  const profile = CpuProfilerBindings.stopProfiling('worker.cpu_profiler.ts');
  writeFileSync(path.resolve(__dirname, './worker.cpu_profiler.profile.json'), JSON.stringify(profile));
})();
