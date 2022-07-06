const cpu_profiler = require('./../build/Release/cpu_profiler');
const sqlite3 = require('sqlite3').verbose();
const autocannon = require('autocannon');

const db = new sqlite3.Database('memory_db');

console.log('\nBenchmarking API instrumented with Cpu profiler');

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS benchmarks;', (db, err) => {
    if (err) {
      console.log(err);
    }
  });

  db.run('CREATE TABLE IF NOT EXISTS benchmarks (id INTEGER PRIMARY KEY, name TEXT);', (res, err) => {
    if (err) {
      console.log('Table creation failed', res, err);
    }
  });

  db.parallelize(() => {
    for (let i = 0; i < 1e3; i++) {
      db.run(`INSERT INTO benchmarks (id, name) VALUES (?, ?);`, [i, `Benchmark ${i}`], (res, err) => {
        if (err) {
          console.log('Failed to insert with', err);
        }
      });
    }
  });
});

db.serialize(() => {
  db.get('SELECT COUNT(*) as c FROM benchmarks;', (err, row) => {
    if (err || row.c < 1e3) {
      throw new Error('Failed to prep db', err, row);
    }
  });
});

const express = require('express');
const app = express();

app.disable('etag');
app.disable('x-powered-by');

app.get('/benchmark/db', (req, res) => {
  res.setHeader('content-type', 'application/json');
  db.get(`SELECT * FROM benchmarks WHERE id = ${Math.floor(Math.random() * 100)}`, (err, row) => {
    res.status(200).json(row);
  });
});

app.get('/benchmark/db/profiled', (req, res) => {
  cpu_profiler.startProfiling('db query');
  res.setHeader('content-type', 'application/json');
  db.get(`SELECT * FROM benchmarks WHERE id = ${Math.floor(Math.random() * 100)}`, (err, row) => {
    res.status(200).json(row);
  });
  cpu_profiler.stopProfiling('db query');
});

app.get('/benchmark/isAlive', (req, res) => {
  res.setHeader('content-type', 'text/plain');
  res.status(200).send('OK');
});

app.get('/benchmark/isAlive/profiled', (req, res) => {
  cpu_profiler.startProfiling('isAlive - profiled');
  res.setHeader('content-type', 'text/plain');
  res.status(200).send('OK');
  cpu_profiler.stopProfiling('isAlive - profiled');
});

const server = app.listen(3000, async () => {
  const loadOptions = {
    connections: 10,
    pipelining: 1,
    duration: 10,
  };
  const isAliveRun = await autocannon({
    url: 'http://localhost:3000/benchmark/isAlive',
    ...loadOptions,
  });

  console.log(`isAlive req/sec=${isAliveRun.requests.mean}`);

  const isAliveRunProfiled = await autocannon({
    url: 'http://localhost:3000/benchmark/isAlive/profiled',
    ...loadOptions,
  });

  console.log(`isAlive (profiled) req/sec=${isAliveRunProfiled.requests.mean}`);

  const isAliveRunDb = await autocannon({
    url: 'http://localhost:3000/benchmark/db',
    ...loadOptions,
  });

  console.log(`DB query req/sec=${isAliveRunDb.requests.mean}`);

  const isAliveRunDbProfiled = await autocannon({
    url: 'http://localhost:3000/benchmark/db/profiled',
    ...loadOptions,
  });

  console.log(`DB query (profiled) req/sec=${isAliveRunDbProfiled.requests.mean}`);

  server.close();
  db.close();
});
