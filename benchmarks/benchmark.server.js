const cpu_profiler = require("./../build/Release/cpu_profiler");
const sqlite3 = require("sqlite3").verbose();
const autocannon = require("autocannon");

const db = new sqlite3.Database("memory_db");

db.exec("DROP TABLE IF EXISTS benchmarks");
db.exec(
  "CREATE TABLE benchmarks (id INTEGER PRIMARY KEY, name TEXT)",
  (err) => {
    console.log("Table created", err);
  }
);

for (let i = 0; i < 100; i++) {
  db.exec(
    `INSERT INTO benchmarks VALUES ('${i}','Just something very random ${i}')`,
    (err) => {
      if (err) {
        console.log("Failed to insrt with", err);
      }
    }
  );
}

db.exec("SELECT * FROM benchmarks", (err, rows) => {
  console.log(rows);
  if (!rows) {
    throw new Error("Failed to prep db", err, rows);
  }
});

const express = require("express");
const app = express();

app.disable("etag");
app.disable("x-powered-by");

app.get("/benchmark/db", (req, res) => {
  res.setHeader("content-type", "text/plain");

  db.exec(
    `SELECT * FROM benchmarks WHERE id = ${Math.floor(Math.random() * 100)}`,
    (err, rows) => {
      console.log(rows);
      res.send(`Hey ${rows}`);
    }
  );
});

app.get("/benchmark/simple", (req, res) => {
  res.setHeader("content-type", "text/plain");
  res.send(`Hey ${req.query.name} ${req.query.name}`);
});

app.get("/benchmark/simple/profiled", (req, res) => {
  cpu_profiler.startProfiling("simple - profiled");
  res.setHeader("content-type", "text/plain");
  res.send(`Hey ${req.query.name} ${req.query.name}`);
  cpu_profiler.stopProfiling("simple - profiled");
});

const server = app.listen(3000, async () => {
  const simpleRun = await autocannon({
    url: "http://localhost:3000/benchmark/simple",
    connections: 10, //default
    pipelining: 1, // default
    duration: 10, // default
  });

  console.log("Simple result\n", autocannon.printResult(simpleRun));

  const simpleRunProfiled = await autocannon({
    url: "http://localhost:3000/benchmark/simple/profiled",
    connections: 10, //default
    pipelining: 1, // default
    duration: 10, // default
  });

  console.log(
    "Simple resp (profiled)\n",
    autocannon.printResult(simpleRunProfiled)
  );

  const simpleRunDb = await autocannon({
    url: "http://localhost:3000/benchmark/db",
    connections: 10, //default
    pipelining: 1, // default
    duration: 10, // default
  });

  console.log("DB query\n", autocannon.printResult(simpleRunDb));
  server.close();
  db.close();
});
