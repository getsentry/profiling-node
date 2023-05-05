import { join, resolve } from 'path';
import { arch, platform } from 'os';
import { env } from 'process';
import { threadId } from 'worker_threads';

import { familySync } from 'detect-libc';

import { getProjectRootDirectory } from './utils';

// Keep these in sync with the replacements in esmmod.js and cjsmod.js
// __START__REPLACE__DIRNAME__
const _dirname = __dirname;
// __END__REPLACE__DIRNAME__

// __START__REPLACE__REQUIRE__
const _require = require;
// __END__REPLACE__REQUIRE__

const family = familySync();
const userPlatform = platform();
const binariesDirectory = env['SENTRY_PROFILER_BINARY_DIR'] || resolve(_dirname, '..', 'binaries');
const userArchitecture = env['BUILD_ARCH'] || arch();
const identifier = [userPlatform, userArchitecture, family].filter((c) => c !== undefined && c !== null).join('-');

export function importCppBindingsModule(): PrivateV8CpuProfilerBindings {
  if (env['SENTRY_PROFILER_BINARY_PATH']) {
    return _require(env['SENTRY_PROFILER_BINARY_PATH'] as string);
  }
  return _require(join(binariesDirectory, `sentry_cpu_profiler-${identifier}.node`));
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
