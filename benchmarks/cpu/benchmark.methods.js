// This code serves to benchmark the performance of individual CPU profiler methods.
// For example, if the profiler is started and stopped frequently, it is likely that the overhead is
// going to be large due to frequent initialization. It also serves to give us a finer grained understanding
// of where the profiler is spending time and where we may have regressed.
const { CpuProfilerBindings } = require('./../../lib/cpu_profiler');
const { benchmark } = require('./utils');

console.log('\nBenchmarking CPU profiler methods');

// Benchmarking startProfiling w
CpuProfilerBindings.initializeProfiler();
benchmark('StartProfiling (without initialize)', 100, {
  run: function run() {
    CpuProfilerBindings.startProfiling('startProfiling');
  },
  cleanup: () => {
    const profile = CpuProfilerBindings.stopProfiling('startProfiling');
  }
});
CpuProfilerBindings.disposeProfiler();

// Benchmarking startProfiling
benchmark('StartProfiling (with initialize)', 100, {
  run: function run() {
    CpuProfilerBindings.initializeProfiler();
    CpuProfilerBindings.startProfiling('startProfiling');
  },
  cleanup: () => {
    const profile = CpuProfilerBindings.stopProfiling('startProfiling');
    CpuProfilerBindings.disposeProfiler();
  }
});
CpuProfilerBindings.disposeProfiler();

CpuProfilerBindings.initializeProfiler();
// Benchmarking stopProfiling
benchmark('StopProfiling', 100, {
  before: function before() {
    CpuProfilerBindings.startProfiling('stopProfiling');
  },
  run: function run() {
    CpuProfilerBindings.stopProfiling('stopProfiling');
  }
});
