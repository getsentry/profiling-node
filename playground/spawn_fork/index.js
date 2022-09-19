const { spawn, fork } = require('node:child_process');
const path = require('node:path');
const { existsSync, writeFileSync, unlinkSync } = require('node:fs');
const Sentry = require('@sentry/node');
require('@sentry/tracing'); // this has a addExtensionMethods side effect
const { ProfilingIntegration } = require('../../lib/index'); // this has a addExtensionMethods side effect

if (existsSync(path.resolve(__dirname, 'main.profile.json'))) {
  unlinkSync(path.resolve(__dirname, 'main.profile.json'));
}

const transport = () => {
  return {
    send: (event) => {
      if (event[1][0][0].type === 'profile') {
        console.log('Writing main.profile.json');
        writeFileSync(path.resolve(__dirname, 'main.profile.json'), JSON.stringify(event[1][0][1]));
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
  debug: false,
  tracesSampleRate: 1,
  // @ts-expect-error profilingSampleRate is not part of the options type yet
  profileSampleRate: 1,
  transport,
  integrations: [new ProfilingIntegration()]
});

const transaction = Sentry.startTransaction({ name: 'main thread' });

if (existsSync(path.resolve(__dirname, 'spawn.profile.json'))) {
  unlinkSync(path.resolve(__dirname, 'spawn.profile.json'));
}

if (existsSync(path.resolve(__dirname, 'fork.profile.json'))) {
  unlinkSync(path.resolve(__dirname, 'fork.profile.json'));
}

async function waitForSpawn() {
  const spawnProcess = spawn('node', [path.resolve(__dirname, 'cpu_task_spawn.js')]);

  return new Promise((resolve, reject) => {
    spawnProcess.stdout.on('data', (data) => {
      if (data === 'pong') {
        resolve(data);
      }
    });

    spawnProcess.stderr.on('data', (data) => {
      console.log(data.toString());
      reject(data);
    });

    spawnProcess.on('close', (code) => {
      code === 0 ? resolve(code) : reject(code);
    });
  });
}

(async () => {
  await waitForSpawn();
})();

async function waitForFork() {
  const childProcess = fork(path.resolve(__dirname, 'cpu_task_fork.js'));
  childProcess.send('ping');
  return new Promise((resolve, reject) => {
    childProcess.on('data', (data) => {
      if (data === 'pong') {
        resolve(data);
      }
    });

    childProcess.on('data', (data) => {
      console.log(data.toString());
      reject(data);
    });

    childProcess.on('close', (code) => {
      code === 0 ? resolve(code) : reject(code);
    });
  });
}

(async () => {
  await waitForFork();
  transaction.finish();
  await Sentry.flush(2000);
})();
