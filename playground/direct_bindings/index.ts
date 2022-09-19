import { CpuProfilerBindings } from '../../src/cpu_profiler';
import { writeFileSync } from 'node:fs';
import path from 'path';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

CpuProfilerBindings.startProfiling('cpu_profiler');
(async () => {
  await wait(1000);
  const profile = CpuProfilerBindings.stopProfiling('cpu_profiler');
  writeFileSync(path.resolve(__dirname, './cpu_profiler.profile.json'), JSON.stringify(profile));
})();
