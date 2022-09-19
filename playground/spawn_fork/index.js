const { spawn, fork } = require('node:child_process');
const path = require('node:path');

const { existsSync, unlinkSync } = require('node:fs');

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
})();
