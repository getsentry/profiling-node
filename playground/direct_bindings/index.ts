import { CpuProfilerBindings } from '../../src/cpu_profiler';
import { writeFileSync, existsSync, unlinkSync } from 'node:fs';
import path from 'path';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

if (existsSync(path.resolve(__dirname, 'cpu_profiler.profile.json'))) {
  unlinkSync(path.resolve(__dirname, 'cpu_profiler.profile.json'));
}

// Stop profiling before it is started
(async () => {
  const p1 = CpuProfilerBindings.stopProfiling('stop_before_start');
  await wait(1000);
  writeFileSync(path.resolve(__dirname, './stop_before_start.profile.json'), JSON.stringify(p1));

  // Double start
  CpuProfilerBindings.startProfiling('same_title');
  await wait(1000);
  CpuProfilerBindings.startProfiling('same_title');
  await wait(1000);
  const p2 = CpuProfilerBindings.startProfiling('same_title');
  writeFileSync(path.resolve(__dirname, './stop_before_start.profile.json'), JSON.stringify(p2));

  // Simple profile
  CpuProfilerBindings.startProfiling('cpu_profiler');
  await wait(1000);
  const p3 = CpuProfilerBindings.stopProfiling('cpu_profiler');
  writeFileSync(path.resolve(__dirname, './cpu_profiler.profile.json'), JSON.stringify(p3));
})();
