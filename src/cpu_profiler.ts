import { getAbi } from 'node-abi';
import { join } from 'path';
import { arch, platform } from 'os';
import { familySync } from 'detect-libc';

import { threadId } from 'worker_threads';
import { getProjectRootDirectory } from './utils';

export function importCppBindingsModule(): PrivateV8CpuProfilerBindings {
  const family = familySync();
  const userArchitecture = process.env['BUILD_ARCH'] || arch();
  const userPlatform = platform();

  if (family === null) {
    // If we did not find libc or musl, we may be on Windows or some other platform.
    return require(join(
      __dirname,
      '..',
      'lib',
      'binaries',
      `sentry_cpu_profiler-v${getAbi(process.versions.node, 'node')}-${userPlatform}-${userArchitecture}.node`
    ));
  }

  return require(join(
    __dirname,
    '..',
    'lib',
    'binaries',
    `sentry_cpu_profiler-v${getAbi(process.versions.node, 'node')}-${userPlatform}-${userArchitecture}-${family}.node`
  ));
}

// Resolve the project root dir so we can try and compute a filename relative to it.
// We forward this to C++ code so we dont end up post-processing frames in JS.
const projectRootDirectory = getProjectRootDirectory();

interface Sample {
  stack_id: number;
  thread_id: string;
  elapsed_since_start_ns: string;
}

type Stack = number[];

type Frame = {
  function: string;
  file: string;
  line: number;
  column: number;
};

export interface RawThreadCpuProfile {
  profile_id?: string;
  stacks: Stack[];
  samples: Sample[];
  frames: Frame[];
  profiler_logging_mode: 'eager' | 'lazy';
}
export interface ThreadCpuProfile {
  samples: Sample[];
  stacks: Stack[];
  frames: Frame[];
  thread_metadata: Record<string, { name?: string; priority?: number }>;
  queue_metadata?: Record<string, { label: string }>;
}

interface PrivateV8CpuProfilerBindings {
  startProfiling(name: string): void;
  stopProfiling(name: string, threadId: number, projectRootDir: string | null): RawThreadCpuProfile | null;
  getFrameModule(abs_path: string, root_dir: string): string;
}

interface V8CpuProfilerBindings {
  startProfiling(name: string): void;
  stopProfiling(name: string): RawThreadCpuProfile | null;
}

const privateBindings: PrivateV8CpuProfilerBindings = importCppBindingsModule();
const CpuProfilerBindings: V8CpuProfilerBindings = {
  startProfiling(name: string) {
    return privateBindings.startProfiling(name);
  },
  stopProfiling(name: string) {
    return privateBindings.stopProfiling(name, threadId, projectRootDirectory);
  }
};
export { CpuProfilerBindings };
