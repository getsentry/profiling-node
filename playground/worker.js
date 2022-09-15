const { parentPort } = require('worker_threads');

const worker_waiting = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// You can do any heavy stuff here, in a synchronous way
// without blocking the "main thread"
parentPort.on('message', async function processingMessage(message) {
  console.log('Got message:', message);
  parentPort.postMessage('done');
  await worker_waiting(2000);
});
