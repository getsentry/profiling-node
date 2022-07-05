// This code serves to benchmark the performance of individual CPU profiler methods.
// For example, if the profiler is started and stopped frequently, it is likely that the overhead is
// going to be large due to frequent initialization. It also serves to give us a finer grained understanding
// of where the profiler is spending time and where we may have regressed.
const cpu_profiler = require("./../build/Release/cpu_profiler");
const title = "test";

const quantile = (arr, q) => {
  arr.sort();
  const pos = (arr.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (arr[base + 1] !== undefined) {
    return arr[base] + rest * (arr[base + 1] - arr[base]);
  } else {
    return arr[base];
  }
};
const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
const hz = (ops, arr) => {
  return (ops / sum(arr)) * 1000;
};
const stdev = (arr) => Math.sqrt(variance(arr));
const variance = (arr) => {
  const m = mean(arr);
  return arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length;
};

const variancepct = (arr) => {
  const m = mean(arr);
  return arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length / m;
};

function computeRunResults(arr) {
  return {
    hz: hz(arr.length, arr),
    mean: mean(arr),
    stdev: stdev(arr),
    variance: variance(arr),
    variancepct: "±" + (variancepct(arr) * 100).toFixed(2) + "%",
    p75: quantile(arr, 0.75),
    p99: quantile(arr, 0.99),
  };
}

function benchmark(name, n, { before, run, cleanup }) {
  const timings = [];

  for (let i = 0; i < n; i++) {
    if (before) before();
    const start = performance.now();
    run();
    const end = performance.now();
    if (cleanup) cleanup();
    timings.push(end - start);
  }

  const results = computeRunResults(timings);
  console.log(
    `${name} N=${n}`,
    `ops/s ${results.hz.toFixed(2)} mean ${results.mean.toFixed(
      2
    )}ms ±${results.stdev.toFixed(2)}ms ${results.variancepct}`
  );
}

// Benchmarking startProfiling
benchmark("StartProfiling", 100, {
  run: function run() {
    cpu_profiler.startProfiling(title);
  },
  cleanup: () => {
    const profile = cpu_profiler.stopProfiling(title);
  },
});

// Benchmarking stopProfiling
benchmark("StopProfiling", 100, {
  before: function before() {
    cpu_profiler.startProfiling(title);
  },
  run: function run() {
    cpu_profiler.stopProfiling(title);
  },
});
